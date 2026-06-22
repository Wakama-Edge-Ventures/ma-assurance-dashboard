import { ReactNode } from "react";

import { AppPageHeader } from "./app-page-header";

interface PageTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
  workflowBadgeOverride?: { label: string; live: boolean } | null;
}

export function PageTitle({ title, description, action, workflowBadgeOverride }: PageTitleProps) {
  return (
    <AppPageHeader
      title={title}
      description={description}
      action={action}
      workflowBadgeOverride={workflowBadgeOverride}
    />
  );
}
