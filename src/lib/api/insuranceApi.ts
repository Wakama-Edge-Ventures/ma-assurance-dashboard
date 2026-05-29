import { getBackendAuthToken, handleSessionExpired, noteAccessDenied } from "@/lib/auth";
import { extractArrayFromApiResponse } from "@/lib/dto-mappers";
import { normalizeSource } from "@/lib/data-source";
import { DataSource } from "@/types";

export const INSURANCE_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.wakama.farm";
export const USE_LIVE_INSURANCE_API =
  process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";
export const INSURANCE_DEMO_FALLBACK_ENABLED =
  process.env.NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK === "true";

export type InsuranceApiState =
  | "SUCCESS"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "UNAVAILABLE"
  | "DEGRADED"
  | "ERROR";

export interface InsuranceApiResponse<T> {
  ok: boolean;
  state: InsuranceApiState;
  status: number | null;
  source: DataSource;
  disclosure: string;
  data: T | null;
  errorMessage?: string;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  requiresAuth?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
}

type UnknownRecord = Record<string, unknown>;

function inBrowser() {
  return typeof window !== "undefined";
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = INSURANCE_API_BASE_URL.endsWith("/")
    ? INSURANCE_API_BASE_URL.slice(0, -1)
    : INSURANCE_API_BASE_URL;
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${safePath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asUpperString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return normalized || null;
}

function parseJsonSafe(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function readCandidateToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function readAuthToken(): string | null {
  return readCandidateToken(getBackendAuthToken());
}

function resolveStateFromPayload(payload: unknown): {
  state: InsuranceApiState | null;
  source: DataSource | null;
} {
  const root = asRecord(payload);
  if (!root) return { state: null, source: null };

  const candidates = [
    root.status,
    root.mode,
    root.serviceStatus,
    root.providerStatus,
    asRecord(root.data)?.status,
    asRecord(root.data)?.mode,
  ];

  const merged = candidates
    .map((value) => asUpperString(value))
    .filter((value): value is string => Boolean(value))
    .join(" ");

  if (!merged) return { state: null, source: null };
  if (merged.includes("DEGRADED")) {
    return { state: "DEGRADED", source: "DEGRADED" };
  }
  if (merged.includes("UNAVAILABLE")) {
    return { state: "UNAVAILABLE", source: "UNAVAILABLE" };
  }
  if (merged.includes("DISABLED_SAFE")) {
    return { state: "DEGRADED", source: "DEGRADED" };
  }

  return { state: null, source: null };
}

function resolveSource(payload: unknown, fallback: DataSource): DataSource {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const sourceCandidate = root?.source ?? data?.source;
  return normalizeSource(sourceCandidate, fallback);
}

function resolveDisclosure(state: InsuranceApiState): string {
  if (state === "AUTH_REQUIRED") {
    return "Route protégée: authentification backend requise.";
  }
  if (state === "DEGRADED") {
    return "Service disponible en mode dégradé (non bloquant).";
  }
  if (state === "UNAVAILABLE" || state === "NETWORK_ERROR") {
    return "Service temporairement indisponible.";
  }
  if (state === "FORBIDDEN") {
    return "Accès refusé (403).";
  }
  if (state === "NOT_FOUND") {
    return "Ressource introuvable (404).";
  }
  return "Donnée live récupérée.";
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<InsuranceApiResponse<T>> {
  const token = readAuthToken();
  if (options.requiresAuth && !token) {
    return {
      ok: false,
      state: "AUTH_REQUIRED",
      status: 401,
      source: "UNAVAILABLE",
      disclosure: resolveDisclosure("AUTH_REQUIRED"),
      data: null,
      errorMessage: "Missing backend token",
    };
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = options.body !== undefined;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      cache: "no-store",
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const payload = parseJsonSafe(text);

    if (!response.ok) {
      const base: Omit<InsuranceApiResponse<T>, "state" | "source" | "disclosure"> = {
        ok: false,
        status: response.status,
        data: null,
        errorMessage:
          (asRecord(payload)?.message as string | undefined) ?? `HTTP ${response.status}`,
      };

      if (response.status === 401) {
        if (inBrowser()) {
          handleSessionExpired(
            (asRecord(payload)?.message as string | undefined) ??
              "Session expirée ou invalide. Reconnectez-vous.",
          );
        }
        return {
          ...base,
          state: "AUTH_REQUIRED",
          source: "UNAVAILABLE",
          disclosure: resolveDisclosure("AUTH_REQUIRED"),
        };
      }
      if (response.status === 403) {
        if (inBrowser()) {
          noteAccessDenied(
            (asRecord(payload)?.message as string | undefined) ??
              "Accès refusé à cette ressource.",
          );
        }
        return {
          ...base,
          state: "FORBIDDEN",
          source: "UNAVAILABLE",
          disclosure: resolveDisclosure("FORBIDDEN"),
        };
      }
      if (response.status === 404) {
        return {
          ...base,
          state: "NOT_FOUND",
          source: "UNAVAILABLE",
          disclosure: resolveDisclosure("NOT_FOUND"),
        };
      }

      return {
        ...base,
        state: "ERROR",
        source: "UNAVAILABLE",
        disclosure: resolveDisclosure("ERROR"),
      };
    }

    const inferred = resolveStateFromPayload(payload);
    const state = inferred.state ?? "SUCCESS";
    const source = inferred.source ?? resolveSource(payload, "LIVE");

    return {
      ok: true,
      state,
      status: response.status,
      source,
      disclosure: resolveDisclosure(state),
      data: payload as T,
    };
  } catch (error) {
    return {
      ok: false,
      state: "NETWORK_ERROR",
      status: null,
      source: "UNAVAILABLE",
      disclosure: resolveDisclosure("NETWORK_ERROR"),
      data: null,
      errorMessage: error instanceof Error ? error.message : "Network error",
    };
  }
}

function toRecordsArray(payload: unknown, preferredKeys: string[] = []) {
  return extractArrayFromApiResponse(payload, preferredKeys).filter(
    (item): item is UnknownRecord => Boolean(asRecord(item)),
  );
}

function withSource(records: UnknownRecord[], source: DataSource): UnknownRecord[] {
  return records.map((record) => {
    const itemSource = normalizeSource(record.source, source);
    return { ...record, source: itemSource };
  });
}

async function getProtectedList(
  path: string,
  preferredKeys: string[] = [],
): Promise<InsuranceApiResponse<UnknownRecord[]>> {
  const result = await request<unknown>(path, { requiresAuth: true });
  if (!result.ok || !result.data) {
    return { ...result, data: null };
  }

  const records = withSource(toRecordsArray(result.data, preferredKeys), result.source);
  return { ...result, data: records };
}

export function shouldUseInsuranceDemoFallback() {
  return INSURANCE_DEMO_FALLBACK_ENABLED;
}

export async function getApiHealth() {
  return request<UnknownRecord>("/health");
}

export async function getEvidenceHealth() {
  return request<UnknownRecord>("/v1/insurance/evidence/health");
}

export async function getMoroccoRegions() {
  return getProtectedList("/v1/morocco/regions", ["regions", "items", "data"]);
}
export async function getMoroccoProvinces() {
  return getProtectedList("/v1/morocco/provinces", ["provinces", "items", "data"]);
}
export async function getMoroccoCommunes() {
  return getProtectedList("/v1/morocco/communes", ["communes", "items", "data"]);
}
export async function getMoroccoCities() {
  return getProtectedList("/v1/morocco/cities", ["cities", "items", "data"]);
}
export async function getMoroccoCrops() {
  return getProtectedList("/v1/morocco/crops", ["crops", "items", "data"]);
}
export async function getMoroccoCropSeasons() {
  return getProtectedList("/v1/morocco/crop-seasons", ["cropSeasons", "items", "data"]);
}
export async function getMoroccoAgroClimaticZones() {
  return getProtectedList("/v1/morocco/agro-climatic-zones", [
    "agroClimaticZones",
    "items",
    "data",
  ]);
}
export async function getMoroccoRiskZones() {
  return getProtectedList("/v1/morocco/risk-zones", ["riskZones", "items", "data"]);
}
export async function getMoroccoDams() {
  return getProtectedList("/v1/morocco/dams", ["dams", "items", "data"]);
}
export async function getMoroccoRiverSegments() {
  return getProtectedList("/v1/morocco/river-segments", ["riverSegments", "items", "data"]);
}
export async function getMoroccoFloodRiskZones() {
  return getProtectedList("/v1/morocco/flood-risk-zones", [
    "floodRiskZones",
    "items",
    "data",
  ]);
}

export async function getInsuranceReferences() {
  return request<UnknownRecord>("/v1/insurance/references", { requiresAuth: true });
}
export async function getInsuranceThreats() {
  return getProtectedList("/v1/insurance/references/threats", ["threats", "items", "data"]);
}
export async function getInsuranceVulnerabilities() {
  return getProtectedList("/v1/insurance/references/vulnerabilities", [
    "vulnerabilities",
    "items",
    "data",
  ]);
}
export async function getInsuranceRaxParameters() {
  return getProtectedList("/v1/insurance/references/rax-parameters", [
    "raxParameters",
    "items",
    "data",
  ]);
}
export async function getInsuranceClaimCauses() {
  return getProtectedList("/v1/insurance/references/claim-causes", [
    "claimCauses",
    "items",
    "data",
  ]);
}
export async function getInsuranceClaimStatuses() {
  return getProtectedList("/v1/insurance/references/claim-statuses", [
    "claimStatuses",
    "items",
    "data",
  ]);
}
export async function getInsuranceAlertThresholds() {
  return getProtectedList("/v1/insurance/references/alert-thresholds", [
    "alertThresholds",
    "items",
    "data",
  ]);
}
export async function getInsurancePricingParameters() {
  return getProtectedList("/v1/insurance/references/pricing-parameters", [
    "pricingParameters",
    "items",
    "data",
  ]);
}

export async function getLiveApplications() {
  return getProtectedList("/v1/insurance/applications", ["applications", "items", "data"]);
}

export interface CreateApplicationPayload {
  country: "MA";
  cropCode: string;
  lat: number;
  lng: number;
  surfaceHa: number;
  regionCode?: string;
  provinceCode?: string;
  communeCode?: string;
  requestedCoverageAmount?: number;
  source: "MANUAL_ENTRY" | "MANUAL_ESTIMATE";
}

export async function createLiveApplication(payload: CreateApplicationPayload) {
  return request<UnknownRecord>("/v1/insurance/applications", {
    method: "POST",
    requiresAuth: true,
    body: payload,
  });
}

export async function getLiveMissions() {
  return getProtectedList("/v1/insurance/missions", ["missions", "items", "data"]);
}

export interface CreateMissionPayload {
  applicationId: string;
  missionType: "FIELD_AUDIT" | "CLAIM_INSPECTION" | "PARCEL_VERIFICATION";
  agentUserId?: string;
  scheduledAt?: string;
  notes?: string;
}

export async function createLiveMission(payload: CreateMissionPayload) {
  return request<UnknownRecord>("/v1/insurance/missions", {
    method: "POST",
    requiresAuth: true,
    body: payload,
  });
}

export interface CalculateRaxPayload {
  country: "MA";
  cropCode: string;
  lat: number;
  lng: number;
  applicationId?: string;
  surfaceHa?: number;
  gravityScore?: number;
  frequencyScore?: number;
  detectionScore?: number;
  useHydroRisk?: boolean;
  useWeatherArchive?: boolean;
  useNdviHistory?: boolean;
  startDate?: string;
  endDate?: string;
}

export async function calculateTechnicalRax(payload: CalculateRaxPayload) {
  return request<UnknownRecord>("/v1/insurance/rax/calculate", {
    method: "POST",
    requiresAuth: true,
    body: payload,
  });
}

export async function getHydroRisk(params: {
  lat: number;
  lng: number;
  radiusKm: number;
}) {
  return request<UnknownRecord>("/v1/insurance/hydro-risk", {
    requiresAuth: true,
    query: params,
  });
}

export async function getWeatherArchive(params: {
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
}) {
  return request<UnknownRecord>("/v1/insurance/weather/archive", {
    requiresAuth: true,
    query: params,
  });
}

export async function getNdviHistory(params: {
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
}) {
  return request<UnknownRecord>("/v1/insurance/ndvi/history", {
    requiresAuth: true,
    query: params,
  });
}

export async function createEvidenceBundle(payload: UnknownRecord) {
  return request<UnknownRecord>("/v1/insurance/evidence/bundle", {
    method: "POST",
    requiresAuth: true,
    body: payload,
  });
}

export async function createApplicationEvidenceBundle(applicationId: string) {
  return request<UnknownRecord>(`/v1/insurance/applications/${applicationId}/evidence-bundle`, {
    method: "POST",
    requiresAuth: true,
    body: {},
  });
}
