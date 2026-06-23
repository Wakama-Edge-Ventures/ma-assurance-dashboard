import { getBackendAuthToken, handleSessionExpired } from "@/lib/auth";
import {
  extractArrayFromApiResponse,
  mapInsuranceDcaApplication,
} from "@/lib/dto-mappers";
import { normalizeSource } from "@/lib/data-source";
import {
  DataSource,
  IdjorFeatureFlag,
  IdjorFoundationHealth,
  IdjorFoundationRegistry,
  IdjorFoundationSecuritySummary,
  IdjorRegisterRagDocumentMetadataInput,
  IdjorRegisterRagDocumentMetadataResult,
  IdjorFoundationTenant,
  IdjorRagAssetCounts,
  IdjorRagAuditEvent,
  IdjorRagAuditEventsPage,
  IdjorRagChunk,
  IdjorRagChunksSnapshot,
  IdjorRagCitation,
  IdjorRagCitationsSnapshot,
  IdjorRagDocument,
  IdjorRagDocumentAuditEventsPage,
  IdjorRagDocumentRegistrationSource,
  IdjorRagDocumentsSnapshot,
  IdjorRagDocumentExtraction,
  IdjorRagDocumentExtractionsPage,
  IdjorRagDocumentUpload,
  IdjorRagDocumentUploadsPage,
  IdjorRagEmbeddingBlockedReason,
  IdjorRagEmbeddingModelStatus,
  IdjorRagEmbeddingPreviewRequestResponse,
  IdjorRagEmbeddingProviderStatus,
  IdjorRagEmbeddingReadiness,
  IdjorRagEmbeddingReadinessResponse,
  IdjorRagEmbeddingRequiredFlag,
  IdjorRagEmbeddingVectorStoreStatus,
  IdjorRagGovernanceAllowedNextStep,
  IdjorRagGovernanceBlockedReason,
  IdjorRagGovernanceCockpit,
  IdjorRagGovernanceCockpitResponse,
  IdjorRagGovernanceCounts,
  IdjorRagGovernancePipelineEvent,
  IdjorRagGovernancePipelineStage,
  IdjorRagGovernancePipelineStageItem,
  IdjorRagGovernanceStageStatus,
  IdjorRagExtractionChunk,
  IdjorRagExtractionChunksPage,
  IdjorRagExtractionChunkingResponse,
  IdjorRagExtractionPreviewResponse,
  IdjorRagHealth,
  IdjorRagIngestionMissingField,
  IdjorRagIngestionPreview,
  IdjorRagIngestionReadinessState,
  IdjorRagLinkedAssetCounts,
  IdjorRagLlmBlockedReason,
  IdjorRagLlmPreviewCitation,
  IdjorRagLlmPreviewRequestResponse,
  IdjorRagLlmReadinessFlagKey,
  IdjorRagLlmReadinessFlagStates,
  IdjorRagLlmReadinessResponse,
  IdjorRagLlmReadinessState,
  IdjorRagMetadataRegistrationStatus,
  IdjorRagRetrievalBlockedReason,
  IdjorRagRetrievalComponentStatus,
  IdjorRagRetrievalPreviewRequestResponse,
  IdjorRagRetrievalReadiness,
  IdjorRagRetrievalReadinessResponse,
  IdjorRagRetrievalReadinessState,
  IdjorRagResponseScope,
  IdjorRagSecuritySummary,
  IdjorRagUploadIntakeResponse,
  IdjorModelCatalog,
  IdjorProviderCatalog,
  IdjorRegistryAgent,
  IdjorRegistryEngine,
  IdjorRegistryTool,
  InsuranceDcaApplication,
  InsuranceDcaSideEffects,
  InsuranceFieldAudit,
  InsuranceInstitutionDecision,
  InsuranceInstitutionDecisionStatus,
  InsuranceInstitutionDecisionType,
  InsurancePolicyContract,
  InsurancePolicyContractStatus,
  InsuranceEvidenceBundle,
  InsuranceEvidenceBundleStatus,
  InsuranceClaimCase,
  InsuranceClaimCaseStatus,
  InsuranceMonitoringSnapshot,
  InsuranceMonitoringSnapshotStatus,
  InsuranceFraudForensicReview,
  InsuranceFraudForensicReviewStatus,
  InsuranceOperationsCockpitSnapshot,
  InsuranceOperationsCockpitSnapshotStatus,
  InsuranceGovernanceComplianceSnapshot,
  InsuranceGovernanceComplianceSnapshotStatus,
  InsuranceRetexClosureReport,
  InsuranceRetexClosureReportStatus,
  InsuranceExecutiveCockpitSnapshot,
  InsuranceExecutiveCockpitSnapshotStatus,
  InsurancePricingOffer,
  InsurancePricingOfferStatus,
} from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.wakama.farm";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export interface InstitutionLoginResult {
  token: string | null;
  payload: unknown;
}

export type InsuranceRiskReviewStatus =
  | "UNDER_RISK_REVIEW"
  | "MORE_INFO_REQUIRED"
  | "READY_FOR_MISSION_CONFIG";

export interface UpdateInsuranceApplicationStatusPayload {
  status: InsuranceRiskReviewStatus;
  riskReviewNote?: string;
  riskReviewReason?: string;
}

type RiskReviewSideEffects = Pick<
  InsuranceDcaSideEffects,
  | "missionCreated"
  | "policyCreated"
  | "claimCreated"
  | "raxCalculated"
  | "pricingCalculated"
  | "blockchainAnchored"
>;

export interface UpdateInsuranceApplicationStatusResult {
  application: InsuranceDcaApplication | null;
  status: string | null;
  sideEffects: RiskReviewSideEffects;
  sideEffectsPresent: boolean;
}

export interface InsuranceMissionConfigRequiredChecks {
  polygon: boolean;
  identity: boolean;
  landDocument: boolean;
  surfaceTolerance: boolean;
}

export interface InsuranceMissionConfigSideEffects {
  missionCreated: boolean;
  missionSent: boolean;
  fieldAuditCreated: boolean;
  raxCalculated: boolean;
  pricingCalculated: boolean;
  policyCreated: boolean;
  claimCreated: boolean;
  evidenceBundleCreated: boolean;
  blockchainAnchored: boolean;
}

export interface InsuranceMissionConfigPayload {
  missionType: string;
  proofLevel: string;
  surfaceTolerancePercent: number;
  requiresPolygonCheck: boolean;
  requiresCinCheck: boolean;
  requiresLandDocumentCheck: boolean;
  requiredDocuments: string[];
  requiredChecks: InsuranceMissionConfigRequiredChecks;
  noteDirectionRisques?: string;
  status: string;
}

