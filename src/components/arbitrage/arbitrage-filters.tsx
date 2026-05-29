"use client";

import { DataSource, InsuranceFieldAudit } from "@/types";
import { AppTableFilters } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";

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
    <AppTableFilters className="md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: audit, mission, demande, agriculteur..."
        className={`${DESIGN_TOKENS.controls.input} md:col-span-2`}
      />
      <select
        value={value.mode}
        onChange={(event) =>
          onChange({ ...value, mode: event.target.value as ArbitrageFiltersState["mode"] })
        }
        className={DESIGN_TOKENS.controls.select}
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
        className={DESIGN_TOKENS.controls.select}
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

export type { ArbitrageFiltersState };
