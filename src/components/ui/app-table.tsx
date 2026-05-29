import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppTableProps {
  children: ReactNode;
  className?: string;
}

export function AppTable({ children, className }: AppTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-slate-400/10 bg-[#101726]/92",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface AppTableFiltersProps {
  children: ReactNode;
  className?: string;
}

export function AppTableFilters({ children, className }: AppTableFiltersProps) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-[20px] border border-slate-400/10 bg-[#101726]/92 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const APP_TABLE_CLASSNAMES = {
  table: "min-w-full",
  head: "border-b border-slate-400/10 bg-[#070b17]/50",
  row: "border-b border-slate-400/10 transition-colors last:border-0 hover:bg-slate-400/[0.03]",
  headCell:
    "px-5 py-3 text-left font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[#5B6B86]",
  bodyCell: "px-5 py-3 text-[12.5px] text-slate-300",
  emptyState: "space-y-1.5 px-4 py-10 text-center",
} as const;
