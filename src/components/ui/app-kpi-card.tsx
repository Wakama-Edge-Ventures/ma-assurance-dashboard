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
        "relative overflow-hidden rounded-[20px] border border-slate-400/10 bg-[#101726]/92 p-[18px_20px_20px]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-[0_20px_50px_-30px_rgba(34,211,238,0.3)]",
        className,
      )}
    >
      {/* top-right glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(160px_90px_at_88%_-10%,rgba(34,211,238,0.12),transparent_70%)] opacity-90" />

      <div className="relative mb-3.5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[#5B6B86]">{title}</p>
        {Icon ? (
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-cyan-400/14 bg-cyan-400/10">
            <Icon className="h-[17px] w-[17px] text-cyan-400" />
          </span>
        ) : null}
      </div>

      <div
        className="bg-gradient-to-br from-cyan-400 to-emerald-400 bg-clip-text font-mono text-[40px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-transparent"
        style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.22))" }}
      >
        {value}
      </div>

      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-1.5">
        {source ? <DataSourceBadge source={source} /> : null}
        {tier ? <RiskTierBadge tier={tier} /> : null}
      </div>

      {hint ? (
        <p className="mt-1 font-mono text-[11px] text-[#5B6B86]">{hint}</p>
      ) : null}
    </div>
  );
}
