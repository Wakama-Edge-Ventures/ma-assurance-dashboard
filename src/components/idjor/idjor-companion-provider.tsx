"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import { useTenant } from "@/components/tenant/useTenant";
import {
  ApiError,
  getIdjorRagLlmReadiness,
  requestIdjorRagLlmPreview,
} from "@/lib/api";
import type {
  IdjorRagLlmBlockedReason,
  IdjorRagLlmPreviewCitation,
  IdjorRagLlmPreviewStatus,
} from "@/types";

export type IdjorCompanionContext =
  | {
      kind: "extraction";
      extractionId: string;
      documentId: string;
      documentTitle: string;
    }
  | {
      kind: "application";
      applicationRef: string;
      applicationLabel: string;
    };

export type IdjorChatMessageKind = "text" | "loading" | "result" | "boundary" | "error";

export interface IdjorChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  kind: IdjorChatMessageKind;
  text: string;
  status?: IdjorRagLlmPreviewStatus;
  citations?: IdjorRagLlmPreviewCitation[];
  blockedReasons?: IdjorRagLlmBlockedReason[];
  actionHref?: string;
  actionLabel?: string;
  createdAt: number;
}

export type IdjorQuickActionId =
  | "check-readiness"
  | "analyze"
  | "show-sources"
  | "extract-attachment";

interface IdjorCompanionState {
  isOpen: boolean;
  context: IdjorCompanionContext | null;
  messages: IdjorChatMessage[];
  isBusy: boolean;
}

