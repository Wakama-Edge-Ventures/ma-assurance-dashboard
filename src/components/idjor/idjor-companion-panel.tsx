"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";

import { IdjorAttachmentButton } from "@/components/idjor/idjor-attachment-button";
import { IdjorChatMessageBubble } from "@/components/idjor/idjor-chat-message";
import { useIdjorCompanion } from "@/components/idjor/idjor-companion-provider";
import { useTenant } from "@/components/tenant/useTenant";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { id: "check-readiness" as const, label: "Vérifier la disponibilité" },
  { id: "analyze" as const, label: "Analyser ce document" },
  { id: "show-sources" as const, label: "Voir les sources RAG" },
  { id: "extract-attachment" as const, label: "Extraire le texte d'une pièce jointe" },
];

export function IdjorCompanionPanel() {
  const { isOpen, close, messages, isBusy, runAction, sendMessage, context } = useIdjorCompanion();
  const { tenant } = useTenant();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!isOpen) {
    return null;
  }

  const subtitle =
    context?.kind === "extraction"
      ? `${tenant.terminology.idjorLabel} · document "${context.documentTitle}"`
      : context?.kind === "application"
        ? `${tenant.terminology.idjorLabel} · dossier ${context.applicationLabel}`
        : `${tenant.terminology.idjorLabel} · ${tenant.displayName}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Idjor Compagnon"
      className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6"
    >
      <div
        className={cn(
          "flex h-[80vh] w-full flex-col rounded-t-3xl border border-wk-border bg-wk-surface",
          "shadow-wk-lg sm:h-[640px] sm:w-[420px] sm:rounded-[22px]",
        )}
      >
        <header className="flex items-center gap-3 border-b border-wk-border bg-gradient-to-r from-wk-violetSoft to-transparent px-4 py-3.5">
          <div
            className="grid h-9 w-9 flex-none place-items-center rounded-[11px]"
            style={{ background: `linear-gradient(140deg, ${tenant.colors.accent}, ${tenant.colors.primary})` }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-wk-text">Idjor</p>
            <p className="truncate text-[11px] font-semibold text-wk-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer Idjor Compagnon"
            className="grid h-8 w-8 flex-none place-items-center rounded-full text-wk-muted transition-colors hover:bg-wk-surface2 hover:text-wk-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <IdjorChatMessageBubble key={message.id} message={message} />
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-wk-border px-4 py-2.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={isBusy}
              onClick={() => void runAction(action.id)}
              className="rounded-full border border-wk-border bg-wk-surface2 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.05em] text-wk-muted transition-colors hover:text-wk-violetInk disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t border-wk-border px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim() || isBusy) return;
            void sendMessage(draft);
            setDraft("");
          }}
        >
          <IdjorAttachmentButton />
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Écrire à Idjor…"
            aria-label="Message pour Idjor"
            className="flex-1 rounded-full border border-wk-border2 bg-wk-surface2 px-3.5 py-2 text-[13px] text-wk-text outline-none placeholder:text-wk-faint focus-visible:border-wk-violet"
          />
          <button
            type="submit"
            disabled={isBusy || !draft.trim()}
            aria-label="Envoyer"
            className="grid h-9 w-9 flex-none place-items-center rounded-full bg-wk-violet text-white transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
