import { Badge } from "@/components/ui/badge";

interface WakamaAlertSeverityBadgeProps {
  severity?: string;
}

export function WakamaAlertSeverityBadge({ severity }: WakamaAlertSeverityBadgeProps) {
  const normalized = severity?.toUpperCase() ?? "UNKNOWN";

  if (normalized === "CRITICAL") {
    return <Badge variant="danger">Critique</Badge>;
  }
  if (normalized === "WARNING") {
    return <Badge variant="warning">Alerte</Badge>;
  }
  if (normalized === "INFO") {
    return <Badge variant="info">Info</Badge>;
  }
  return <Badge variant="muted">Inconnu</Badge>;
}
