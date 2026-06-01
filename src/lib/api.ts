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
