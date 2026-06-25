import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { DataSource, RiskTier } from "@/types";

import { DataSourceBadge } from "./data-source-badge";
import { RiskTierBadge } from "./risk-tier-badge";

interface AppKpiCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  source?: DataSource;
  tier?: RiskTier;
  className?: string;
}

export function AppKpiCard({
  title,
  value,
  hint,
  icon: Icon,
  source,
  tier,
  className,
}: AppKpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-wk-border bg-wk-surface p-[18px_20px_20px] shadow-wk-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-wk",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(180px_80px_at_92%_-10%,rgba(19,138,94,0.14),transparent_70%)]" />

      <div className="relative mb-3.5 flex items-center justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.10em] text-wk-faint">{title}</p>
        {Icon ? (
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-wk-primarySoft text-wk-primaryInk">
            <Icon className="h-[17px] w-[17px]" />
          </span>
        ) : null}
      </div>

      <div className="text-[40px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-wk-text">
        {value}
      </div>

      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-1.5">
        {source ? <DataSourceBadge source={source} /> : null}
        {tier ? <RiskTierBadge tier={tier} /> : null}
      </div>

      {hint ? (
        <p className="mt-1 text-[11px] font-semibold text-wk-muted">{hint}</p>
      ) : null}
    </div>
  );
}
