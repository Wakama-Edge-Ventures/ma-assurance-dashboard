"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getAreaDeltaSeverity, getAuditModeLabel } from "@/lib/workflow";
import { DataSource, InsuranceFieldAudit } from "@/types";

import { ArbitrageFilters, ArbitrageFiltersState } from "./arbitrage-filters";
import { AreaDeltaBadge } from "./area-delta-badge";

export interface ArbitrageRow extends InsuranceFieldAudit {
  applicationReference: string;
  farmerName: string;
}

interface ArbitrageTableProps {
  rows: ArbitrageRow[];
}

const defaultFilters: ArbitrageFiltersState = {
  search: "",
  mode: "ALL",
  severity: "ALL",
  source: "ALL",
};

export function ArbitrageTable({ rows }: ArbitrageTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.mode !== "ALL" && row.auditMode !== filters.mode) return false;
      if (filters.source !== "ALL" && row.source !== (filters.source as DataSource))
        return false;
      if (
        filters.severity !== "ALL" &&
        getAreaDeltaSeverity(row.areaDeltaPercent) !== filters.severity
      ) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        row.id,
        row.missionId ?? "",
        row.applicationReference,
        row.farmerName,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <ArbitrageFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Audit / Reference</th>
              <th className="px-3 py-3">Demande liee</th>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">Surface declaree</th>
              <th className="px-3 py-3">Surface mesuree</th>
              <th className="px-3 py-3">Ecart %</th>
              <th className="px-3 py-3">Actifs valides / rejetes</th>
              <th className="px-3 py-3">Mode audit</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 font-medium text-slate-100">
                  <p>{row.id}</p>
                  <p className="text-xs text-brand-textMuted">{row.missionId ?? "Mission N/A"}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">{row.applicationReference}</td>
                <td className="px-3 py-3 text-slate-200">{row.farmerName}</td>
                <td className="px-3 py-3 text-slate-200">{row.declaredAreaHa} ha</td>
                <td className="px-3 py-3 text-slate-200">{row.measuredAreaHa} ha</td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="text-slate-200">{row.areaDeltaPercent.toFixed(1)}%</p>
                    <AreaDeltaBadge deltaPercent={row.areaDeltaPercent} />
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-200">
                  {row.assetsApprovedCount}/{row.assetsRejectedCount}
                </td>
                <td className="px-3 py-3 text-slate-200">
                  {getAuditModeLabel(row.auditMode)}
                </td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/arbitrage/${row.id}`}
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
            <p className="text-sm text-slate-100">Aucun audit ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher des dossiers d&apos;arbitrage.
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
