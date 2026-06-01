import { getBackendAuthToken, handleSessionExpired } from "@/lib/auth";
import {
  extractArrayFromApiResponse,
  mapInsuranceDcaApplication,
} from "@/lib/dto-mappers";
import { InsuranceDcaApplication, InsuranceDcaSideEffects } from "@/types";

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
  token: string;
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

function toUrl(path: string) {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${safePath}`;
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
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    const message = extractErrorMessage(payload, response.status);
    throw new ApiError(response.status, message, payload);
  }

  const token = extractJwtFromLoginPayload(payload);
  if (!token) {
    throw new ApiError(
      502,
      "Réponse de connexion backend invalide: JWT manquant.",
      payload,
    );
  }

  return { token, payload };
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getBackendAuthToken();
  const headers = new Headers(options.headers);
  const method = options.method?.toUpperCase();
  const isReadOnlyGet = !method || method === "GET";
  const hasAuthorization = headers.has("Authorization");

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...options,
    headers,
    cache: "no-store",
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

export interface InsuranceApplicationByIdResult {
  application: InsuranceDcaApplication | null;
  detailNote?: string;
  usedListFallback: boolean;
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
      return {
        application: mapped,
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
