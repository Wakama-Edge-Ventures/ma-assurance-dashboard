import { Badge } from "@/components/ui/badge";
import { getMissionStatusLabel } from "@/lib/workflow";
import { InsuranceMission } from "@/types";

interface MissionStatusBadgeProps {
  status: InsuranceMission["status"];
}

export function MissionStatusBadge({ status }: MissionStatusBadgeProps) {
  const variant =
    status === "REVIEW_COMPLETE" || status === "DONE"
      ? "success"
      : status === "IN_PROGRESS" || status === "SENT"
        ? "warning"
        : "muted";
  return <Badge variant={variant}>{getMissionStatusLabel(status)}</Badge>;
}
