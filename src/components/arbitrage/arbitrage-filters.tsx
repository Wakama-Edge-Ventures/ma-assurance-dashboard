"use client";

import { DataSource, InsuranceFieldAudit } from "@/types";

interface ArbitrageFiltersState {
  search: string;
  mode: "ALL" | InsuranceFieldAudit["auditMode"];
  severity: "ALL" | "OK" | "WARNING" | "CRITICAL";
  source: "ALL" | DataSource;
}

interface ArbitrageFiltersProps {
  value: ArbitrageFiltersState;
  onChange: (next: ArbitrageFiltersState) => void;
  onReset: () => void;
}

export function ArbitrageFilters({
  value,
  onChange,
  onReset,
}: ArbitrageFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: audit, mission, demande, agriculteur..."
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet md:col-span-2"
      />
      <select
        value={value.mode}
        onChange={(event) =>
          onChange({ ...value, mode: event.target.value as ArbitrageFiltersState["mode"] })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Tous modes</option>
        <option value="WEB_DEMO">WEB_DEMO</option>
        <option value="NATIVE_AGENT">NATIVE_AGENT</option>
        <option value="API_IMPORT">API_IMPORT</option>
      </select>
      <select
        value={value.severity}
        onChange={(event) =>
          onChange({
            ...value,
            severity: event.target.value as ArbitrageFiltersState["severity"],
          })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Toutes severites</option>
        <option value="OK">OK</option>
        <option value="WARNING">WARNING</option>
        <option value="CRITICAL">CRITICAL</option>
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({
            ...value,
            source: event.target.value as ArbitrageFiltersState["source"],
          })
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

export type { ArbitrageFiltersState };
