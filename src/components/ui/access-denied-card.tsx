import { ShieldX } from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { SourceBadge } from "@/components/ui/source-badge";

interface AccessDeniedCardProps {
  title?: string;
  description?: string;
}

export function AccessDeniedCard({
  title = "Acces refuse",
  description = "Votre role ne permet pas d'acceder a cette ressource (403).",
}: AccessDeniedCardProps) {
  return (
    <AppCard className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <ShieldX className="h-4 w-4 text-rose-300" />
        <p className="text-sm font-medium text-white">{title}</p>
        <SourceBadge source="UNAVAILABLE" />
      </div>
      <p className="text-xs text-slate-300">{description}</p>
    </AppCard>
  );
}
