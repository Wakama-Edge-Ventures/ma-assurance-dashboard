import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

import { idjorPreviewStatusLabel } from "@/components/idjor/idjor-companion-provider";
import type { IdjorChatMessage } from "@/components/idjor/idjor-companion-provider";
import { IdjorSourceList } from "@/components/idjor/idjor-source-list";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASS: Record<string, string> = {
  EXECUTED:
    "border-emerald-400/28 bg-emerald-400/10 text-emerald-300",
  BLOCKED: "border-amber-400/28 bg-amber-400/10 text-amber-300",
  FAILED: "border-rose-400/28 bg-rose-400/10 text-rose-300",
};

export function IdjorChatMessageBubble({ message }: { message: IdjorChatMessage }) {
  if (message.role === "system") {
    return (
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
        {message.text}
      </p>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
          isUser
            ? "bg-cyan-500/15 text-cyan-50"
            : "border border-slate-400/14 bg-slate-400/[0.06] text-slate-200",
        )}
      >
        {message.kind === "loading" ? (
          <span className="inline-flex items-center gap-2 text-slate-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {message.text}
          </span>
        ) : (
          <>
            {message.status ? (
              <span
                className={cn(
                  "mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
                  STATUS_BADGE_CLASS[message.status] ?? "border-slate-400/20 text-slate-300",
                )}
              >
                {idjorPreviewStatusLabel(message.status)}
              </span>
            ) : null}

            {message.kind === "boundary" || message.kind === "error" ? (
              <span className="mb-1 inline-flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
            ) : null}

            <p className="whitespace-pre-wrap">{message.text}</p>

            {message.citations ? <IdjorSourceList citations={message.citations} /> : null}

            {message.actionHref ? (
              <Link
                href={message.actionHref}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan-200 transition-colors hover:border-cyan-300/50"
              >
                {message.actionLabel ?? "Ouvrir"}
              </Link>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
