import { ReactNode } from "react";

import { AppCard } from "./app-card";

interface AppEmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function AppEmptyState({ title, description, action }: AppEmptyStateProps) {
  return (
    <AppCard tone="subtle" className="space-y-2.5 p-4 text-center">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
      <p className="text-xs text-brand-textMuted">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </AppCard>
  );
}
