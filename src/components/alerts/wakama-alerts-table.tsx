"use client";

import { useMemo, useState } from "react";

import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable, AppTableFilters } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
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
      <AppTableFilters className="md:grid-cols-5">
        <input
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          placeholder="Recherche: id, message, type, entite..."
          className={`${DESIGN_TOKENS.controls.input} md:col-span-2`}
        />

        <select
          value={filters.severity}
          onChange={(event) =>
            setFilters({
              ...filters,
              severity: event.target.value as WakamaAlertsFiltersState["severity"],
            })
          }
          className={DESIGN_TOKENS.controls.select}
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
          className={DESIGN_TOKENS.controls.select}
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
          className={DESIGN_TOKENS.controls.select}
        >
          <option value="ALL">Toutes sources</option>
          <option value="LIVE">LIVE</option>
          <option value="SEED_DEMO">SEED_DEMO</option>
        </select>
      </AppTableFilters>

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Alerte</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Severite</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Type</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Entite liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Date</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{row.title}</p>
                  <p className="text-xs text-brand-textMuted">{row.message}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <WakamaAlertSeverityBadge severity={row.severity} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.type}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} font-mono`}>{row.linkedEntity}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatDate(row.createdAt)}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className={APP_TABLE_CLASSNAMES.emptyState}>
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucune alerte ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les signaux operationnels.
            </p>
          </div>
        ) : null}
      </AppTable>
    </div>
  );
}
