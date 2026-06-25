import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppSectionProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppSection({ title, subtitle, badge, children, className }: AppSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <h2 className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.16em] text-wk-faint">
          {title}
        </h2>
        {badge}
        <div className="h-px flex-1 bg-gradient-to-r from-wk-border2 via-wk-border to-transparent" />
      </div>
      {subtitle ? <p className="max-w-3xl text-[13px] font-medium leading-relaxed text-wk-muted">{subtitle}</p> : null}
      {children}
    </section>
  );
}