export interface InsuranceMissionConfig {
  id?: string | null;
  missionType: string;
  proofLevel: string;
  surfaceTolerancePercent: number;
  requiresPolygonCheck: boolean;
  requiresCinCheck: boolean;
  requiresLandDocumentCheck: boolean;
  requiredDocuments: string[];
  requiredChecks: InsuranceMissionConfigRequiredChecks;
  noteDirectionRisques: string;
  status: string;
  sideEffects: InsuranceMissionConfigSideEffects;
  version: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateInsuranceMissionDispatchDraftPayload {
  missionConfigId: string;
  dispatchMode: "DRAFT_ONLY";
  suggestedAgentId?: string | null;
  scheduledWindowStart?: string | null;
  scheduledWindowEnd?: string | null;
  dispatchNote?: string | null;
}

export interface InsuranceMissionDispatchDraft {
  id: string;
  applicationId: string;
  missionConfigId: string;
  missionConfigVersion?: number | null;
  dispatchMode: "DRAFT_ONLY";
  suggestedAgentId?: string | null;
  scheduledWindowStart?: string | null;
  scheduledWindowEnd?: string | null;
  dispatchNote?: string | null;
  status: "MISSION_DISPATCH_DRAFT";
  source: "LIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface InsuranceMissionDispatchDraftSideEffects {
  missionCreated?: boolean;
  missionSent: boolean;
  fieldAuditCreated: boolean;
  policyCreated: boolean;
  claimCreated: boolean;
  raxCalculated: boolean;
  pricingCalculated: boolean;
  evidenceBundleCreated: boolean;
  blockchainAnchored: boolean;
}

export interface CreateInsuranceMissionDispatchDraftResult {
  missionDispatchDraft: InsuranceMissionDispatchDraft;
  application?: {
    id: string;
    status?: string;
    frontendStatus?: string;
  };
  sideEffects: InsuranceMissionDispatchDraftSideEffects;
}

function toUrl(path: string) {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${safePath}`;
}

function withQuery(
  path: string,
  query: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (!value?.trim()) continue;
    params.set(key, value.trim());
  }

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }
  return `API request failed with status ${status}`;
}

function readString(record: unknown, key: string): string | null {
  if (!record || typeof record !== "object") return null;
  const value = (record as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readBoolean(record: unknown, key: string): boolean | null {
  if (!record || typeof record !== "object") return null;
  const value = (record as Record<string, unknown>)[key];
  return typeof value === "boolean" ? value : null;
}

function readBooleanLike(record: unknown, key: string): boolean | null {
  if (!record || typeof record !== "object") return null;
  const value = (record as Record<string, unknown>)[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return null;
}

function readNumberLike(record: unknown, key: string): number | null {
  if (!record || typeof record !== "object") return null;
  const value = (record as Record<string, unknown>)[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStringArray(record: unknown, key: string): string[] {
  if (!record || typeof record !== "object") return [];
  const value = (record as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

function readObjectArray(record: unknown, key: string): Record<string, unknown>[] {
  if (!record || typeof record !== "object") return [];
  const value = (record as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(asObject(item)));
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function mapIdjorTenant(value: unknown): IdjorFoundationTenant | null {
  const tenant = asObject(value);
  const tenantKey = readString(tenant, "tenantKey");
  const country = readString(tenant, "country");
  const vertical = readString(tenant, "vertical");

  if (!tenantKey || !country || !vertical) {
    return null;
  }

  return {
    tenantKey,
    institutionId: readString(tenant, "institutionId"),
    country,
    vertical,
  };
}

function mapIdjorSecuritySummary(value: unknown): IdjorFoundationSecuritySummary {
  return {
    llmEnabled: readBooleanLike(value, "llmEnabled") ?? false,
    vectorStoreEnabled: readBooleanLike(value, "vectorStoreEnabled") ?? false,
    decisioningEnabled: readBooleanLike(value, "decisioningEnabled") ?? false,
    sourceLabels: readStringArray(value, "sourceLabels"),
    readOnly: readBooleanLike(value, "readOnly") ?? true,
  };
}

function mapIdjorRagScope(value: unknown): IdjorRagResponseScope | null {
  const scope = asObject(value);
  const tenantId = readString(scope, "tenantId");
  const tenantKey = readString(scope, "tenantKey");
  const country = readString(scope, "country");
  const vertical = readString(scope, "vertical");

  if (!tenantId || !tenantKey || !country || !vertical) {
    return null;
  }

  return {
    tenantId,
    tenantKey,
    institutionId: readString(scope, "institutionId"),
    country,
    vertical,
    role: readString(scope, "role"),
  };
}

function mapIdjorRagSecuritySummary(value: unknown): IdjorRagSecuritySummary {
  return {
    ragEnabled: readBooleanLike(value, "ragEnabled") ?? false,
    vectorStoreEnabled: readBooleanLike(value, "vectorStoreEnabled") ?? false,
    embeddingsEnabled: readBooleanLike(value, "embeddingsEnabled") ?? false,
    llmEnabled: readBooleanLike(value, "llmEnabled") ?? false,
    decisioningEnabled: readBooleanLike(value, "decisioningEnabled") ?? false,
    sourceLabels: readStringArray(value, "sourceLabels"),
    readOnly: readBooleanLike(value, "readOnly") ?? true,
  };
}

function mapIdjorRagDocument(value: unknown): IdjorRagDocument | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const tenantId = readString(record, "tenantId");
  const country = readString(record, "country");
  const vertical = readString(record, "vertical");
  const documentKey = readString(record, "documentKey");
  const title = readString(record, "title");
  const contentHash = readString(record, "contentHash");

  if (!id || !tenantId || !country || !vertical || !documentKey || !title || !contentHash) {
    return null;
  }

  return {
    id,
    tenantId,
    institutionId: readString(record, "institutionId"),
    country,
    vertical,
    documentKey,
    title,
    mimeType: readString(record, "mimeType"),
    contentHash,
    ingestionStatus: readString(record, "ingestionStatus") ?? "REGISTERED",
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    externalReference: readString(record, "externalReference"),
    createdAt: readString(record, "createdAt"),
    updatedAt: readString(record, "updatedAt"),
  };
}

function mapIdjorRagChunk(value: unknown): IdjorRagChunk | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const tenantId = readString(record, "tenantId");
  const country = readString(record, "country");
  const vertical = readString(record, "vertical");
  const documentId = readString(record, "documentId");
  const documentKey = readString(record, "documentKey");
  const documentTitle = readString(record, "documentTitle");
  const contentText = readString(record, "contentText");
  const contentHash = readString(record, "contentHash");
  const chunkIndex = readNumberLike(record, "chunkIndex");

  if (
    !id ||
    !tenantId ||
    !country ||
    !vertical ||
    !documentId ||
    !documentKey ||
    !documentTitle ||
    !contentText ||
    !contentHash ||
    chunkIndex === null
  ) {
    return null;
  }

  return {
    id,
    tenantId,
    institutionId: readString(record, "institutionId"),
    country,
    vertical,
    documentId,
    documentKey,
    documentTitle,
    chunkIndex,
    contentText,
    contentHash,
    tokenCount: readNumberLike(record, "tokenCount"),
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    createdAt: readString(record, "createdAt"),
    updatedAt: readString(record, "updatedAt"),
  };
}

function mapIdjorRagCitation(value: unknown): IdjorRagCitation | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const tenantId = readString(record, "tenantId");
  const country = readString(record, "country");
  const vertical = readString(record, "vertical");
  const documentId = readString(record, "documentId");
  const documentKey = readString(record, "documentKey");
  const documentTitle = readString(record, "documentTitle");
  const citationLabel = readString(record, "citationLabel");
  const excerptText = readString(record, "excerptText");

  if (
    !id ||
    !tenantId ||
    !country ||
    !vertical ||
    !documentId ||
    !documentKey ||
    !documentTitle ||
    !citationLabel ||
    !excerptText
  ) {
    return null;
  }

  return {
    id,
    tenantId,
    institutionId: readString(record, "institutionId"),
    country,
    vertical,
    documentId,
    documentKey,
    documentTitle,
    chunkId: readString(record, "chunkId"),
    chunkIndex: readNumberLike(record, "chunkIndex"),
    citationLabel,
    excerptText,
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    createdAt: readString(record, "createdAt"),
  };
}

function readRegistrationSource(
  value: unknown,
): IdjorRagDocumentRegistrationSource {
  const normalized = normalizeSource(value, "UNAVAILABLE");

  if (
    normalized === "LIVE" ||
    normalized === "SEED_DEMO" ||
    normalized === "MANUAL_ESTIMATE" ||
    normalized === "DEGRADED" ||
    normalized === "UNAVAILABLE"
  ) {
    return normalized;
  }

  return "UNAVAILABLE";
}

function readMetadataRegistrationStatus(
  value: unknown,
): IdjorRagMetadataRegistrationStatus {
  const status = typeof value === "string" ? value.trim().toUpperCase() : "";
  return status === "DEGRADED" ? "DEGRADED" : "REGISTERED";
}

function mapIdjorRagLinkedAssetCounts(value: unknown): IdjorRagLinkedAssetCounts {
  const counts = asObject(value);

  return {
    chunks: readNumberLike(counts, "chunks") ?? 0,
    embeddings: readNumberLike(counts, "embeddings") ?? 0,
    citations: readNumberLike(counts, "citations") ?? 0,
  };
}

function mapIdjorRegisterRagDocumentMetadataResult(
  payload: unknown,
): IdjorRegisterRagDocumentMetadataResult {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentRecord = asObject(root?.document);
  const document = mapIdjorRagDocument(documentRecord);
  const operation = readString(root, "operation");

  if (
    !root ||
    !scope ||
    !documentRecord ||
    !document ||
    (operation !== "CREATED" && operation !== "UPDATED")
  ) {
    throw new ApiError(
      502,
      "Reponse backend invalide: resultat d'enregistrement metadata RAG incomplet.",
      payload,
    );
  }

  return {
    scope,
    operation,
    document: {
      ...document,
      source: readRegistrationSource(documentRecord.source),
      ingestionStatus: readMetadataRegistrationStatus(documentRecord.ingestionStatus),
      metadataJson: asObject(documentRecord.metadataJson),
    },
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    metadataOnly: readBooleanLike(root, "metadataOnly") ?? true,
  };
}

function readIngestionReadiness(value: unknown): IdjorRagIngestionReadinessState {
  return value === "BLOCKED" ? "BLOCKED" : "NOT_READY";
}

function mapIdjorRagIngestionMissingField(value: unknown): IdjorRagIngestionMissingField | null {
  const record = asObject(value);
  const field = readString(record, "field");
  const reason = readString(record, "reason");

  if (!field || !reason) {
    return null;
  }

  return { field, reason };
}

function mapIdjorRagIngestionPreview(payload: unknown): IdjorRagIngestionPreview {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");

  if (!root || !scope || !documentId || !documentKey) {
    throw new ApiError(
      502,
      "Reponse backend invalide: previsualisation d'ingestion RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    ingestionStatus: readString(root, "ingestionStatus") ?? "REGISTERED",
    ingestionReadiness: readIngestionReadiness(root.ingestionReadiness),
    missingFields: readArray(root.missingFields)
      .map((entry) => mapIdjorRagIngestionMissingField(entry))
      .filter((entry): entry is IdjorRagIngestionMissingField => entry !== null),
    allowedNextSteps: readStringArray(root, "allowedNextSteps"),
    blockedReasons: readStringArray(root, "blockedReasons"),
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    metadataOnly: readBooleanLike(root, "metadataOnly") ?? true,
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagAuditEvent(value: unknown): IdjorRagAuditEvent | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const tenantId = readString(record, "tenantId");
  const country = readString(record, "country");
  const vertical = readString(record, "vertical");
  const eventType = readString(record, "eventType");
  const createdAt = readString(record, "createdAt");

  if (!id || !tenantId || !country || !vertical || !eventType || !createdAt) {
    return null;
  }

  return {
    id,
    tenantId,
    institutionId: readString(record, "institutionId"),
    country,
    vertical,
    eventType,
    documentId: readString(record, "documentId"),
    documentKey: readString(record, "documentKey"),
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    ingestionStatus: readString(record, "ingestionStatus"),
    operation: readString(record, "operation"),
    actorUserId: readString(record, "actorUserId"),
    actorRole: readString(record, "role"),
    createdAt,
  };
}

function mapIdjorRagAuditEventsPage(payload: unknown): IdjorRagAuditEventsPage {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);

  if (!root || !scope) {
    throw new ApiError(
      502,
      "Reponse backend invalide: journal d'audit RAG incomplet.",
      payload,
    );
  }

  return {
    scope,
    events: readArray(root.events)
      .map((entry) => mapIdjorRagAuditEvent(entry))
      .filter((entry): entry is IdjorRagAuditEvent => entry !== null),
    nextCursor: readString(root, "nextCursor"),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagDocumentAuditEventsPage(
  payload: unknown,
): IdjorRagDocumentAuditEventsPage {
  const page = mapIdjorRagAuditEventsPage(payload);
  const root = asObject(payload);
  const documentId = readString(root, "documentId");

  if (!documentId) {
    throw new ApiError(
      502,
      "Reponse backend invalide: journal d'audit RAG documentaire incomplet.",
      payload,
    );
  }

  return { ...page, documentId };
}

function mapIdjorRagDocumentUpload(value: unknown): IdjorRagDocumentUpload | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const tenantId = readString(record, "tenantId");
  const country = readString(record, "country");
  const vertical = readString(record, "vertical");
  const documentId = readString(record, "documentId");
  const originalFilename = readString(record, "originalFilename");
  const mimeType = readString(record, "mimeType");
  const sha256Hash = readString(record, "sha256Hash");
  const quarantineStatus = readString(record, "quarantineStatus");
  const storageProvider = readString(record, "storageProvider");
  const createdAt = readString(record, "createdAt");
  const updatedAt = readString(record, "updatedAt");
  const sizeBytes = readNumberLike(record, "sizeBytes");

  if (
    !id ||
    !tenantId ||
    !country ||
    !vertical ||
    !documentId ||
    !originalFilename ||
    !mimeType ||
    !sha256Hash ||
    !quarantineStatus ||
    !storageProvider ||
    !createdAt ||
    !updatedAt ||
    sizeBytes === null
  ) {
    return null;
  }

  return {
    id,
    tenantId,
    institutionId: readString(record, "institutionId"),
    country,
    vertical,
    documentId,
    originalFilename,
    mimeType,
    sizeBytes,
    sha256Hash,
    quarantineStatus,
    storageProvider,
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    uploadedByUserId: readString(record, "uploadedByUserId"),
    createdAt,
    updatedAt,
  };
}

function mapIdjorRagDocumentUploadsPage(payload: unknown): IdjorRagDocumentUploadsPage {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");

  if (!root || !scope || !documentId) {
    throw new ApiError(
      502,
      "Reponse backend invalide: liste des uploads RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    uploads: readArray(root.uploads)
      .map((entry) => mapIdjorRagDocumentUpload(entry))
      .filter((entry): entry is IdjorRagDocumentUpload => entry !== null),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagUploadIntakeResponse(payload: unknown): IdjorRagUploadIntakeResponse {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const upload = mapIdjorRagDocumentUpload(root?.upload);

  if (!root || !scope || !documentId || !documentKey || !upload) {
    throw new ApiError(
      502,
      "Reponse backend invalide: resultat d'upload en quarantaine RAG incomplet.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    upload,
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    quarantineStorage: "LOCAL_PRIVATE",
    publicDownloadEnabled: false,
  };
}

function mapIdjorRagDocumentExtraction(value: unknown): IdjorRagDocumentExtraction | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const tenantId = readString(record, "tenantId");
  const country = readString(record, "country");
  const vertical = readString(record, "vertical");
  const documentId = readString(record, "documentId");
  const uploadId = readString(record, "uploadId");
  const mimeType = readString(record, "mimeType");
  const status = readString(record, "status");
  const createdAt = readString(record, "createdAt");
  const updatedAt = readString(record, "updatedAt");

  if (
    !id ||
    !tenantId ||
    !country ||
    !vertical ||
    !documentId ||
    !uploadId ||
    !mimeType ||
    !status ||
    !createdAt ||
    !updatedAt
  ) {
    return null;
  }

  return {
    id,
    tenantId,
    institutionId: readString(record, "institutionId"),
    country,
    vertical,
    documentId,
    uploadId,
    mimeType,
    status: status as IdjorRagDocumentExtraction["status"],
    previewText: readString(record, "previewText"),
    previewTextLength: readNumberLike(record, "previewTextLength"),
    errorReason: readString(record, "errorReason"),
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    createdAt,
    updatedAt,
  };
}

function mapIdjorRagDocumentExtractionsPage(payload: unknown): IdjorRagDocumentExtractionsPage {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const uploadId = readString(root, "uploadId");

  if (!root || !scope || !uploadId) {
    throw new ApiError(
      502,
      "Reponse backend invalide: liste des extractions RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    uploadId,
    extractions: readArray(root.extractions)
      .map((entry) => mapIdjorRagDocumentExtraction(entry))
      .filter((entry): entry is IdjorRagDocumentExtraction => entry !== null),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagExtractionPreviewResponse(payload: unknown): IdjorRagExtractionPreviewResponse {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const uploadId = readString(root, "uploadId");
  const extraction = mapIdjorRagDocumentExtraction(root?.extraction);

  if (!root || !scope || !documentId || !documentKey || !uploadId || !extraction) {
    throw new ApiError(
      502,
      "Reponse backend invalide: resultat de previsualisation d'extraction RAG incomplet.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    uploadId,
    extraction,
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagExtractionChunk(value: unknown): IdjorRagExtractionChunk | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const tenantId = readString(record, "tenantId");
  const country = readString(record, "country");
  const vertical = readString(record, "vertical");
  const documentId = readString(record, "documentId");
  const contentText = readString(record, "contentText");
  const contentHash = readString(record, "contentHash");
  const chunkIndex = readNumberLike(record, "chunkIndex");

  if (
    !id ||
    !tenantId ||
    !country ||
    !vertical ||
    !documentId ||
    !contentText ||
    !contentHash ||
    chunkIndex === null
  ) {
    return null;
  }

  return {
    id,
    tenantId,
    institutionId: readString(record, "institutionId"),
    country,
    vertical,
    documentId,
    extractionId: readString(record, "extractionId"),
    chunkIndex,
    contentText,
    contentHash,
    tokenCount: readNumberLike(record, "tokenCount"),
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    createdAt: readString(record, "createdAt"),
    updatedAt: readString(record, "updatedAt"),
  };
}

function mapIdjorRagExtractionChunksPage(payload: unknown): IdjorRagExtractionChunksPage {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const extractionId = readString(root, "extractionId");

  if (!root || !scope || !extractionId) {
    throw new ApiError(
      502,
      "Reponse backend invalide: liste des chunks d'extraction RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    extractionId,
    chunks: readArray(root.chunks)
      .map((entry) => mapIdjorRagExtractionChunk(entry))
      .filter((entry): entry is IdjorRagExtractionChunk => entry !== null),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagExtractionChunkingResponse(
  payload: unknown,
): IdjorRagExtractionChunkingResponse {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const extractionId = readString(root, "extractionId");

  if (!root || !scope || !documentId || !documentKey || !extractionId) {
    throw new ApiError(
      502,
      "Reponse backend invalide: resultat de decoupage deterministe RAG incomplet.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    extractionId,
    chunks: readArray(root.chunks)
      .map((entry) => mapIdjorRagExtractionChunk(entry))
      .filter((entry): entry is IdjorRagExtractionChunk => entry !== null),
    chunkCount: readNumberLike(root, "chunkCount") ?? 0,
    created: readBooleanLike(root, "created") ?? false,
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

const IDJOR_RAG_EMBEDDING_BLOCKED_REASONS: ReadonlySet<IdjorRagEmbeddingBlockedReason> = new Set([
  "NO_CHUNKS",
  "EMBEDDINGS_FEATURE_FLAG_OFF",
  "EMBEDDING_PROVIDER_DISABLED",
  "EMBEDDING_MODEL_DISABLED",
  "VECTOR_STORE_DISABLED",
]);

function mapIdjorRagEmbeddingBlockedReasons(value: unknown): IdjorRagEmbeddingBlockedReason[] {
  return readArray(value).filter(
    (entry): entry is IdjorRagEmbeddingBlockedReason =>
      typeof entry === "string" &&
      IDJOR_RAG_EMBEDDING_BLOCKED_REASONS.has(entry as IdjorRagEmbeddingBlockedReason),
  );
}

function mapIdjorRagEmbeddingRequiredFlag(value: unknown): IdjorRagEmbeddingRequiredFlag | null {
  const record = asObject(value);
  const targetType = readString(record, "targetType");
  const targetKey = readString(record, "targetKey");

  if (targetType !== "RAG" && targetType !== "PROVIDER" && targetType !== "MODEL") {
    return null;
  }
  if (!targetKey) return null;

  return {
    targetType,
    targetKey,
    enabled: readBooleanLike(record, "enabled") ?? false,
  };
}

function mapIdjorRagEmbeddingProviderStatus(value: unknown): IdjorRagEmbeddingProviderStatus {
  const record = asObject(value);

  return {
    providerKey: readString(record, "providerKey"),
    isEnabled: readBooleanLike(record, "isEnabled") ?? false,
    registryStatus: readString(record, "registryStatus"),
  };
}

function mapIdjorRagEmbeddingModelStatus(value: unknown): IdjorRagEmbeddingModelStatus {
  const record = asObject(value);

  return {
    modelKey: readString(record, "modelKey"),
    isEnabled: readBooleanLike(record, "isEnabled") ?? false,
    registryStatus: readString(record, "registryStatus"),
  };
}

function mapIdjorRagEmbeddingVectorStoreStatus(
  value: unknown,
): IdjorRagEmbeddingVectorStoreStatus {
  const record = asObject(value);

  return {
    vectorStoreEnabled: readBooleanLike(record, "vectorStoreEnabled") ?? false,
    reason: readString(record, "reason"),
  };
}

function mapIdjorRagEmbeddingReadiness(payload: unknown): IdjorRagEmbeddingReadiness {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const extractionId = readString(root, "extractionId");
  const embeddingReadiness = readString(root, "embeddingReadiness");

  if (
    !root ||
    !scope ||
    !documentId ||
    !documentKey ||
    !extractionId ||
    (embeddingReadiness !== "NOT_READY" && embeddingReadiness !== "BLOCKED")
  ) {
    throw new ApiError(
      502,
      "Reponse backend invalide: readiness embeddings RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    extractionId,
    eligibleChunksCount: readNumberLike(root, "eligibleChunksCount") ?? 0,
    embeddingReadiness,
    requiredFlags: readArray(root.requiredFlags)
      .map((entry) => mapIdjorRagEmbeddingRequiredFlag(entry))
      .filter((entry): entry is IdjorRagEmbeddingRequiredFlag => entry !== null),
    providerStatus: mapIdjorRagEmbeddingProviderStatus(root.providerStatus),
    modelStatus: mapIdjorRagEmbeddingModelStatus(root.modelStatus),
    vectorStoreStatus: mapIdjorRagEmbeddingVectorStoreStatus(root.vectorStoreStatus),
    blockedReasons: mapIdjorRagEmbeddingBlockedReasons(root.blockedReasons),
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    embeddingsComputed: readBooleanLike(root, "embeddingsComputed") ?? false,
  };
}

function mapIdjorRagEmbeddingReadinessResponse(
  payload: unknown,
): IdjorRagEmbeddingReadinessResponse {
  const root = asObject(payload);

  return {
    ...mapIdjorRagEmbeddingReadiness(payload),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagEmbeddingPreviewRequestResponse(
  payload: unknown,
): IdjorRagEmbeddingPreviewRequestResponse {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const extractionId = readString(root, "extractionId");
  const previewStatus = readString(root, "previewStatus");

  if (!root || !scope || !documentId || !documentKey || !extractionId || previewStatus !== "BLOCKED") {
    throw new ApiError(
      502,
      "Reponse backend invalide: demande de preview embedding RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    extractionId,
    previewStatus: "BLOCKED",
    readiness: mapIdjorRagEmbeddingReadiness(root.readiness),
    embeddingJobCreated: readBooleanLike(root, "embeddingJobCreated") ?? false,
    embeddingReferenceCreated: readBooleanLike(root, "embeddingReferenceCreated") ?? false,
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

const IDJOR_RAG_RETRIEVAL_BLOCKED_REASONS: ReadonlySet<IdjorRagRetrievalBlockedReason> = new Set([
  "NO_CHUNKS",
  "NO_EMBEDDINGS",
  "VECTOR_STORE_DISABLED",
  "RETRIEVAL_DISABLED",
  "LLM_DISABLED",
]);

function mapIdjorRagRetrievalBlockedReasons(value: unknown): IdjorRagRetrievalBlockedReason[] {
  return readArray(value).filter(
    (entry): entry is IdjorRagRetrievalBlockedReason =>
      typeof entry === "string" &&
      IDJOR_RAG_RETRIEVAL_BLOCKED_REASONS.has(entry as IdjorRagRetrievalBlockedReason),
  );
}

function readIdjorRagRetrievalReadinessState(
  value: unknown,
): IdjorRagRetrievalReadinessState {
  return value === "BLOCKED" ? "BLOCKED" : "NOT_READY";
}

function readIdjorRagRetrievalComponentStatus(
  value: unknown,
): IdjorRagRetrievalComponentStatus {
  return value === "BLOCKED" ? "BLOCKED" : "DISABLED";
}

function mapIdjorRagRetrievalReadiness(payload: unknown): IdjorRagRetrievalReadiness {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const extractionId = readString(root, "extractionId");

  if (!root || !scope || !documentId || !documentKey || !extractionId) {
    throw new ApiError(
      502,
      "Reponse backend invalide: readiness retrieval RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    extractionId,
    retrievalReadiness: readIdjorRagRetrievalReadinessState(root.retrievalReadiness),
    blockedReasons: mapIdjorRagRetrievalBlockedReasons(root.blockedReasons),
    chunksCount: readNumberLike(root, "chunksCount") ?? 0,
    embeddingsCount: readNumberLike(root, "embeddingsCount") ?? 0,
    citationsCount: readNumberLike(root, "citationsCount") ?? 0,
    vectorStoreStatus: readIdjorRagRetrievalComponentStatus(root.vectorStoreStatus),
    retrievalStatus: readIdjorRagRetrievalComponentStatus(root.retrievalStatus),
    llmStatus: readIdjorRagRetrievalComponentStatus(root.llmStatus),
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    retrievalExecuted: readBooleanLike(root, "retrievalExecuted") ?? false,
    citationsCreated: readBooleanLike(root, "citationsCreated") ?? false,
    llmExecuted: readBooleanLike(root, "llmExecuted") ?? false,
  };
}

function mapIdjorRagRetrievalReadinessResponse(
  payload: unknown,
): IdjorRagRetrievalReadinessResponse {
  const root = asObject(payload);

  return {
    ...mapIdjorRagRetrievalReadiness(payload),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagRetrievalPreviewRequestResponse(
  payload: unknown,
): IdjorRagRetrievalPreviewRequestResponse {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const extractionId = readString(root, "extractionId");
  const previewStatus = readString(root, "previewStatus");

  if (!root || !scope || !documentId || !documentKey || !extractionId || previewStatus !== "BLOCKED") {
    throw new ApiError(
      502,
      "Reponse backend invalide: demande de preview retrieval RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    extractionId,
    previewStatus: "BLOCKED",
    retrievalReadiness: readIdjorRagRetrievalReadinessState(root.retrievalReadiness),
    blockedReasons: mapIdjorRagRetrievalBlockedReasons(root.blockedReasons),
    chunksCount: readNumberLike(root, "chunksCount") ?? 0,
    embeddingsCount: readNumberLike(root, "embeddingsCount") ?? 0,
    citationsCount: readNumberLike(root, "citationsCount") ?? 0,
    vectorStoreStatus: readIdjorRagRetrievalComponentStatus(root.vectorStoreStatus),
    retrievalStatus: readIdjorRagRetrievalComponentStatus(root.retrievalStatus),
    llmStatus: readIdjorRagRetrievalComponentStatus(root.llmStatus),
    readiness: mapIdjorRagRetrievalReadiness(root.readiness),
    retrievalExecuted: readBooleanLike(root, "retrievalExecuted") ?? false,
    citationsCreated: readBooleanLike(root, "citationsCreated") ?? false,
    llmExecuted: readBooleanLike(root, "llmExecuted") ?? false,
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

const IDJOR_RAG_LLM_READINESS_FLAG_KEYS: ReadonlySet<IdjorRagLlmReadinessFlagKey> = new Set([
  "llm-activation",
  "llm-provider",
  "llm-model",
  "llm-prompt-guardrails",
  "llm-execution",
  "llm-audit-write",
]);

const IDJOR_RAG_LLM_BLOCKED_REASONS: ReadonlySet<IdjorRagLlmBlockedReason> = new Set([
  "LLM_FEATURE_FLAG_OFF",
  "LLM_PROVIDER_DISABLED",
  "LLM_MODEL_DISABLED",
  "PROMPT_GUARDRAILS_DISABLED",
  "RETRIEVAL_NOT_READY",
  "CITATIONS_NOT_READY",
  "TENANT_SCOPE_REQUIRED",
  "LLM_EXECUTION_DISABLED",
]);

function readIdjorRagLlmReadinessState(value: unknown): IdjorRagLlmReadinessState {
  return value === "BLOCKED" ? "BLOCKED" : "NOT_READY";
}

function mapIdjorRagLlmBlockedReasons(value: unknown): IdjorRagLlmBlockedReason[] {
  return readArray(value).filter(
    (entry): entry is IdjorRagLlmBlockedReason =>
      typeof entry === "string" && IDJOR_RAG_LLM_BLOCKED_REASONS.has(entry as IdjorRagLlmBlockedReason),
  );
}

function mapIdjorRagLlmReadinessFlagStates(value: unknown): IdjorRagLlmReadinessFlagStates {
  const record = asObject(value);

  return Array.from(IDJOR_RAG_LLM_READINESS_FLAG_KEYS).reduce((states, key) => {
    states[key] = readBooleanLike(record, key) ?? false;
    return states;
  }, {} as IdjorRagLlmReadinessFlagStates);
}

function mapIdjorRagLlmReadinessResponse(payload: unknown): IdjorRagLlmReadinessResponse {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const extractionId = readString(root, "extractionId");

  if (!root || !scope || !documentId || !documentKey || !extractionId) {
    throw new ApiError(
      502,
      "Reponse backend invalide: readiness LLM RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    extractionId,
    llmReadiness: readIdjorRagLlmReadinessState(root.llmReadiness),
    flagStates: mapIdjorRagLlmReadinessFlagStates(root.flagStates),
    blockedReasons: mapIdjorRagLlmBlockedReasons(root.blockedReasons),
    chunksCount: readNumberLike(root, "chunksCount") ?? 0,
    embeddingsCount: readNumberLike(root, "embeddingsCount") ?? 0,
    citationsCount: readNumberLike(root, "citationsCount") ?? 0,
    linkedAssetCounts: mapIdjorRagLinkedAssetCounts(root.linkedAssetCounts),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    llmExecuted: readBooleanLike(root, "llmExecuted") ?? false,
    citationsCreated: readBooleanLike(root, "citationsCreated") ?? false,
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

const IDJOR_RAG_GOVERNANCE_STAGE_VALUES: ReadonlySet<IdjorRagGovernancePipelineStage> = new Set([
  "METADATA",
  "UPLOAD_QUARANTINE",
  "EXTRACTION",
  "CHUNKING",
  "EMBEDDING_READINESS",
  "RETRIEVAL_READINESS",
  "AUDIT",
]);

const IDJOR_RAG_GOVERNANCE_STATUS_VALUES: ReadonlySet<IdjorRagGovernanceStageStatus> = new Set([
  "DONE",
  "BLOCKED",
  "NOT_READY",
  "DISABLED",
]);

const IDJOR_RAG_GOVERNANCE_BLOCKED_REASONS: ReadonlySet<IdjorRagGovernanceBlockedReason> = new Set([
  "NO_UPLOADS",
  "NO_EXTRACTIONS",
  "EXTRACTION_UNSUPPORTED",
  "EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY",
  "EXTRACTION_FAILED",
  "EXTRACTION_FILE_MISSING",
  "NO_CHUNKS",
  "NO_EMBEDDINGS",
  "EMBEDDINGS_DISABLED",
  "VECTOR_STORE_DISABLED",
  "RETRIEVAL_DISABLED",
  "LLM_DISABLED",
]);

const IDJOR_RAG_GOVERNANCE_ALLOWED_NEXT_STEPS: ReadonlySet<IdjorRagGovernanceAllowedNextStep> = new Set([
  "UPLOAD_QUARANTINE_DOCUMENT",
  "REQUEST_EXTRACTION_PREVIEW",
  "RUN_DETERMINISTIC_CHUNKING",
  "VIEW_EMBEDDING_READINESS",
  "REQUEST_EMBEDDING_PREVIEW",
  "VIEW_RETRIEVAL_READINESS",
  "REQUEST_RETRIEVAL_PREVIEW",
  "REVIEW_APPEND_ONLY_AUDIT",
]);

function mapIdjorRagGovernancePipelineStageItem(
  value: unknown,
): IdjorRagGovernancePipelineStageItem | null {
  const record = asObject(value);
  const stage = readString(record, "stage");
  const status = readString(record, "status");

  if (
    !stage ||
    !status ||
    !IDJOR_RAG_GOVERNANCE_STAGE_VALUES.has(stage as IdjorRagGovernancePipelineStage) ||
    !IDJOR_RAG_GOVERNANCE_STATUS_VALUES.has(status as IdjorRagGovernanceStageStatus)
  ) {
    return null;
  }

  return {
    stage: stage as IdjorRagGovernancePipelineStage,
    status: status as IdjorRagGovernanceStageStatus,
  };
}

function readIdjorRagGovernanceStageStatus(value: unknown): IdjorRagGovernanceStageStatus {
  if (
    typeof value === "string" &&
    IDJOR_RAG_GOVERNANCE_STATUS_VALUES.has(value as IdjorRagGovernanceStageStatus)
  ) {
    return value as IdjorRagGovernanceStageStatus;
  }

  return "NOT_READY";
}

function mapIdjorRagGovernanceBlockedReasons(value: unknown): IdjorRagGovernanceBlockedReason[] {
  return readArray(value).filter(
    (entry): entry is IdjorRagGovernanceBlockedReason =>
      typeof entry === "string" &&
      IDJOR_RAG_GOVERNANCE_BLOCKED_REASONS.has(entry as IdjorRagGovernanceBlockedReason),
  );
}

function mapIdjorRagGovernanceAllowedNextSteps(
  value: unknown,
): IdjorRagGovernanceAllowedNextStep[] {
  return readArray(value).filter(
    (entry): entry is IdjorRagGovernanceAllowedNextStep =>
      typeof entry === "string" &&
      IDJOR_RAG_GOVERNANCE_ALLOWED_NEXT_STEPS.has(entry as IdjorRagGovernanceAllowedNextStep),
  );
}

function mapIdjorRagGovernanceCounts(value: unknown): IdjorRagGovernanceCounts {
  const record = asObject(value);

  return {
    uploads: readNumberLike(record, "uploads") ?? 0,
    extractions: readNumberLike(record, "extractions") ?? 0,
    chunks: readNumberLike(record, "chunks") ?? 0,
    embeddings: readNumberLike(record, "embeddings") ?? 0,
    citations: readNumberLike(record, "citations") ?? 0,
    auditEvents: readNumberLike(record, "auditEvents") ?? 0,
  };
}

function mapIdjorRagGovernancePipelineEvent(
  value: unknown,
): IdjorRagGovernancePipelineEvent | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const eventType = readString(record, "eventType");

  if (!id || !eventType) {
    return null;
  }

  return {
    id,
    eventType,
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    operation: readString(record, "operation"),
    uploadId: readString(record, "uploadId"),
    extractionId: readString(record, "extractionId"),
    createdAt: readString(record, "createdAt"),
  };
}

function mapIdjorRagGovernanceCockpit(payload: unknown): IdjorRagGovernanceCockpit {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const viewMode = readString(root, "viewMode");
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");

  if (
    !root ||
    !scope ||
    !documentId ||
    !documentKey ||
    (viewMode !== "DOCUMENT" && viewMode !== "EXTRACTION")
  ) {
    throw new ApiError(
      502,
      "Reponse backend invalide: governance cockpit RAG incomplet.",
      payload,
    );
  }

  return {
    scope,
    viewMode,
    documentId,
    documentKey,
    uploadId: readString(root, "uploadId"),
    extractionId: readString(root, "extractionId"),
    pipelineStages: readArray(root.pipelineStages)
      .map((entry) => mapIdjorRagGovernancePipelineStageItem(entry))
      .filter((entry): entry is IdjorRagGovernancePipelineStageItem => entry !== null),
    documentStatus: readIdjorRagGovernanceStageStatus(root.documentStatus),
    uploadStatus: readIdjorRagGovernanceStageStatus(root.uploadStatus),
    extractionStatus: readIdjorRagGovernanceStageStatus(root.extractionStatus),
    chunkingStatus: readIdjorRagGovernanceStageStatus(root.chunkingStatus),
    embeddingStatus: readIdjorRagGovernanceStageStatus(root.embeddingStatus),
    retrievalStatus: readIdjorRagGovernanceStageStatus(root.retrievalStatus),
    auditStatus: readIdjorRagGovernanceStageStatus(root.auditStatus),
    blockedReasons: mapIdjorRagGovernanceBlockedReasons(root.blockedReasons),
    allowedNextSteps: mapIdjorRagGovernanceAllowedNextSteps(root.allowedNextSteps),
    counts: mapIdjorRagGovernanceCounts(root.counts),
    pipelineEvents: readArray(root.pipelineEvents)
      .map((entry) => mapIdjorRagGovernancePipelineEvent(entry))
      .filter((entry): entry is IdjorRagGovernancePipelineEvent => entry !== null),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    retrievalExecuted: readBooleanLike(root, "retrievalExecuted") ?? false,
    citationsCreated: readBooleanLike(root, "citationsCreated") ?? false,
    llmExecuted: readBooleanLike(root, "llmExecuted") ?? false,
  };
}

function mapIdjorRagGovernanceCockpitResponse(
  payload: unknown,
): IdjorRagGovernanceCockpitResponse {
  const root = asObject(payload);

  return {
    ...mapIdjorRagGovernanceCockpit(payload),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRegistryAgent(value: unknown): IdjorRegistryAgent | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const agentKey = readString(record, "agentKey");
  const displayName = readString(record, "displayName");
  const layer = readString(record, "layer");

  if (!id || !agentKey || !displayName || !layer) {
    return null;
  }

  return {
    id,
    agentKey,
    displayName,
    layer,
    registryStatus: readString(record, "registryStatus") ?? "UNKNOWN",
    isEnabled: readBooleanLike(record, "isEnabled") ?? false,
    isReadOnly: readBooleanLike(record, "isReadOnly") ?? true,
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    description: readString(record, "description"),
  };
}

function mapIdjorRegistryEngine(value: unknown): IdjorRegistryEngine | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const engineKey = readString(record, "engineKey");
  const displayName = readString(record, "displayName");

  if (!id || !engineKey || !displayName) {
    return null;
  }

  return {
    id,
    engineKey,
    agentId: readString(record, "agentId"),
    displayName,
    registryStatus: readString(record, "registryStatus") ?? "UNKNOWN",
    isEnabled: readBooleanLike(record, "isEnabled") ?? false,
    isReadOnly: readBooleanLike(record, "isReadOnly") ?? true,
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    description: readString(record, "description"),
  };
}

function mapIdjorRegistryTool(value: unknown): IdjorRegistryTool | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const toolKey = readString(record, "toolKey");
  const displayName = readString(record, "displayName");
  const accessMode = readString(record, "accessMode");

  if (!id || !toolKey || !displayName || !accessMode) {
    return null;
  }

  const allowedRoles = readArray(record?.allowedRolesJson).filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );

  return {
    id,
    toolKey,
    engineId: readString(record, "engineId"),
    displayName,
    accessMode,
    isEnabled: readBooleanLike(record, "isEnabled") ?? false,
    isReadOnly: readBooleanLike(record, "isReadOnly") ?? true,
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    description: readString(record, "description"),
    allowedRoles,
  };
}

function mapIdjorFeatureFlag(value: unknown): IdjorFeatureFlag | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const targetType = readString(record, "targetType");
  const targetKey = readString(record, "targetKey");

  if (!id || !targetType || !targetKey) {
    return null;
  }

  return {
    id,
    targetType,
    targetKey,
    enabled: readBooleanLike(record, "enabled") ?? false,
    rolloutState: readString(record, "rolloutState") ?? "OFF",
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    notes: readString(record, "notes"),
  };
}

function mapIdjorProviderCatalog(value: unknown): IdjorProviderCatalog | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const providerKey = readString(record, "providerKey");
  const displayName = readString(record, "displayName");
  const providerType = readString(record, "providerType");

  if (!id || !providerKey || !displayName || !providerType) {
    return null;
  }

  return {
    id,
    providerKey,
    displayName,
    providerType,
    baseUrl: readString(record, "baseUrl"),
    isEnabled: readBooleanLike(record, "isEnabled") ?? false,
    registryStatus: readString(record, "registryStatus") ?? "DISABLED",
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    description: readString(record, "description"),
  };
}

function mapIdjorModelCatalog(value: unknown): IdjorModelCatalog | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const modelKey = readString(record, "modelKey");
  const displayName = readString(record, "displayName");
  const modelFamily = readString(record, "modelFamily");

  if (!id || !modelKey || !displayName || !modelFamily) {
    return null;
  }

  return {
    id,
    modelKey,
    providerCatalogId: readString(record, "providerCatalogId"),
    displayName,
    modelFamily,
    isDefault: readBooleanLike(record, "isDefault") ?? false,
    isEnabled: readBooleanLike(record, "isEnabled") ?? false,
    registryStatus: readString(record, "registryStatus") ?? "DISABLED",
    source: normalizeSource(record?.source, "UNAVAILABLE"),
    description: readString(record, "description"),
  };
}

function mapIdjorFoundationHealth(payload: unknown): IdjorFoundationHealth {
  const root = asObject(payload);
  const tenant = mapIdjorTenant(root?.tenant);
  const counts = asObject(root?.counts);

  if (!root || !tenant || !counts) {
    throw new ApiError(
      502,
      "Reponse backend invalide: snapshot IDJOR foundation health incomplet.",
      payload,
    );
  }

  return {
    tenant,
    counts: {
      agents: readNumberLike(counts, "agents") ?? 0,
      engines: readNumberLike(counts, "engines") ?? 0,
      tools: readNumberLike(counts, "tools") ?? 0,
      providers: readNumberLike(counts, "providers") ?? 0,
      models: readNumberLike(counts, "models") ?? 0,
      featureFlags: readNumberLike(counts, "featureFlags") ?? 0,
    },
    allFeatureFlagsOff: readBooleanLike(root, "allFeatureFlagsOff") ?? false,
    allProvidersDisabled: readBooleanLike(root, "allProvidersDisabled") ?? false,
    allModelsDisabled: readBooleanLike(root, "allModelsDisabled") ?? false,
    allToolsReadOnly: readBooleanLike(root, "allToolsReadOnly") ?? false,
    securitySummary: mapIdjorSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? false,
  };
}

function mapIdjorFoundationRegistry(payload: unknown): IdjorFoundationRegistry {
  const root = asObject(payload);
  const tenant = mapIdjorTenant(root?.tenant);

  if (!root || !tenant) {
    throw new ApiError(
      502,
      "Reponse backend invalide: snapshot IDJOR foundation registry incomplet.",
      payload,
    );
  }

  return {
    tenant,
    agents: readArray(root.agents)
      .map((entry) => mapIdjorRegistryAgent(entry))
      .filter((entry): entry is IdjorRegistryAgent => entry !== null),
    engines: readArray(root.engines)
      .map((entry) => mapIdjorRegistryEngine(entry))
      .filter((entry): entry is IdjorRegistryEngine => entry !== null),
    tools: readArray(root.tools)
      .map((entry) => mapIdjorRegistryTool(entry))
      .filter((entry): entry is IdjorRegistryTool => entry !== null),
    featureFlags: readArray(root.featureFlags)
      .map((entry) => mapIdjorFeatureFlag(entry))
      .filter((entry): entry is IdjorFeatureFlag => entry !== null),
    providers: readArray(root.providers)
      .map((entry) => mapIdjorProviderCatalog(entry))
      .filter((entry): entry is IdjorProviderCatalog => entry !== null),
    models: readArray(root.models)
      .map((entry) => mapIdjorModelCatalog(entry))
      .filter((entry): entry is IdjorModelCatalog => entry !== null),
    securitySummary: mapIdjorSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? false,
  };
}

function mapIdjorRagCounts(value: unknown): IdjorRagAssetCounts {
  const counts = asObject(value);

  return {
    documents: readNumberLike(counts, "documents") ?? 0,
    chunks: readNumberLike(counts, "chunks") ?? 0,
    citations: readNumberLike(counts, "citations") ?? 0,
  };
}

function mapIdjorRagHealth(payload: unknown): IdjorRagHealth {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);

  if (!root || !scope) {
    throw new ApiError(
      502,
      "Reponse backend invalide: snapshot IDJOR RAG health incomplet.",
      payload,
    );
  }

  return {
    scope,
    counts: mapIdjorRagCounts(root.counts),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagDocuments(payload: unknown): IdjorRagDocumentsSnapshot {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);

  if (!root || !scope) {
    throw new ApiError(
      502,
      "Reponse backend invalide: snapshot IDJOR RAG documents incomplet.",
      payload,
    );
  }

  return {
    scope,
    documents: readArray(root.documents)
      .map((entry) => mapIdjorRagDocument(entry))
      .filter((entry): entry is IdjorRagDocument => entry !== null),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagChunks(payload: unknown): IdjorRagChunksSnapshot {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);

  if (!root || !scope) {
    throw new ApiError(
      502,
      "Reponse backend invalide: snapshot IDJOR RAG chunks incomplet.",
      payload,
    );
  }

  return {
    scope,
    chunks: readArray(root.chunks)
      .map((entry) => mapIdjorRagChunk(entry))
      .filter((entry): entry is IdjorRagChunk => entry !== null),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function mapIdjorRagCitations(payload: unknown): IdjorRagCitationsSnapshot {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);

  if (!root || !scope) {
    throw new ApiError(
      502,
      "Reponse backend invalide: snapshot IDJOR RAG citations incomplet.",
      payload,
    );
  }

  return {
    scope,
    citations: readArray(root.citations)
      .map((entry) => mapIdjorRagCitation(entry))
      .filter((entry): entry is IdjorRagCitation => entry !== null),
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

function emptyRiskReviewSideEffects(): RiskReviewSideEffects {
  return {
    missionCreated: false,
    policyCreated: false,
    claimCreated: false,
    raxCalculated: false,
    pricingCalculated: false,
    blockchainAnchored: false,
  };
}

function hasRiskReviewSideEffects(value: unknown): boolean {
  const record = asObject(value);
  if (!record) return false;

  const keys: Array<keyof RiskReviewSideEffects> = [
    "missionCreated",
    "policyCreated",
    "claimCreated",
    "raxCalculated",
    "pricingCalculated",
    "blockchainAnchored",
  ];

  return keys.some((key) => typeof record[key] === "boolean");
}

function mapRiskReviewSideEffects(value: unknown): RiskReviewSideEffects {
  return {
    missionCreated: readBoolean(value, "missionCreated") ?? false,
    policyCreated: readBoolean(value, "policyCreated") ?? false,
    claimCreated: readBoolean(value, "claimCreated") ?? false,
    raxCalculated: readBoolean(value, "raxCalculated") ?? false,
    pricingCalculated: readBoolean(value, "pricingCalculated") ?? false,
    blockchainAnchored: readBoolean(value, "blockchainAnchored") ?? false,
  };
}

function emptyMissionConfigSideEffects(): InsuranceMissionConfigSideEffects {
  return {
    missionCreated: false,
    missionSent: false,
    fieldAuditCreated: false,
    raxCalculated: false,
    pricingCalculated: false,
    policyCreated: false,
    claimCreated: false,
    evidenceBundleCreated: false,
    blockchainAnchored: false,
  };
}

function hasMissionConfigSideEffects(value: unknown): boolean {
  const record = asObject(value);
  if (!record) return false;
  const keys: Array<keyof InsuranceMissionConfigSideEffects> = [
    "missionCreated",
    "missionSent",
    "fieldAuditCreated",
    "raxCalculated",
    "pricingCalculated",
    "policyCreated",
    "claimCreated",
    "evidenceBundleCreated",
    "blockchainAnchored",
  ];
  return keys.some((key) => typeof record[key] === "boolean");
}

function mapMissionConfigSideEffects(value: unknown): InsuranceMissionConfigSideEffects {
  return {
    missionCreated: readBooleanLike(value, "missionCreated") ?? false,
    missionSent: readBooleanLike(value, "missionSent") ?? false,
    fieldAuditCreated: readBooleanLike(value, "fieldAuditCreated") ?? false,
    raxCalculated: readBooleanLike(value, "raxCalculated") ?? false,
    pricingCalculated: readBooleanLike(value, "pricingCalculated") ?? false,
    policyCreated: readBooleanLike(value, "policyCreated") ?? false,
    claimCreated: readBooleanLike(value, "claimCreated") ?? false,
    evidenceBundleCreated: readBooleanLike(value, "evidenceBundleCreated") ?? false,
    blockchainAnchored: readBooleanLike(value, "blockchainAnchored") ?? false,
  };
}

function extractMissionConfigRecord(payload: unknown): Record<string, unknown> | null {
  const root = asObject(payload);
  if (!root) return null;

  const data = asObject(root.data);
  const candidates = [
    asObject(root.missionConfig),
    asObject(data?.missionConfig),
    asObject(root.config),
    asObject(data?.config),
    data,
    root,
  ];

  const hasMissionConfigShape = (value: Record<string, unknown> | null) =>
    Boolean(
      value &&
        (value.missionType !== undefined ||
          value.proofLevel !== undefined ||
          value.surfaceTolerancePercent !== undefined ||
          value.requiredDocuments !== undefined ||
          value.requiredChecks !== undefined ||
          value.status !== undefined),
    );

  return candidates.find((candidate) => hasMissionConfigShape(candidate)) ?? null;
}

function extractMissionConfigSideEffects(
  payload: unknown,
  missionConfig: Record<string, unknown> | null,
): InsuranceMissionConfigSideEffects {
  const root = asObject(payload);
  const data = asObject(root?.data);
  const candidates = [
    missionConfig?.sideEffects,
    root?.sideEffects,
    data?.sideEffects,
    asObject(root?.missionConfig)?.sideEffects,
    asObject(data?.missionConfig)?.sideEffects,
  ];
  const source = candidates.find((candidate) => hasMissionConfigSideEffects(candidate));
  return source ? mapMissionConfigSideEffects(source) : emptyMissionConfigSideEffects();
}

function mapMissionConfig(payload: unknown): InsuranceMissionConfig | null {
  const missionConfig = extractMissionConfigRecord(payload);
  if (!missionConfig) return null;

  const requiredChecks = asObject(missionConfig.requiredChecks);
  const sideEffects = extractMissionConfigSideEffects(payload, missionConfig);

  const noteDirectionRisques =
    readString(missionConfig, "noteDirectionRisques") ??
    readString(missionConfig, "riskDirectorNote") ??
    readString(missionConfig, "riskReviewNote") ??
    readString(missionConfig, "note") ??
    "";

  return {
    id:
      readString(missionConfig, "id") ??
      readString(missionConfig, "missionConfigId") ??
      readString(missionConfig, "configId"),
    missionType: readString(missionConfig, "missionType") ?? "",
    proofLevel: readString(missionConfig, "proofLevel") ?? "",
    surfaceTolerancePercent: readNumberLike(missionConfig, "surfaceTolerancePercent") ?? 0,
    requiresPolygonCheck: readBooleanLike(missionConfig, "requiresPolygonCheck") ?? false,
    requiresCinCheck: readBooleanLike(missionConfig, "requiresCinCheck") ?? false,
    requiresLandDocumentCheck:
      readBooleanLike(missionConfig, "requiresLandDocumentCheck") ?? false,
    requiredDocuments: readStringArray(missionConfig, "requiredDocuments"),
    requiredChecks: {
      polygon: readBooleanLike(requiredChecks, "polygon") ?? false,
      identity: readBooleanLike(requiredChecks, "identity") ?? false,
      landDocument: readBooleanLike(requiredChecks, "landDocument") ?? false,
      surfaceTolerance: readBooleanLike(requiredChecks, "surfaceTolerance") ?? false,
    },
    noteDirectionRisques,
    status: readString(missionConfig, "status") ?? "",
    sideEffects,
    version: readNumberLike(missionConfig, "version"),
    createdAt: readString(missionConfig, "createdAt"),
    updatedAt: readString(missionConfig, "updatedAt"),
  };
}

function emptyMissionDispatchDraftSideEffects(): InsuranceMissionDispatchDraftSideEffects {
  return {
    missionSent: false,
    fieldAuditCreated: false,
    policyCreated: false,
    claimCreated: false,
    raxCalculated: false,
    pricingCalculated: false,
    evidenceBundleCreated: false,
    blockchainAnchored: false,
  };
}

function hasMissionDispatchDraftSideEffects(value: unknown): boolean {
  const record = asObject(value);
  if (!record) return false;
  const keys: Array<keyof InsuranceMissionDispatchDraftSideEffects> = [
    "missionCreated",
    "missionSent",
    "fieldAuditCreated",
    "policyCreated",
    "claimCreated",
    "raxCalculated",
    "pricingCalculated",
    "evidenceBundleCreated",
    "blockchainAnchored",
  ];
  return keys.some((key) => typeof record[key] === "boolean");
}

function mapMissionDispatchDraftSideEffects(value: unknown): InsuranceMissionDispatchDraftSideEffects {
  const missionCreated = readBooleanLike(value, "missionCreated");
  return {
    missionCreated: missionCreated === null ? undefined : missionCreated,
    missionSent: readBooleanLike(value, "missionSent") ?? false,
    fieldAuditCreated: readBooleanLike(value, "fieldAuditCreated") ?? false,
    policyCreated: readBooleanLike(value, "policyCreated") ?? false,
    claimCreated: readBooleanLike(value, "claimCreated") ?? false,
    raxCalculated: readBooleanLike(value, "raxCalculated") ?? false,
    pricingCalculated: readBooleanLike(value, "pricingCalculated") ?? false,
    evidenceBundleCreated: readBooleanLike(value, "evidenceBundleCreated") ?? false,
    blockchainAnchored: readBooleanLike(value, "blockchainAnchored") ?? false,
  };
}

function extractMissionDispatchDraftRecord(payload: unknown): Record<string, unknown> | null {
  const root = asObject(payload);
  if (!root) return null;

  const data = asObject(root.data);
  const candidates = [
    asObject(root.missionDispatchDraft),
    asObject(data?.missionDispatchDraft),
    asObject(root.dispatchDraft),
    asObject(data?.dispatchDraft),
    asObject(root.data),
    root,
  ];

  return (
    candidates.find((candidate) =>
      Boolean(
        candidate &&
          (candidate.id !== undefined ||
            candidate.applicationId !== undefined ||
            candidate.missionConfigId !== undefined),
      ),
    ) ?? null
  );
}

function extractRiskReviewSideEffects(
  payload: unknown,
): { sideEffects: RiskReviewSideEffects; present: boolean } {
  const root = asObject(payload);
  const data = asObject(root?.data);
  const rootApplication = asObject(root?.application);
  const dataApplication = asObject(data?.application);

  const candidates = [
    root?.sideEffects,
    data?.sideEffects,
    rootApplication?.sideEffects,
    dataApplication?.sideEffects,
  ];

  const source = candidates.find((candidate) => hasRiskReviewSideEffects(candidate));
  if (!source) {
    return {
      sideEffects: emptyRiskReviewSideEffects(),
      present: false,
    };
  }

  return {
    sideEffects: mapRiskReviewSideEffects(source),
    present: true,
  };
}

function extractJwtFromLoginPayload(payload: unknown): string | null {
  const root = payload as Record<string, unknown> | null;
  const data =
    root && typeof root.data === "object" && root.data
      ? (root.data as Record<string, unknown>)
      : null;
  const user =
    data && typeof data.user === "object" && data.user
      ? (data.user as Record<string, unknown>)
      : null;

  const candidates = [
    readString(root, "token"),
    readString(root, "accessToken"),
    readString(root, "jwt"),
    readString(root, "idToken"),
    readString(data, "token"),
    readString(data, "accessToken"),
    readString(data, "jwt"),
    readString(data, "idToken"),
    readString(user, "token"),
    readString(user, "accessToken"),
  ];

  return candidates.find(Boolean) ?? null;
}

export async function institutionLogin(
  email: string,
  password: string,
): Promise<InstitutionLoginResult> {
  const response = await fetch(toUrl("/v1/auth/institution-login"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    const message = extractErrorMessage(payload, response.status);
    throw new ApiError(response.status, message, payload);
  }

  const token = extractJwtFromLoginPayload(payload) ?? "__cookie-session__";
  if (!token) {
    throw new ApiError(
      502,
      "Réponse de connexion backend invalide: JWT manquant.",
      payload,
    );
  }

  return { token, payload };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { authToken?: string | null } = {},
): Promise<T> {
  const { authToken, ...requestOptions } = options;
  const token = authToken ?? getBackendAuthToken();
  const headers = new Headers(requestOptions.headers);
  const method = requestOptions.method?.toUpperCase();
  const isReadOnlyGet = !method || method === "GET";
  const hasAuthorization = headers.has("Authorization");

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (token && !hasAuthorization) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...requestOptions,
    headers,
    cache: "no-store",
    credentials: "include",
  };

  const response = await fetch(toUrl(path), requestInit);

  const json = await parseJsonSafe(response);

  const shouldRetryWithoutAuth =
    !response.ok && response.status === 401 && isReadOnlyGet && (token || hasAuthorization);

  if (shouldRetryWithoutAuth) {
    const retryHeaders = new Headers(requestInit.headers);
    retryHeaders.delete("Authorization");

    const retryResponse = await fetch(toUrl(path), {
      ...requestInit,
      headers: retryHeaders,
    });

    const retryJson = await parseJsonSafe(retryResponse);

    if (retryResponse.ok) {
      return retryJson as T;
    }

    const retryMessage = extractErrorMessage(retryJson, retryResponse.status);
    if (retryResponse.status === 401) {
      handleSessionExpired(retryMessage);
    }
    throw new ApiError(retryResponse.status, retryMessage, retryJson);
  }

  if (!response.ok) {
    if (response.status === 401) {
      const expiredMessage = extractErrorMessage(json, response.status);
      handleSessionExpired(expiredMessage);
    }
    const message = extractErrorMessage(json, response.status);
    throw new ApiError(response.status, message, json);
  }

  return json as T;
}

export async function getInsuranceApplications(): Promise<unknown> {
  return apiFetch<unknown>("/v1/insurance/applications");
}

export async function getIdjorFoundationHealth(
  options: { tenantKey?: string | null } = {},
): Promise<IdjorFoundationHealth> {
  const payload = await apiFetch<unknown>(
    withQuery("/v1/idjor/foundation/health", {
      tenantKey: options.tenantKey ?? null,
    }),
  );

  return mapIdjorFoundationHealth(payload);
}

export async function getIdjorFoundationRegistry(
  options: { tenantKey?: string | null } = {},
): Promise<IdjorFoundationRegistry> {
  const payload = await apiFetch<unknown>(
    withQuery("/v1/idjor/foundation/registry", {
      tenantKey: options.tenantKey ?? null,
    }),
  );

  return mapIdjorFoundationRegistry(payload);
}

export async function getIdjorRagHealth(
  options: { tenantKey?: string | null } = {},
): Promise<IdjorRagHealth> {
  const payload = await apiFetch<unknown>(
    withQuery("/v1/idjor/rag/health", {
      tenantKey: options.tenantKey ?? null,
    }),
  );

  return mapIdjorRagHealth(payload);
}

export async function getIdjorRagDocuments(
  options: { tenantKey?: string | null; documentKey?: string | null } = {},
): Promise<IdjorRagDocumentsSnapshot> {
  const payload = await apiFetch<unknown>(
    withQuery("/v1/idjor/rag/documents", {
      tenantKey: options.tenantKey ?? null,
      documentKey: options.documentKey ?? null,
    }),
  );

  return mapIdjorRagDocuments(payload);
}

export async function getIdjorRagChunks(
  options: { tenantKey?: string | null; documentKey?: string | null } = {},
): Promise<IdjorRagChunksSnapshot> {
  const payload = await apiFetch<unknown>(
    withQuery("/v1/idjor/rag/chunks", {
      tenantKey: options.tenantKey ?? null,
      documentKey: options.documentKey ?? null,
    }),
  );

  return mapIdjorRagChunks(payload);
}

export async function getIdjorRagCitations(
  options: { tenantKey?: string | null; documentKey?: string | null } = {},
): Promise<IdjorRagCitationsSnapshot> {
  const payload = await apiFetch<unknown>(
    withQuery("/v1/idjor/rag/citations", {
      tenantKey: options.tenantKey ?? null,
      documentKey: options.documentKey ?? null,
    }),
  );

  return mapIdjorRagCitations(payload);
}

export async function registerIdjorRagDocumentMetadata(
  input: IdjorRegisterRagDocumentMetadataInput,
): Promise<IdjorRegisterRagDocumentMetadataResult> {
  const payload = await apiFetch<unknown>("/v1/idjor/rag/documents/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tenantKey: input.tenantKey ?? null,
      tenantId: input.tenantId ?? null,
      documentKey: input.documentKey,
      title: input.title,
      source: input.source,
      ingestionStatus: input.ingestionStatus,
      externalReference: input.externalReference ?? null,
      metadataJson: input.metadataJson ?? null,
    }),
  });

  return mapIdjorRegisterRagDocumentMetadataResult(payload);
}

export async function getIdjorRagDocumentIngestionPreview(
  documentId: string,
): Promise<IdjorRagIngestionPreview> {
  const safeId = encodeURIComponent(documentId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/documents/${safeId}/ingestion-preview`,
  );

