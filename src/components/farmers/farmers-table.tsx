"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable, AppTableFilters } from "@/components/ui/app-table";
import { cn } from "@/lib/utils";
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

  const hasActiveFilters = filters.search !== "" || filters.source !== "ALL";

  return (
    <div className="space-y-3">
      {/* Filter panel */}
      <AppTableFilters className="md:grid-cols-[1fr_auto_auto]">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-[14px] w-[14px] text-cyan-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Recherche: nom, téléphone, région, coopérative…"
            className={cn(
              "w-full rounded-full border border-cyan-400/16 bg-[#0b1422]/75 py-2 pl-9 pr-4",
              "font-sans text-[13px] text-white outline-none placeholder:text-[#5B6B86]",
              "transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20",
            )}
          />
        </div>

        {/* Source select */}
        <select
          value={filters.source}
          onChange={(e) =>
            setFilters({ ...filters, source: e.target.value as FarmersFiltersState["source"] })
          }
          className={cn(
            "rounded-full border border-slate-400/16 bg-[#0b1422]/75 px-4 py-2",
            "font-mono text-[12px] text-slate-300 outline-none",
            "transition focus:border-cyan-400/40",
          )}
        >
          <option value="ALL">Toutes sources</option>
          <option value="LIVE">LIVE</option>
          <option value="SEED_DEMO">SEED_DEMO</option>
        </select>

        {/* Reset */}
        <button
          type="button"
          onClick={() => setFilters(defaultFilters)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-transparent px-4 py-2",
            "font-mono text-[12px] text-slate-400 transition-colors",
            "hover:border-cyan-400/30 hover:text-white",
            hasActiveFilters ? "border-cyan-400/30 text-white" : "",
          )}
        >
          {hasActiveFilters ? <X className="h-3 w-3" /> : <SlidersHorizontal className="h-3 w-3" />}
          Filtres
        </button>
      </AppTableFilters>

      {/* Table */}
      <AppTable>
        <div className="overflow-x-auto">
          <table className={APP_TABLE_CLASSNAMES.table}>
            <thead className={APP_TABLE_CLASSNAMES.head}>
              <tr>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Région</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Coopérative</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Parcelles</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Alertes</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Niveau</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                    <p className="font-medium text-white">{row.fullName}</p>
                    <p className="font-mono text-[11px] text-[#5B6B86]">{row.phone}</p>
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.region}</td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.cooperativeName}</td>
                  <td className={cn(APP_TABLE_CLASSNAMES.bodyCell, "font-mono tabular-nums")}>
                    {row.parcellesCount}
                  </td>
                  <td
                    className={cn(
                      APP_TABLE_CLASSNAMES.bodyCell,
                      "font-mono tabular-nums",
                      row.alertsCount > 0 ? "text-amber-400" : "",
                    )}
                  >
                    {row.alertsCount}
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                    {row.highestAlertSeverity ? (
                      <WakamaAlertSeverityBadge severity={row.highestAlertSeverity} />
                    ) : (
                      <span className="text-[#5B6B86]">—</span>
                    )}
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                    <DataSourceBadge source={row.source} />
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                    <span className="inline-flex items-center rounded-full border border-slate-400/16 bg-transparent px-2.5 py-1 font-mono text-[11px] text-slate-400 transition-colors hover:border-cyan-400/30 hover:text-white">
                      Détail
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 ? (
          <div className={APP_TABLE_CLASSNAMES.emptyState}>
            <p className="text-[13px] text-slate-300">Aucun agriculteur ne correspond aux filtres.</p>
            <p className="font-mono text-[11px] text-[#5B6B86]">
              Ajustez les critères pour afficher le portefeuille.
            </p>
          </div>
        ) : null}
      </AppTable>

      {/* Footer count */}
      <div className="flex items-center justify-between px-1">
        <p className="font-mono text-[11px] text-[#5B6B86]">
          {filteredRows.length} agriculteur{filteredRows.length !== 1 ? "s" : ""} affichés
          {filteredRows.length !== rows.length ? ` · ${rows.length} total` : ""}
        </p>
      </div>
    </div>
  );
}
