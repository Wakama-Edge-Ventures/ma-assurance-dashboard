import { DataSource } from "@/types";

export const DEMO_TOKEN_KEY = "wakama_demo_token";
export const DEMO_USER_KEY = "wakama_demo_user";
export const LIVE_USER_KEY = "wakama_auth_user";
export const AUTH_NOTICE_KEY = "wakama_auth_notice";
export const AUTH_CHANGED_EVENT = "wakama-auth-changed";

const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.wakama.farm";

const LEGACY_BACKEND_TOKEN_KEYS = [
  "wakama_backend_jwt",
  "wakama_backend_token",
  "wakama_access_token",
  "access_token",
  "token",
  "jwt",
] as const;

export const DEMO_CREDENTIALS = {
  email: "demo@wakama.farm",
  password: "demo",
} as const;

type AuthNoticeType = "session_expired" | "access_denied";
type SessionRole = "INSURER_ANALYST";
type SessionMode = "DEMO" | "LIVE";

interface AuthNotice {
  type: AuthNoticeType;
  message: string;
  at: string;
}

export interface DashboardSessionUser {
  id: string;
  fullName: string;
  email: string;
  role: SessionRole;
  source: DataSource;
  authMode: SessionMode;
}

export type DemoUser = DashboardSessionUser;

const seedUser: DemoUser = {
  id: "usr_demo_001",
  fullName: "Analyste Demo Wakama",
  email: DEMO_CREDENTIALS.email,
  role: "INSURER_ANALYST",
  source: "SEED_DEMO",
  authMode: "DEMO",
};

let inMemoryBackendToken: string | null = null;

