"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { formatMAD, getPolicyExpiryStateLabel } from "@/lib/workflow";
import { DataSource } from "@/types";

import { PoliciesFilters, PoliciesFiltersState } from "./policies-filters";
import { PolicyStatusBadge } from "./policy-status-badge";

export interface PolicyRow {
  id: string;
  policyNumber: string;
  applicationId: string;
  applicationReference: string;
  farmerName: string;
  cropType: string;
  capitalInsured: number;
  premiumTtc: number;
  coverageText: string;
  status: string;
  source: DataSource;
  expiryState: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "UNKNOWN";
}

interface PoliciesTableProps {
  rows: PolicyRow[];
}

const defaultFilters: PoliciesFiltersState = {
  search: "",
  status: "ALL",
  source: "ALL",
  expiry: "ALL",
};

export function PoliciesTable({ rows }: PoliciesTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const statuses = useMemo(
    () => Array.from(new Set(rows.map((row) => row.status))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.status !== "ALL" && row.status !== filters.status) return false;
      if (filters.source !== "ALL" && row.source !== (filters.source as DataSource))
        return false;
      if (filters.expiry !== "ALL" && row.expiryState !== filters.expiry) return false;
      if (!query) return true;

      const haystack = [
        row.id,
        row.policyNumber,
        row.applicationReference,
        row.farmerName,
        row.cropType,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <PoliciesFilters
        value={filters}
        statuses={statuses}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Police</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Demande liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Culture</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Capital assure</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Prime TTC</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Couverture</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Statut</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} font-medium text-slate-900 dark:text-slate-100`}>
                  <p>{row.policyNumber}</p>
                  <p className="font-mono text-xs text-brand-textMuted">{row.id}</p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.applicationReference}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.farmerName}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.cropType}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatMAD(row.capitalInsured)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatMAD(row.premiumTtc)}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p>{row.coverageText}</p>
                  <p className="text-xs text-brand-textMuted">
                    {getPolicyExpiryStateLabel(row.expiryState)}
                  </p>
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <PolicyStatusBadge status={row.status} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/policies/${row.id}`}
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
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucune police ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les polices communiquees par l&apos;assureur.
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