  return mapIdjorRagIngestionPreview(payload);
}

export async function getIdjorRagAuditEvents(
  options: {
    tenantKey?: string | null;
    documentId?: string | null;
    eventType?: string | null;
    limit?: number | null;
    cursor?: string | null;
  } = {},
): Promise<IdjorRagAuditEventsPage> {
  const payload = await apiFetch<unknown>(
    withQuery("/v1/idjor/rag/audit/events", {
      tenantKey: options.tenantKey ?? null,
      documentId: options.documentId ?? null,
      eventType: options.eventType ?? null,
      limit: options.limit != null ? String(options.limit) : null,
      cursor: options.cursor ?? null,
    }),
  );

  return mapIdjorRagAuditEventsPage(payload);
}

export async function getIdjorRagDocumentAuditEvents(
  documentId: string,
  options: { eventType?: string | null; limit?: number | null; cursor?: string | null } = {},
): Promise<IdjorRagDocumentAuditEventsPage> {
  const safeId = encodeURIComponent(documentId);
  const payload = await apiFetch<unknown>(
    withQuery(`/v1/idjor/rag/documents/${safeId}/audit/events`, {
      eventType: options.eventType ?? null,
      limit: options.limit != null ? String(options.limit) : null,
      cursor: options.cursor ?? null,
    }),
  );

  return mapIdjorRagDocumentAuditEventsPage(payload);
}

