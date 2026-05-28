import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "muted";

const styles: Record<Variant, string> = {
  default: "bg-brand-violet/20 text-violet-200 border border-brand-violet/40",
  success: "bg-green-500/15 text-green-300 border border-green-500/30",
  warning: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  danger: "bg-red-500/15 text-red-300 border border-red-500/30",
  muted: "bg-slate-700/30 text-slate-300 border border-slate-600",
};

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
