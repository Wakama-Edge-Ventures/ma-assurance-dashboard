import { DataSource } from "@/types";

const DEMO_TOKEN_KEY = "wakama_demo_token";
const DEMO_USER_KEY = "wakama_demo_user";

export const DEMO_CREDENTIALS = {
  email: "demo@wakama.farm",
  password: "demo",
} as const;

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  role: "INSURER_ANALYST";
  source: DataSource;
}

const seedUser: DemoUser = {
  id: "usr_demo_001",
  fullName: "Analyste Démo Wakama",
  email: DEMO_CREDENTIALS.email,
  role: "INSURER_ANALYST",
  source: "SEED_DEMO",
};

function inBrowser() {
  return typeof window !== "undefined";
}

export function getDemoToken() {
  if (!inBrowser()) return null;
  return localStorage.getItem(DEMO_TOKEN_KEY);
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
  const token = getAuthToken();
  if (!token || isDemoAuthToken(token)) return null;
  return token;
}

export function getDemoUser() {
  if (!inBrowser()) return null;
  const raw = localStorage.getItem(DEMO_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getDemoToken());
}

export function signInWithDemoCredentials(email: string, password: string) {
  const isValid =
    email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;

  if (!isValid || !inBrowser()) return false;

  localStorage.setItem(DEMO_TOKEN_KEY, "demo-token-mvp");
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(seedUser));
  return true;
}

export function signOut() {
  if (!inBrowser()) return;
  localStorage.removeItem(DEMO_TOKEN_KEY);
  localStorage.removeItem(DEMO_USER_KEY);
}

export function clearAuth() {
  signOut();
}