export async function uploadIdjorRagDocumentIntake(
  documentId: string,
  file: File,
): Promise<IdjorRagUploadIntakeResponse> {
  const safeId = encodeURIComponent(documentId);
  const formData = new FormData();
  formData.append("file", file);

  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/documents/${safeId}/upload-intake`,
    {
      method: "POST",
      body: formData,
    },
  );

  return mapIdjorRagUploadIntakeResponse(payload);
}

export async function getIdjorRagDocumentUploads(
  documentId: string,
): Promise<IdjorRagDocumentUploadsPage> {
  const safeId = encodeURIComponent(documentId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/documents/${safeId}/uploads`,
  );

  return mapIdjorRagDocumentUploadsPage(payload);
}

export async function runIdjorRagUploadExtractionPreview(
  uploadId: string,
): Promise<IdjorRagExtractionPreviewResponse> {
  const safeId = encodeURIComponent(uploadId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/uploads/${safeId}/extract-preview`,
    { method: "POST" },
  );

  return mapIdjorRagExtractionPreviewResponse(payload);
}

export async function getIdjorRagUploadExtractions(
  uploadId: string,
): Promise<IdjorRagDocumentExtractionsPage> {
  const safeId = encodeURIComponent(uploadId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/uploads/${safeId}/extractions`,
  );

  return mapIdjorRagDocumentExtractionsPage(payload);
}

