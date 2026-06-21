"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import {
  formatDate,
  getMonitoringSignalTypeLabel,
  getMonitoringSeverityOrder,
} from "@/lib/workflow";
import { DataSource } from "@/types";

import { MonitoringFilters, MonitoringFiltersState } from "./monitoring-filters";
import { MonitoringSeverityBadge } from "./monitoring-severity-badge";

export interface MonitoringRow {
  id: string;
  policyId: string;
  policyNumber: string;
  farmerName: string;
  cropType: string;
  region: string;
  type: "NDVI" | "WEATHER" | "IOT" | "FIELD" | "SYSTEM";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  createdAt: string;
  source: DataSource;
}

interface MonitoringTableProps {
  rows: MonitoringRow[];
}

const defaultFilters: MonitoringFiltersState = {
  search: "",
  severity: "ALL",
  signalType: "ALL",
  source: "ALL",
};

export function MonitoringTable({ rows }: MonitoringTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (filters.severity !== "ALL" && row.severity !== filters.severity) return false;
        if (filters.signalType !== "ALL" && row.type !== filters.signalType) return false;
        if (filters.source !== "ALL" && row.source !== (filters.source as DataSource))
          return false;
        if (!query) return true;
        const haystack = [
          row.id,
          row.policyId,
          row.policyNumber,
          row.farmerName,
          row.cropType,
          row.region,
          row.message,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const sev = getMonitoringSeverityOrder(b.severity) - getMonitoringSeverityOrder(a.severity);
        if (sev !== 0) return sev;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <MonitoringFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Alerte / Signal</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Police liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Type</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Severite</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Message</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Date</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} font-mono font-medium text-slate-900 dark:text-slate-100`}>
                  {row.id}
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p>{row.policyNumber}</p>
                  <p className="font-mono text-xs text-brand-textMuted">{row.policyId}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p>{row.farmerName}</p>
                  <p className="text-xs text-brand-textMuted">{row.cropType}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  {getMonitoringSignalTypeLabel(row.type)}
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <MonitoringSeverityBadge severity={row.severity} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.message}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatDate(row.createdAt)}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/monitoring/${row.id}`}
                    className={DESIGN_TOKENS.controls.tableAction}
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className={APP_TABLE_CLASSNAMES.emptyState}>
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucune alerte ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les signaux de monitoring.
            </p>
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              className={DESIGN_TOKENS.controls.resetButton}
            >
              Reinitialiser les filtres
            </button>
          </div>
        ) : null}
      </AppTable>
    </div>
  );
}
