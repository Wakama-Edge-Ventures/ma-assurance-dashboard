import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  trailing?: ReactNode;
  className?: string;
}

export function SectionHeader({ icon, title, description, trailing, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-2.5">
        {icon ? (
          <span className="mt-0.5 flex-none text-cyan-700 dark:text-cyan-300">{icon}</span>
        ) : null}
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-brand-textMuted">{description}</p>
          ) : null}
        </div>
      </div>
      {trailing ? <div className="flex-none">{trailing}</div> : null}
    </div>
  );
}
