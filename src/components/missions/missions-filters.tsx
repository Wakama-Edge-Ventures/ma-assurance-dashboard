"use client";

import { DataSource, InsuranceMission } from "@/types";
import { getMissionStatusLabel } from "@/lib/workflow";

export interface MissionsFiltersState {
  search: string;
  status: "ALL" | InsuranceMission["status"];
  assignedAgent: string;
  source: "ALL" | DataSource;
}

interface MissionsFiltersProps {
  value: MissionsFiltersState;
  statuses: InsuranceMission["status"][];
  agents: string[];
  onChange: (next: MissionsFiltersState) => void;
  onReset: () => void;
}

export function MissionsFilters({
  value,
  statuses,
  agents,
  onChange,
  onReset,
}: MissionsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Rechercher: mission, reference, agriculteur, region..."
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet md:col-span-2"
      />
      <select
        value={value.status}
        onChange={(event) =>
          onChange({
            ...value,
            status: event.target.value as MissionsFiltersState["status"],
          })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Tous statuts</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {getMissionStatusLabel(status)}
          </option>
        ))}
      </select>
      <select
        value={value.assignedAgent}
        onChange={(event) => onChange({ ...value, assignedAgent: event.target.value })}
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
      >
        <option value="ALL">Tous agents</option>
        {agents.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as MissionsFiltersState["source"] })
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
