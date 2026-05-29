"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { formatDate } from "@/lib/workflow";
import { ApplicationStatus, DataSource, InsuranceApplication, RiskTier } from "@/types";

import { ApplicationStatusBadge } from "./application-status-badge";
import { ApplicationsFilters, ApplicationsFiltersState } from "./applications-filters";

export interface ApplicationRow extends InsuranceApplication {
  farmerName: string;
  region?: string;
  wrsScore?: number;
}

interface ApplicationsTableProps {
  rows: ApplicationRow[];
}

const defaultFilters: ApplicationsFiltersState = {
  search: "",
  status: "ALL",
  riskTier: "ALL",
  source: "ALL",
};

export function ApplicationsTable({ rows }: ApplicationsTableProps) {
  const [filters, setFilters] = useState<ApplicationsFiltersState>(defaultFilters);

  const statuses = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.status))).sort() as ApplicationStatus[],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.status !== "ALL" && row.status !== filters.status) return false;
      if (filters.riskTier !== "ALL" && row.riskTier !== (filters.riskTier as RiskTier))
        return false;
      if (filters.source !== "ALL" && row.source !== (filters.source as DataSource))
        return false;
      if (!query) return true;

      const haystack = [
        row.reference,
        row.farmerName,
        row.cropType,
        row.province ?? "",
        row.commune ?? "",
        row.region ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <ApplicationsFilters
        value={filters}
        statuses={statuses}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Reference</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Culture</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Surface</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Statut</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>WRS / Tier</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Date</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} font-medium text-slate-900 dark:text-slate-100`}>
                  {row.reference}
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p>{row.farmerName}</p>
                  <p className="text-xs text-brand-textMuted">{row.region ?? "Region N/A"}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.cropType}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{row.areaHa} ha</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <ApplicationStatusBadge status={row.status} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <div className="space-y-1">
                    <p className="tabular-nums text-slate-700 dark:text-slate-200">
                      {typeof row.wrsScore === "number" ? row.wrsScore.toFixed(0) : "N/A"}
                    </p>
                    <RiskTierBadge tier={row.riskTier} />
                  </div>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatDate(row.createdAt)}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/applications/${row.id}`}
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
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucune demande ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez vos criteres pour retrouver des dossiers.
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
