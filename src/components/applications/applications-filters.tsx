"use client";

import { DataSource } from "@/types";
import { ApplicationStatus } from "@/types";
import { getApplicationStatusLabel } from "@/lib/workflow";

interface ApplicationsFiltersState {
  search: string;
  status: string;
  riskTier: string;
  source: "ALL" | DataSource;
}

interface ApplicationsFiltersProps {
  value: ApplicationsFiltersState;
  statuses: ApplicationStatus[];
  onChange: (next: ApplicationsFiltersState) => void;
  onReset: () => void;
}

export function ApplicationsFilters({
  value,
  statuses,
  onChange,
  onReset,
}: ApplicationsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-4">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Rechercher: reference, agriculteur, culture, region..."
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet md:col-span-2"
      />
      <select
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value })}
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Tous statuts</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {getApplicationStatusLabel(status)}
          </option>
        ))}
      </select>
      <select
        value={value.riskTier}
        onChange={(event) => onChange({ ...value, riskTier: event.target.value })}
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Tous niveaux risque</option>
        <option value="LOW_RISK">LOW_RISK</option>
        <option value="MEDIUM_RISK">MEDIUM_RISK</option>
        <option value="HIGH_RISK">HIGH_RISK</option>
        <option value="UNINSURABLE">UNINSURABLE</option>
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as "ALL" | DataSource })
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

export type { ApplicationsFiltersState };