export async function runIdjorRagExtractionChunking(
  extractionId: string,
): Promise<IdjorRagExtractionChunkingResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/chunk`,
    { method: "POST" },
  );

  return mapIdjorRagExtractionChunkingResponse(payload);
}

export async function getIdjorRagExtractionChunks(
  extractionId: string,
): Promise<IdjorRagExtractionChunksPage> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/chunks`,
  );

  return mapIdjorRagExtractionChunksPage(payload);
}

export async function getIdjorRagEmbeddingReadiness(
  extractionId: string,
): Promise<IdjorRagEmbeddingReadinessResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/embedding-readiness`,
  );

  return mapIdjorRagEmbeddingReadinessResponse(payload);
}

export async function requestIdjorRagEmbeddingPreview(
  extractionId: string,
): Promise<IdjorRagEmbeddingPreviewRequestResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/embedding-preview-request`,
    { method: "POST" },
  );

  return mapIdjorRagEmbeddingPreviewRequestResponse(payload);
}

export async function getIdjorRagRetrievalReadiness(
  extractionId: string,
): Promise<IdjorRagRetrievalReadinessResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/retrieval-readiness`,
  );

  return mapIdjorRagRetrievalReadinessResponse(payload);
}

export async function requestIdjorRagRetrievalPreview(
  extractionId: string,
): Promise<IdjorRagRetrievalPreviewRequestResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/retrieval-preview-request`,
    { method: "POST" },
  );

  return mapIdjorRagRetrievalPreviewRequestResponse(payload);
}

export async function getIdjorRagLlmReadiness(
  extractionId: string,
): Promise<IdjorRagLlmReadinessResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/llm-readiness`,
  );

  return mapIdjorRagLlmReadinessResponse(payload);
}

function mapIdjorRagLlmPreviewCitation(value: unknown): IdjorRagLlmPreviewCitation | null {
  const record = asObject(value);
  const id = readString(record, "id");
  const documentId = readString(record, "documentId");
  const documentKey = readString(record, "documentKey");
  const citationLabel = readString(record, "citationLabel");
  const excerptText = readString(record, "excerptText");
  const source = readString(record, "source");

  if (!id || !documentId || !documentKey || !citationLabel || !excerptText || !source) {
    return null;
  }

  return {
    id,
    documentId,
    documentKey,
    citationLabel,
    excerptText,
    chunkId: readString(record, "chunkId"),
    chunkIndex: readNumberLike(record, "chunkIndex"),
    source: source as DataSource,
  };
}

function mapIdjorRagLlmPreviewRequestResponse(
  payload: unknown,
): IdjorRagLlmPreviewRequestResponse {
  const root = asObject(payload);
  const scope = mapIdjorRagScope(root?.scope);
  const documentId = readString(root, "documentId");
  const documentKey = readString(root, "documentKey");
  const extractionId = readString(root, "extractionId");
  const status = readString(root, "status");

  if (
    !root ||
    !scope ||
    !documentId ||
    !documentKey ||
    !extractionId ||
    (status !== "BLOCKED" && status !== "FAILED" && status !== "EXECUTED")
  ) {
    throw new ApiError(
      502,
      "Reponse backend invalide: demande de preview LLM RAG incomplete.",
      payload,
    );
  }

  return {
    scope,
    documentId,
    documentKey,
    extractionId,
    status,
    llmExecuted: readBooleanLike(root, "llmExecuted") ?? false,
    blockedReasons: mapIdjorRagLlmBlockedReasons(root.blockedReasons),
    answer: readString(root, "answer"),
    citations: readArray(root.citations)
      .map((entry) => mapIdjorRagLlmPreviewCitation(entry))
      .filter((entry): entry is IdjorRagLlmPreviewCitation => entry !== null),
    chunksCount: readNumberLike(root, "chunksCount") ?? 0,
    embeddingsCount: readNumberLike(root, "embeddingsCount") ?? 0,
    citationsCount: readNumberLike(root, "citationsCount") ?? 0,
    securitySummary: mapIdjorRagSecuritySummary(root.securitySummary),
    auditWritten: readBooleanLike(root, "auditWritten") ?? false,
    sourceLabel: readString(root, "sourceLabel"),
    resolutionMode: readString(root, "resolutionMode"),
    readOnly: readBooleanLike(root, "readOnly") ?? true,
  };
}

export async function requestIdjorRagLlmPreview(
  extractionId: string,
): Promise<IdjorRagLlmPreviewRequestResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/llm-preview-request`,
    { method: "POST" },
  );

  return mapIdjorRagLlmPreviewRequestResponse(payload);
}

export async function getIdjorRagDocumentGovernanceCockpit(
  documentId: string,
): Promise<IdjorRagGovernanceCockpitResponse> {
  const safeId = encodeURIComponent(documentId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/documents/${safeId}/governance-cockpit`,
  );

  return mapIdjorRagGovernanceCockpitResponse(payload);
}

export async function getIdjorRagExtractionGovernanceCockpit(
  extractionId: string,
): Promise<IdjorRagGovernanceCockpitResponse> {
  const safeId = encodeURIComponent(extractionId);
  const payload = await apiFetch<unknown>(
    `/v1/idjor/rag/extractions/${safeId}/governance-cockpit`,
  );

  return mapIdjorRagGovernanceCockpitResponse(payload);
}

export interface InsuranceApplicationByIdResult {
  application: InsuranceDcaApplication | null;
  latestFieldAudit?: InsuranceFieldAudit | null;
  detailNote?: string;
  usedListFallback: boolean;
}

function mapLatestFieldAudit(raw: unknown): InsuranceFieldAudit | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.applicationId !== "string") return null;
  return {
    // Phase 33A fields
    id: r.id,
    applicationId: r.applicationId,
    missionId: typeof r.missionId === "string" ? r.missionId : null,
    missionDispatchId: typeof r.missionDispatchId === "string" ? r.missionDispatchId : null,
    missionConfigId: typeof r.missionConfigId === "string" ? r.missionConfigId : null,
    agentUserId: typeof r.agentUserId === "string" ? r.agentUserId : null,
    measuredSurfaceHa: typeof r.measuredSurfaceHa === "number" ? r.measuredSurfaceHa : null,
    measuredPolygonGeojson: typeof r.measuredPolygonGeojson === "string" ? r.measuredPolygonGeojson : null,
    hashStatus: typeof r.hashStatus === "string" ? r.hashStatus : "PENDING",
    fieldAuditStatus: typeof r.fieldAuditStatus === "string" ? r.fieldAuditStatus : null,
    source: (typeof r.source === "string" ? r.source : "UNAVAILABLE") as InsuranceFieldAudit["source"],
    syncedAt: typeof r.syncedAt === "string" ? r.syncedAt : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
    // Legacy required fields — defaulted for Phase 33A records that lack them
    farmerId: typeof r.farmerId === "string" ? r.farmerId : "",
    declaredAreaHa: typeof r.declaredAreaHa === "number" ? r.declaredAreaHa : 0,
    measuredAreaHa: typeof r.measuredAreaHa === "number" ? r.measuredAreaHa : 0,
    areaDeltaPercent: typeof r.areaDeltaPercent === "number" ? r.areaDeltaPercent : 0,
    assetsApprovedCount: typeof r.assetsApprovedCount === "number" ? r.assetsApprovedCount : 0,
    assetsRejectedCount: typeof r.assetsRejectedCount === "number" ? r.assetsRejectedCount : 0,
    integrityHash: typeof r.integrityHash === "string" ? r.integrityHash : "",
    auditMode: (typeof r.auditMode === "string" ? r.auditMode : "NATIVE_AGENT") as InsuranceFieldAudit["auditMode"],
    status: (typeof r.status === "string" ? r.status : "DRAFT") as InsuranceFieldAudit["status"],
    vegetationScore: typeof r.vegetationScore === "number" ? r.vegetationScore : 0,
    irrigationType: (typeof r.irrigationType === "string" ? r.irrigationType : "PLUVIAL") as InsuranceFieldAudit["irrigationType"],
    anomalyDetected: typeof r.anomalyDetected === "boolean" ? r.anomalyDetected : false,
    notes: typeof r.notes === "string" ? r.notes : "",
  };
}

function mapApplicationDetailPayload(payload: unknown): InsuranceDcaApplication | null {
  const direct = mapInsuranceDcaApplication(payload);
  if (direct) return direct;

  const root =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  if (!root) return null;

  const nestedCandidates = [
    root.data,
    root.application,
    (root.data as Record<string, unknown> | undefined)?.application,
  ];

  for (const candidate of nestedCandidates) {
    const mapped = mapInsuranceDcaApplication(candidate);
    if (mapped) return mapped;
  }

  return null;
}

export async function getInsuranceApplicationById(
  id: string,
): Promise<InsuranceApplicationByIdResult> {
  const safeId = encodeURIComponent(id);

  try {
    const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}`);
    const mapped = mapApplicationDetailPayload(payload);
    if (mapped) {
      const rawRoot =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : null;
      const latestFieldAudit = rawRoot ? mapLatestFieldAudit(rawRoot.latestFieldAudit) : null;
      return {
        application: mapped,
        latestFieldAudit,
        usedListFallback: false,
      };
    }
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      (error.status !== 404 && error.status !== 405)
    ) {
      throw error;
    }
  }

  const listPayload = await getInsuranceApplications();
  const rawItems = extractArrayFromApiResponse(listPayload, ["applications", "items", "data"]);
  const mappedItems = rawItems
    .map((item) => mapInsuranceDcaApplication(item))
    .filter((item): item is InsuranceDcaApplication => item !== null);
  const found = mappedItems.find((item) => item.id === id) ?? null;

  return {
    application: found,
    detailNote: "Detail charge depuis la liste, endpoint detail indisponible.",
    usedListFallback: true,
  };
}

export async function updateInsuranceApplicationStatus(
  applicationId: string,
  payload: UpdateInsuranceApplicationStatusPayload,
): Promise<UpdateInsuranceApplicationStatusResult> {
  const safeId = encodeURIComponent(applicationId);
  const body: Record<string, string> = {
    status: payload.status,
  };
  const note = payload.riskReviewNote?.trim();
  const reason = payload.riskReviewReason?.trim();

  if (note) {
    body.riskReviewNote = note;
  }
  if (reason) {
    body.riskReviewReason = reason;
  }

  const response = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const root = asObject(response);
  const data = asObject(root?.data);
  const status =
    readString(root, "status") ??
    readString(data, "status") ??
    readString(root?.application, "status") ??
    readString(data?.application, "status");
  const { sideEffects, present } = extractRiskReviewSideEffects(response);
  const mappedApplication = mapApplicationDetailPayload(response);

  return {
    application: mappedApplication,
    status,
    sideEffects,
    sideEffectsPresent: present,
  };
}

// ── IRAX-P: Planning & Orchestration ────────────────────────────────────────
// IRAX-P prepares an investigation plan. It never approves, rejects, prices,
// or declares an application insurable, and it never triggers a mission,
// field audit, RAX/IRAX-D calculation, evidence bundle, or blockchain anchor.

export interface InsuranceIraxDataQuality {
  farmerProfileCompleteness: string;
  parcelCompleteness: string;
  ndviStatus: string;
  documentsStatus: string;
  claimsHistoryStatus: string;
  geoCountryCoherence: string;
}

export interface InsuranceIraxCoherenceChecks {
  farmerCountryMatchesApplication: boolean | "UNKNOWN";
  parcelleCountryMatchesApplication: boolean | "UNKNOWN";
  gpsWithinPlausibleCountryBounds: boolean | "UNKNOWN";
  surfacePlausible: boolean;
  cropPresent: boolean;
  consentPresent: boolean;
  issues: string[];
}

export interface InsuranceIraxRiskSegmentation {
  segment: string;
  reasons: string[];
  confidence: string;
  sourceLabel: string;
}

export interface InsuranceIraxFieldInvestigationPlan {
  requiresFieldMission: boolean;
  missionPriority: string;
  objectives: string[];
  gpsChecks: string[];
  photoRequirements: string[];
  documentChecks: string[];
  farmerInterviewQuestions: string[];
  expectedAgentOutputs: string[];
}

export interface InsuranceIraxBackOfficeInvestigationPlan {
  ndviNeeded: boolean;
  weatherNeeded: boolean;
  hydroNeeded: boolean;
  agronomyNeeded: boolean;
  missingSignals: string[];
}

export interface InsuranceIraxDocumentChecklist {
  expected: string[];
  prepared: string[];
  uploaded: string[];
  missing: string[];
  status: string;
}

export interface InsuranceIraxPlanning {
  id: string;
  applicationId: string;
  institutionId: string | null;
  country: string;
  version: number;
  status: string;
  sourceLabel: string;
  algorithmVersion: string;
  dataQuality: InsuranceIraxDataQuality;
  coherenceChecks: InsuranceIraxCoherenceChecks;
  riskSegmentation: InsuranceIraxRiskSegmentation;
  fieldInvestigationPlan: InsuranceIraxFieldInvestigationPlan;
  backOfficeInvestigationPlan: InsuranceIraxBackOfficeInvestigationPlan;
  documentChecklist: InsuranceIraxDocumentChecklist;
  requiredSignals: string[];
  blockers: string[];
  warnings: string[];
  nextRecommendedStep: string;
  sideEffects: InsuranceMissionConfigSideEffects;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InsuranceIraxPlanningStatus = "REVIEWED" | "APPROVED_FOR_FIELD_PLANNING" | "NEEDS_MORE_INFO";

function readBooleanOrUnknown(record: unknown, key: string): boolean | "UNKNOWN" {
  const value = readBooleanLike(record, key);
  return value === null ? "UNKNOWN" : value;
}

function mapIraxPlanning(payload: unknown): InsuranceIraxPlanning | null {
  const root = asObject(payload);
  const raw = asObject(root?.iraxPlanning);
  if (!raw) return null;

  const dataQuality = asObject(raw.dataQuality);
  const coherenceChecks = asObject(raw.coherenceChecks);
  const riskSegmentation = asObject(raw.riskSegmentation);
  const fieldPlan = asObject(raw.fieldInvestigationPlan);
  const backOfficePlan = asObject(raw.backOfficeInvestigationPlan);
  const documentChecklist = asObject(raw.documentChecklist);

  return {
    id: readString(raw, "id") ?? "",
    applicationId: readString(raw, "applicationId") ?? "",
    institutionId: readString(raw, "institutionId"),
    country: readString(raw, "country") ?? "MA",
    version: readNumberLike(raw, "version") ?? 1,
    status: readString(raw, "status") ?? "GENERATED",
    sourceLabel: readString(raw, "sourceLabel") ?? "LIVE",
    algorithmVersion: readString(raw, "algorithmVersion") ?? "IRAX_P_V1_2026",
    dataQuality: {
      farmerProfileCompleteness: readString(dataQuality, "farmerProfileCompleteness") ?? "UNAVAILABLE",
      parcelCompleteness: readString(dataQuality, "parcelCompleteness") ?? "UNAVAILABLE",
      ndviStatus: readString(dataQuality, "ndviStatus") ?? "UNAVAILABLE",
      documentsStatus: readString(dataQuality, "documentsStatus") ?? "MISSING",
      claimsHistoryStatus: readString(dataQuality, "claimsHistoryStatus") ?? "UNAVAILABLE",
      geoCountryCoherence: readString(dataQuality, "geoCountryCoherence") ?? "UNKNOWN",
    },
    coherenceChecks: {
      farmerCountryMatchesApplication: readBooleanOrUnknown(coherenceChecks, "farmerCountryMatchesApplication"),
      parcelleCountryMatchesApplication: readBooleanOrUnknown(coherenceChecks, "parcelleCountryMatchesApplication"),
      gpsWithinPlausibleCountryBounds: readBooleanOrUnknown(coherenceChecks, "gpsWithinPlausibleCountryBounds"),
      surfacePlausible: readBooleanLike(coherenceChecks, "surfacePlausible") ?? false,
      cropPresent: readBooleanLike(coherenceChecks, "cropPresent") ?? false,
      consentPresent: readBooleanLike(coherenceChecks, "consentPresent") ?? false,
      issues: readStringArray(coherenceChecks, "issues"),
    },
    riskSegmentation: {
      segment: readString(riskSegmentation, "segment") ?? "STANDARD_REVIEW",
      reasons: readStringArray(riskSegmentation, "reasons"),
      confidence: readString(riskSegmentation, "confidence") ?? "LOW",
      sourceLabel: readString(riskSegmentation, "sourceLabel") ?? "LIVE",
    },
    fieldInvestigationPlan: {
      requiresFieldMission: readBooleanLike(fieldPlan, "requiresFieldMission") ?? false,
      missionPriority: readString(fieldPlan, "missionPriority") ?? "STANDARD",
      objectives: readStringArray(fieldPlan, "objectives"),
      gpsChecks: readStringArray(fieldPlan, "gpsChecks"),
      photoRequirements: readStringArray(fieldPlan, "photoRequirements"),
      documentChecks: readStringArray(fieldPlan, "documentChecks"),
      farmerInterviewQuestions: readStringArray(fieldPlan, "farmerInterviewQuestions"),
      expectedAgentOutputs: readStringArray(fieldPlan, "expectedAgentOutputs"),
    },
    backOfficeInvestigationPlan: {
      ndviNeeded: readBooleanLike(backOfficePlan, "ndviNeeded") ?? false,
      weatherNeeded: readBooleanLike(backOfficePlan, "weatherNeeded") ?? false,
      hydroNeeded: readBooleanLike(backOfficePlan, "hydroNeeded") ?? false,
      agronomyNeeded: readBooleanLike(backOfficePlan, "agronomyNeeded") ?? false,
      missingSignals: readStringArray(backOfficePlan, "missingSignals"),
    },
    documentChecklist: {
      expected: readStringArray(documentChecklist, "expected"),
      prepared: readStringArray(documentChecklist, "prepared"),
      uploaded: readStringArray(documentChecklist, "uploaded"),
      missing: readStringArray(documentChecklist, "missing"),
      status: readString(documentChecklist, "status") ?? "MISSING",
    },
    requiredSignals: readStringArray(raw, "requiredSignals"),
    blockers: readStringArray(raw, "blockers"),
    warnings: readStringArray(raw, "warnings"),
    nextRecommendedStep: readString(raw, "nextRecommendedStep") ?? "REQUEST_MORE_INFO",
    sideEffects: mapMissionConfigSideEffects(root?.sideEffects),
    createdAt: readString(raw, "createdAt"),
    updatedAt: readString(raw, "updatedAt"),
  };
}

export async function getIraxPlanning(applicationId: string): Promise<InsuranceIraxPlanning | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax-p`);
  return mapIraxPlanning(payload);
}

export async function generateIraxPlanning(applicationId: string): Promise<InsuranceIraxPlanning | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax-p/generate`, {
    method: "POST",
  });
  return mapIraxPlanning(payload);
}

