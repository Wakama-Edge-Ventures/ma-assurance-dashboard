import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/types";
import { getApplicationStatusLabel } from "@/lib/workflow";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const variant =
    status === "REJECTED_BY_INSURER"
      ? "danger"
      : status === "APPROVED_BY_INSURER" || status === "ACTIVE"
        ? "success"
        : status === "REQUIRES_FIELD_AUDIT" || status === "UNDER_REVIEW"
          ? "warning"
          : "muted";

  return <Badge variant={variant}>{getApplicationStatusLabel(status)}</Badge>;
}
