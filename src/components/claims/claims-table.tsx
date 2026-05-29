"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { formatDate, formatMAD, getClaimStatusOrder } from "@/lib/workflow";
import { DataSource } from "@/types";

import { ClaimSeverityBadge } from "./claim-severity-badge";
import { ClaimStatusBadge } from "./claim-status-badge";
import { ClaimsFilters, ClaimsFiltersState } from "./claims-filters";

export interface ClaimRow {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  farmerName: string;
  cropType: string;
  claimType: string;
  status: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  estimatedAmount: number;
  createdAt: string;
  source: DataSource;
}

interface ClaimsTableProps {
  rows: ClaimRow[];
}

const defaultFilters: ClaimsFiltersState = {
  search: "",
  status: "ALL",
  severity: "ALL",
  source: "ALL",
};

export function ClaimsTable({ rows }: ClaimsTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const statuses = useMemo(
    () => Array.from(new Set(rows.map((row) => row.status))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (filters.status !== "ALL" && row.status !== filters.status) return false;
        if (filters.severity !== "ALL" && row.severity !== filters.severity) return false;
        if (filters.source !== "ALL" && row.source !== (filters.source as DataSource))
          return false;
        if (!query) return true;
        const haystack = [
          row.id,
          row.claimNumber,
          row.policyId,
          row.policyNumber,
          row.farmerName,
          row.cropType,
          row.claimType,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const statusDelta = getClaimStatusOrder(a.status) - getClaimStatusOrder(b.status);
        if (statusDelta !== 0) return statusDelta;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <ClaimsFilters
        value={filters}
        statuses={statuses}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Sinistre / Signalement</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Police liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Type</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Statut</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Severite</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Estimation indicative</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Date</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} font-medium text-slate-900 dark:text-slate-100`}>
                  <p>{row.claimNumber}</p>
                  <p className="font-mono text-xs text-brand-textMuted">{row.id}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p>{row.policyNumber}</p>
                  <p className="font-mono text-xs text-brand-textMuted">{row.policyId}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p>{row.farmerName}</p>
                  <p className="text-xs text-brand-textMuted">{row.cropType}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.claimType}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <ClaimStatusBadge status={row.status} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <ClaimSeverityBadge severity={row.severity} />
                </td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatMAD(row.estimatedAmount)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatDate(row.createdAt)}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/claims/${row.id}`}
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
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucun dossier ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les signalements de sinistre.
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
