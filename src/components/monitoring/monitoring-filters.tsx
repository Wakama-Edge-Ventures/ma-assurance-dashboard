"use client";

import { DataSource } from "@/types";

import { getMonitoringSeverityLabel, getMonitoringSignalTypeLabel } from "@/lib/workflow";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { AppTableFilters } from "@/components/ui/app-table";

export interface MonitoringFiltersState {
  search: string;
  severity: "ALL" | "INFO" | "WARNING" | "CRITICAL";
  signalType: "ALL" | "NDVI" | "WEATHER" | "IOT" | "FIELD" | "SYSTEM";
  source: "ALL" | DataSource;
}

interface MonitoringFiltersProps {
  value: MonitoringFiltersState;
  onChange: (next: MonitoringFiltersState) => void;
  onReset: () => void;
}

export function MonitoringFilters({ value, onChange, onReset }: MonitoringFiltersProps) {
  return (
    <AppTableFilters className="md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: alerte, police, agriculteur, culture, zone..."
        className={`${DESIGN_TOKENS.controls.input} md:col-span-2`}
      />
      <select
        value={value.severity}
        onChange={(event) =>
          onChange({
            ...value,
            severity: event.target.value as MonitoringFiltersState["severity"],
          })
        }
        className={DESIGN_TOKENS.controls.select}
      >
        <option value="ALL">Toutes severites</option>
        <option value="INFO">{getMonitoringSeverityLabel("INFO")}</option>
        <option value="WARNING">{getMonitoringSeverityLabel("WARNING")}</option>
        <option value="CRITICAL">{getMonitoringSeverityLabel("CRITICAL")}</option>
      </select>
      <select
        value={value.signalType}
        onChange={(event) =>
          onChange({
            ...value,
            signalType: event.target.value as MonitoringFiltersState["signalType"],
          })
        }
        className={DESIGN_TOKENS.controls.select}
      >
        <option value="ALL">Tous types</option>
        <option value="NDVI">{getMonitoringSignalTypeLabel("NDVI")}</option>
        <option value="WEATHER">{getMonitoringSignalTypeLabel("WEATHER")}</option>
        <option value="IOT">{getMonitoringSignalTypeLabel("IOT")}</option>
        <option value="FIELD">{getMonitoringSignalTypeLabel("FIELD")}</option>
        <option value="SYSTEM">{getMonitoringSignalTypeLabel("SYSTEM")}</option>
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as MonitoringFiltersState["source"] })
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
