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

export interface IdjorRagResponseScope {
  tenantId: string;
  tenantKey: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  role: string | null;
}

export interface IdjorRagSecuritySummary {
  ragEnabled: boolean;
  vectorStoreEnabled: boolean;
  embeddingsEnabled: boolean;
  llmEnabled: boolean;
  decisioningEnabled: boolean;
  sourceLabels: string[];
  readOnly: boolean;
}

export interface IdjorRagAssetCounts {
  documents: number;
  chunks: number;
  citations: number;
}

export interface IdjorRagHealth {
  scope: IdjorRagResponseScope;
  counts: IdjorRagAssetCounts;
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagDocument {
  id: string;
  tenantId: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  documentKey: string;
  title: string;
  mimeType: string | null;
  contentHash: string;
  ingestionStatus: string;
  source: DataSource;
  externalReference: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IdjorRagChunk {
  id: string;
  tenantId: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  documentId: string;
  documentKey: string;
  documentTitle: string;
  chunkIndex: number;
  contentText: string;
  contentHash: string;
  tokenCount: number | null;
  source: DataSource;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IdjorRagCitation {
  id: string;
  tenantId: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  documentId: string;
  documentKey: string;
  documentTitle: string;
  chunkId: string | null;
  chunkIndex: number | null;
  citationLabel: string;
  excerptText: string;
  source: DataSource;
  createdAt: string | null;
}

export interface IdjorRagDocumentsSnapshot {
  scope: IdjorRagResponseScope;
  documents: IdjorRagDocument[];
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagChunksSnapshot {
  scope: IdjorRagResponseScope;
  chunks: IdjorRagChunk[];
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagCitationsSnapshot {
  scope: IdjorRagResponseScope;
  citations: IdjorRagCitation[];
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export type IdjorRagDocumentRegistrationSource =
  | "LIVE"
  | "SEED_DEMO"
  | "MANUAL_ESTIMATE"
  | "DEGRADED"
  | "UNAVAILABLE";

export type IdjorRagMetadataRegistrationStatus = "REGISTERED" | "DEGRADED";

export interface IdjorRegisterRagDocumentMetadataInput {
  tenantKey?: string | null;
  tenantId?: string | null;
  documentKey: string;
  title: string;
  source: IdjorRagDocumentRegistrationSource;
  ingestionStatus: IdjorRagMetadataRegistrationStatus;
  externalReference?: string | null;
  metadataJson?: Record<string, unknown> | null;
}

export interface IdjorRegisterRagDocumentMetadataDocument extends IdjorRagDocument {
  metadataJson: Record<string, unknown> | null;
}

export interface IdjorRagLinkedAssetCounts {
  chunks: number;
  embeddings: number;
  citations: number;
}

export interface IdjorRegisterRagDocumentMetadataResult {
  scope: IdjorRagResponseScope;
  operation: "CREATED" | "UPDATED";
  document: IdjorRegisterRagDocumentMetadataDocument;
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  metadataOnly: boolean;
}

export type IdjorRagIngestionReadinessState = "NOT_READY" | "BLOCKED";

export interface IdjorRagIngestionMissingField {
  field: string;
  reason: string;
}

export interface IdjorRagIngestionPreview {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  ingestionStatus: string;
  ingestionReadiness: IdjorRagIngestionReadinessState;
  missingFields: IdjorRagIngestionMissingField[];
  allowedNextSteps: string[];
  blockedReasons: string[];
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  securitySummary: IdjorRagSecuritySummary;
  metadataOnly: boolean;
  resolutionMode: string | null;
  readOnly: boolean;
}

export type IdjorRagAuditEventType =
  | "RAG_DOCUMENT_METADATA_REGISTERED"
  | "RAG_DOCUMENT_METADATA_DEGRADED_REGISTERED"
  | "RAG_INGESTION_PREVIEW_VIEWED"
  | "RAG_INGESTION_PREVIEW_BLOCKED";

export interface IdjorRagAuditEvent {
  id: string;
  tenantId: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  eventType: string;
  documentId: string | null;
  documentKey: string | null;
  source: DataSource;
  ingestionStatus: string | null;
  operation: string | null;
  actorUserId: string | null;
  actorRole: string | null;
  createdAt: string;
}

export interface IdjorRagAuditEventsPage {
  scope: IdjorRagResponseScope;
  events: IdjorRagAuditEvent[];
  nextCursor: string | null;
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagDocumentAuditEventsPage extends IdjorRagAuditEventsPage {
  documentId: string;
}

export interface IdjorRagDocumentUpload {
  id: string;
  tenantId: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  documentId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  quarantineStatus: string;
  storageProvider: string;
  source: DataSource;
  uploadedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IdjorRagDocumentUploadsPage {
  scope: IdjorRagResponseScope;
  documentId: string;
  uploads: IdjorRagDocumentUpload[];
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagUploadIntakeResponse {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  upload: IdjorRagDocumentUpload;
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  quarantineStorage: "LOCAL_PRIVATE";
  publicDownloadEnabled: false;
}

export type IdjorRagExtractionStatus =
  | "EXTRACTED_PENDING_REVIEW"
  | "EXTRACTED_PARTIAL_PENDING_REVIEW"
  | "EXTRACTION_UNSUPPORTED_TYPE"
  | "EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY"
  | "EXTRACTION_FAILED"
  | "UNSUPPORTED_PENDING_EXTRACTOR"
  | "FILE_MISSING"
  | "FAILED";

export interface IdjorRagDocumentExtraction {
  id: string;
  tenantId: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  documentId: string;
  uploadId: string;
  mimeType: string;
  status: IdjorRagExtractionStatus;
  previewText: string | null;
  previewTextLength: number | null;
  errorReason: string | null;
  source: DataSource;
  createdAt: string;
  updatedAt: string;
}

export interface IdjorRagDocumentExtractionsPage {
  scope: IdjorRagResponseScope;
  uploadId: string;
  extractions: IdjorRagDocumentExtraction[];
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagExtractionPreviewResponse {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  uploadId: string;
  extraction: IdjorRagDocumentExtraction;
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagExtractionChunk {
  id: string;
  tenantId: string;
  institutionId: string | null;
  country: string;
  vertical: string;
  documentId: string;
  extractionId: string | null;
  chunkIndex: number;
  contentText: string;
  contentHash: string;
  tokenCount: number | null;
  source: DataSource;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IdjorRagExtractionChunksPage {
  scope: IdjorRagResponseScope;
  extractionId: string;
  chunks: IdjorRagExtractionChunk[];
  securitySummary: IdjorRagSecuritySummary;
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagExtractionChunkingResponse {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  extractionId: string;
  chunks: IdjorRagExtractionChunk[];
  chunkCount: number;
  created: boolean;
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  resolutionMode: string | null;
  readOnly: boolean;
}

export type IdjorRagEmbeddingReadinessState = "NOT_READY" | "BLOCKED";

export type IdjorRagEmbeddingBlockedReason =
  | "NO_CHUNKS"
  | "EMBEDDINGS_FEATURE_FLAG_OFF"
  | "EMBEDDING_PROVIDER_DISABLED"
  | "EMBEDDING_MODEL_DISABLED"
  | "VECTOR_STORE_DISABLED";

export interface IdjorRagEmbeddingRequiredFlag {
  targetType: "RAG" | "PROVIDER" | "MODEL";
  targetKey: string;
  enabled: boolean;
}

export interface IdjorRagEmbeddingProviderStatus {
  providerKey: string | null;
  isEnabled: boolean;
  registryStatus: string | null;
}

export interface IdjorRagEmbeddingModelStatus {
  modelKey: string | null;
  isEnabled: boolean;
  registryStatus: string | null;
}

export interface IdjorRagEmbeddingVectorStoreStatus {
  vectorStoreEnabled: boolean;
  reason: string | null;
}

export interface IdjorRagEmbeddingReadiness {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  extractionId: string;
  eligibleChunksCount: number;
  embeddingReadiness: IdjorRagEmbeddingReadinessState;
  requiredFlags: IdjorRagEmbeddingRequiredFlag[];
  providerStatus: IdjorRagEmbeddingProviderStatus;
  modelStatus: IdjorRagEmbeddingModelStatus;
  vectorStoreStatus: IdjorRagEmbeddingVectorStoreStatus;
  blockedReasons: IdjorRagEmbeddingBlockedReason[];
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  securitySummary: IdjorRagSecuritySummary;
  embeddingsComputed: boolean;
}

export interface IdjorRagEmbeddingReadinessResponse extends IdjorRagEmbeddingReadiness {
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagEmbeddingPreviewRequestResponse {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  extractionId: string;
  previewStatus: "BLOCKED";
  readiness: IdjorRagEmbeddingReadiness;
  embeddingJobCreated: boolean;
  embeddingReferenceCreated: boolean;
  resolutionMode: string | null;
  readOnly: boolean;
}

export type IdjorRagRetrievalReadinessState = "NOT_READY" | "BLOCKED";

export type IdjorRagRetrievalBlockedReason =
  | "NO_CHUNKS"
  | "NO_EMBEDDINGS"
  | "VECTOR_STORE_DISABLED"
  | "RETRIEVAL_DISABLED"
  | "LLM_DISABLED";

export type IdjorRagRetrievalComponentStatus = "DISABLED" | "BLOCKED";

export interface IdjorRagRetrievalReadiness {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  extractionId: string;
  retrievalReadiness: IdjorRagRetrievalReadinessState;
  blockedReasons: IdjorRagRetrievalBlockedReason[];
  chunksCount: number;
  embeddingsCount: number;
  citationsCount: number;
  vectorStoreStatus: IdjorRagRetrievalComponentStatus;
  retrievalStatus: IdjorRagRetrievalComponentStatus;
  llmStatus: IdjorRagRetrievalComponentStatus;
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  securitySummary: IdjorRagSecuritySummary;
  retrievalExecuted: boolean;
  citationsCreated: boolean;
  llmExecuted: boolean;
}

export interface IdjorRagRetrievalReadinessResponse extends IdjorRagRetrievalReadiness {
  resolutionMode: string | null;
  readOnly: boolean;
}

export interface IdjorRagRetrievalPreviewRequestResponse {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  extractionId: string;
  previewStatus: "BLOCKED";
  retrievalReadiness: IdjorRagRetrievalReadinessState;
  blockedReasons: IdjorRagRetrievalBlockedReason[];
  chunksCount: number;
  embeddingsCount: number;
  citationsCount: number;
  vectorStoreStatus: IdjorRagRetrievalComponentStatus;
  retrievalStatus: IdjorRagRetrievalComponentStatus;
  llmStatus: IdjorRagRetrievalComponentStatus;
  readiness: IdjorRagRetrievalReadiness;
  retrievalExecuted: boolean;
  citationsCreated: boolean;
  llmExecuted: boolean;
  resolutionMode: string | null;
  readOnly: boolean;
}

export type IdjorRagLlmReadinessState = "NOT_READY" | "BLOCKED";

export type IdjorRagLlmReadinessFlagKey =
  | "llm-activation"
  | "llm-provider"
  | "llm-model"
  | "llm-prompt-guardrails"
  | "llm-execution"
  | "llm-audit-write";

export type IdjorRagLlmReadinessFlagStates = Record<IdjorRagLlmReadinessFlagKey, boolean>;

export type IdjorRagLlmBlockedReason =
  | "LLM_FEATURE_FLAG_OFF"
  | "LLM_PROVIDER_DISABLED"
  | "LLM_MODEL_DISABLED"
  | "PROMPT_GUARDRAILS_DISABLED"
  | "RETRIEVAL_NOT_READY"
  | "CITATIONS_NOT_READY"
  | "TENANT_SCOPE_REQUIRED"
  | "LLM_EXECUTION_DISABLED";

export interface IdjorRagLlmReadiness {
  scope: IdjorRagResponseScope;
  documentId: string;
  documentKey: string;
  extractionId: string;
  llmReadiness: IdjorRagLlmReadinessState;
  flagStates: IdjorRagLlmReadinessFlagStates;
  blockedReasons: IdjorRagLlmBlockedReason[];
  chunksCount: number;
  embeddingsCount: number;
  citationsCount: number;
  linkedAssetCounts: IdjorRagLinkedAssetCounts;
  securitySummary: IdjorRagSecuritySummary;
  llmExecuted: boolean;
  citationsCreated: boolean;
}

export interface IdjorRagLlmReadinessResponse extends IdjorRagLlmReadiness {
  resolutionMode: string | null;
  readOnly: boolean;
}

export type IdjorRagGovernancePipelineStage =
  | "METADATA"
  | "UPLOAD_QUARANTINE"
  | "EXTRACTION"
  | "CHUNKING"
  | "EMBEDDING_READINESS"
  | "RETRIEVAL_READINESS"
  | "AUDIT";

export type IdjorRagGovernanceStageStatus =
  | "DONE"
  | "BLOCKED"
  | "NOT_READY"
  | "DISABLED";

export type IdjorRagGovernanceBlockedReason =
  | "NO_UPLOADS"
  | "NO_EXTRACTIONS"
  | "EXTRACTION_UNSUPPORTED"
  | "EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY"
  | "EXTRACTION_FAILED"
  | "EXTRACTION_FILE_MISSING"
  | "NO_CHUNKS"
  | "NO_EMBEDDINGS"
  | "EMBEDDINGS_DISABLED"
  | "VECTOR_STORE_DISABLED"
  | "RETRIEVAL_DISABLED"
  | "LLM_DISABLED";

export type IdjorRagGovernanceAllowedNextStep =
  | "UPLOAD_QUARANTINE_DOCUMENT"
  | "REQUEST_EXTRACTION_PREVIEW"
  | "RUN_DETERMINISTIC_CHUNKING"
  | "VIEW_EMBEDDING_READINESS"
  | "REQUEST_EMBEDDING_PREVIEW"
  | "VIEW_RETRIEVAL_READINESS"
  | "REQUEST_RETRIEVAL_PREVIEW"
  | "REVIEW_APPEND_ONLY_AUDIT";

export interface IdjorRagGovernancePipelineStageItem {
  stage: IdjorRagGovernancePipelineStage;
  status: IdjorRagGovernanceStageStatus;
}

export interface IdjorRagGovernanceCounts {
  uploads: number;
  extractions: number;
  chunks: number;
  embeddings: number;
  citations: number;
  auditEvents: number;
}

export interface IdjorRagGovernancePipelineEvent {
  id: string;
  eventType: string;
  source: DataSource;
  operation: string | null;
  uploadId: string | null;
  extractionId: string | null;
  createdAt: string | null;
}

export interface IdjorRagGovernanceCockpit {
  scope: IdjorRagResponseScope;
  viewMode: "DOCUMENT" | "EXTRACTION";
  documentId: string;
  documentKey: string;
  uploadId: string | null;
  extractionId: string | null;
  pipelineStages: IdjorRagGovernancePipelineStageItem[];
  documentStatus: IdjorRagGovernanceStageStatus;
  uploadStatus: IdjorRagGovernanceStageStatus;
  extractionStatus: IdjorRagGovernanceStageStatus;
  chunkingStatus: IdjorRagGovernanceStageStatus;
  embeddingStatus: IdjorRagGovernanceStageStatus;
  retrievalStatus: IdjorRagGovernanceStageStatus;
  auditStatus: IdjorRagGovernanceStageStatus;
  blockedReasons: IdjorRagGovernanceBlockedReason[];
  allowedNextSteps: IdjorRagGovernanceAllowedNextStep[];
  counts: IdjorRagGovernanceCounts;
  pipelineEvents: IdjorRagGovernancePipelineEvent[];
  securitySummary: IdjorRagSecuritySummary;
  retrievalExecuted: boolean;
  citationsCreated: boolean;
  llmExecuted: boolean;
}

export interface IdjorRagGovernanceCockpitResponse extends IdjorRagGovernanceCockpit {
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

export type InsuranceInstitutionDecisionStatus =
  | "DRAFT_REVIEW"
  | "UNDER_INSTITUTION_REVIEW"
  | "DECISION_RECORDED"
  | "READY_FOR_PRICING"
  | "NEEDS_MORE_INFORMATION"
  | "CLOSED_NO_OFFER";

export type InsuranceInstitutionDecisionType =
  | "PROCEED_TO_PRICING"
  | "REQUEST_MORE_INFORMATION"
  | "DECLINE_TO_PROCEED"
  | "DEFER_FOR_COMMITTEE";

export interface InsuranceInstitutionDecision {
  id: string;
  applicationId: string;
  iraxDecisionAssessmentId: string | null;
  institutionId: string;
  country: string;
  version: number;
  status: InsuranceInstitutionDecisionStatus;
  decisionType: InsuranceInstitutionDecisionType;
  decisionLabel: string;
  decisionRationale: string;
  conditions: unknown;
  requiredActions: string[];
  pricingReadiness: Record<string, unknown> | null;
  offerPreparation: Record<string, unknown> | null;
  committeeReview: Record<string, unknown> | null;
  authorityLevel: string | null;
  decidedByUserId: string;
  reviewedByUserId: string | null;
  decidedAt: string | null;
  reviewedAt: string | null;
  sourceLabel: string;
  protocolVersion: string;
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsurancePricingOfferStatus =
  | "OFFER_DRAFT"
  | "OFFER_PREPARED"
  | "UNDER_OFFER_REVIEW"
  | "OFFER_APPROVED_FOR_CONTRACT"
  | "OFFER_NEEDS_MORE_INFORMATION"
  | "OFFER_DECLINED"
  | "OFFER_EXPIRED";

export interface InsurancePricingOffer {
  id: string;
  applicationId: string;
  institutionDecisionId: string | null;
  iraxDecisionAssessmentId: string | null;
  institutionId: string;
  country: string;
  version: number;
  status: InsurancePricingOfferStatus;
  sourceLabel: string;
  pricingVersion: string;
  pricingInputs: Record<string, unknown> | null;
  coverageProposal: Record<string, unknown> | null;
  premiumComputation: Record<string, unknown> | null;
  taxesAndFees: Record<string, unknown> | null;
  discountsAndAdjustments: Record<string, unknown> | null;
  exclusions: unknown;
  conditions: unknown;
  offerSummary: Record<string, unknown> | null;
  offerValidity: Record<string, unknown> | null;
  requiredActions: unknown;
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsurancePolicyContractStatus =
  | "CONTRACT_DRAFT"
  | "READY_FOR_SIGNATURE"
  | "ISSUED_PENDING_PAYMENT"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export interface InsurancePolicyContract {
  id: string;
  applicationId: string;
  pricingOfferId: string | null;
  institutionDecisionId: string | null;
  institutionId: string;
  country: string;
  version: number;
  status: InsurancePolicyContractStatus;
  sourceLabel: string;
  contractVersion: string;
  policyNumber: string;
  contractReference: string;
  insuredPartySnapshot: Record<string, unknown> | null;
  parcelSnapshot: Record<string, unknown> | null;
  coverageTerms: Record<string, unknown> | null;
  premiumSnapshot: Record<string, unknown> | null;
  conditions: unknown;
  exclusions: unknown;
  contractDocuments: Record<string, unknown> | null;
  receiptDraft: Record<string, unknown> | null;
  issuanceAudit: Record<string, unknown> | null;
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  issuedByUserId: string | null;
  reviewedByUserId: string | null;
  issuedAt: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  cancelledAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceEvidenceBundleStatus =
  | "BUNDLE_GENERATED"
  | "UNDER_EVIDENCE_REVIEW"
  | "READY_FOR_ANCHORING"
  | "NEEDS_EVIDENCE_COMPLETION"
  | "BLOCKED_INTEGRITY_ISSUE";

export interface InsuranceEvidenceBundle {
  id: string;
  applicationId: string;
  policyContractId: string | null;
  pricingOfferId: string | null;
  institutionDecisionId: string | null;
  iraxPlanningId: string | null;
  iraxFieldAssessmentId: string | null;
  iraxScientificAssessmentId: string | null;
  iraxConsolidatedAssessmentId: string | null;
  iraxDecisionAssessmentId: string | null;
  institutionId: string;
  country: string;
  version: number;
  status: InsuranceEvidenceBundleStatus;
  sourceLabel: string;
  protocolVersion: string;
  evidenceIndex: unknown;
  chainSummary: Record<string, unknown> | null;
  componentHashes: Record<string, unknown> | null;
  integrityChecks: Record<string, unknown> | null;
  privacyRedaction: Record<string, unknown> | null;
  storageManifest: Record<string, unknown> | null;
  anchoringReadiness: Record<string, unknown> | null;
  bundleHash: string;
  merkleRoot: string | null;
  limitations: string[];
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceClaimCaseStatus =
  | "CLAIM_REPORTED"
  | "UNDER_CLAIM_REVIEW"
  | "NEEDS_MORE_EVIDENCE"
  | "READY_FOR_LOSS_ASSESSMENT"
  | "ACCEPTED_FOR_SETTLEMENT_REVIEW"
  | "CLOSED_NO_SETTLEMENT"
  | "CANCELLED";

export interface InsuranceClaimCase {
  id: string;
  applicationId: string;
  policyContractId: string;
  evidenceBundleId: string | null;
  institutionId: string;
  country: string;
  version: number;
  claimReference: string;
  status: InsuranceClaimCaseStatus;
  sourceLabel: string;
  claimProtocolVersion: string;
  claimType: string;
  eventDate: string | null;
  reportedAt: string;
  reportedByUserId: string | null;
  claimDeclaration: Record<string, unknown> | null;
  policySnapshot: Record<string, unknown> | null;
  lossAssessmentPlan: Record<string, unknown> | null;
  evidenceRequirements: Record<string, unknown> | null;
  triageAssessment: Record<string, unknown> | null;
  coverageContext: Record<string, unknown> | null;
  reserveEstimate: Record<string, unknown> | null;
  reviewNotes: unknown;
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  assignedReviewerId: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceMonitoringSnapshotStatus =
  | "MONITORING_SNAPSHOT_GENERATED"
  | "UNDER_MONITORING_REVIEW"
  | "ALERTS_REQUIRING_ATTENTION"
  | "NO_ACTION_REQUIRED"
  | "NEEDS_DATA_REFRESH";

export interface InsuranceMonitoringSnapshot {
  id: string;
  applicationId: string;
  policyContractId: string | null;
  evidenceBundleId: string | null;
  institutionId: string;
  country: string;
  version: number;
  status: InsuranceMonitoringSnapshotStatus;
  sourceLabel: string;
  monitoringProtocolVersion: string;
  policySurveillance: Record<string, unknown> | null;
  parcelSurveillance: Record<string, unknown> | null;
  climateSurveillance: Record<string, unknown> | null;
  vegetationSurveillance: Record<string, unknown> | null;
  hydrologySurveillance: Record<string, unknown> | null;
  claimsSurveillance: Record<string, unknown> | null;
  complianceSurveillance: Record<string, unknown> | null;
  dataQuality: Record<string, unknown> | null;
  alerts: unknown[];
  recommendedActions: string[];
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceFraudForensicReviewStatus =
  | "FORENSIC_REVIEW_GENERATED"
  | "UNDER_FORENSIC_REVIEW"
  | "ANOMALY_REVIEW_REQUIRED"
  | "CLEARED_FOR_STANDARD_PROCESSING"
  | "NEEDS_ADDITIONAL_EVIDENCE"
  | "ESCALATED_TO_INSTITUTION_COMMITTEE"
  | "CLOSED_NO_ACTION";

export interface InsuranceFraudForensicReview {
  id: string;
  applicationId: string;
  policyContractId: string | null;
  evidenceBundleId: string | null;
  monitoringSnapshotId: string | null;
  institutionId: string;
  country: string;
  version: number;
  status: InsuranceFraudForensicReviewStatus;
  sourceLabel: string;
  protocolVersion: string;
  anomalySignals: unknown[];
  forensicMatrix: unknown[];
  evidenceConsistency: Record<string, unknown> | null;
  identityAndConsentReview: Record<string, unknown> | null;
  geoTemporalReview: Record<string, unknown> | null;
  claimPatternReview: Record<string, unknown> | null;
  documentIntegrityReview: Record<string, unknown> | null;
  riskAndPricingConsistency: Record<string, unknown> | null;
  recommendedHumanActions: string[];
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceOperationsCockpitSnapshotStatus =
  | "OPERATIONS_SNAPSHOT_GENERATED"
  | "UNDER_OPERATIONS_REVIEW"
  | "ACTIONS_REQUIRED"
  | "NO_OPERATIONAL_ACTION_REQUIRED"
  | "NEEDS_REFRESH";

export interface InsuranceOperationsCockpitSnapshot {
  id: string;
  institutionId: string;
  country: string;
  scopeType: string;
  applicationId: string | null;
  version: number;
  status: InsuranceOperationsCockpitSnapshotStatus;
  sourceLabel: string;
  protocolVersion: string;
  pipelineOverview: Record<string, unknown> | null;
  workloadQueues: Record<string, unknown> | null;
  slaIndicators: Record<string, unknown> | null;
  bottleneckAnalysis: Record<string, unknown> | null;
  exceptionList: unknown[];
  claimsOperations: Record<string, unknown> | null;
  monitoringOperations: Record<string, unknown> | null;
  evidenceOperations: Record<string, unknown> | null;
  policyOperations: Record<string, unknown> | null;
  recommendedActions: string[];
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceGovernanceComplianceSnapshotStatus =
  | "COMPLIANCE_SNAPSHOT_GENERATED"
  | "UNDER_COMPLIANCE_REVIEW"
  | "GAPS_REQUIRING_ACTION"
  | "READY_FOR_AUDIT_REVIEW"
  | "NO_COMPLIANCE_ACTION_REQUIRED"
  | "NEEDS_COMPLIANCE_REFRESH";

export interface InsuranceGovernanceComplianceSnapshot {
  id: string;
  institutionId: string;
  country: string;
  scopeType: string;
  applicationId: string | null;
  policyContractId: string | null;
  evidenceBundleId: string | null;
  version: number;
  status: InsuranceGovernanceComplianceSnapshotStatus;
  sourceLabel: string;
  protocolVersion: string;
  consentCompliance: Record<string, unknown> | null;
  dataProtectionReview: Record<string, unknown> | null;
  piiReview: Record<string, unknown> | null;
  auditTrailReview: Record<string, unknown> | null;
  evidenceGovernance: Record<string, unknown> | null;
  tenantScopeReview: Record<string, unknown> | null;
  regulatoryReadiness: Record<string, unknown> | null;
  securityPostureReview: Record<string, unknown> | null;
  complianceGaps: string[];
  recommendedActions: string[];
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceRetexClosureReportStatus =
  | "RETEX_REPORT_GENERATED"
  | "UNDER_RETEX_REVIEW"
  | "LESSONS_REVIEW_REQUIRED"
  | "READY_FOR_INSTITUTION_CLOSURE_REVIEW"
  | "NEEDS_FOLLOW_UP_ACTIONS"
  | "ARCHIVE_PACKAGE_READY"
  | "CLOSED_FOR_LEARNING_ONLY";

export interface InsuranceRetexClosureReport {
  id: string;
  applicationId: string;
  policyContractId: string | null;
  evidenceBundleId: string | null;
  monitoringSnapshotId: string | null;
  fraudForensicReviewId: string | null;
  operationsCockpitSnapshotId: string | null;
  governanceComplianceSnapshotId: string | null;
  institutionId: string;
  country: string;
  version: number;
  status: InsuranceRetexClosureReportStatus;
  sourceLabel: string;
  protocolVersion: string;
  closureScope: Record<string, unknown> | null;
  chainTimeline: unknown[];
  outcomeSummary: Record<string, unknown> | null;
  lessonsLearned: Record<string, unknown> | null;
  operationalFindings: Record<string, unknown> | null;
  riskFindings: Record<string, unknown> | null;
  claimsFindings: Record<string, unknown> | null;
  monitoringFindings: Record<string, unknown> | null;
  governanceFindings: Record<string, unknown> | null;
  evidenceFindings: Record<string, unknown> | null;
  unresolvedItems: string[];
  correctiveActions: string[];
  futureRecommendations: string[];
  closureReadiness: Record<string, unknown> | null;
  archiveReadiness: Record<string, unknown> | null;
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceExecutiveCockpitSnapshotStatus =
  | "EXECUTIVE_COCKPIT_GENERATED"
  | "UNDER_EXECUTIVE_REVIEW"
  | "EXECUTIVE_ACTIONS_REQUIRED"
  | "READY_FOR_STEERING_COMMITTEE"
  | "NO_EXECUTIVE_ACTION_REQUIRED"
  | "NEEDS_EXECUTIVE_REFRESH";

export interface InsuranceExecutiveCockpitSnapshot {
  id: string;
  institutionId: string;
  country: string;
  scopeType: string;
  applicationId: string | null;
  version: number;
  status: InsuranceExecutiveCockpitSnapshotStatus;
  sourceLabel: string;
  protocolVersion: string;
  executiveSummary: Record<string, unknown> | null;
  fullChainMap: unknown[];
  portfolioKpis: Record<string, unknown> | null;
  riskKpis: Record<string, unknown> | null;
  policyKpis: Record<string, unknown> | null;
  claimsKpis: Record<string, unknown> | null;
  evidenceKpis: Record<string, unknown> | null;
  monitoringKpis: Record<string, unknown> | null;
  operationsKpis: Record<string, unknown> | null;
  governanceKpis: Record<string, unknown> | null;
  forensicKpis: Record<string, unknown> | null;
  retexKpis: Record<string, unknown> | null;
  readinessScorecard: Record<string, unknown> | null;
  dataQualityScorecard: Record<string, unknown> | null;
  exceptionBoard: unknown[];
  recommendedHumanActions: string[];
  blockers: string[];
  warnings: string[];
  sideEffects: Record<string, unknown> | null;
  generatedByUserId: string | null;
  reviewedByUserId: string | null;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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
