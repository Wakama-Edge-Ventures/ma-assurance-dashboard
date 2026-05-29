"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { formatScore } from "@/lib/workflow";
import { DataSource, RaxEvaluation } from "@/types";

import { RaxFilters, RaxFiltersState } from "./rax-filters";

export interface RaxRow extends RaxEvaluation {
  applicationReference: string;
  farmerName: string;
  cropType: string;
  gravityValue: number;
  frequencyValue: number;
  detectionValue: number;
  raxBrutValue: number;
  wrsValue: number;
}

interface RaxTableProps {
  rows: RaxRow[];
}

const defaultFilters: RaxFiltersState = {
  search: "",
  riskTier: "ALL",
  source: "ALL",
  wrsRange: "ALL",
};

function matchesWrsRange(value: number, range: RaxFiltersState["wrsRange"]) {
  if (range === "ALL") return true;
  if (range === "0_20") return value >= 0 && value <= 20;
  if (range === "21_50") return value > 20 && value <= 50;
  if (range === "51_75") return value > 50 && value <= 75;
  return value > 75 && value <= 100;
}

export function RaxTable({ rows }: RaxTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.riskTier !== "ALL" && row.riskTier !== filters.riskTier) return false;
      if (filters.source !== "ALL" && row.source !== (filters.source as DataSource))
        return false;
      if (!matchesWrsRange(row.wrsValue, filters.wrsRange)) return false;
      if (!query) return true;

      const haystack = [
        row.id,
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
      <RaxFilters
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Evaluation</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Demande liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>G</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>F</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>D</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>RAX brut</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>WRS</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Tier</th>
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
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatScore(row.gravityValue)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatScore(row.frequencyValue)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatScore(row.detectionValue)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatScore(row.raxBrutValue)}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatScore(row.wrsValue)}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <RiskTierBadge tier={row.riskTier} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/rax/${row.id}`}
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
            <p className="text-sm text-slate-900 dark:text-slate-100">
              Aucune evaluation RAX ne correspond aux filtres.
            </p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour retrouver des dossiers de scoring.
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
