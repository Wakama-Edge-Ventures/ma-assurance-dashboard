import { Badge } from "@/components/ui/badge";
import { getMonitoringSeverityLabel } from "@/lib/workflow";

interface MonitoringSeverityBadgeProps {
  severity: string;
}

export function MonitoringSeverityBadge({ severity }: MonitoringSeverityBadgeProps) {
  const variant =
    severity === "CRITICAL" ? "danger" : severity === "WARNING" ? "warning" : "success";
  return <Badge variant={variant}>{getMonitoringSeverityLabel(severity)}</Badge>;
}
