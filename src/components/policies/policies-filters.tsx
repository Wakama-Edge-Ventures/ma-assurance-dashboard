"use client";

import { DataSource } from "@/types";
import { getPolicyExpiryStateLabel, getPolicyStatusLabel } from "@/lib/workflow";

export interface PoliciesFiltersState {
  search: string;
  status: "ALL" | string;
  source: "ALL" | DataSource;
  expiry: "ALL" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
}

interface PoliciesFiltersProps {
  value: PoliciesFiltersState;
  statuses: string[];
  onChange: (next: PoliciesFiltersState) => void;
  onReset: () => void;
}

export function PoliciesFilters({
  value,
  statuses,
  onChange,
  onReset,
}: PoliciesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: police, demande, agriculteur, culture..."
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
            {getPolicyStatusLabel(status)}
          </option>
        ))}
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as PoliciesFiltersState["source"] })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Toutes sources</option>
        <option value="LIVE">LIVE</option>
        <option value="SEED_DEMO">SEED_DEMO</option>
      </select>
      <select
        value={value.expiry}
        onChange={(event) =>
          onChange({ ...value, expiry: event.target.value as PoliciesFiltersState["expiry"] })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Toutes echeances</option>
        <option value="ACTIVE">{getPolicyExpiryStateLabel("ACTIVE")}</option>
        <option value="EXPIRING_SOON">{getPolicyExpiryStateLabel("EXPIRING_SOON")}</option>
        <option value="EXPIRED">{getPolicyExpiryStateLabel("EXPIRED")}</option>
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
