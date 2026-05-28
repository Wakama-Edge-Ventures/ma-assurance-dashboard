"use client";

import { useMemo, useState } from "react";

import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { formatDate } from "@/lib/workflow";
import { DataSource } from "@/types";

export interface WakamaAlertRow {
  id: string;
  title: string;
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO" | "UNKNOWN";
  type: string;
  linkedEntity: string;
  createdAt: string;
  source: DataSource;
}

interface WakamaAlertsTableProps {
  rows: WakamaAlertRow[];
}

interface WakamaAlertsFiltersState {
  search: string;
  severity: "ALL" | "CRITICAL" | "WARNING" | "INFO" | "UNKNOWN";
  type: "ALL" | string;
  source: "ALL" | DataSource;
}

const defaultFilters: WakamaAlertsFiltersState = {
  search: "",
  severity: "ALL",
  type: "ALL",
  source: "ALL",
};

export function WakamaAlertsTable({ rows }: WakamaAlertsTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const types = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.type).filter(Boolean))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.source !== "ALL" && row.source !== filters.source) return false;
      if (filters.severity !== "ALL" && row.severity !== filters.severity) return false;
      if (filters.type !== "ALL" && row.type !== filters.type) return false;
      if (!query) return true;
      const haystack = [row.id, row.title, row.message, row.type, row.linkedEntity]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-5">
        <input
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          placeholder="Recherche: id, message, type, entite..."
          className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet md:col-span-2"
        />

        <select
          value={filters.severity}
          onChange={(event) =>
            setFilters({
              ...filters,
              severity: event.target.value as WakamaAlertsFiltersState["severity"],
            })
          }
          className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
        >
          <option value="ALL">Toutes severites</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="WARNING">WARNING</option>
          <option value="INFO">INFO</option>
          <option value="UNKNOWN">UNKNOWN</option>
        </select>

        <select
          value={filters.type}
          onChange={(event) =>
            setFilters({
              ...filters,
              type: event.target.value,
            })
          }
          className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
        >
          <option value="ALL">Tous types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(event) =>
            setFilters({
              ...filters,
              source: event.target.value as WakamaAlertsFiltersState["source"],
            })
          }
          className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
        >
          <option value="ALL">Toutes sources</option>
          <option value="LIVE">LIVE</option>
          <option value="SEED_DEMO">SEED_DEMO</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Alerte</th>
              <th className="px-3 py-3">Severite</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Entite liee</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 text-slate-200">
                  <p className="font-medium text-slate-100">{row.title}</p>
                  <p className="text-xs text-brand-textMuted">{row.message}</p>
                </td>
                <td className="px-3 py-3">
                  <WakamaAlertSeverityBadge severity={row.severity} />
                </td>
                <td className="px-3 py-3 text-slate-200">{row.type}</td>
                <td className="px-3 py-3 text-slate-200">{row.linkedEntity}</td>
                <td className="px-3 py-3 text-slate-200">{formatDate(row.createdAt)}</td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className="space-y-2 px-4 py-10 text-center">
            <p className="text-sm text-slate-100">Aucune alerte ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les signaux operationnels.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
