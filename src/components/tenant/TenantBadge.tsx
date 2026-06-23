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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] ${className ?? ""}`}
      style={{
        backgroundColor: withAlpha(tenant.colors.primary, "1A"),
        color: tenant.colors.primary,
      }}
    >
      Demo institutionnelle
    </span>
  );
}
