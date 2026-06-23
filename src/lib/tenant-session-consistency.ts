import { TenantId } from "@/config/tenants";

export type TenantConsistencyState = "MATCH" | "MISMATCH" | "UNKNOWN";

export interface BackendTenantScope {
  tenantKey: string | null;
  institutionId: string | null;
  country: string | null;
  vertical: string | null;
}

export interface TenantConsistencyResult {
  state: TenantConsistencyState;
  requestedTenantId: TenantId;
  backendScope: BackendTenantScope | null;
}

/**
 * Compares the tenant requested via `?tenant=` (frontend branding) against the
 * tenant actually resolved by the backend for the authenticated session. The
 * backend session scope is the source of truth: it is never overridden by the
 * requested tenant, only compared against it.
 */
export function evaluateTenantConsistency(
  requestedTenantId: TenantId,
  backendScope: BackendTenantScope | null,
): TenantConsistencyResult {
  if (!backendScope || !backendScope.tenantKey) {
    return { state: "UNKNOWN", requestedTenantId, backendScope: backendScope ?? null };
  }

  if (backendScope.tenantKey === requestedTenantId) {
    return { state: "MATCH", requestedTenantId, backendScope };
  }

  return { state: "MISMATCH", requestedTenantId, backendScope };
}
