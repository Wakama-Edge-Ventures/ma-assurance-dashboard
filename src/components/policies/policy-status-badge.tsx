import { Badge } from "@/components/ui/badge";
import { getPolicyStatusLabel } from "@/lib/workflow";

interface PolicyStatusBadgeProps {
  status: string;
}

export function PolicyStatusBadge({ status }: PolicyStatusBadgeProps) {
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "SUSPENDED"
        ? "warning"
        : status === "CLAIM_OPEN"
          ? "danger"
          : "muted";
  return <Badge variant={variant}>{getPolicyStatusLabel(status)}</Badge>;
}
