import { ApplicationStatus, RiskTier } from "@/types";

export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    DRAFT: "Brouillon",
    SUBMITTED: "Soumise",
    UNDER_REVIEW: "En revue",
    REQUIRES_FIELD_AUDIT: "Audit terrain requis",
    PRICED: "Tarification produite",
    APPROVED_BY_INSURER: "Validee par l'assureur",
    REJECTED_BY_INSURER: "Rejetee par l'assureur",
  };
  return labels[status];
}

export function getRiskTierLabel(tier: RiskTier): string {
  const labels: Record<RiskTier, string> = {
    LOW_RISK: "Risque faible",
    MEDIUM_RISK: "Risque moyen",
    HIGH_RISK: "Risque eleve",
    UNINSURABLE: "Non assurable",
  };
  return labels[tier];
}

export function getRiskTierDescription(tier: RiskTier): string {
  const descriptions: Record<RiskTier, string> = {
    LOW_RISK: "Conditions techniques favorables, suivi standard.",
    MEDIUM_RISK: "Surveillance renforcee recommandee.",
    HIGH_RISK: "Revue humaine approfondie recommandee.",
    UNINSURABLE: "Seuil de risque hors cadre produit.",
  };
  return descriptions[tier];
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMAD(value: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium" }).format(date);
}
