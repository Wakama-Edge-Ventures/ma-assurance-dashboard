import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataPanelProps {
  children: ReactNode;
  className?: string;
  maxHeightClass?: string;
}

export function DataPanel({ children, className, maxHeightClass }: DataPanelProps) {
  return (
    <div
      className={cn(
        "overflow-auto rounded-[18px] border border-brand-border/10 bg-brand-surfaceRaised/72 p-4 dark:border-slate-400/10 dark:bg-[#0c1322]/75",
        maxHeightClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