function inBrowser() {
  return typeof window !== "undefined";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toAuthUrl(path: string) {
  const base = AUTH_API_BASE_URL.endsWith("/")
    ? AUTH_API_BASE_URL.slice(0, -1)
    : AUTH_API_BASE_URL;
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${safePath}`;
}

function emitAuthChanged() {
  if (!inBrowser()) return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function sanitizeBackendToken(token?: string | null): string | null {
  if (!token) return null;
  const trimmed = token.trim();
  if (!trimmed || isDemoAuthToken(trimmed)) return null;
  return trimmed;
}

function readLocalStorage(): Storage | null {
  if (!inBrowser()) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readSessionStorage(): Storage | null {
  if (!inBrowser()) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function removeLegacyBackendTokens() {
  const localStorage = readLocalStorage();
  const sessionStorage = readSessionStorage();

  for (const key of LEGACY_BACKEND_TOKEN_KEYS) {
    localStorage?.removeItem(key);
    sessionStorage?.removeItem(key);
  }
}

function clearDemoSessionStorage() {
  const localStorage = readLocalStorage();
  localStorage?.removeItem(DEMO_TOKEN_KEY);
  localStorage?.removeItem(DEMO_USER_KEY);
}

function clearLiveSessionStorage() {
  const localStorage = readLocalStorage();
  localStorage?.removeItem(LIVE_USER_KEY);
}

function readStoredUser(key: string): DashboardSessionUser | null {
  const storage = readLocalStorage();
  const raw = storage?.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DashboardSessionUser>;
    const source = parsed.source === "LIVE" || parsed.source === "SEED_DEMO"
      ? parsed.source
      : key === LIVE_USER_KEY
        ? "LIVE"
        : "SEED_DEMO";

    return {
      id: readString(parsed.id) ?? seedUser.id,
      fullName: readString(parsed.fullName) ?? seedUser.fullName,
      email: readString(parsed.email) ?? "",
      role: parsed.role === "INSURER_ANALYST" ? parsed.role : seedUser.role,
      source,
      authMode: key === LIVE_USER_KEY ? "LIVE" : "DEMO",
    };
  } catch {
    storage?.removeItem(key);
    return null;
  }
}

function parseJsonSafe(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function guessNameFromEmail(email?: string | null) {
  if (!email || !email.includes("@")) return "";
  const [localPart] = email.split("@");
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function buildLiveSessionUser(
  input?: {
    id?: string | null;
    email?: string | null;
    fullName?: string | null;
    role?: SessionRole | null;
  },
  fallback?: DashboardSessionUser | null,
): DashboardSessionUser {
  const email = readString(input?.email) ?? fallback?.email ?? "";
  const fullName =
    readString(input?.fullName) ||
    guessNameFromEmail(email) ||
    fallback?.fullName ||
    "Utilisateur Assurance";

  return {
    id: readString(input?.id) ?? fallback?.id ?? "usr_institution_session",
    fullName,
    email,
    role: input?.role === "INSURER_ANALYST" ? input.role : fallback?.role ?? seedUser.role,
    source: "LIVE",
    authMode: "LIVE",
  };
}

function extractSessionIdentity(payload: unknown): {
  id?: string | null;
  fullName?: string | null;
  email?: string | null;
  role?: SessionRole | null;
} {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const user = asRecord(data?.user) ?? asRecord(root?.user);

  const roleCandidate =
    readString(user?.role) ??
    readString(user?.userRole) ??
    readString(data?.role) ??
    readString(root?.role);

  return {
    id:
      readString(user?.id) ??
      readString(user?.userId) ??
      readString(data?.id) ??
      readString(root?.id),
    fullName:
      readString(user?.fullName) ??
      readString(user?.name) ??
      readString(data?.fullName) ??
      readString(data?.name) ??
      readString(root?.fullName) ??
      readString(root?.name),
    email:
      readString(user?.email) ??
      readString(data?.email) ??
      readString(root?.email),
    role: roleCandidate === "INSURER_ANALYST" ? roleCandidate : null,
  };
}

function persistLiveSessionUser(
  input?: {
    id?: string | null;
    email?: string | null;
    fullName?: string | null;
    role?: SessionRole | null;
  },
  emit = true,
) {
  const storage = readLocalStorage();
  if (!storage) return;

  const existing = readStoredUser(LIVE_USER_KEY);
  const sessionUser = buildLiveSessionUser(input, existing);

  clearDemoSessionStorage();
  storage.setItem(LIVE_USER_KEY, JSON.stringify(sessionUser));
  removeLegacyBackendTokens();

  if (emit) {
    emitAuthChanged();
  }
}

function clearLocalAuthState(emit = true) {
  clearDemoSessionStorage();
  clearLiveSessionStorage();
  inMemoryBackendToken = null;
  removeLegacyBackendTokens();

  if (emit) {
    emitAuthChanged();
  }
}

function setAuthNotice(type: AuthNoticeType, message: string) {
  const storage = readSessionStorage();
  if (!storage) return;

  const payload: AuthNotice = {
    type,
    message,
    at: new Date().toISOString(),
  };

  storage.setItem(AUTH_NOTICE_KEY, JSON.stringify(payload));
}

async function fetchLiveSessionUser(): Promise<DashboardSessionUser | null> {
  const response = await fetch(toAuthUrl("/v1/auth/me"), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const payload = parseJsonSafe(await response.text());
  return buildLiveSessionUser(extractSessionIdentity(payload), readStoredUser(LIVE_USER_KEY));
}

export function cleanupLegacyBrowserAuthStorage() {
  if (!inBrowser()) return;
  removeLegacyBackendTokens();
}

export function consumeAuthNotice(): { type: AuthNoticeType; message: string } | null {
  const storage = readSessionStorage();
  if (!storage) return null;

  const raw = storage.getItem(AUTH_NOTICE_KEY);
  if (!raw) return null;
  storage.removeItem(AUTH_NOTICE_KEY);

  try {
    const parsed = JSON.parse(raw) as AuthNotice;
    if (!parsed?.type || !parsed?.message) return null;
    return { type: parsed.type, message: parsed.message };
  } catch {
    return null;
  }
}

export function getDemoToken() {
  const storage = readLocalStorage();
  return storage?.getItem(DEMO_TOKEN_KEY) ?? null;
}

export function getAuthToken() {
  return getDemoToken();
}

const DEMO_TOKEN_EXACT_VALUES = new Set([
  "demo-token",
  "mock-token",
  "wakama-demo-token",
  "demo-token-mvp",
  "demo-session-token",
]);

export function isDemoAuthToken(token?: string | null): boolean {
  if (!token) return true;
  const normalized = token.trim().toLowerCase();
  if (!normalized) return true;
  return (
    DEMO_TOKEN_EXACT_VALUES.has(normalized) ||
    normalized.startsWith("demo-") ||
    normalized.startsWith("mock-")
  );
}

export function getBackendAuthToken(): string | null {
  return sanitizeBackendToken(inMemoryBackendToken);
}

export function setBackendAuthToken(token?: string | null) {
  inMemoryBackendToken = sanitizeBackendToken(token);
  if (inBrowser()) {
    removeLegacyBackendTokens();
    emitAuthChanged();
  }
}

export function clearBackendAuthToken() {
  inMemoryBackendToken = null;
  if (inBrowser()) {
    removeLegacyBackendTokens();
    emitAuthChanged();
  }
}

export function getDemoUser() {
  const user = readStoredUser(DEMO_USER_KEY);
  return user?.authMode === "DEMO" ? user : null;
}

export function getLiveSessionUser() {
  const user = readStoredUser(LIVE_USER_KEY);
  return user?.authMode === "LIVE" ? user : null;
}

export function getAuthenticatedUser() {
  return getDemoUser() ?? getLiveSessionUser();
}

export function isAuthenticated() {
  return Boolean(getAuthenticatedUser());
}

export function establishDashboardSession(user?: {
  id?: string;
  email?: string;
  fullName?: string;
  role?: SessionRole;
}) {
  if (!inBrowser()) return;
  persistLiveSessionUser(user);
}

export function signInWithDemoCredentials(
  email: string,
  password: string,
  backendToken?: string,
) {
  const isValid =
    email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
  const storage = readLocalStorage();

  if (!isValid || !storage) return false;

  clearLiveSessionStorage();
  removeLegacyBackendTokens();

  storage.setItem(DEMO_TOKEN_KEY, "demo-token-mvp");
  storage.setItem(DEMO_USER_KEY, JSON.stringify(seedUser));

  if (backendToken) {
    setBackendAuthToken(backendToken);
    return true;
  }

  emitAuthChanged();
  return true;
}

export async function restoreAuthSession(): Promise<boolean> {
  if (!inBrowser()) return false;

  removeLegacyBackendTokens();

  const demoToken = getDemoToken();
  const demoUser = getDemoUser();
  if (demoToken && demoUser) {
    return true;
  }
  if (demoToken || demoUser) {
    clearDemoSessionStorage();
  }

  try {
    const liveUser = await fetchLiveSessionUser();
    if (!liveUser) {
      const hadLiveSession = Boolean(getLiveSessionUser());
      clearLiveSessionStorage();
      inMemoryBackendToken = null;
      removeLegacyBackendTokens();
      if (hadLiveSession) {
        emitAuthChanged();
      }
      return false;
    }

    persistLiveSessionUser(liveUser);
    return true;
  } catch {
    const hadLiveSession = Boolean(getLiveSessionUser());
    clearLiveSessionStorage();
    inMemoryBackendToken = null;
    removeLegacyBackendTokens();
    if (hadLiveSession) {
      emitAuthChanged();
    }
    return false;
  }
}

export async function signOut() {
  try {
    await fetch(toAuthUrl("/v1/auth/logout"), {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      credentials: "include",
    });
  } catch {
    // Best effort: local cleanup still happens below.
  }

  if (!inBrowser()) return;
  clearLocalAuthState();
}

export function clearAuth(reason?: AuthNoticeType, message?: string) {
  if (!inBrowser()) return;

  clearLocalAuthState(false);

  if (reason) {
    const fallbackMessage =
      reason === "session_expired"
        ? "Session expirée ou invalide. Reconnectez-vous."
        : "Accès refusé pour ce compte.";
    setAuthNotice(reason, message ?? fallbackMessage);
  }

  emitAuthChanged();
}

export function handleSessionExpired(message?: string) {
  if (!inBrowser()) return;
  clearAuth("session_expired", message ?? "Session expirée ou invalide. Reconnectez-vous.");
  if (!window.location.pathname.startsWith("/fr/login")) {
    window.location.assign("/fr/login?reason=session_expired");
  }
}

export function noteAccessDenied(message?: string) {
  setAuthNotice("access_denied", message ?? "Accès refusé à cette ressource.");
}
