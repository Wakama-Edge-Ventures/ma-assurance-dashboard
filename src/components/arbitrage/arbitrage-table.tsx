"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
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

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Audit / Reference</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Demande liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Surface declaree</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Surface mesuree</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Ecart %</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Actifs valides / rejetes</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Mode audit</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} font-medium text-slate-900 dark:text-slate-100`}>
                  <p>{row.id}</p>
                  <p className="font-mono text-xs text-brand-textMuted">{row.missionId ?? "Mission N/A"}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.applicationReference}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.farmerName}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{row.declaredAreaHa} ha</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{row.measuredAreaHa} ha</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <div className="space-y-1">
                    <p className="tabular-nums text-slate-300">{row.areaDeltaPercent.toFixed(1)}%</p>
                    <AreaDeltaBadge deltaPercent={row.areaDeltaPercent} />
                  </div>
                </td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>
                  {row.assetsApprovedCount}/{row.assetsRejectedCount}
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  {getAuditModeLabel(row.auditMode)}
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/arbitrage/${row.id}`}
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
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucun audit ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher des dossiers d&apos;arbitrage.
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
