import { DataSource } from "@/types";

export const DEMO_TOKEN_KEY = "wakama_demo_token";
export const DEMO_USER_KEY = "wakama_demo_user";
export const BACKEND_TOKEN_KEY = "wakama_backend_jwt";
export const AUTH_NOTICE_KEY = "wakama_auth_notice";
export const AUTH_CHANGED_EVENT = "wakama-auth-changed";

const LEGACY_BACKEND_TOKEN_KEYS = [
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

interface AuthNotice {
  type: AuthNoticeType;
  message: string;
  at: string;
}

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  role: "INSURER_ANALYST";
  source: DataSource;
}

const seedUser: DemoUser = {
  id: "usr_demo_001",
  fullName: "Analyste Demo Wakama",
  email: DEMO_CREDENTIALS.email,
  role: "INSURER_ANALYST",
  source: "SEED_DEMO",
};

function inBrowser() {
  return typeof window !== "undefined";
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

function readNoticeStorage(): Storage | null {
  if (!inBrowser()) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readPreferredStorage(): Storage | null {
  if (!inBrowser()) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function removeLegacyBackendTokens() {
  if (!inBrowser()) return;
  for (const key of LEGACY_BACKEND_TOKEN_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

function setAuthNotice(type: AuthNoticeType, message: string) {
  const storage = readNoticeStorage();
  if (!storage) return;
  const payload: AuthNotice = {
    type,
    message,
    at: new Date().toISOString(),
  };
  storage.setItem(AUTH_NOTICE_KEY, JSON.stringify(payload));
}

export function consumeAuthNotice(): { type: AuthNoticeType; message: string } | null {
  const storage = readNoticeStorage();
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
  if (!inBrowser()) return null;
  return window.localStorage.getItem(DEMO_TOKEN_KEY);
}

export function getAuthToken() {
  return getDemoToken();
}

const DEMO_TOKEN_EXACT_VALUES = new Set([
  "demo-token",
  "mock-token",
  "wakama-demo-token",
  "demo-token-mvp",
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
  if (!inBrowser()) return null;

  const storage = readPreferredStorage();
  const fromOfficial = sanitizeBackendToken(storage?.getItem(BACKEND_TOKEN_KEY));
  if (fromOfficial) return fromOfficial;

  for (const key of LEGACY_BACKEND_TOKEN_KEYS) {
    const fromLegacy =
      sanitizeBackendToken(window.localStorage.getItem(key)) ??
      sanitizeBackendToken(window.sessionStorage.getItem(key));
    if (fromLegacy) {
      setBackendAuthToken(fromLegacy);
      return fromLegacy;
    }
  }

  const migrated = sanitizeBackendToken(getDemoToken());
  if (migrated) {
    setBackendAuthToken(migrated);
    return migrated;
  }

  return null;
}

export function setBackendAuthToken(token?: string | null) {
  if (!inBrowser()) return;

  const storage = readPreferredStorage();
  const sanitized = sanitizeBackendToken(token);
  if (storage) {
    if (sanitized) {
      storage.setItem(BACKEND_TOKEN_KEY, sanitized);
    } else {
      storage.removeItem(BACKEND_TOKEN_KEY);
    }
  }

  removeLegacyBackendTokens();
  emitAuthChanged();
}

export function clearBackendAuthToken() {
  if (!inBrowser()) return;
  const storage = readPreferredStorage();
  storage?.removeItem(BACKEND_TOKEN_KEY);
  removeLegacyBackendTokens();
  emitAuthChanged();
}

export function getDemoUser() {
  if (!inBrowser()) return null;
  const raw = window.localStorage.getItem(DEMO_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getDemoToken() || getBackendAuthToken());
}

export function establishDashboardSession(user?: {
  email?: string;
  fullName?: string;
  role?: DemoUser["role"];
}) {
  if (!inBrowser()) return;

  const sanitizedEmail = user?.email?.trim() || seedUser.email;
  const guessedNameFromEmail = sanitizedEmail.includes("@")
    ? sanitizedEmail.split("@")[0].replace(/[._-]+/g, " ").trim()
    : "";
  const fallbackName =
    guessedNameFromEmail.charAt(0).toUpperCase() + guessedNameFromEmail.slice(1);

  const sessionUser: DemoUser = {
    id: seedUser.id,
    fullName: user?.fullName?.trim() || fallbackName || seedUser.fullName,
    email: sanitizedEmail,
    role: user?.role ?? seedUser.role,
    source: "LIVE",
  };

  window.localStorage.setItem(DEMO_TOKEN_KEY, "demo-session-token");
  window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(sessionUser));
  emitAuthChanged();
}

export function signInWithDemoCredentials(
  email: string,
  password: string,
  backendToken?: string,
) {
  const isValid =
    email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;

  if (!isValid || !inBrowser()) return false;

  window.localStorage.setItem(DEMO_TOKEN_KEY, "demo-token-mvp");
  window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(seedUser));
  if (backendToken) {
    setBackendAuthToken(backendToken);
  }
  emitAuthChanged();
  return true;
}

export function signOut() {
  clearAuth();
}

export function clearAuth(reason?: AuthNoticeType, message?: string) {
  if (!inBrowser()) return;
  window.localStorage.removeItem(DEMO_TOKEN_KEY);
  window.localStorage.removeItem(DEMO_USER_KEY);
  clearBackendAuthToken();

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
