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
      <div className="idjor-rainbow-border rounded-t-3xl sm:rounded-3xl">
        <div
          className={cn(
            "idjor-rainbow-border-inner flex h-[80vh] w-full flex-col rounded-t-3xl bg-[#0b0f1a]",
            "shadow-premium-dark sm:h-[640px] sm:w-[420px] sm:rounded-3xl",
          )}
        >
          <header className="flex items-center gap-3 border-b border-slate-400/10 px-4 py-3.5">
            <div
              className="grid h-9 w-9 flex-none place-items-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${tenant.colors.accent}, ${tenant.colors.primary})`,
              }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-white">Idjor Compagnon</p>
              <p className="truncate text-[11px] text-brand-textMuted">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer Idjor Compagnon"
              className="grid h-8 w-8 flex-none place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-400/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <IdjorChatMessageBubble key={message.id} message={message} />
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-slate-400/10 px-4 py-2.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={isBusy}
                onClick={() => void runAction(action.id)}
                className="rounded-full border border-slate-400/16 bg-slate-400/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-200 disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-slate-400/10 px-3 py-3"
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
              className="flex-1 rounded-full border border-slate-400/16 bg-slate-400/5 px-3.5 py-2 text-[13px] text-white outline-none placeholder:text-slate-500 focus-visible:border-cyan-400/40"
            />
            <button
              type="submit"
              disabled={isBusy || !draft.trim()}
              aria-label="Envoyer"
              className="grid h-9 w-9 flex-none place-items-center rounded-full bg-cyan-500/90 text-[#0b0f1a] transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
