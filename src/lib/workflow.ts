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

export function getAreaDeltaSeverity(
  deltaPercent: number,
): "OK" | "WARNING" | "CRITICAL" {
  const normalized = Math.abs(deltaPercent);
  if (normalized <= 3) return "OK";
  if (normalized <= 10) return "WARNING";
  return "CRITICAL";
}

export function getAreaDeltaSeverityLabel(
  severity: "OK" | "WARNING" | "CRITICAL",
): string {
  const labels = {
    OK: "Ecart acceptable",
    WARNING: "Ecart a verifier",
    CRITICAL: "Ecart critique",
  } as const;
  return labels[severity];
}

export function getAuditModeLabel(
  mode: "WEB_DEMO" | "NATIVE_AGENT" | "API_IMPORT" | string,
): string {
  const labels: Record<string, string> = {
    WEB_DEMO: "Web demo",
    NATIVE_AGENT: "Agent native",
    API_IMPORT: "Import API",
  };
  return labels[mode] ?? "Mode inconnu";
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

export function calculateRaxBrut(
  gravity: number,
  frequency: number,
  detection: number,
): number {
  const g = Number.isFinite(gravity) ? gravity : 0;
  const f = Number.isFinite(frequency) ? frequency : 0;
  const d = Number.isFinite(detection) ? detection : 0;
  return g * f * d;
}

export function calculateWrs(raxBrut: number): number {
  const raw = (raxBrut / 25) * 100;
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, raw));
}

export function getRiskTierFromWrs(wrs: number): RiskTier {
  if (wrs <= 20) return "LOW_RISK";
  if (wrs <= 50) return "MEDIUM_RISK";
  if (wrs <= 75) return "HIGH_RISK";
  return "UNINSURABLE";
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatScore(value: number): string {
  if (!Number.isFinite(value)) return "0.0";
  return value.toFixed(1);
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

export function getFarmerDecisionLabel(value: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    ACCEPTED: "Acceptee",
    REJECTED: "Refusee",
    EXPIRED: "Expiree",
  };
  return labels[value] ?? "Non renseignee";
}

export function getOfferStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    SENT_TO_INSURER: "Envoyee a l'assureur",
    VALIDATED_BY_INSURER: "Validee assureur",
    PENDING_FARMER: "En attente producteur",
    FARMER_ACCEPTED: "Accord producteur",
    FARMER_REJECTED: "Refus producteur",
    EXPIRED: "Expiree",
  };
  return labels[value] ?? "Statut non renseigne";
}

export function isExpiredDate(value: string | Date): boolean {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

export function getPolicyStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    SUSPENDED: "Suspendue",
    EXPIRED: "Expiree",
    CLOSED: "Cloturee",
    CLAIM_OPEN: "Sinistre en suivi",
  };
  return labels[value] ?? "Statut non renseigne";
}

export function getPolicyExpiryState(
  startDate?: string | Date,
  endDate?: string | Date,
): "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "UNKNOWN" {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const now = new Date();

  if (!end || Number.isNaN(end.getTime())) return "UNKNOWN";
  if (end.getTime() < now.getTime()) return "EXPIRED";
  if (start && !Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) {
    return "UNKNOWN";
  }

  const daysRemaining = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysRemaining <= 45) return "EXPIRING_SOON";
  return "ACTIVE";
}

export function getPolicyExpiryStateLabel(value: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "En couverture",
    EXPIRING_SOON: "Expiration proche",
    EXPIRED: "Expiree",
    UNKNOWN: "Etat inconnu",
  };
  return labels[value] ?? "Etat inconnu";
}
