import { Badge } from "@/components/ui/badge";
import { getClaimSeverityLabel } from "@/lib/workflow";

interface ClaimSeverityBadgeProps {
  severity: string;
}

export function ClaimSeverityBadge({ severity }: ClaimSeverityBadgeProps) {
  const variant =
    severity === "CRITICAL" ? "danger" : severity === "WARNING" ? "warning" : "success";
  return <Badge variant={variant}>{getClaimSeverityLabel(severity)}</Badge>;
}
