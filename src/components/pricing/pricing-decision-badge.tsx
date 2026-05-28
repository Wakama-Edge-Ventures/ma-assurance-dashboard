import { Badge } from "@/components/ui/badge";
import { getFarmerDecisionLabel } from "@/lib/workflow";

interface PricingDecisionBadgeProps {
  decision: string;
}

export function PricingDecisionBadge({ decision }: PricingDecisionBadgeProps) {
  const variant =
    decision === "ACCEPTED"
      ? "success"
      : decision === "REJECTED" || decision === "EXPIRED"
        ? "danger"
        : "warning";
  return <Badge variant={variant}>{getFarmerDecisionLabel(decision)}</Badge>;
}
