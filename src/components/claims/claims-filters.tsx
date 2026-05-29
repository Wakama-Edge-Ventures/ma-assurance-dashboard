"use client";

import { DataSource } from "@/types";

import { getClaimSeverityLabel, getClaimStatusLabel } from "@/lib/workflow";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { AppTableFilters } from "@/components/ui/app-table";

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
    <AppTableFilters className="md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: sinistre, police, agriculteur, culture, type..."
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
            {getClaimStatusLabel(status)}
          </option>
        ))}
      </select>
      <select
        value={value.severity}
        onChange={(event) =>
          onChange({ ...value, severity: event.target.value as ClaimsFiltersState["severity"] })
        }
        className={DESIGN_TOKENS.controls.select}
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
