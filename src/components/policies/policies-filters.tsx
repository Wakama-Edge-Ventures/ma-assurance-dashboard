"use client";

import { DataSource } from "@/types";
import { getPolicyExpiryStateLabel, getPolicyStatusLabel } from "@/lib/workflow";
import { AppTableFilters } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";

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
    <AppTableFilters className="md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: police, demande, agriculteur, culture..."
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
            {getPolicyStatusLabel(status)}
          </option>
        ))}
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as PoliciesFiltersState["source"] })
        }
        className={DESIGN_TOKENS.controls.select}
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
        className={DESIGN_TOKENS.controls.select}
      >
        <option value="ALL">Toutes echeances</option>
        <option value="ACTIVE">{getPolicyExpiryStateLabel("ACTIVE")}</option>
        <option value="EXPIRING_SOON">{getPolicyExpiryStateLabel("EXPIRING_SOON")}</option>
        <option value="EXPIRED">{getPolicyExpiryStateLabel("EXPIRED")}</option>
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
