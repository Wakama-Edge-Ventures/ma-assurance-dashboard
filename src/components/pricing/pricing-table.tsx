"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { formatMAD } from "@/lib/workflow";
import { DataSource, RiskTier } from "@/types";

import { PricingDecisionBadge } from "./pricing-decision-badge";
import { PricingFilters, PricingFiltersState } from "./pricing-filters";

export interface PricingRow {
  id: string;
  applicationId: string;
  applicationReference: string;
  farmerName: string;
  cropType: string;
  totalInsuredCapital: number;
  purePremiumAmount: number;
  managementFees: number;
  taxAmount: number;
  totalCommercialPremiumTtc: number;
  farmerDecision: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  riskTier?: RiskTier;
  source: DataSource;
}

interface PricingTableProps {
  rows: PricingRow[];
}

const defaultFilters: PricingFiltersState = {
  search: "",
  decision: "ALL",
  riskTier: "ALL",
  source: "ALL",
};

export function PricingTable({ rows }: PricingTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.decision !== "ALL" && row.farmerDecision !== filters.decision) return false;
      if (filters.riskTier !== "ALL" && row.riskTier !== filters.riskTier) return false;
      if (filters.source !== "ALL" && row.source !== (filters.source as DataSource))
        return false;

      if (!query) return true;
      const haystack = [row.id, row.applicationReference, row.farmerName, row.cropType]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <PricingFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Offre</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Demande liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Capital assure</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Prime pure</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Frais</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Taxes</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Prime TTC</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Decision farmer</th>
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
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.applicationReference}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <p>{row.farmerName}</p>
                  <p className="text-xs text-brand-textMuted">{row.cropType}</p>
                </td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatMAD(row.totalInsuredCapital)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatMAD(row.purePremiumAmount)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatMAD(row.managementFees)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatMAD(row.taxAmount)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums font-medium text-slate-900 dark:text-slate-100`}>
                  {formatMAD(row.totalCommercialPremiumTtc)}
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <PricingDecisionBadge decision={row.farmerDecision} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/pricing/${row.id}`}
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
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucune offre ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher des suggestions de prime technique.
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
