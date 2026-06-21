import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppBadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "info";

const styles: Record<AppBadgeVariant, string> = {
  default:
    "border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/45 dark:bg-violet-500/14 dark:text-violet-200",
  success:
    "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-500/15 dark:text-emerald-200",
  warning:
    "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/50 dark:bg-amber-500/15 dark:text-amber-200",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/50 dark:bg-rose-500/15 dark:text-rose-200",
  info:
    "border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/45 dark:bg-cyan-500/12 dark:text-cyan-200",
  muted:
    "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600/40 dark:bg-slate-800/50 dark:text-slate-400",
};

interface AppBadgeProps {
  children: ReactNode;
  variant?: AppBadgeVariant;
  className?: string;
}

export function AppBadge({ children, variant = "default", className }: AppBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
