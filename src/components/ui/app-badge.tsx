import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppBadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "info";

const styles: Record<AppBadgeVariant, string> = {
  default: "bg-wk-violetSoft text-wk-violetInk",
  success: "bg-wk-liveSoft text-wk-liveInk",
  warning: "bg-wk-amberSoft text-wk-amberInk",
  danger: "bg-wk-coralSoft text-wk-coralInk",
  info: "bg-wk-tealSoft text-wk-tealInk",
  muted: "bg-wk-surface3 text-wk-muted",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
