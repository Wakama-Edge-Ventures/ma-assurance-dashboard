import { getBackendAuthToken, handleSessionExpired } from "@/lib/auth";

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
