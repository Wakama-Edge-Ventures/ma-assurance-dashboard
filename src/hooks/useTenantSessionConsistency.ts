"use client";

import { useEffect, useState } from "react";

import { useTenant } from "@/components/tenant/useTenant";
import { getIdjorFoundationHealth } from "@/lib/api";
import {
  BackendTenantScope,
  evaluateTenantConsistency,
  TenantConsistencyResult,
} from "@/lib/tenant-session-consistency";

export interface TenantSessionConsistencyHookResult extends TenantConsistencyResult {
  checking: boolean;
}

/**
 * Probes the backend-resolved tenant scope for the authenticated session
 * (independent of the `?tenant=` branding param) and compares it against the
 * tenant requested in the URL. Used on pages that fetch institution-scoped
 * live data (applications) but don't otherwise receive a scope object.
 */
export function useTenantSessionConsistency(): TenantSessionConsistencyHookResult {
  const { tenant } = useTenant();
  const [backendScope, setBackendScope] = useState<BackendTenantScope | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setChecking(true);

    getIdjorFoundationHealth({})
      .then((health) => {
        if (cancelled) return;
        setBackendScope({
          tenantKey: health.tenant.tenantKey,
          institutionId: health.tenant.institutionId,
          country: health.tenant.country,
          vertical: health.tenant.vertical,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setBackendScope(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenant.id]);

  const consistency = evaluateTenantConsistency(tenant.id, backendScope);

  return { ...consistency, checking };
}
