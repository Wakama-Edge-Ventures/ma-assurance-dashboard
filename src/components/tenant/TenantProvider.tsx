"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { TenantId } from "@/config/tenants";
import { getTenantById, resolveTenantId } from "@/lib/tenant";

interface TenantProviderProps {
  children: React.ReactNode;
  initialTenantId?: TenantId | string | null;
}

interface TenantContextValue {
  tenantId: TenantId;
  tenant: ReturnType<typeof getTenantById>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children, initialTenantId }: TenantProviderProps) {
  const searchParams = useSearchParams();
  const [tenantId, setTenantId] = useState<TenantId>(resolveTenantId(initialTenantId));

  useEffect(() => {
    const tenantFromQuery = searchParams.get("tenant");
    if (!tenantFromQuery) return;

    const nextTenantId = resolveTenantId(tenantFromQuery);
    setTenantId((currentTenantId) =>
      currentTenantId === nextTenantId ? currentTenantId : nextTenantId,
    );
  }, [searchParams]);

  const tenant = useMemo(() => getTenantById(tenantId), [tenantId]);

  return (
    <TenantContext.Provider value={{ tenantId, tenant }}>
      <div
        style={
          {
            "--tenant-primary": tenant.colors.primary,
            "--tenant-secondary": tenant.colors.secondary,
            "--tenant-accent": tenant.colors.accent,
            "--tenant-surface": tenant.colors.surface ?? "#101726",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used inside a TenantProvider");
  }

  return context;
}
