"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
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

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Alerte / Signal</th>
              <th className="px-3 py-3">Police liee</th>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Severite</th>
              <th className="px-3 py-3">Message</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 font-medium text-slate-100">{row.id}</td>
                <td className="px-3 py-3 text-slate-200">
                  <p>{row.policyNumber}</p>
                  <p className="text-xs text-brand-textMuted">{row.policyId}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">
                  <p>{row.farmerName}</p>
                  <p className="text-xs text-brand-textMuted">{row.cropType}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">
                  {getMonitoringSignalTypeLabel(row.type)}
                </td>
                <td className="px-3 py-3">
                  <MonitoringSeverityBadge severity={row.severity} />
                </td>
                <td className="px-3 py-3 text-slate-200">{row.message}</td>
                <td className="px-3 py-3 text-slate-200">{formatDate(row.createdAt)}</td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/monitoring/${row.id}`}
                    className="rounded-md border border-brand-border px-2.5 py-1.5 text-xs text-slate-100 transition-colors hover:bg-slate-900"
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className="space-y-2 px-4 py-10 text-center">
            <p className="text-sm text-slate-100">Aucune alerte ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les signaux de monitoring.
            </p>
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              className="mt-2 rounded-md border border-brand-border px-3 py-1.5 text-xs text-brand-textMuted transition-colors hover:bg-slate-900 hover:text-slate-100"
            >
              Reinitialiser les filtres
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
