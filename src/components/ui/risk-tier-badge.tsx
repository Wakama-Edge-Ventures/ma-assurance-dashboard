import { RiskTier } from "@/types";

import { Badge } from "./badge";

interface RiskTierBadgeProps {
  tier: RiskTier;
}

const labels: Record<RiskTier, string> = {
  LOW_RISK: "Risque faible",
  MEDIUM_RISK: "Risque moyen",
  HIGH_RISK: "Risque élevé",
  UNINSURABLE: "Non assurable",
};

export function RiskTierBadge({ tier }: RiskTierBadgeProps) {
  if (tier === "LOW_RISK") {
    return <Badge variant="success">{labels[tier]}</Badge>;
  }

  if (tier === "MEDIUM_RISK") {
    return <Badge variant="warning">{labels[tier]}</Badge>;
  }

  return <Badge variant="danger">{labels[tier]}</Badge>;
}
