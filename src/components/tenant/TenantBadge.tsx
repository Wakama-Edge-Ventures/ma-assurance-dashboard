"use client";

import { useTenant } from "@/components/tenant/useTenant";
import { withAlpha } from "@/lib/tenant";

interface TenantBadgeProps {
  className?: string;
}

export function TenantBadge({ className }: TenantBadgeProps) {
  const { tenant } = useTenant();

  if (!tenant.featureFlags.showDemoBadge) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] ${className ?? ""}`}
      style={{
        borderColor: withAlpha(tenant.colors.primary, "59"),
        backgroundColor: withAlpha(tenant.colors.primary, "1A"),
        color: tenant.colors.primary,
      }}
    >
      Demo institutionnelle
    </span>
  );
}
