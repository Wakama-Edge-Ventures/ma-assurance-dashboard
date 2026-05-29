"use client";

import { DataSource } from "@/types";
import { ApplicationStatus } from "@/types";
import { getApplicationStatusLabel } from "@/lib/workflow";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { AppTableFilters } from "@/components/ui/app-table";

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
    <AppTableFilters className="md:grid-cols-4">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Rechercher: reference, agriculteur, culture, region..."
        className={`${DESIGN_TOKENS.controls.input} md:col-span-2`}
      />
      <select
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value })}
        className={DESIGN_TOKENS.controls.select}
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
        className={DESIGN_TOKENS.controls.select}
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

export type { ApplicationsFiltersState };
