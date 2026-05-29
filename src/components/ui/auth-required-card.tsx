import { Lock } from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { SourceBadge } from "@/components/ui/source-badge";

interface AuthRequiredCardProps {
  title?: string;
  description?: string;
}

export function AuthRequiredCard({
  title = "Authentification backend requise",
  description = "Ajoutez un token backend valide pour accéder aux routes protégées /v1/insurance/* et /v1/morocco/*.",
}: AuthRequiredCardProps) {
  return (
    <AppCard className="space-y-2 p-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-amber-300" />
        <p className="text-sm font-medium text-white">{title}</p>
        <SourceBadge source="UNAVAILABLE" />
      </div>
      <p className="text-xs text-slate-300">{description}</p>
    </AppCard>
  );
}
