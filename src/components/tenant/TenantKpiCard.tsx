"use client";

import { type LucideIcon } from "lucide-react";

import { useTenant } from "@/components/tenant/useTenant";
import { withAlpha } from "@/lib/tenant";

interface TenantKpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
}

export function TenantKpiCard({ icon: Icon, label, value, hint }: TenantKpiCardProps) {
  const { tenant } = useTenant();

  return (
    <div
      className="relative overflow-hidden rounded-[22px] border p-5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.85)]"
      style={{
        borderColor: withAlpha(tenant.colors.primary, "24"),
        background: `radial-gradient(220px 120px at 100% 0%, ${withAlpha(tenant.colors.accent, "24")}, transparent 65%), linear-gradient(135deg, rgba(16,23,38,0.96), rgba(11,16,30,0.92))`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(160px 90px at 10% 0%, ${withAlpha(tenant.colors.primary, "1A")}, transparent 70%)`,
        }}
      />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <span
            className="grid h-10 w-10 place-items-center rounded-[12px] border"
            style={{
              borderColor: withAlpha(tenant.colors.primary, "2E"),
              backgroundColor: withAlpha(tenant.colors.primary, "14"),
              color: tenant.colors.primary,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Illustration
          </span>
        </div>

        <div
          className="font-mono text-[34px] font-semibold leading-none tracking-[-0.02em]"
          style={{ color: tenant.colors.primary }}
        >
          {value}
        </div>
        <div className="mt-3 text-[13px] font-medium text-white">{label}</div>
        <div className="mt-1 font-mono text-[11px] text-slate-500">{hint}</div>
      </div>
    </div>
  );
}
