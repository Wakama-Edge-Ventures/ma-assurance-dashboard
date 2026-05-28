"use client";

import { useMemo, useState } from "react";

import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { DataSource } from "@/types";

export interface FarmerRow {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  cooperativeName: string;
  parcellesCount: number;
  alertsCount: number;
  highestAlertSeverity?: "CRITICAL" | "WARNING" | "INFO" | "UNKNOWN" | null;
  source: DataSource;
}

interface FarmersTableProps {
  rows: FarmerRow[];
}

interface FarmersFiltersState {
  search: string;
  source: "ALL" | DataSource;
}

const defaultFilters: FarmersFiltersState = {
  search: "",
  source: "ALL",
};

export function FarmersTable({ rows }: FarmersTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.source !== "ALL" && row.source !== filters.source) return false;
      if (!query) return true;
      const haystack = [row.fullName, row.phone, row.region, row.cooperativeName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface/90 p-4 md:grid-cols-4">
        <input
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          placeholder="Recherche: nom, telephone, region, cooperative..."
          className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet md:col-span-2"
        />
        <select
          value={filters.source}
          onChange={(event) =>
            setFilters({ ...filters, source: event.target.value as FarmersFiltersState["source"] })
          }
          className="rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
        >
          <option value="ALL">Toutes sources</option>
          <option value="LIVE">LIVE</option>
          <option value="SEED_DEMO">SEED_DEMO</option>
        </select>
        <button
          type="button"
          onClick={() => setFilters(defaultFilters)}
          className="rounded-md border border-brand-border px-3 py-2 text-sm text-brand-textMuted transition-colors hover:bg-slate-900 hover:text-slate-100"
        >
          Reinitialiser filtres
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">Region / commune</th>
              <th className="px-3 py-3">Cooperative</th>
              <th className="px-3 py-3">Parcelles</th>
              <th className="px-3 py-3">Alertes</th>
              <th className="px-3 py-3">Niveau</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 text-slate-200">
                  <p className="font-medium text-slate-100">{row.fullName}</p>
                  <p className="text-xs text-brand-textMuted">{row.phone}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">{row.region}</td>
                <td className="px-3 py-3 text-slate-200">{row.cooperativeName}</td>
                <td className="px-3 py-3 text-slate-200">{row.parcellesCount}</td>
                <td className="px-3 py-3 text-slate-200">{row.alertsCount}</td>
                <td className="px-3 py-3 text-slate-200">
                  {row.highestAlertSeverity ? (
                    <WakamaAlertSeverityBadge severity={row.highestAlertSeverity} />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3">
                  <span className="rounded-md border border-brand-border px-2.5 py-1.5 text-xs text-brand-textMuted">
                    Detail bientot
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className="space-y-2 px-4 py-10 text-center">
            <p className="text-sm text-slate-100">Aucun agriculteur ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher le portefeuille.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
