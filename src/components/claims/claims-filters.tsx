"use client";

import { DataSource } from "@/types";

import { getClaimSeverityLabel, getClaimStatusLabel } from "@/lib/workflow";

export interface ClaimsFiltersState {
  search: string;
  status: "ALL" | string;
  severity: "ALL" | "INFO" | "WARNING" | "CRITICAL";
  source: "ALL" | DataSource;
}

interface ClaimsFiltersProps {
  value: ClaimsFiltersState;
  statuses: string[];
  onChange: (next: ClaimsFiltersState) => void;
  onReset: () => void;
}

export function ClaimsFilters({
  value,
  statuses,
  onChange,
  onReset,
}: ClaimsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: sinistre, police, agriculteur, culture, type..."
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
            {getClaimStatusLabel(status)}
          </option>
        ))}
      </select>
      <select
        value={value.severity}
        onChange={(event) =>
          onChange({ ...value, severity: event.target.value as ClaimsFiltersState["severity"] })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Toutes severites</option>
        <option value="INFO">{getClaimSeverityLabel("INFO")}</option>
        <option value="WARNING">{getClaimSeverityLabel("WARNING")}</option>
        <option value="CRITICAL">{getClaimSeverityLabel("CRITICAL")}</option>
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as ClaimsFiltersState["source"] })
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
