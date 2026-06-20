"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppAccordionProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  countLabel?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export function AppAccordion({
  icon,
  title,
  subtitle,
  countLabel,
  open,
  onToggle,
  children,
  className,
}: AppAccordionProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-brand-border/10 bg-brand-surface/86 shadow-premium dark:border-cyan-400/12 dark:bg-[#0d1525]/82 dark:shadow-premium-dark",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-900/[0.02] dark:hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {icon ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-brand-border/16 bg-brand-surfaceRaised/70 text-brand-textMuted dark:border-slate-400/16 dark:bg-slate-400/8 dark:text-slate-200">
                {icon}
              </span>
            ) : null}
            <h2 className="font-display text-[18px] font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {countLabel ? (
              <span className="rounded-full border border-brand-border/16 bg-brand-surfaceRaised/70 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted dark:border-slate-400/16 dark:bg-slate-400/8 dark:text-slate-300">
                {countLabel}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 text-sm text-brand-textMuted">{subtitle}</p>
          ) : null}
        </div>
        <span className="mt-0.5 rounded-full border border-brand-border/16 bg-brand-surfaceRaised/70 p-2 text-brand-textMuted dark:border-slate-400/16 dark:bg-slate-400/8 dark:text-slate-300">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open ? (
        <div className="border-t border-brand-border/10 px-5 py-4 dark:border-slate-400/10">{children}</div>
      ) : null}
    </div>
  );
}
