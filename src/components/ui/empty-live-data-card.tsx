import { Inbox } from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { SourceBadge } from "@/components/ui/source-badge";

interface EmptyLiveDataCardProps {
  title?: string;
  description: string;
}

export function EmptyLiveDataCard({
  title = "Aucune donnée live",
  description,
}: EmptyLiveDataCardProps) {
  return (
    <AppCard className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <Inbox className="h-4 w-4 text-wk-muted" />
        <p className="text-sm font-bold text-wk-text">{title}</p>
        <SourceBadge source="LIVE" />
      </div>
      <p className="text-xs font-medium text-wk-muted">{description}</p>
    </AppCard>
  );
}
