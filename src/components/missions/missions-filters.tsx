"use client";

import { DataSource, InsuranceMission } from "@/types";
import { getMissionStatusLabel } from "@/lib/workflow";
import { AppTableFilters } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";

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
    <AppTableFilters className="md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Rechercher: mission, reference, agriculteur, region..."
        className={`${DESIGN_TOKENS.controls.input} md:col-span-2`}
      />
      <select
        value={value.status}
        onChange={(event) =>
          onChange({
            ...value,
            status: event.target.value as MissionsFiltersState["status"],
          })
        }
        className={DESIGN_TOKENS.controls.select}
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
        className={DESIGN_TOKENS.controls.select}
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
        className={DESIGN_TOKENS.controls.select}
      >
        <option value="ALL">Toutes sources</option>
        <option value="LIVE">LIVE</option>
        <option value="SEED_DEMO">SEED_DEMO</option>
      </select>
      <button
        type="button"
        onClick={onReset}
        className={DESIGN_TOKENS.controls.resetButton}
      >
        Reinitialiser filtres
      </button>
    </AppTableFilters>
  );
}
