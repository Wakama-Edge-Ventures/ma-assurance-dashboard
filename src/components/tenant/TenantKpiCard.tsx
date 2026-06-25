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
    <div className="relative overflow-hidden rounded-[18px] border border-wk-border bg-wk-surface p-5 shadow-wk-sm">
      <div className="mb-4 flex items-center justify-between">
        <span
          className="grid h-10 w-10 place-items-center rounded-[12px]"
          style={{ backgroundColor: withAlpha(tenant.colors.primary, "14"), color: tenant.colors.primary }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="rounded-md bg-wk-violetSoft px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-wk-violetInk">
          Exemple
        </span>
      </div>

      <div className="text-[30px] font-extrabold leading-none tracking-[-0.02em]" style={{ color: tenant.colors.primary }}>
        {value}
      </div>
      <div className="mt-3 text-[13px] font-bold text-wk-text">{label}</div>
      <div className="mt-1 text-[11.5px] font-medium text-wk-faint">{hint}</div>
    </div>
  );
}
