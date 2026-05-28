"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
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

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Offre</th>
              <th className="px-3 py-3">Demande liee</th>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">Capital assure</th>
              <th className="px-3 py-3">Prime pure</th>
              <th className="px-3 py-3">Frais</th>
              <th className="px-3 py-3">Taxes</th>
              <th className="px-3 py-3">Prime TTC</th>
              <th className="px-3 py-3">Decision farmer</th>
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
                <td className="px-3 py-3 text-slate-200">{formatMAD(row.totalInsuredCapital)}</td>
                <td className="px-3 py-3 text-slate-200">{formatMAD(row.purePremiumAmount)}</td>
                <td className="px-3 py-3 text-slate-200">{formatMAD(row.managementFees)}</td>
                <td className="px-3 py-3 text-slate-200">{formatMAD(row.taxAmount)}</td>
                <td className="px-3 py-3 font-medium text-slate-100">
                  {formatMAD(row.totalCommercialPremiumTtc)}
                </td>
                <td className="px-3 py-3">
                  <PricingDecisionBadge decision={row.farmerDecision} />
                </td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/pricing/${row.id}`}
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
            <p className="text-sm text-slate-100">Aucune offre ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher des suggestions de prime technique.
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
