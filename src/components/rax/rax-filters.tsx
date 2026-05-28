"use client";

import { DataSource, RiskTier } from "@/types";
import { getRiskTierLabel } from "@/lib/workflow";

export interface RaxFiltersState {
  search: string;
  riskTier: "ALL" | RiskTier;
  source: "ALL" | DataSource;
  wrsRange: "ALL" | "0_20" | "21_50" | "51_75" | "76_100";
}

interface RaxFiltersProps {
  value: RaxFiltersState;
  onChange: (next: RaxFiltersState) => void;
  onReset: () => void;
}

export function RaxFilters({ value, onChange, onReset }: RaxFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Rechercher: evaluation, demande, agriculteur, culture..."
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet md:col-span-2"
      />
      <select
        value={value.riskTier}
        onChange={(event) =>
          onChange({ ...value, riskTier: event.target.value as RaxFiltersState["riskTier"] })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Tous tiers</option>
        <option value="LOW_RISK">{getRiskTierLabel("LOW_RISK")}</option>
        <option value="MEDIUM_RISK">{getRiskTierLabel("MEDIUM_RISK")}</option>
        <option value="HIGH_RISK">{getRiskTierLabel("HIGH_RISK")}</option>
        <option value="UNINSURABLE">{getRiskTierLabel("UNINSURABLE")}</option>
      </select>
      <select
        value={value.wrsRange}
        onChange={(event) =>
          onChange({ ...value, wrsRange: event.target.value as RaxFiltersState["wrsRange"] })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Tous WRS</option>
        <option value="0_20">0-20</option>
        <option value="21_50">21-50</option>
        <option value="51_75">51-75</option>
        <option value="76_100">76-100</option>
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as RaxFiltersState["source"] })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Toutes sources</option>
        <option value="LIVE">LIVE</option>
        <option value="SEED_DEMO">SEED_DEMO</option>
      </select>
      <button
        type="button"
        onClick={onReset}
        className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-textMuted transition-colors hover:bg-slate-900 hover:text-slate-100"
      >
        Reinitialiser filtres
      </button>
    </div>
  );
}
