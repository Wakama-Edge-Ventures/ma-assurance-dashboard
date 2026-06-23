import { ReactNode } from "react";

import { CARD_PRESETS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface AppCardProps {
  children: ReactNode;
  className?: string;
  tone?: "base" | "soft" | "subtle";
}

export function AppCard({ children, className, tone = "base" }: AppCardProps) {
  return (
    <section className={cn(CARD_PRESETS[tone], CARD_PRESETS.hover, "text-wk-text", className)}>
      {children}
    </section>
  );
}