export async function updateIraxPlanningStatus(
  applicationId: string,
  status: InsuranceIraxPlanningStatus,
): Promise<InsuranceIraxPlanning | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax-p/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapIraxPlanning(payload);
}

export type Irax1FrapStatus =
  | "IRAX1_MISSION_DRAFT"
  | "IRAX1_MISSION_READY"
  | "IRAX1_MISSION_SENT"
  | "IRAX1_IN_PROGRESS"
  | "IRAX1_SUBMITTED"
  | "IRAX1_ACCEPTED_FOR_REVIEW"
  | "IRAX1_REJECTED_FOR_CORRECTION"
  | "IRAX1_CLOSED"
  | "UNDER_BACK_OFFICE_REVIEW"
  | "ACCEPTED_FOR_IRAX3"
  | "NEEDS_FIELD_CORRECTION"
  | "REJECTED_INVALID_EVIDENCE";

export interface InsuranceIrax1FieldAssessment {
  id: string;
  applicationId: string;
  iraxPlanningId: string | null;
  missionDispatchId: string | null;
  missionConfigId: string | null;
  institutionId: string | null;
  country: string;
  agentUserId: string | null;
  status: string;
  sourceLabel: string;
  algorithmVersion: string;
  fieldMissionPlanSnapshot: Record<string, unknown> | null;
  geospatialVerification: Record<string, unknown> | null;
  parcelVerification: Record<string, unknown> | null;
  agriculturalActivityVerification: Record<string, unknown> | null;
  assetVerification: Record<string, unknown> | null;
  evidenceCollection: Record<string, unknown> | null;
  anomalyDetection: Record<string, unknown> | null;
  fieldRiskIntelligence: Record<string, unknown> | null;
  evidenceTransfer: Record<string, unknown> | null;
  fieldReport: Record<string, unknown> | null;
  blockers: string[];
  warnings: string[];
  submittedAt: string | null;
  reviewedAt: string | null;
  acceptedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function mapIrax1FieldAssessment(raw: unknown): InsuranceIrax1FieldAssessment | null {
  const obj = asObject(raw);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    iraxPlanningId: readString(obj, "iraxPlanningId"),
    missionDispatchId: readString(obj, "missionDispatchId"),
    missionConfigId: readString(obj, "missionConfigId"),
    institutionId: readString(obj, "institutionId"),
    country: readString(obj, "country") ?? "MA",
    agentUserId: readString(obj, "agentUserId"),
    status: readString(obj, "status") ?? "IRAX1_MISSION_DRAFT",
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    algorithmVersion: readString(obj, "algorithmVersion") ?? "IRAX1_FRAP_V1_2026",
    fieldMissionPlanSnapshot: asObject(obj.fieldMissionPlanSnapshot),
    geospatialVerification: asObject(obj.geospatialVerification),
    parcelVerification: asObject(obj.parcelVerification),
    agriculturalActivityVerification: asObject(obj.agriculturalActivityVerification),
    assetVerification: asObject(obj.assetVerification),
    evidenceCollection: asObject(obj.evidenceCollection),
    anomalyDetection: asObject(obj.anomalyDetection),
    fieldRiskIntelligence: asObject(obj.fieldRiskIntelligence),
    evidenceTransfer: asObject(obj.evidenceTransfer),
    fieldReport: asObject(obj.fieldReport),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    submittedAt: readString(obj, "submittedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    acceptedAt: readString(obj, "acceptedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getIrax1FieldAssessment(
  applicationId: string,
): Promise<InsuranceIrax1FieldAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax1/frap`);
  const root = asObject(payload);
  return mapIrax1FieldAssessment(root?.fieldAssessment);
}

export async function createIrax1Mission(
  applicationId: string,
  agentUserId?: string | null,
): Promise<InsuranceIrax1FieldAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const body: Record<string, unknown> = {};
  if (agentUserId) {
    body.agentUserId = agentUserId;
  }

  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax1/mission`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const root = asObject(payload);
  return mapIrax1FieldAssessment(root?.mission);
}

export async function updateIrax1FieldAssessmentStatus(
  applicationId: string,
  status: Irax1FrapStatus,
): Promise<InsuranceIrax1FieldAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax1/frap/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  const root = asObject(payload);
  return mapIrax1FieldAssessment(root?.fieldAssessment);
}

// ── IRAX2: Scientific Back Office Investigation Engine ─────────────────────
// IRAX2 produces the Scientific Risk Assessment Package (SRAP). It never
// approves, rejects, prices, or declares an application insurable, and it
// never triggers RAX/IRAX3/IRAX-D, a policy, a claim, or a blockchain anchor.

export type InsuranceIraxScientificAssessmentStatus =
  | "SRAP_GENERATED"
  | "UNDER_BACK_OFFICE_REVIEW"
  | "ACCEPTED_FOR_IRAX3"
  | "NEEDS_MORE_SCIENTIFIC_DATA"
  | "REJECTED_INSUFFICIENT_DATA";

export interface InsuranceIraxScientificAssessment {
  id: string;
  applicationId: string;
  iraxPlanningId: string | null;
  iraxFieldAssessmentId: string | null;
  institutionId: string | null;
  country: string;
  version: number;
  status: string;
  sourceLabel: string;
  protocolVersion: string;
  dataAggregation: Record<string, unknown> | null;
  geospatialIntelligence: Record<string, unknown> | null;
  climateIntelligence: Record<string, unknown> | null;
  hydrologyIntelligence: Record<string, unknown> | null;
  agronomicIntelligence: Record<string, unknown> | null;
  economicIntelligence: Record<string, unknown> | null;
  supplyChainIntelligence: Record<string, unknown> | null;
  riskCorrelation: Record<string, unknown> | null;
  predictiveAnalytics: Record<string, unknown> | null;
  scientificReport: Record<string, unknown> | null;
  requiredSignals: string[];
  unavailableSignals: string[];
  degradedSignals: string[];
  blockers: string[];
  warnings: string[];
  nextRecommendedStep: string;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sideEffects: InsuranceMissionConfigSideEffects;
}

function mapIraxScientificAssessment(payload: unknown): InsuranceIraxScientificAssessment | null {
  const root = asObject(payload);
  const obj = asObject(root?.iraxScientificAssessment);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    iraxPlanningId: readString(obj, "iraxPlanningId"),
    iraxFieldAssessmentId: readString(obj, "iraxFieldAssessmentId"),
    institutionId: readString(obj, "institutionId"),
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: readString(obj, "status") ?? "SRAP_GENERATED",
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "IRAX2_SRAP_V1_2026",
    dataAggregation: asObject(obj.dataAggregation),
    geospatialIntelligence: asObject(obj.geospatialIntelligence),
    climateIntelligence: asObject(obj.climateIntelligence),
    hydrologyIntelligence: asObject(obj.hydrologyIntelligence),
    agronomicIntelligence: asObject(obj.agronomicIntelligence),
    economicIntelligence: asObject(obj.economicIntelligence),
    supplyChainIntelligence: asObject(obj.supplyChainIntelligence),
    riskCorrelation: asObject(obj.riskCorrelation),
    predictiveAnalytics: asObject(obj.predictiveAnalytics),
    scientificReport: asObject(obj.scientificReport),
    requiredSignals: readStringArray(obj, "requiredSignals"),
    unavailableSignals: readStringArray(obj, "unavailableSignals"),
    degradedSignals: readStringArray(obj, "degradedSignals"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    nextRecommendedStep: readString(obj, "nextRecommendedStep") ?? "REQUEST_MORE_SCIENTIFIC_DATA",
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
    sideEffects: mapMissionConfigSideEffects(root?.sideEffects),
  };
}

export async function getIraxScientificAssessment(
  applicationId: string,
): Promise<InsuranceIraxScientificAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax2/srap`);
  return mapIraxScientificAssessment(payload);
}

export async function generateIraxScientificAssessment(
  applicationId: string,
): Promise<InsuranceIraxScientificAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax2/generate`, {
    method: "POST",
  });
  return mapIraxScientificAssessment(payload);
}

export async function updateIraxScientificAssessmentStatus(
  applicationId: string,
  status: InsuranceIraxScientificAssessmentStatus,
): Promise<InsuranceIraxScientificAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax2/srap/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapIraxScientificAssessment(payload);
}

export type InsuranceIraxConsolidatedAssessmentStatus =
  | "UNDER_CONSOLIDATION_REVIEW"
  | "ACCEPTED_FOR_IRAX_D"
  | "NEEDS_MORE_FIELD_DATA"
  | "NEEDS_MORE_SCIENTIFIC_DATA"
  | "REJECTED_INSUFFICIENT_EVIDENCE";

export interface InsuranceIraxConsolidatedAssessment {
  id: string;
  applicationId: string;
  iraxPlanningId: string | null;
  iraxFieldAssessmentId: string | null;
  iraxScientificAssessmentId: string | null;
  institutionId: string | null;
  country: string;
  version: number;
  status: string;
  sourceLabel: string;
  protocolVersion: string;
  inputReadiness: Record<string, unknown> | null;
  crossEngineConsistency: Record<string, unknown> | null;
  contradictionMatrix: Record<string, unknown>[];
  consolidatedRiskSignals: Record<string, unknown> | null;
  evidenceSynthesis: Record<string, unknown> | null;
  missingDataAnalysis: Record<string, unknown> | null;
  blockerSynthesis: Record<string, unknown> | null;
  warningSynthesis: Record<string, unknown> | null;
  iraxDPreparation: Record<string, unknown> | null;
  consolidatedReport: Record<string, unknown> | null;
  requiredNextActions: string[];
  blockers: string[];
  warnings: string[];
  nextRecommendedStep: string;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sideEffects: InsuranceMissionConfigSideEffects;
}

function mapIraxConsolidatedAssessment(payload: unknown): InsuranceIraxConsolidatedAssessment | null {
  const root = asObject(payload);
  const obj = asObject(root?.iraxConsolidatedAssessment);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    iraxPlanningId: readString(obj, "iraxPlanningId"),
    iraxFieldAssessmentId: readString(obj, "iraxFieldAssessmentId"),
    iraxScientificAssessmentId: readString(obj, "iraxScientificAssessmentId"),
    institutionId: readString(obj, "institutionId"),
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: readString(obj, "status") ?? "CRIP_GENERATED",
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "IRAX3_CRIP_V1_2026",
    inputReadiness: asObject(obj.inputReadiness),
    crossEngineConsistency: asObject(obj.crossEngineConsistency),
    contradictionMatrix: readObjectArray(obj, "contradictionMatrix"),
    consolidatedRiskSignals: asObject(obj.consolidatedRiskSignals),
    evidenceSynthesis: asObject(obj.evidenceSynthesis),
    missingDataAnalysis: asObject(obj.missingDataAnalysis),
    blockerSynthesis: asObject(obj.blockerSynthesis),
    warningSynthesis: asObject(obj.warningSynthesis),
    iraxDPreparation: asObject(obj.iraxDPreparation),
    consolidatedReport: asObject(obj.consolidatedReport),
    requiredNextActions: readStringArray(obj, "requiredNextActions"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    nextRecommendedStep: readString(obj, "nextRecommendedStep") ?? "WAITING_FOR_FIELD_ASSESSMENT",
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
    sideEffects: mapMissionConfigSideEffects(root?.sideEffects),
  };
}

export async function getIraxConsolidatedAssessment(
  applicationId: string,
): Promise<InsuranceIraxConsolidatedAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax3/crip`);
  return mapIraxConsolidatedAssessment(payload);
}

export async function generateIraxConsolidatedAssessment(
  applicationId: string,
): Promise<InsuranceIraxConsolidatedAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax3/generate`, {
    method: "POST",
  });
  return mapIraxConsolidatedAssessment(payload);
}

export async function updateIraxConsolidatedAssessmentStatus(
  applicationId: string,
  status: InsuranceIraxConsolidatedAssessmentStatus,
): Promise<InsuranceIraxConsolidatedAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax3/crip/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapIraxConsolidatedAssessment(payload);
}

export type InsuranceIraxDecisionAssessmentStatus =
  | "UNDER_RISK_REVIEW"
  | "NEEDS_MORE_DATA"
  | "ACCEPTED_FOR_INSTITUTION_REVIEW"
  | "BLOCKED_INSUFFICIENT_DATA";

export interface InsuranceIraxDecisionAssessment {
  id: string;
  applicationId: string;
  iraxConsolidatedAssessmentId: string | null;
  institutionId: string | null;
  country: string;
  version: number;
  status: string;
  sourceLabel: string;
  algorithmVersion: string;
  inputReadiness: Record<string, unknown> | null;
  deterministicInputs: Record<string, unknown> | null;
  severityAssessment: Record<string, unknown> | null;
  frequencyAssessment: Record<string, unknown> | null;
  detectabilityAssessment: Record<string, unknown> | null;
  raxCalculation: Record<string, unknown> | null;
  wrsCalculation: Record<string, unknown> | null;
  riskTier: Record<string, unknown> | null;
  calculationTrace: string[];
  limitations: Record<string, unknown> | null;
  blockers: string[];
  warnings: string[];
  nextRecommendedStep: string;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sideEffects: InsuranceMissionConfigSideEffects;
}

export interface RecordInstitutionDecisionPayload {
  decisionType: InsuranceInstitutionDecisionType;
  decisionRationale: string;
  conditions?: string[];
  requiredActions?: string[];
  authorityLevel?: string | null;
  committeeNote?: string | null;
}