interface IdjorCompanionApi extends IdjorCompanionState {
  open: (context?: IdjorCompanionContext) => void;
  close: () => void;
  runAction: (actionId: IdjorQuickActionId) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

const IdjorCompanionApiContext = createContext<IdjorCompanionApi | null>(null);

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `idjor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function statusLabel(status: IdjorRagLlmPreviewStatus): string {
  switch (status) {
    case "EXECUTED":
      return "Exécuté";
    case "BLOCKED":
      return "Bloqué";
    case "FAILED":
      return "Échec";
    default:
      return status;
  }
}

const BLOCKED_REASON_LABELS: Record<IdjorRagLlmBlockedReason, string> = {
  LLM_FEATURE_FLAG_OFF: "Activation LLM désactivée",
  LLM_PROVIDER_DISABLED: "Fournisseur LLM désactivé",
  LLM_MODEL_DISABLED: "Modèle LLM désactivé",
  PROMPT_GUARDRAILS_DISABLED: "Garde-fous de prompt désactivés",
  RETRIEVAL_NOT_READY: "Retrieval non prêt",
  CITATIONS_NOT_READY: "Citations non prêtes",
  TENANT_SCOPE_REQUIRED: "Périmètre institution requis",
  LLM_EXECUTION_DISABLED: "Exécution LLM désactivée",
};

export function IdjorCompanionProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<IdjorCompanionContext | null>(null);
  const [messages, setMessages] = useState<IdjorChatMessage[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const hasWelcomed = useRef(false);

  const pushMessage = useCallback((message: Omit<IdjorChatMessage, "id" | "createdAt">) => {
    setMessages((prev) => [...prev, { ...message, id: makeId(), createdAt: Date.now() }]);
  }, []);

  const open = useCallback(
    (nextContext?: IdjorCompanionContext) => {
      setIsOpen(true);

      if (!hasWelcomed.current) {
        hasWelcomed.current = true;
        pushMessage({
          role: "assistant",
          kind: "text",
          text: `Bonjour, je suis Idjor Compagnon. Je peux vous aider à analyser vos documents, expliquer un dossier, résumer les éléments de risque et préparer une réponse, au nom de ${tenant.displayName}. ${tenant.terminology.decisionDisclaimer}`,
        });
      }

      if (nextContext) {
        setContext(nextContext);
        pushMessage({
          role: "system",
          kind: "text",
          text:
            nextContext.kind === "extraction"
              ? `Contexte chargé : document "${nextContext.documentTitle}".`
              : `Contexte chargé : dossier ${nextContext.applicationLabel}.`,
        });
      }
    },
    [pushMessage, tenant.displayName, tenant.terminology.decisionDisclaimer],
  );

  const close = useCallback(() => setIsOpen(false), []);

  const runExtractionAction = useCallback(
    async (extractionId: string, actionId: IdjorQuickActionId) => {
      if (actionId === "extract-attachment") {
        pushMessage({
          role: "assistant",
          kind: "boundary",
          text: "L'extraction de texte depuis une pièce jointe n'est pas encore disponible directement dans cette conversation. Utilisez le workflow documentaire pour importer et analyser un document.",
          actionHref: "/fr/idjor",
          actionLabel: "Ouvrir le workflow documentaire",
        });
        return;
      }

      if (actionId === "check-readiness") {
        setIsBusy(true);
        try {
          const readiness = await getIdjorRagLlmReadiness(extractionId);
          const reasons = readiness.blockedReasons.map((r) => BLOCKED_REASON_LABELS[r]);
          pushMessage({
            role: "assistant",
            kind: "text",
            text:
              `Disponibilité gouvernance : ${readiness.llmReadiness}. ` +
              (reasons.length > 0
                ? `Motifs : ${reasons.join(", ")}. `
                : "Aucun motif de blocage signalé. ") +
              "Cette vérification est une lecture de gouvernance ; le résultat réel d'une analyse peut différer et n'est connu qu'à l'exécution.",
          });
        } catch (error) {
          pushMessage({
            role: "assistant",
            kind: "error",
            text:
              error instanceof ApiError
                ? `Idjor n'a pas pu vérifier la disponibilité (${error.message}).`
                : "Idjor n'a pas pu vérifier la disponibilité.",
          });
        } finally {
          setIsBusy(false);
        }
        return;
      }

      if (actionId === "analyze") {
        setIsBusy(true);
        pushMessage({ role: "assistant", kind: "loading", text: "Idjor analyse le document…" });
        try {
          const result = await requestIdjorRagLlmPreview(extractionId);
          setMessages((prev) => prev.filter((m) => m.kind !== "loading"));
          pushMessage({
            role: "assistant",
            kind: "result",
            status: result.status,
            text:
              result.status === "EXECUTED"
                ? result.answer ?? "Idjor a exécuté l'analyse mais n'a renvoyé aucun contenu."
                : result.status === "BLOCKED"
                  ? "Idjor ne peut pas encore exécuter cette analyse : les prérequis de gouvernance ne sont pas réunis."
                  : "Idjor n'a pas pu exécuter cette analyse : le fournisseur n'a pas répondu correctement.",
            citations: result.citations,
            blockedReasons: result.blockedReasons,
          });
        } catch (error) {
          setMessages((prev) => prev.filter((m) => m.kind !== "loading"));
          pushMessage({
            role: "assistant",
            kind: "error",
            text:
              error instanceof ApiError
                ? `Idjor n'a pas pu répondre (${error.message}).`
                : "Idjor n'a pas pu répondre.",
          });
        } finally {
          setIsBusy(false);
        }
        return;
      }

      if (actionId === "show-sources") {
        const lastResult = [...messages].reverse().find((m) => m.kind === "result");
        if (lastResult?.citations && lastResult.citations.length > 0) {
          pushMessage({
            role: "assistant",
            kind: "result",
            status: lastResult.status,
            text: "Sources de la dernière analyse exécutée :",
            citations: lastResult.citations,
          });
        } else {
          pushMessage({
            role: "assistant",
            kind: "boundary",
            text: "Aucune réponse exécutée pour le moment, donc aucune source à afficher. Lancez d'abord \"Analyser ce document\".",
          });
        }
      }
    },
    [messages, pushMessage],
  );

  const runAction = useCallback(
    async (actionId: IdjorQuickActionId) => {
      if (context?.kind === "extraction") {
        await runExtractionAction(context.extractionId, actionId);
        return;
      }

      pushMessage({
        role: "assistant",
        kind: "boundary",
        text:
          context?.kind === "application"
            ? `Le dossier ${context.applicationLabel} n'est pas encore relié à un document analysé par Idjor. Rendez-vous dans le module documentaire pour lancer une analyse réelle.`
            : "Idjor a besoin d'un document analysé pour répondre. Ouvrez un document depuis le module documentaire pour l'attacher à cette conversation.",
        actionHref: "/fr/idjor",
        actionLabel: "Ouvrir le module documentaire",
      });
    },
    [context, pushMessage, runExtractionAction],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      pushMessage({ role: "user", kind: "text", text: trimmed });

      if (context?.kind === "extraction") {
        await runExtractionAction(context.extractionId, "analyze");
        return;
      }

      pushMessage({
        role: "assistant",
        kind: "boundary",
        text:
          context?.kind === "application"
            ? `Le dossier ${context.applicationLabel} n'est pas encore relié à un document analysé par Idjor : je ne peux pas générer de réponse réelle sur ce message. Rendez-vous dans le module documentaire pour lancer une analyse.`
            : "Idjor répond à partir de documents analysés sous gouvernance, pas en conversation libre pour le moment. Ouvrez un document depuis le module documentaire pour l'attacher à cette conversation.",
        actionHref: "/fr/idjor",
        actionLabel: "Ouvrir le module documentaire",
      });
    },
    [context, pushMessage, runExtractionAction],
  );

  const value = useMemo<IdjorCompanionApi>(
    () => ({ isOpen, context, messages, isBusy, open, close, runAction, sendMessage }),
    [isOpen, context, messages, isBusy, open, close, runAction, sendMessage],
  );

  return (
    <IdjorCompanionApiContext.Provider value={value}>{children}</IdjorCompanionApiContext.Provider>
  );
}

export function useIdjorCompanion() {
  const context = useContext(IdjorCompanionApiContext);

  if (!context) {
    throw new Error("useIdjorCompanion must be used inside an IdjorCompanionProvider");
  }

  return context;
}

export function idjorPreviewStatusLabel(status: IdjorRagLlmPreviewStatus) {
  return statusLabel(status);
}
