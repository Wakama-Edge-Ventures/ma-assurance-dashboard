"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
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

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Evaluation</th>
              <th className="px-3 py-3">Demande liee</th>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">G</th>
              <th className="px-3 py-3">F</th>
              <th className="px-3 py-3">D</th>
              <th className="px-3 py-3">RAX brut</th>
              <th className="px-3 py-3">WRS</th>
              <th className="px-3 py-3">Tier</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 font-medium text-slate-100">{row.id}</td>
                <td className="px-3 py-3 text-slate-200">{row.applicationReference}</td>
                <td className="px-3 py-3 text-slate-200">
                  <p>{row.farmerName}</p>
                  <p className="text-xs text-brand-textMuted">{row.cropType}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">{formatScore(row.gravityValue)}</td>
                <td className="px-3 py-3 text-slate-200">{formatScore(row.frequencyValue)}</td>
                <td className="px-3 py-3 text-slate-200">{formatScore(row.detectionValue)}</td>
                <td className="px-3 py-3 text-slate-200">{formatScore(row.raxBrutValue)}</td>
                <td className="px-3 py-3 text-slate-200">{formatScore(row.wrsValue)}</td>
                <td className="px-3 py-3">
                  <RiskTierBadge tier={row.riskTier} />
                </td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/rax/${row.id}`}
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
            <p className="text-sm text-slate-100">
              Aucune evaluation RAX ne correspond aux filtres.
            </p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour retrouver des dossiers de scoring.
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
