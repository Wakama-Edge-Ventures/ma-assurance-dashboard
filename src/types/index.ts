export type DataSource =
  | "LIVE"
  | "SEED_DEMO"
  | "MANUAL_ESTIMATE"
  | "EXCEL_IMPORT"
  | "UNAVAILABLE"
  | "DEGRADED"
  | "MANUAL_ENTRY";

export interface IdjorFoundationTenant {
  tenantKey: string;
  institutionId: string | null;
  country: string;
  vertical: string;
}

export interface IdjorFoundationCounts {
  agents: number;
  engines: number;
  tools: number;
  providers: number;
  models: number;
  featureFlags: number;
}

export interface IdjorFoundationSecuritySummary {
  llmEnabled: boolean;
  vectorStoreEnabled: boolean;
  decisioningEnabled: boolean;
  sourceLabels: string[];
  readOnly: boolean;
}

export interface IdjorFoundationHealth {
  tenant: IdjorFoundationTenant;
  counts: IdjorFoundationCounts;
  allFeatureFlagsOff: boolean;
  allProvidersDisabled: boolean;
  allModelsDisabled: boolean;
  allToolsReadOnly: boolean;
  securitySummary: IdjorFoundationSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

interface IdjorRegistryBaseEntry {
  id: string;
  displayName: string;
  isEnabled: boolean;
  source: DataSource;
  description: string | null;
}

export interface IdjorRegistryAgent extends IdjorRegistryBaseEntry {
  agentKey: string;
  layer: string;
  registryStatus: string;
  isReadOnly: boolean;
}

export interface IdjorRegistryEngine extends IdjorRegistryBaseEntry {
  engineKey: string;
  agentId: string | null;
  registryStatus: string;
  isReadOnly: boolean;
}

export interface IdjorRegistryTool extends IdjorRegistryBaseEntry {
  toolKey: string;
  engineId: string | null;
  accessMode: string;
  isReadOnly: boolean;
  allowedRoles: string[];
}

export interface IdjorFeatureFlag {
  id: string;
  targetType: string;
  targetKey: string;
  enabled: boolean;
  rolloutState: string;
  source: DataSource;
  notes: string | null;
}

export interface IdjorProviderCatalog extends IdjorRegistryBaseEntry {
  providerKey: string;
  providerType: string;
  baseUrl: string | null;
  registryStatus: string;
}

export interface IdjorModelCatalog extends IdjorRegistryBaseEntry {
  modelKey: string;
  providerCatalogId: string | null;
  modelFamily: string;
  isDefault: boolean;
  registryStatus: string;
}

export interface IdjorFoundationRegistry {
  tenant: IdjorFoundationTenant;
  agents: IdjorRegistryAgent[];
  engines: IdjorRegistryEngine[];
  tools: IdjorRegistryTool[];
  featureFlags: IdjorFeatureFlag[];
  providers: IdjorProviderCatalog[];
  models: IdjorModelCatalog[];
  securitySummary: IdjorFoundationSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

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
  cooperativeId?: string;
  cooperativeName?: string;
  kycStatus?: string;
  lat?: number;
  lng?: number;
  source: DataSource;
}

export interface Cooperative {
  id: string;
  name: string;
  region: string;
  filiere?: string;
  memberCount: number;
  aggregatedAreaHa: number;
  contactName: string;
  lat?: number;
  lng?: number;
  source: DataSource;
}

export interface Parcelle {
  id: string;
  farmerId?: string;
  cooperativeId?: string;
  name: string;
  culture?: string;
  superficie?: number;
  areaHa?: number;
  lat?: number;
  lng?: number;
  polygone?: string;
  ndvi?: number;
  status?: string;
  source: DataSource;
}

export interface WakamaAlert {
  id: string;
  farmerId?: string;
  cooperativeId?: string;
  parcelleId?: string;
  farmerName?: string;
  cooperativeName?: string;
  parcelleName?: string;
  type?: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "UNKNOWN";
  title?: string;
  message: string;
  read?: boolean;
  createdAt: string;
  source: DataSource;
}

export interface NdviSnapshot {
  parcelleId: string;
  ndvi: number;
  capturedAt?: string;
  source: DataSource;
  provider?: string;
}

export interface IotNode {
  id: string;
  cooperativeId?: string;
  farmerId?: string;
  name?: string;
  status?: string;
  lat?: number;
  lng?: number;
  lastSeenAt?: string;
  source: DataSource;
}

export interface IotReading {
  id: string;
  nodeId: string;
  temperatureAir?: number;
  humidityAir?: number;
  soilMoisture?: number;
  soilTemperature?: number;
  capturedAt: string;
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
  missionId?: string | null;
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
  // Phase 33A fields — back-office field audit review
  missionDispatchId?: string | null;
  missionConfigId?: string | null;
  agentUserId?: string | null;
  measuredSurfaceHa?: number | null;
  measuredPolygonGeojson?: string | null;
  hashStatus?: string | null;
  fieldAuditStatus?: string | null;
  syncedAt?: string | null;
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
  offerId?: string;
  farmerId?: string;
  policyNumber: string;
  applicationId: string;
  insurerName: string;
  totalInsuredCapital?: number;
  totalPremiumTtc?: number;
  coverageStartDate?: string;
  coverageEndDate?: string;
  issuedAt?: string;
  coverageMad: number;
  annualPremiumMad: number;
  effectiveDate: string;
  expiryDate: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CLOSED" | "CLAIM_OPEN";
  source: DataSource;
}

export interface MonitoringAlert {
  id: string;
  policyId: string;
  applicationId?: string;
  farmerId?: string;
  type?: "NDVI" | "WEATHER" | "IOT" | "FIELD" | "SYSTEM";
  severity?: "INFO" | "WARNING" | "CRITICAL";
  status?: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  message?: string;
  level: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  createdAt: string;
  resolved: boolean;
  source: DataSource;
}

export interface InsuranceClaim {
  id: string;
  applicationId?: string;
  farmerId?: string;
  monitoringAlertId?: string;
  claimNumber: string;
  policyId: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
  estimatedAmount?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  claimType: "DROUGHT" | "FLOOD" | "PEST" | "OTHER";
  estimatedLossMad: number;
  status:
    | "OPEN"
    | "DECLARED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "CLOSED"
    | "APPROVED_BY_INSURER"
    | "REJECTED_BY_INSURER";
  source: DataSource;
}

export type InsuranceDcaApplicationStatus =
  | "DRAFT"
  | "DRAFT_SUBMITTED"
  | "UNDER_RISK_REVIEW"
  | "MORE_INFO_REQUIRED"
  | "READY_FOR_MISSION_CONFIG"
  | "MISSION_CONFIG_DRAFT"
  | "MISSION_CONFIGURED"
  | "MISSION_DISPATCH_DRAFT"
  | "MISSION_SENT"
  | "FIELD_AUDIT_COMPLETE"
  | "BACK_OFFICE_REVIEW"
  | "RAX_SCORED"
  | "OFFER_SENT"
  | "FARMER_ACCEPTED"
  | "CONTRACT_SIGNED"
  | "ACTIVE"
  | "CLAIM_OPEN"
  | "CLOSED"
  | "REJECTED";

export interface InsuranceDcaSideEffects {
  missionCreated: boolean;
  policyCreated: boolean;
  claimCreated: boolean;
  raxCalculated: boolean;
  pricingCalculated: boolean;
  blockchainAnchored: boolean;
  sideEffectsSource?: "BACKEND" | "FRONTEND_FALLBACK";
  sourceNote?: string;
}

export interface InsuranceDcaFarmer {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneMasked?: string | null;
  cinMasked?: string | null;
  preferredLanguage?: string | null;
  source?: DataSource;
}

export interface InsuranceDcaParcelle {
  id?: string | null;
  name?: string | null;
  culture?: string | null;
  superficie?: number | null;
  declaredArea?: number | null;
  lat?: number | null;
  lng?: number | null;
  country?: string | null;
  source?: DataSource;
}

export interface InsuranceDcaClaimHistoryItem {
  id?: string | null;
  status?: string | null;
  createdAt?: string | null;
  year?: number | null;
  type?: string | null;
  cause?: string | null;
  estimatedAmount?: number | null;
  note?: string | null;
  source: DataSource;
}

export interface InsuranceDcaPreparedDocument {
  id?: string | null;
  type?: string | null;
  label?: string | null;
  filename?: string | null;
  name?: string | null;
  status?: string | null;
  url?: string | null;
  createdAt?: string | null;
  source: DataSource;
  // Phase 1.5C — document reception metadata from backend upload
  hasUploadedFile?: boolean | null;
  originalFilename?: string | null;
  storedFilename?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  sha256Hash?: string | null;
  receivedAt?: string | null;
  storageProvider?: string | null;
  sourceLabel?: string | null;
}

export interface InsuranceDcaApplication {
  id: string;
  reference: string | null;
  dcaNumber?: string | null;
  status: InsuranceDcaApplicationStatus | "UNAVAILABLE";
  backendStatus?: string | null;
  source: DataSource;
  declarativeSource?: DataSource;
  sourceOfTruth?: string | null;
  legacyAuditFallbackUsed?: boolean | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  periodYears?: number | null;
  noClaimsDeclared?: boolean | null;
  applicationCountry?: string | null;
  farmerCountry?: string | null;
  parcelleCountry?: string | null;
  farmer: InsuranceDcaFarmer;
  parcelle: InsuranceDcaParcelle;
  crop?: string | null;
  culture?: string | null;
  declaredArea?: number | null;
  consentCndp?: boolean | null;
  consentCndpAt?: string | null;
  consentCndpSource?: DataSource;
  preparedDocuments: InsuranceDcaPreparedDocument[];
  claimHistory: InsuranceDcaClaimHistoryItem[];
  sideEffects: InsuranceDcaSideEffects;
}
