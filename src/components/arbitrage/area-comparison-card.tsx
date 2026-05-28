import { Card } from "@/components/ui/card";
import { InsuranceFieldAudit } from "@/types";
import { getAreaDeltaSeverityLabel } from "@/lib/workflow";

import { AreaDeltaBadge } from "./area-delta-badge";

interface AreaComparisonCardProps {
  audit: InsuranceFieldAudit;
}

export function AreaComparisonCard({ audit }: AreaComparisonCardProps) {
  return (
    <Card>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Surface declaree vs mesuree
      </h2>
      <div className="mt-3 grid gap-3 text-sm text-slate-200 md:grid-cols-3">
        <p>Declaree: {audit.declaredAreaHa} ha</p>
        <p>Mesuree: {audit.measuredAreaHa} ha</p>
        <p>Ecart: {audit.areaDeltaPercent.toFixed(1)}%</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <AreaDeltaBadge deltaPercent={audit.areaDeltaPercent} />
        <p className="text-xs text-brand-textMuted">
          {getAreaDeltaSeverityLabel(
            Math.abs(audit.areaDeltaPercent) <= 3
              ? "OK"
              : Math.abs(audit.areaDeltaPercent) <= 10
                ? "WARNING"
                : "CRITICAL",
          )}
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-brand-border bg-slate-900/50 p-3 text-xs text-brand-textMuted">
          Polygone declare
        </div>
        <div className="rounded-lg border border-brand-border bg-slate-900/50 p-3 text-xs text-brand-textMuted">
          Polygone mesure
        </div>
      </div>
    </Card>
  );
}