function mapPricingOffer(payload: unknown): InsurancePricingOffer | null {
  const root = asObject(payload);
  const obj = asObject(root?.pricingOffer);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    institutionDecisionId: readString(obj, "institutionDecisionId"),
    iraxDecisionAssessmentId: readString(obj, "iraxDecisionAssessmentId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "OFFER_DRAFT") as InsurancePricingOfferStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    pricingVersion: readString(obj, "pricingVersion") ?? "PRICING_OFFER_V1_2026",
    pricingInputs: asObject(obj.pricingInputs),
    coverageProposal: asObject(obj.coverageProposal),
    premiumComputation: asObject(obj.premiumComputation),
    taxesAndFees: asObject(obj.taxesAndFees),
    discountsAndAdjustments: asObject(obj.discountsAndAdjustments),
    exclusions: obj.exclusions ?? [],
    conditions: obj.conditions ?? [],
    offerSummary: asObject(obj.offerSummary),
    offerValidity: asObject(obj.offerValidity),
    requiredActions: obj.requiredActions ?? [],
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    acceptedAt: readString(obj, "acceptedAt"),
    rejectedAt: readString(obj, "rejectedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

function mapPolicyContract(payload: unknown): InsurancePolicyContract | null {
  const root = asObject(payload);
  const obj = asObject(root?.policyContract);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    pricingOfferId: readString(obj, "pricingOfferId"),
    institutionDecisionId: readString(obj, "institutionDecisionId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "CONTRACT_DRAFT") as InsurancePolicyContractStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    contractVersion: readString(obj, "contractVersion") ?? "POLICY_CONTRACT_V1_2026",
    policyNumber: readString(obj, "policyNumber") ?? "",
    contractReference: readString(obj, "contractReference") ?? "",
    insuredPartySnapshot: asObject(obj.insuredPartySnapshot),
    parcelSnapshot: asObject(obj.parcelSnapshot),
    coverageTerms: asObject(obj.coverageTerms),
    premiumSnapshot: asObject(obj.premiumSnapshot),
    conditions: obj.conditions ?? [],
    exclusions: obj.exclusions ?? [],
    contractDocuments: asObject(obj.contractDocuments),
    receiptDraft: asObject(obj.receiptDraft),
    issuanceAudit: asObject(obj.issuanceAudit),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    issuedByUserId: readString(obj, "issuedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    issuedAt: readString(obj, "issuedAt"),
    effectiveFrom: readString(obj, "effectiveFrom"),
    effectiveTo: readString(obj, "effectiveTo"),
    cancelledAt: readString(obj, "cancelledAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

function mapInstitutionDecision(payload: unknown): InsuranceInstitutionDecision | null {
  const root = asObject(payload);
  const obj = asObject(root?.institutionDecision);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    iraxDecisionAssessmentId: readString(obj, "iraxDecisionAssessmentId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "DRAFT_REVIEW") as InsuranceInstitutionDecisionStatus,
    decisionType: (readString(obj, "decisionType") ?? "PROCEED_TO_PRICING") as InsuranceInstitutionDecisionType,
    decisionLabel: readString(obj, "decisionLabel") ?? "",
    decisionRationale: readString(obj, "decisionRationale") ?? "",
    conditions: obj.conditions ?? null,
    requiredActions: readStringArray(obj, "requiredActions"),
    pricingReadiness: asObject(obj.pricingReadiness),
    offerPreparation: asObject(obj.offerPreparation),
    committeeReview: asObject(obj.committeeReview),
    authorityLevel: readString(obj, "authorityLevel"),
    decidedByUserId: readString(obj, "decidedByUserId") ?? "",
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    decidedAt: readString(obj, "decidedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "INSTITUTION_REVIEW_V1_2026",
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

function mapIraxDecisionAssessment(payload: unknown): InsuranceIraxDecisionAssessment | null {
  const root = asObject(payload);
  const obj = asObject(root?.iraxDecisionAssessment);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    iraxConsolidatedAssessmentId: readString(obj, "iraxConsolidatedAssessmentId"),
    institutionId: readString(obj, "institutionId"),
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: readString(obj, "status") ?? "IRAX_D_CALCULATED",
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    algorithmVersion: readString(obj, "algorithmVersion") ?? "IRAX_D_RAX_V1_2026",
    inputReadiness: asObject(obj.inputReadiness),
    deterministicInputs: asObject(obj.deterministicInputs),
    severityAssessment: asObject(obj.severityAssessment),
    frequencyAssessment: asObject(obj.frequencyAssessment),
    detectabilityAssessment: asObject(obj.detectabilityAssessment),
    raxCalculation: asObject(obj.raxCalculation),
    wrsCalculation: asObject(obj.wrsCalculation),
    riskTier: asObject(obj.riskTier),
    calculationTrace: readStringArray(obj, "calculationTrace"),
    limitations: asObject(obj.limitations),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    nextRecommendedStep: readString(obj, "nextRecommendedStep") ?? "WAITING_FOR_CRIP",
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
    sideEffects: mapMissionConfigSideEffects(root?.sideEffects),
  };
}

export async function getIraxDecisionAssessment(
  applicationId: string,
): Promise<InsuranceIraxDecisionAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax-d/crdp`);
  return mapIraxDecisionAssessment(payload);
}

export async function calculateIraxDecisionAssessment(
  applicationId: string,
): Promise<InsuranceIraxDecisionAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax-d/calculate`, {
    method: "POST",
  });
  return mapIraxDecisionAssessment(payload);
}

export async function updateIraxDecisionAssessmentStatus(
  applicationId: string,
  status: InsuranceIraxDecisionAssessmentStatus,
): Promise<InsuranceIraxDecisionAssessment | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/irax-d/crdp/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapIraxDecisionAssessment(payload);
}

export async function getInstitutionDecision(
  applicationId: string,
): Promise<InsuranceInstitutionDecision | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/institution-decision`);
  return mapInstitutionDecision(payload);
}

export async function recordInstitutionDecision(
  applicationId: string,
  payload: RecordInstitutionDecisionPayload,
): Promise<InsuranceInstitutionDecision | null> {
  const safeId = encodeURIComponent(applicationId);
  const response = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/institution-decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      decisionType: payload.decisionType,
      decisionRationale: payload.decisionRationale,
      conditions: payload.conditions,
      requiredActions: payload.requiredActions,
      authorityLevel: payload.authorityLevel,
      committeeNote: payload.committeeNote,
    }),
  });
  return mapInstitutionDecision(response);
}

export async function updateInstitutionDecisionStatus(
  applicationId: string,
  status: InsuranceInstitutionDecisionStatus,
): Promise<InsuranceInstitutionDecision | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/institution-decision/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapInstitutionDecision(payload);
}

export async function getPricingOffer(
  applicationId: string,
): Promise<InsurancePricingOffer | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/pricing-offer`);
  return mapPricingOffer(payload);
}

export async function generatePricingOffer(
  applicationId: string,
): Promise<InsurancePricingOffer | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/pricing-offer/generate`, {
    method: "POST",
  });
  return mapPricingOffer(payload);
}

export async function updatePricingOfferStatus(
  applicationId: string,
  status: InsurancePricingOfferStatus,
): Promise<InsurancePricingOffer | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/pricing-offer/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapPricingOffer(payload);
}

export async function getPolicyContract(
  applicationId: string,
): Promise<InsurancePolicyContract | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/policy-contract`);
  return mapPolicyContract(payload);
}

export async function issuePolicyContract(
  applicationId: string,
): Promise<InsurancePolicyContract | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/policy-contract/issue`, {
    method: "POST",
  });
  return mapPolicyContract(payload);
}

export async function updatePolicyContractStatus(
  applicationId: string,
  status: InsurancePolicyContractStatus,
): Promise<InsurancePolicyContract | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/policy-contract/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapPolicyContract(payload);
}

function mapEvidenceBundle(payload: unknown): InsuranceEvidenceBundle | null {
  const root = asObject(payload);
  const obj = asObject(root?.evidenceBundle);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    policyContractId: readString(obj, "policyContractId"),
    pricingOfferId: readString(obj, "pricingOfferId"),
    institutionDecisionId: readString(obj, "institutionDecisionId"),
    iraxPlanningId: readString(obj, "iraxPlanningId"),
    iraxFieldAssessmentId: readString(obj, "iraxFieldAssessmentId"),
    iraxScientificAssessmentId: readString(obj, "iraxScientificAssessmentId"),
    iraxConsolidatedAssessmentId: readString(obj, "iraxConsolidatedAssessmentId"),
    iraxDecisionAssessmentId: readString(obj, "iraxDecisionAssessmentId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "BUNDLE_GENERATED") as InsuranceEvidenceBundleStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "IBDO_EVIDENCE_BUNDLE_V1_2026",
    evidenceIndex: obj.evidenceIndex ?? [],
    chainSummary: asObject(obj.chainSummary),
    componentHashes: asObject(obj.componentHashes),
    integrityChecks: asObject(obj.integrityChecks),
    privacyRedaction: asObject(obj.privacyRedaction),
    storageManifest: asObject(obj.storageManifest),
    anchoringReadiness: asObject(obj.anchoringReadiness),
    bundleHash: readString(obj, "bundleHash") ?? "",
    merkleRoot: readString(obj, "merkleRoot"),
    limitations: readStringArray(obj, "limitations"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getEvidenceBundle(
  applicationId: string,
): Promise<InsuranceEvidenceBundle | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/evidence-bundle`);
  return mapEvidenceBundle(payload);
}

export async function generateEvidenceBundle(
  applicationId: string,
): Promise<InsuranceEvidenceBundle | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/evidence-bundle/generate`, {
    method: "POST",
  });
  return mapEvidenceBundle(payload);
}

export async function updateEvidenceBundleStatus(
  applicationId: string,
  status: InsuranceEvidenceBundleStatus,
): Promise<InsuranceEvidenceBundle | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/evidence-bundle/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapEvidenceBundle(payload);
}

function mapClaimCase(obj: Record<string, unknown> | null): InsuranceClaimCase | null {
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    policyContractId: readString(obj, "policyContractId") ?? "",
    evidenceBundleId: readString(obj, "evidenceBundleId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    claimReference: readString(obj, "claimReference") ?? "",
    status: (readString(obj, "status") ?? "CLAIM_REPORTED") as InsuranceClaimCaseStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    claimProtocolVersion: readString(obj, "claimProtocolVersion") ?? "CLAIM_CASE_V1_2026",
    claimType: readString(obj, "claimType") ?? "",
    eventDate: readString(obj, "eventDate"),
    reportedAt: readString(obj, "reportedAt") ?? "",
    reportedByUserId: readString(obj, "reportedByUserId"),
    claimDeclaration: asObject(obj.claimDeclaration),
    policySnapshot: asObject(obj.policySnapshot),
    lossAssessmentPlan: asObject(obj.lossAssessmentPlan),
    evidenceRequirements: asObject(obj.evidenceRequirements),
    triageAssessment: asObject(obj.triageAssessment),
    coverageContext: asObject(obj.coverageContext),
    reserveEstimate: asObject(obj.reserveEstimate),
    reviewNotes: obj.reviewNotes ?? [],
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    assignedReviewerId: readString(obj, "assignedReviewerId"),
    reviewedAt: readString(obj, "reviewedAt"),
    closedAt: readString(obj, "closedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export interface CreateClaimCasePayload {
  claimType: string;
  eventDate?: string | null;
  reportedDamage?: string | null;
  notes?: string | null;
}

export async function listClaimCases(applicationId: string): Promise<InsuranceClaimCase[]> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/claims`);
  const root = asObject(payload);
  const claims = Array.isArray(root?.claims) ? root.claims : [];
  return claims
    .map((claim) => mapClaimCase(asObject(claim)))
    .filter((claim): claim is InsuranceClaimCase => claim !== null);
}

export async function createClaimCase(
  applicationId: string,
  payload: CreateClaimCasePayload,
): Promise<InsuranceClaimCase | null> {
  const safeId = encodeURIComponent(applicationId);
  const response = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/claims`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const root = asObject(response);
  return mapClaimCase(asObject(root?.claim));
}

export async function getClaimCase(
  applicationId: string,
  claimId: string,
): Promise<InsuranceClaimCase | null> {
  const safeId = encodeURIComponent(applicationId);
  const safeClaimId = encodeURIComponent(claimId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/claims/${safeClaimId}`);
  const root = asObject(payload);
  return mapClaimCase(asObject(root?.claim));
}

export async function updateClaimCaseStatus(
  applicationId: string,
  claimId: string,
  status: InsuranceClaimCaseStatus,
): Promise<InsuranceClaimCase | null> {
  const safeId = encodeURIComponent(applicationId);
  const safeClaimId = encodeURIComponent(claimId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/claims/${safeClaimId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );
  const root = asObject(payload);
  return mapClaimCase(asObject(root?.claim));
}

function mapMonitoringSnapshot(payload: unknown): InsuranceMonitoringSnapshot | null {
  const root = asObject(payload);
  const obj = asObject(root?.monitoring);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    policyContractId: readString(obj, "policyContractId"),
    evidenceBundleId: readString(obj, "evidenceBundleId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "MONITORING_SNAPSHOT_GENERATED") as InsuranceMonitoringSnapshotStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    monitoringProtocolVersion: readString(obj, "monitoringProtocolVersion") ?? "IDDO_MONITORING_V1_2026",
    policySurveillance: asObject(obj.policySurveillance),
    parcelSurveillance: asObject(obj.parcelSurveillance),
    climateSurveillance: asObject(obj.climateSurveillance),
    vegetationSurveillance: asObject(obj.vegetationSurveillance),
    hydrologySurveillance: asObject(obj.hydrologySurveillance),
    claimsSurveillance: asObject(obj.claimsSurveillance),
    complianceSurveillance: asObject(obj.complianceSurveillance),
    dataQuality: asObject(obj.dataQuality),
    alerts: Array.isArray(obj.alerts) ? obj.alerts : [],
    recommendedActions: readStringArray(obj, "recommendedActions"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getMonitoringSnapshot(
  applicationId: string,
): Promise<InsuranceMonitoringSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/monitoring`);
  return mapMonitoringSnapshot(payload);
}

export async function generateMonitoringSnapshot(
  applicationId: string,
): Promise<InsuranceMonitoringSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/monitoring/generate`, {
    method: "POST",
  });
  return mapMonitoringSnapshot(payload);
}

export async function updateMonitoringSnapshotStatus(
  applicationId: string,
  status: InsuranceMonitoringSnapshotStatus,
): Promise<InsuranceMonitoringSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/monitoring/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return mapMonitoringSnapshot(payload);
}

function mapFraudForensicReview(payload: unknown): InsuranceFraudForensicReview | null {
  const root = asObject(payload);
  const obj = asObject(root?.fraudForensicReview);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    policyContractId: readString(obj, "policyContractId"),
    evidenceBundleId: readString(obj, "evidenceBundleId"),
    monitoringSnapshotId: readString(obj, "monitoringSnapshotId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "FORENSIC_REVIEW_GENERATED") as InsuranceFraudForensicReviewStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "IFDO_FORENSIC_REVIEW_V1_2026",
    anomalySignals: Array.isArray(obj.anomalySignals) ? obj.anomalySignals : [],
    forensicMatrix: Array.isArray(obj.forensicMatrix) ? obj.forensicMatrix : [],
    evidenceConsistency: asObject(obj.evidenceConsistency),
    identityAndConsentReview: asObject(obj.identityAndConsentReview),
    geoTemporalReview: asObject(obj.geoTemporalReview),
    claimPatternReview: asObject(obj.claimPatternReview),
    documentIntegrityReview: asObject(obj.documentIntegrityReview),
    riskAndPricingConsistency: asObject(obj.riskAndPricingConsistency),
    recommendedHumanActions: readStringArray(obj, "recommendedHumanActions"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getFraudForensicReview(
  applicationId: string,
): Promise<InsuranceFraudForensicReview | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/fraud-forensic-review`);
  return mapFraudForensicReview(payload);
}

export async function generateFraudForensicReview(
  applicationId: string,
): Promise<InsuranceFraudForensicReview | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/fraud-forensic-review/generate`,
    { method: "POST" },
  );
  return mapFraudForensicReview(payload);
}

export async function updateFraudForensicReviewStatus(
  applicationId: string,
  status: InsuranceFraudForensicReviewStatus,
): Promise<InsuranceFraudForensicReview | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/fraud-forensic-review/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return mapFraudForensicReview(payload);
}

function mapOperationsCockpitSnapshot(payload: unknown): InsuranceOperationsCockpitSnapshot | null {
  const root = asObject(payload);
  const obj = asObject(root?.operationsCockpit);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    scopeType: readString(obj, "scopeType") ?? "APPLICATION",
    applicationId: readString(obj, "applicationId"),
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "OPERATIONS_SNAPSHOT_GENERATED") as InsuranceOperationsCockpitSnapshotStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "ICOO_OPERATIONS_COCKPIT_V1_2026",
    pipelineOverview: asObject(obj.pipelineOverview),
    workloadQueues: asObject(obj.workloadQueues),
    slaIndicators: asObject(obj.slaIndicators),
    bottleneckAnalysis: asObject(obj.bottleneckAnalysis),
    exceptionList: Array.isArray(obj.exceptionList) ? obj.exceptionList : [],
    claimsOperations: asObject(obj.claimsOperations),
    monitoringOperations: asObject(obj.monitoringOperations),
    evidenceOperations: asObject(obj.evidenceOperations),
    policyOperations: asObject(obj.policyOperations),
    recommendedActions: readStringArray(obj, "recommendedActions"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getOperationsCockpit(
  applicationId: string,
): Promise<InsuranceOperationsCockpitSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/operations-cockpit`);
  return mapOperationsCockpitSnapshot(payload);
}

export async function generateOperationsCockpit(
  applicationId: string,
): Promise<InsuranceOperationsCockpitSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/operations-cockpit/generate`,
    { method: "POST" },
  );
  return mapOperationsCockpitSnapshot(payload);
}

export async function updateOperationsCockpitStatus(
  applicationId: string,
  status: InsuranceOperationsCockpitSnapshotStatus,
): Promise<InsuranceOperationsCockpitSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/operations-cockpit/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return mapOperationsCockpitSnapshot(payload);
}

export async function getInstitutionOperationsCockpit(): Promise<InsuranceOperationsCockpitSnapshot | null> {
  const payload = await apiFetch<unknown>(`/v1/insurance/operations-cockpit`);
  return mapOperationsCockpitSnapshot(payload);
}

export async function generateInstitutionOperationsCockpit(): Promise<InsuranceOperationsCockpitSnapshot | null> {
  const payload = await apiFetch<unknown>(`/v1/insurance/operations-cockpit/generate`, {
    method: "POST",
  });
  return mapOperationsCockpitSnapshot(payload);
}

function mapGovernanceComplianceSnapshot(payload: unknown): InsuranceGovernanceComplianceSnapshot | null {
  const root = asObject(payload);
  const obj = asObject(root?.governanceCompliance);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    scopeType: readString(obj, "scopeType") ?? "APPLICATION",
    applicationId: readString(obj, "applicationId"),
    policyContractId: readString(obj, "policyContractId"),
    evidenceBundleId: readString(obj, "evidenceBundleId"),
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "COMPLIANCE_SNAPSHOT_GENERATED") as InsuranceGovernanceComplianceSnapshotStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "ICGO_GOVERNANCE_COMPLIANCE_V1_2026",
    consentCompliance: asObject(obj.consentCompliance),
    dataProtectionReview: asObject(obj.dataProtectionReview),
    piiReview: asObject(obj.piiReview),
    auditTrailReview: asObject(obj.auditTrailReview),
    evidenceGovernance: asObject(obj.evidenceGovernance),
    tenantScopeReview: asObject(obj.tenantScopeReview),
    regulatoryReadiness: asObject(obj.regulatoryReadiness),
    securityPostureReview: asObject(obj.securityPostureReview),
    complianceGaps: readStringArray(obj, "complianceGaps"),
    recommendedActions: readStringArray(obj, "recommendedActions"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getGovernanceCompliance(
  applicationId: string,
): Promise<InsuranceGovernanceComplianceSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/governance-compliance`);
  return mapGovernanceComplianceSnapshot(payload);
}

export async function generateGovernanceCompliance(
  applicationId: string,
): Promise<InsuranceGovernanceComplianceSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/governance-compliance/generate`,
    { method: "POST" },
  );
  return mapGovernanceComplianceSnapshot(payload);
}

