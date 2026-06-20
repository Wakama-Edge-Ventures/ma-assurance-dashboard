import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusOverviewTone = "success" | "warning" | "danger" | "neutral";

interface StatusOverviewCardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: StatusOverviewTone;
  className?: string;
}

const TONE_STYLES: Record<StatusOverviewTone, string> = {
  success:
    "border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-400/28 dark:bg-emerald-400/10 dark:text-emerald-200",
  warning:
    "border-amber-300/60 bg-amber-50 text-amber-800 dark:border-amber-400/28 dark:bg-amber-400/10 dark:text-amber-200",
  danger:
    "border-rose-300/60 bg-rose-50 text-rose-800 dark:border-rose-400/28 dark:bg-rose-400/10 dark:text-rose-200",
  neutral:
    "border-brand-border/16 bg-brand-surfaceRaised/70 text-slate-700 dark:border-slate-400/16 dark:bg-slate-400/8 dark:text-slate-200",
};

export function StatusOverviewCard({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: StatusOverviewCardProps) {
  return (
    <div className={cn("rounded-2xl border px-4 py-3.5", TONE_STYLES[tone], className)}>
      <div className="flex items-center gap-2">
        {icon ? <span className="flex-none">{icon}</span> : null}
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-80">{label}</p>
      </div>
      <p className="mt-1.5 text-[15px] font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-relaxed opacity-80">{hint}</p> : null}
    </div>
  );
}
