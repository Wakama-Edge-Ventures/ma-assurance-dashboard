import { AlertTriangle } from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { SourceBadge } from "@/components/ui/source-badge";

interface DegradedStateCardProps {
  title?: string;
  description: string;
}

export function DegradedStateCard({
  title = "Service dégradé",
  description,
}: DegradedStateCardProps) {
  return (
    <AppCard className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-wk-amberInk" />
        <p className="text-sm font-bold text-wk-text">{title}</p>
        <SourceBadge source="DEGRADED" />
      </div>
      <p className="text-xs font-medium text-wk-muted">{description}</p>
    </AppCard>
  );
}
