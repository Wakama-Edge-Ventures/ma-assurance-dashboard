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
        "overflow-hidden rounded-[20px] border border-wk-border bg-wk-surface shadow-wk-sm",
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
        "grid gap-3 rounded-[20px] border border-wk-border bg-wk-surface p-4 shadow-wk-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const APP_TABLE_CLASSNAMES = {
  table: "min-w-full",
  head: "border-b border-wk-border bg-wk-surface2",
  row: "border-b border-wk-border transition-colors last:border-0 hover:bg-wk-surface2",
  headCell:
    "px-5 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-wk-faint",
  bodyCell: "px-5 py-3 text-[12.5px] font-medium text-wk-text",
  emptyState: "space-y-1.5 px-4 py-10 text-center",
} as const;
