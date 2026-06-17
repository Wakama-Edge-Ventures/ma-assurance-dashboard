import { TENANTS, TENANT_IDS, TenantConfig, TenantId } from "@/config/tenants";

export const DEFAULT_TENANT_ID: TenantId = "assurance-ma";
export const TENANT_COOKIE_NAME = "wakama_tenant";
const DEFAULT_POST_LOGIN_PATH = "/fr/applications";
const TENANT_POST_LOGIN_PATHS: Record<TenantId, string> = {
  "assurance-ma": "/fr/applications",
  "bni-ci": "/fr/dashboard",
  "bad-program": "/fr/dashboard",
  wakama: "/fr/dashboard",
};

export function isTenantId(value: unknown): value is TenantId {
  return typeof value === "string" && TENANT_IDS.includes(value as TenantId);
}

export function resolveTenantId(value: unknown): TenantId {
  return isTenantId(value) ? value : DEFAULT_TENANT_ID;
}

export function getTenantById(id?: string | null): TenantConfig {
  return TENANTS[resolveTenantId(id)];
}

export function getTenantPostLoginPath(tenantId?: string | null): string {
  const resolvedTenantId = resolveTenantId(tenantId);
  const tenantPath = TENANT_POST_LOGIN_PATHS[resolvedTenantId];

  if (tenantPath.startsWith("/fr/")) {
    return tenantPath;
  }

  return DEFAULT_POST_LOGIN_PATH;
}

export function withAlpha(color: string, alphaHex: string): string {
  if (/^#[\da-f]{6}$/i.test(color)) {
    return `${color}${alphaHex}`;
  }

  if (/^#[\da-f]{8}$/i.test(color)) {
    return `${color.slice(0, 7)}${alphaHex}`;
  }

  return color;
}
