import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageTitle({ title, description, action }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-brand-textMuted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
