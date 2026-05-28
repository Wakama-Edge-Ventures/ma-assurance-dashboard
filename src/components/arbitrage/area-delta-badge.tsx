import { Badge } from "@/components/ui/badge";
import { getAreaDeltaSeverity, getAreaDeltaSeverityLabel } from "@/lib/workflow";

interface AreaDeltaBadgeProps {
  deltaPercent: number;
}

export function AreaDeltaBadge({ deltaPercent }: AreaDeltaBadgeProps) {
  const severity = getAreaDeltaSeverity(deltaPercent);
  const variant =
    severity === "OK" ? "success" : severity === "WARNING" ? "warning" : "danger";

  return <Badge variant={variant}>{getAreaDeltaSeverityLabel(severity)}</Badge>;
}
