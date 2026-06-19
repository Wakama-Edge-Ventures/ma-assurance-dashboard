import { getBackendAuthToken, handleSessionExpired } from "@/lib/auth";
import {
  extractArrayFromApiResponse,
  mapInsuranceDcaApplication,
} from "@/lib/dto-mappers";
import { normalizeSource } from "@/lib/data-source";
import {
  IdjorFeatureFlag,
  IdjorFoundationHealth,
  IdjorFoundationRegistry,
  IdjorFoundationSecuritySummary,
  IdjorRegisterRagDocumentMetadataInput,
  IdjorRegisterRagDocumentMetadataResult,
  IdjorFoundationTenant,
  IdjorRagAssetCounts,
  IdjorRagChunk,
  IdjorRagChunksSnapshot,
  IdjorRagCitation,
  IdjorRagCitationsSnapshot,
  IdjorRagDocument,
  IdjorRagDocumentRegistrationSource,
  IdjorRagDocumentsSnapshot,
  IdjorRagHealth,
  IdjorRagLinkedAssetCounts,
  IdjorRagMetadataRegistrationStatus,
  IdjorRagResponseScope,
  IdjorRagSecuritySummary,
  IdjorModelCatalog,
  IdjorProviderCatalog,
  IdjorRegistryAgent,
  IdjorRegistryEngine,
  IdjorRegistryTool,
  InsuranceDcaApplication,
  InsuranceDcaSideEffects,
  InsuranceFieldAudit,
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
