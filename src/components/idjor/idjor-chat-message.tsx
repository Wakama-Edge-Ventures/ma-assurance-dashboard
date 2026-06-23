import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

import { idjorPreviewStatusLabel } from "@/components/idjor/idjor-companion-provider";
import type { IdjorChatMessage } from "@/components/idjor/idjor-companion-provider";
import { IdjorSourceList } from "@/components/idjor/idjor-source-list";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASS: Record<string, string> = {
  EXECUTED: "bg-wk-liveSoft text-wk-liveInk",
  BLOCKED: "bg-wk-amberSoft text-wk-amberInk",
  FAILED: "bg-wk-coralSoft text-wk-coralInk",
};

export function IdjorChatMessageBubble({ message }: { message: IdjorChatMessage }) {
  if (message.role === "system") {
    return (
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.12em] text-wk-faint">
        {message.text}
      </p>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] font-medium leading-relaxed",
          isUser ? "bg-wk-violetSoft text-wk-violetInk" : "border border-wk-border bg-wk-surface2 text-wk-text",
        )}
      >
        {message.kind === "loading" ? (
          <span className="inline-flex items-center gap-2 text-wk-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {message.text}
          </span>
        ) : (
          <>
            {message.status ? (
              <span
                className={cn(
                  "mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em]",
                  STATUS_BADGE_CLASS[message.status] ?? "bg-wk-surface3 text-wk-muted",
                )}
              >
                {idjorPreviewStatusLabel(message.status)}
              </span>
            ) : null}

            {message.kind === "boundary" || message.kind === "error" ? (
              <span className="mb-1 inline-flex items-center gap-1.5 text-wk-amberInk">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
            ) : null}

            <p className="whitespace-pre-wrap">{message.text}</p>

            {message.citations ? <IdjorSourceList citations={message.citations} /> : null}

            {message.actionHref ? (
              <Link
                href={message.actionHref}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-wk-violetSoft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-wk-violetInk transition-colors hover:bg-wk-violet hover:text-white"
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
