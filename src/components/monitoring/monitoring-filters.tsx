"use client";

import { DataSource } from "@/types";

import { getMonitoringSeverityLabel, getMonitoringSignalTypeLabel } from "@/lib/workflow";

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
    <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: alerte, police, agriculteur, culture, zone..."
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet md:col-span-2"
      />
      <select
        value={value.severity}
        onChange={(event) =>
          onChange({
            ...value,
            severity: event.target.value as MonitoringFiltersState["severity"],
          })
        }
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
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
        className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
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
