"use client";

import { useMemo, useState } from "react";

import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable, AppTableFilters } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { DataSource } from "@/types";

export interface CooperativeRow {
  id: string;
  name: string;
  region: string;
  filiere: string;
  farmersCount: number;
  parcellesCount: number;
  iotCount: number;
  alertsCount: number;
  highestAlertSeverity?: "CRITICAL" | "WARNING" | "INFO" | "UNKNOWN" | null;
  source: DataSource;
}

interface CooperativesTableProps {
  rows: CooperativeRow[];
}

interface CooperativesFiltersState {
  search: string;
  source: "ALL" | DataSource;
}

const defaultFilters: CooperativesFiltersState = {
  search: "",
  source: "ALL",
};

export function CooperativesTable({ rows }: CooperativesTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.source !== "ALL" && row.source !== filters.source) return false;
      if (!query) return true;
      const haystack = [row.name, row.region, row.filiere].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <AppTableFilters className="md:grid-cols-4">
        <input
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          placeholder="Recherche: cooperative, region, filiere..."
          className={`${DESIGN_TOKENS.controls.input} md:col-span-2`}
        />
        <select
          value={filters.source}
          onChange={(event) =>
            setFilters({
              ...filters,
              source: event.target.value as CooperativesFiltersState["source"],
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
          onClick={() => setFilters(defaultFilters)}
          className={DESIGN_TOKENS.controls.resetButton}
        >
          Reinitialiser filtres
        </button>
      </AppTableFilters>

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Cooperative</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Region</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Filiere</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteurs</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Parcelles</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>IoT</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Alertes</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Niveau</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{row.name}</p>
                  <p className="font-mono text-xs text-brand-textMuted">{row.id}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.region}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.filiere}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{row.farmersCount}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{row.parcellesCount}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{row.iotCount}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{row.alertsCount}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  {row.highestAlertSeverity ? (
                    <WakamaAlertSeverityBadge severity={row.highestAlertSeverity} />
                  ) : (
                    "-"
                  )}
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className={APP_TABLE_CLASSNAMES.emptyState}>
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucune cooperative ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les structures terrain.
            </p>
          </div>
        ) : null}
      </AppTable>
    </div>
  );
}
