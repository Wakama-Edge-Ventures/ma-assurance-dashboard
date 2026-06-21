import { ReactNode } from "react";

import { AppPageHeader } from "./app-page-header";

interface PageTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageTitle({ title, description, action }: PageTitleProps) {
  return <AppPageHeader title={title} description={description} action={action} />;
}
