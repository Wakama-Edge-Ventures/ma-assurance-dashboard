export type DataSource = "LIVE" | "SEED_DEMO";

export type RiskTier =
  | "LOW_RISK"
  | "MEDIUM_RISK"
  | "HIGH_RISK"
  | "UNINSURABLE";

export type ApplicationStatus =
  | "DRAFT"
  | "MFA_VERIFIED"
  | "MISSION_CONFIGURED"
  | "MISSION_SENT"
  | "FIELD_AUDIT_COMPLETE"
  | "BACK_OFFICE_REVIEW"
  | "READY_FOR_SCORING"
  | "SCORED"
  | "OFFER_SENT"
  | "FARMER_ACCEPTED"
  | "CONTRACT_SIGNED"
  | "ACTIVE"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REQUIRES_FIELD_AUDIT"
  | "PRICED"
  | "APPROVED_BY_INSURER"
  | "REJECTED_BY_INSURER";

export interface Farmer {
  id: string;
  fullName: string;
  nationalIdMasked: string;
  phone: string;
  region: string;
  primaryCrop: string;
  totalAreaHa: number;
  source: DataSource;
}

export interface Cooperative {
  id: string;
  name: string;
  region: string;
  memberCount: number;
  aggregatedAreaHa: number;
  contactName: string;
  source: DataSource;
}

export interface InsuranceApplication {
  id: string;
  reference: string;
  farmerId: string;
  cooperativeId?: string;
  insurerName: string;
  cropType: string;
  areaHa: number;
  province?: string;
  commune?: string;
  updatedAt?: string;
  requestedCoverageMad: number;
  status: ApplicationStatus;
  riskTier: RiskTier;
  createdAt: string;
  source: DataSource;
}

export interface InsuranceMission {
  id: string;
  applicationId: string;
  missionType: "FIELD_VISIT" | "PHONE_VERIFICATION" | "SATELLITE_REVIEW";
  assignedTo: string;
  scheduledFor: string;
  status:
    | "CONFIG_PENDING"
    | "PLANNED"
    | "SENT"
    | "IN_PROGRESS"
    | "AUDIT_COMPLETE"
    | "REVIEW_COMPLETE"
    | "DONE";
  region: string;
  source: DataSource;
}

export interface InsuranceFieldAudit {
  id: string;
  applicationId: string;
  missionId?: string;
  farmerId: string;
  declaredAreaHa: number;
  measuredAreaHa: number;
  areaDeltaPercent: number;
  declaredPolygon?: string;
  measuredPolygon?: string;
  assetsApprovedCount: number;
  assetsRejectedCount: number;
  integrityHash: string;
  auditMode: "WEB_DEMO" | "NATIVE_AGENT" | "API_IMPORT";
  status: "DRAFT" | "IN_REVIEW" | "COMPLETED";
  createdAt: string;
  completedAt?: string;
  vegetationScore: number;
  irrigationType: "PLUVIAL" | "GOUTTE_A_GOUTTE" | "GRAVITAIRE";
  anomalyDetected: boolean;
  notes: string;
  source: DataSource;
}

export interface RaxEvaluation {
  id: string;
  applicationId: string;
  gravity?: number;
  frequency?: number;
  detection?: number;
  raxBrut?: number;
  wrsScore: number;
  raxScore: number;
  riskTier: RiskTier;
  recommendation: string;
  source: DataSource;
}

export interface CommercialOffer {
  id: string;
  applicationId: string;
  raxEvaluationId?: string;
  insurerName: string;
  totalInsuredCapital?: number;
  purePremiumAmount?: number;
  managementFees?: number;
  taxRateApplied?: number;
  taxAmount?: number;
  totalCommercialPremiumTtc?: number;
  farmerDecision?: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  farmerDecisionAt?: string;
  farmerRejectionReason?: string;
  generatedAt?: string;
  expiresAt?: string;
  shortUrlToken?: string;
  agencyPickupToken?: string;
  technicalPremiumMad: number;
  suggestedCommercialPremiumMad: number;
  deductiblePct: number;
  status:
    | "DRAFT"
    | "SENT_TO_INSURER"
    | "VALIDATED_BY_INSURER"
    | "PENDING_FARMER"
    | "FARMER_ACCEPTED"
    | "FARMER_REJECTED"
    | "EXPIRED";
  source: DataSource;
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  applicationId: string;
  insurerName: string;
  coverageMad: number;
  annualPremiumMad: number;
  effectiveDate: string;
  expiryDate: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  source: DataSource;
}

export interface MonitoringAlert {
  id: string;
  policyId: string;
  level: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  createdAt: string;
  resolved: boolean;
  source: DataSource;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  claimType: "DROUGHT" | "FLOOD" | "PEST" | "OTHER";
  estimatedLossMad: number;
  status:
    | "DECLARED"
    | "UNDER_REVIEW"
    | "APPROVED_BY_INSURER"
    | "REJECTED_BY_INSURER";
  source: DataSource;
}