export async function updateGovernanceComplianceStatus(
  applicationId: string,
  status: InsuranceGovernanceComplianceSnapshotStatus,
): Promise<InsuranceGovernanceComplianceSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/governance-compliance/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return mapGovernanceComplianceSnapshot(payload);
}

export async function getInstitutionGovernanceCompliance(): Promise<InsuranceGovernanceComplianceSnapshot | null> {
  const payload = await apiFetch<unknown>(`/v1/insurance/governance-compliance`);
  return mapGovernanceComplianceSnapshot(payload);
}

export async function generateInstitutionGovernanceCompliance(): Promise<InsuranceGovernanceComplianceSnapshot | null> {
  const payload = await apiFetch<unknown>(`/v1/insurance/governance-compliance/generate`, {
    method: "POST",
  });
  return mapGovernanceComplianceSnapshot(payload);
}

function mapRetexClosureReport(payload: unknown): InsuranceRetexClosureReport | null {
  const root = asObject(payload);
  const obj = asObject(root?.retexClosure);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    applicationId: readString(obj, "applicationId") ?? "",
    policyContractId: readString(obj, "policyContractId"),
    evidenceBundleId: readString(obj, "evidenceBundleId"),
    monitoringSnapshotId: readString(obj, "monitoringSnapshotId"),
    fraudForensicReviewId: readString(obj, "fraudForensicReviewId"),
    operationsCockpitSnapshotId: readString(obj, "operationsCockpitSnapshotId"),
    governanceComplianceSnapshotId: readString(obj, "governanceComplianceSnapshotId"),
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "RETEX_REPORT_GENERATED") as InsuranceRetexClosureReportStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "IRETEX_CLOSURE_REVIEW_V1_2026",
    closureScope: asObject(obj.closureScope),
    chainTimeline: Array.isArray(obj.chainTimeline) ? obj.chainTimeline : [],
    outcomeSummary: asObject(obj.outcomeSummary),
    lessonsLearned: asObject(obj.lessonsLearned),
    operationalFindings: asObject(obj.operationalFindings),
    riskFindings: asObject(obj.riskFindings),
    claimsFindings: asObject(obj.claimsFindings),
    monitoringFindings: asObject(obj.monitoringFindings),
    governanceFindings: asObject(obj.governanceFindings),
    evidenceFindings: asObject(obj.evidenceFindings),
    unresolvedItems: readStringArray(obj, "unresolvedItems"),
    correctiveActions: readStringArray(obj, "correctiveActions"),
    futureRecommendations: readStringArray(obj, "futureRecommendations"),
    closureReadiness: asObject(obj.closureReadiness),
    archiveReadiness: asObject(obj.archiveReadiness),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getRetexClosureReport(
  applicationId: string,
): Promise<InsuranceRetexClosureReport | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/retex-closure`);
  return mapRetexClosureReport(payload);
}

export async function generateRetexClosureReport(
  applicationId: string,
): Promise<InsuranceRetexClosureReport | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/retex-closure/generate`,
    { method: "POST" },
  );
  return mapRetexClosureReport(payload);
}

export async function updateRetexClosureReportStatus(
  applicationId: string,
  status: InsuranceRetexClosureReportStatus,
): Promise<InsuranceRetexClosureReport | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/retex-closure/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return mapRetexClosureReport(payload);
}

function mapExecutiveCockpitSnapshot(payload: unknown): InsuranceExecutiveCockpitSnapshot | null {
  const root = asObject(payload);
  const obj = asObject(root?.executiveCockpit);
  if (!obj) return null;

  return {
    id: readString(obj, "id") ?? "",
    institutionId: readString(obj, "institutionId") ?? "",
    country: readString(obj, "country") ?? "MA",
    scopeType: readString(obj, "scopeType") ?? "APPLICATION",
    applicationId: readString(obj, "applicationId"),
    version: readNumberLike(obj, "version") ?? 1,
    status: (readString(obj, "status") ?? "EXECUTIVE_COCKPIT_GENERATED") as InsuranceExecutiveCockpitSnapshotStatus,
    sourceLabel: readString(obj, "sourceLabel") ?? "LIVE",
    protocolVersion: readString(obj, "protocolVersion") ?? "IDJOR_EXECUTIVE_COCKPIT_V1_2026",
    executiveSummary: asObject(obj.executiveSummary),
    fullChainMap: Array.isArray(obj.fullChainMap) ? obj.fullChainMap : [],
    portfolioKpis: asObject(obj.portfolioKpis),
    riskKpis: asObject(obj.riskKpis),
    policyKpis: asObject(obj.policyKpis),
    claimsKpis: asObject(obj.claimsKpis),
    evidenceKpis: asObject(obj.evidenceKpis),
    monitoringKpis: asObject(obj.monitoringKpis),
    operationsKpis: asObject(obj.operationsKpis),
    governanceKpis: asObject(obj.governanceKpis),
    forensicKpis: asObject(obj.forensicKpis),
    retexKpis: asObject(obj.retexKpis),
    readinessScorecard: asObject(obj.readinessScorecard),
    dataQualityScorecard: asObject(obj.dataQualityScorecard),
    exceptionBoard: Array.isArray(obj.exceptionBoard) ? obj.exceptionBoard : [],
    recommendedHumanActions: readStringArray(obj, "recommendedHumanActions"),
    blockers: readStringArray(obj, "blockers"),
    warnings: readStringArray(obj, "warnings"),
    sideEffects: asObject(obj.sideEffects),
    generatedByUserId: readString(obj, "generatedByUserId"),
    reviewedByUserId: readString(obj, "reviewedByUserId"),
    generatedAt: readString(obj, "generatedAt"),
    reviewedAt: readString(obj, "reviewedAt"),
    createdAt: readString(obj, "createdAt"),
    updatedAt: readString(obj, "updatedAt"),
  };
}

export async function getExecutiveCockpit(
  applicationId: string,
): Promise<InsuranceExecutiveCockpitSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(`/v1/insurance/applications/${safeId}/executive-cockpit`);
  return mapExecutiveCockpitSnapshot(payload);
}

export async function generateExecutiveCockpit(
  applicationId: string,
): Promise<InsuranceExecutiveCockpitSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/executive-cockpit/generate`,
    { method: "POST" },
  );
  return mapExecutiveCockpitSnapshot(payload);
}

export async function updateExecutiveCockpitStatus(
  applicationId: string,
  status: InsuranceExecutiveCockpitSnapshotStatus,
): Promise<InsuranceExecutiveCockpitSnapshot | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/executive-cockpit/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return mapExecutiveCockpitSnapshot(payload);
}

export async function getInstitutionExecutiveCockpit(): Promise<InsuranceExecutiveCockpitSnapshot | null> {
  const payload = await apiFetch<unknown>(`/v1/insurance/executive-cockpit`);
  return mapExecutiveCockpitSnapshot(payload);
}

export async function generateInstitutionExecutiveCockpit(): Promise<InsuranceExecutiveCockpitSnapshot | null> {
  const payload = await apiFetch<unknown>(`/v1/insurance/executive-cockpit/generate`, {
    method: "POST",
  });
  return mapExecutiveCockpitSnapshot(payload);
}

export async function getInsuranceMissionConfig(
  applicationId: string,
): Promise<InsuranceMissionConfig | null> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/mission-config`,
  );
  return mapMissionConfig(payload);
}

export async function saveInsuranceMissionConfig(
  applicationId: string,
  payload: InsuranceMissionConfigPayload,
): Promise<InsuranceMissionConfig | null> {
  const safeId = encodeURIComponent(applicationId);
  const response = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/mission-config`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  return mapMissionConfig(response);
}

export async function createInsuranceMissionDispatchDraft(
  applicationId: string,
  payload: CreateInsuranceMissionDispatchDraftPayload,
): Promise<CreateInsuranceMissionDispatchDraftResult> {
  const safeId = encodeURIComponent(applicationId);
  const missionConfigId = payload.missionConfigId.trim();
  if (!missionConfigId) {
    throw new ApiError(400, "missionConfigId est requis.");
  }

  const body: Record<string, unknown> = {
    missionConfigId,
    dispatchMode: "DRAFT_ONLY",
  };

  if (payload.suggestedAgentId !== undefined) {
    body.suggestedAgentId = payload.suggestedAgentId;
  }
  if (payload.scheduledWindowStart !== undefined) {
    body.scheduledWindowStart = payload.scheduledWindowStart;
  }
  if (payload.scheduledWindowEnd !== undefined) {
    body.scheduledWindowEnd = payload.scheduledWindowEnd;
  }
  if (payload.dispatchNote !== undefined) {
    body.dispatchNote = payload.dispatchNote;
  }

  const response = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/mission-dispatch-draft`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const root = asObject(response);
  const data = asObject(root?.data);
  const draftRecord = extractMissionDispatchDraftRecord(response);

  if (!draftRecord) {
    throw new ApiError(
      502,
      "Réponse backend invalide: missionDispatchDraft manquant.",
      response,
    );
  }

  const missionDispatchDraft: InsuranceMissionDispatchDraft = {
    id: readString(draftRecord, "id") ?? "",
    applicationId: readString(draftRecord, "applicationId") ?? applicationId,
    missionConfigId: readString(draftRecord, "missionConfigId") ?? missionConfigId,
    missionConfigVersion: readNumberLike(draftRecord, "missionConfigVersion"),
    dispatchMode: "DRAFT_ONLY",
    suggestedAgentId: readString(draftRecord, "suggestedAgentId"),
    scheduledWindowStart: readString(draftRecord, "scheduledWindowStart"),
    scheduledWindowEnd: readString(draftRecord, "scheduledWindowEnd"),
    dispatchNote: readString(draftRecord, "dispatchNote"),
    status: "MISSION_DISPATCH_DRAFT",
    source: "LIVE",
    createdAt: readString(draftRecord, "createdAt") ?? undefined,
    updatedAt: readString(draftRecord, "updatedAt") ?? undefined,
  };

  const sideEffectsCandidates = [
    root?.sideEffects,
    data?.sideEffects,
    draftRecord.sideEffects,
  ];
  const sideEffectsSource = sideEffectsCandidates.find((item) =>
    hasMissionDispatchDraftSideEffects(item),
  );
  const sideEffects = sideEffectsSource
    ? mapMissionDispatchDraftSideEffects(sideEffectsSource)
    : emptyMissionDispatchDraftSideEffects();

  const rawApplication = asObject(root?.application) ?? asObject(data?.application);
  const application =
    rawApplication && readString(rawApplication, "id")
      ? {
          id: readString(rawApplication, "id") as string,
          status: readString(rawApplication, "status") ?? undefined,
          frontendStatus: readString(rawApplication, "frontendStatus") ?? undefined,
        }
      : undefined;

  return {
    missionDispatchDraft,
    application,
    sideEffects,
  };
}

export type FieldAgent = {
  userId: string;
  agentProfileId: string | null;
  email: string;
  displayName: string;
  status: string;
  organizationType: "WAKAMA" | "INSURER" | "UNKNOWN";
};

export async function getInsuranceFieldAgents(): Promise<FieldAgent[]> {
  const response = await apiFetch<unknown>("/v1/insurance/field-agents");
  const root = asObject(response);
  const items = Array.isArray(root?.agents) ? (root!.agents as unknown[]) : [];
  return items.flatMap((item) => {
    const obj = asObject(item);
    if (!obj) return [];
    return [{
      userId: readString(obj, "userId") ?? "",
      agentProfileId: readString(obj, "agentProfileId") ?? null,
      email: readString(obj, "email") ?? "",
      displayName: readString(obj, "displayName") ?? "",
      status: readString(obj, "status") ?? "UNKNOWN",
      organizationType: (readString(obj, "organizationType") ?? "UNKNOWN") as FieldAgent["organizationType"],
    }];
  });
}

export type MissionDispatchAssignPayload = {
  missionConfigId: string;
  assignedAgentUserId: string;
  scheduledWindowStart?: string | null;
  scheduledWindowEnd?: string | null;
  dispatchNote?: string | null;
};

export type MissionDispatchResult = {
  id: string;
  applicationId: string;
  missionConfigId: string;
  assignedAgentUserId: string | null;
  status: string;
  assignmentFilteringMode: string;
};

export async function assignInsuranceMissionDispatch(
  applicationId: string,
  payload: MissionDispatchAssignPayload,
): Promise<MissionDispatchResult> {
  const safeId = encodeURIComponent(applicationId);
  const response = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/mission-dispatch/assign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const root = asObject(response);
  const dispatch = asObject(root?.dispatch);
  if (!dispatch) throw new ApiError(502, "Réponse backend invalide: dispatch manquant.", response);
  return {
    id: readString(dispatch, "id") ?? "",
    applicationId: readString(dispatch, "applicationId") ?? applicationId,
    missionConfigId: readString(dispatch, "missionConfigId") ?? payload.missionConfigId,
    assignedAgentUserId: readString(dispatch, "assignedAgentUserId") ?? null,
    status: readString(dispatch, "status") ?? "MISSION_ASSIGNED",
    assignmentFilteringMode: readString(dispatch, "assignmentFilteringMode") ?? "AGENT_PROFILE",
  };
}

export async function sendInsuranceMissionDispatch(
  applicationId: string,
  missionConfigId: string,
): Promise<MissionDispatchResult> {
  const safeId = encodeURIComponent(applicationId);
  const response = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/mission-dispatch/send`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionConfigId }),
    },
  );
  const root = asObject(response);
  const dispatch = asObject(root?.dispatch);
  if (!dispatch) throw new ApiError(502, "Réponse backend invalide: dispatch manquant.", response);
  return {
    id: readString(dispatch, "id") ?? "",
    applicationId,
    missionConfigId,
    assignedAgentUserId: readString(dispatch, "assignedAgentUserId") ?? null,
    status: readString(dispatch, "status") ?? "MISSION_SENT",
    assignmentFilteringMode: readString(dispatch, "assignmentFilteringMode") ?? "AGENT_PROFILE",
  };
}

export interface AcceptFieldAuditForReviewSideEffects {
  fieldAuditCreated: false;
  fieldAuditAcceptedForReview: true;
  raxCalculated: false;
  pricingCalculated: false;
  policyCreated: false;
  claimCreated: false;
  evidenceBundleCreated: false;
  blockchainAnchored: false;
}

export interface AcceptFieldAuditForReviewResult {
  fieldAudit: InsuranceFieldAudit;
  applicationNextStatusSuggested: "READY_FOR_BACK_OFFICE_REVIEW";
  sideEffects: AcceptFieldAuditForReviewSideEffects;
}

export async function acceptInsuranceFieldAuditForReview(
  fieldAuditId: string,
): Promise<AcceptFieldAuditForReviewResult> {
  const safeId = encodeURIComponent(fieldAuditId);
  const raw = await apiFetch<unknown>(`/v1/insurance/field-audits/${safeId}/accept-for-review`, {
    method: "PATCH",
  });

  const r = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : null;
  if (!r || typeof r.fieldAudit !== "object") {
    throw new ApiError(500, "Réponse inattendue du serveur.");
  }

  const fieldAudit = mapLatestFieldAudit(r.fieldAudit);
  if (!fieldAudit) {
    throw new ApiError(500, "Données audit terrain invalides dans la réponse.");
  }

  return {
    fieldAudit,
    applicationNextStatusSuggested: "READY_FOR_BACK_OFFICE_REVIEW",
    sideEffects: {
      fieldAuditCreated: false,
      fieldAuditAcceptedForReview: true,
      raxCalculated: false,
      pricingCalculated: false,
      policyCreated: false,
      claimCreated: false,
      evidenceBundleCreated: false,
      blockchainAnchored: false,
    },
  };
}

export async function getInsuranceMissionConfigVersions(
  applicationId: string,
): Promise<InsuranceMissionConfig[]> {
  const safeId = encodeURIComponent(applicationId);
  const payload = await apiFetch<unknown>(
    `/v1/insurance/applications/${safeId}/mission-config/versions`,
  );

  const items = extractArrayFromApiResponse(payload, ["versions", "items", "data"]);
  return items
    .map((item) => {
      const mapped = mapMissionConfig(item);
      if (mapped) return mapped;

      const raw = asObject(item);
      const version = readNumberLike(raw, "version");
      if (version === null) return null;

      return {
        missionType: "",
        proofLevel: "",
        surfaceTolerancePercent: 0,
        requiresPolygonCheck: false,
        requiresCinCheck: false,
        requiresLandDocumentCheck: false,
        requiredDocuments: [],
        requiredChecks: {
          polygon: false,
          identity: false,
          landDocument: false,
          surfaceTolerance: false,
        },
        noteDirectionRisques: "",
        status: "",
        sideEffects: emptyMissionConfigSideEffects(),
        version,
        createdAt: readString(raw, "createdAt"),
        updatedAt: readString(raw, "updatedAt"),
      } satisfies InsuranceMissionConfig;
    })
    .filter((item): item is InsuranceMissionConfig => item !== null);
}
