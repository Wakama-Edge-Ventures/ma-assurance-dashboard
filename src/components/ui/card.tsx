import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-brand-border bg-brand-surface/90 p-5 shadow-premium",
        className,
      )}
    >
      {children}
    </section>
  );
}
