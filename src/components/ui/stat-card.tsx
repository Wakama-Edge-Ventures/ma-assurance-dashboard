import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { DataSource, RiskTier } from "@/types";

import { Card } from "./card";
import { DataSourceBadge } from "./data-source-badge";
import { RiskTierBadge } from "./risk-tier-badge";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  source?: DataSource;
  tier?: RiskTier;
  className?: string;
}

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  source,
  tier,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-brand-textMuted">{title}</p>
        {Icon ? <Icon className="h-4 w-4 text-brand-violet" /> : null}
      </div>
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
      <div className="flex items-center gap-2">
        {source ? <DataSourceBadge source={source} /> : null}
        {tier ? <RiskTierBadge tier={tier} /> : null}
      </div>
      {hint ? <p className="text-sm text-brand-textMuted">{hint}</p> : null}
    </Card>
  );
}
