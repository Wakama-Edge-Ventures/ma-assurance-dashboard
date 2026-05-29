import { ReactNode } from "react";

import { AppBadge } from "./app-badge";

type Variant = "default" | "success" | "warning" | "danger" | "muted" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <AppBadge variant={variant} className={className}>
      {children}
    </AppBadge>
  );
}
