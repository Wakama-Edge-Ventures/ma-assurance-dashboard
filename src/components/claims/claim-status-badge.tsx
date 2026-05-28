import { Badge } from "@/components/ui/badge";
import { getClaimStatusLabel } from "@/lib/workflow";

interface ClaimStatusBadgeProps {
  status: string;
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const variant =
    status === "CLOSED" ||
    status === "APPROVED" ||
    status === "APPROVED_BY_INSURER"
      ? "success"
      : status === "REJECTED" || status === "REJECTED_BY_INSURER"
        ? "danger"
        : "warning";
  return <Badge variant={variant}>{getClaimStatusLabel(status)}</Badge>;
}
