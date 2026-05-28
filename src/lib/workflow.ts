import { ApplicationStatus, InsuranceMission, RiskTier } from "@/types";

export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    DRAFT: "Brouillon",
    MFA_VERIFIED: "MFA verifiee",
    MISSION_CONFIGURED: "Mission configuree",
    MISSION_SENT: "Mission envoyee",
    FIELD_AUDIT_COMPLETE: "Audit terrain termine",
    BACK_OFFICE_REVIEW: "Revue back-office",
    READY_FOR_SCORING: "Pret pour scoring",
    SCORED: "Scoring termine",
    OFFER_SENT: "Offre envoyee",
    FARMER_ACCEPTED: "Offre acceptee",
    CONTRACT_SIGNED: "Contrat signe",
    ACTIVE: "Actif",
    SUBMITTED: "Soumise",
    UNDER_REVIEW: "En revue",
    REQUIRES_FIELD_AUDIT: "Audit terrain requis",
    PRICED: "Tarification produite",
    APPROVED_BY_INSURER: "Validee par l'assureur",
    REJECTED_BY_INSURER: "Rejetee par l'assureur",
  };
  return labels[status];
}

export function getApplicationStatusDescription(status: ApplicationStatus): string {
  const descriptions: Record<ApplicationStatus, string> = {
    DRAFT: "Dossier en cours de saisie initiale.",
    MFA_VERIFIED: "Identite et acces verifies.",
    MISSION_CONFIGURED: "Mission terrain preparee.",
    MISSION_SENT: "Mission transmise aux operateurs.",
    FIELD_AUDIT_COMPLETE: "Collecte terrain finalisee.",
    BACK_OFFICE_REVIEW: "Verification documentaire en back-office.",
    READY_FOR_SCORING: "Dossier prete a l'evaluation technique.",
    SCORED: "Scoring technique calcule.",
    OFFER_SENT: "Proposition transmise a l'assureur.",
    FARMER_ACCEPTED: "Acceptation producteur en attente assureur.",
    CONTRACT_SIGNED: "Contrat signe par l'assureur.",
    ACTIVE: "Contrat actif et monitorable.",
    SUBMITTED: "Demande soumise au pipeline.",
    UNDER_REVIEW: "Analyse technique en cours.",
    REQUIRES_FIELD_AUDIT: "Audit terrain necessaire.",
    PRICED: "Tarification technique preparee.",
    APPROVED_BY_INSURER: "Validation finale assureur effectuee.",
    REJECTED_BY_INSURER: "Decision de rejet assureur.",
  };
  return descriptions[status];
}

export function getApplicationStatusOrder(status: ApplicationStatus): number {
  const order: Record<ApplicationStatus, number> = {
    DRAFT: 1,
    MFA_VERIFIED: 2,
    MISSION_CONFIGURED: 3,
    MISSION_SENT: 4,
    FIELD_AUDIT_COMPLETE: 5,
    BACK_OFFICE_REVIEW: 6,
    READY_FOR_SCORING: 7,
    SCORED: 8,
    OFFER_SENT: 9,
    FARMER_ACCEPTED: 10,
    PRICED: 11,
    CONTRACT_SIGNED: 12,
    ACTIVE: 13,
    SUBMITTED: 2,
    UNDER_REVIEW: 6,
    REQUIRES_FIELD_AUDIT: 4,
    APPROVED_BY_INSURER: 13,
    REJECTED_BY_INSURER: 13,
  };
  return order[status];
}

export function getMissionStatusLabel(status: InsuranceMission["status"]): string {
  const labels: Record<InsuranceMission["status"], string> = {
    CONFIG_PENDING: "A configurer",
    PLANNED: "Planifiee",
    SENT: "Envoyee",
    IN_PROGRESS: "En cours",
    AUDIT_COMPLETE: "Audit termine",
    REVIEW_COMPLETE: "Revue terminee",
    DONE: "Terminee",
  };
  return labels[status];
}

export function getMissionStatusDescription(status: InsuranceMission["status"]): string {
  const descriptions: Record<InsuranceMission["status"], string> = {
    CONFIG_PENDING: "Mission en attente de parametrage.",
    PLANNED: "Mission planifiee et prete a l'envoi.",
    SENT: "Mission transmise a l'agent terrain.",
    IN_PROGRESS: "Collecte terrain en execution.",
    AUDIT_COMPLETE: "Audit synchronise, pret pour arbitrage.",
    REVIEW_COMPLETE: "Revue back-office terminee.",
    DONE: "Mission cloturee.",
  };
  return descriptions[status];
}

export function getMissionStatusOrder(status: InsuranceMission["status"]): number {
  const order: Record<InsuranceMission["status"], number> = {
    CONFIG_PENDING: 1,
    PLANNED: 2,
    SENT: 3,
    IN_PROGRESS: 4,
    AUDIT_COMPLETE: 5,
    REVIEW_COMPLETE: 6,
    DONE: 7,
  };
  return order[status];
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
