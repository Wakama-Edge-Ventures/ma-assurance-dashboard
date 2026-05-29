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
    <section className={cn("space-y-3.5", className)}>
      <div className="flex items-center gap-3">
        <h2 className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
          {title}
        </h2>
        {badge}
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/14 to-transparent" />
      </div>
      {subtitle ? <p className="text-[12.5px] text-[#5B6B86]">{subtitle}</p> : null}
      {children}
    </section>
  );
}
