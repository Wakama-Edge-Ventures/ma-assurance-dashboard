"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
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

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Sinistre / Signalement</th>
              <th className="px-3 py-3">Police liee</th>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Severite</th>
              <th className="px-3 py-3">Estimation indicative</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 font-medium text-slate-100">
                  <p>{row.claimNumber}</p>
                  <p className="text-xs text-brand-textMuted">{row.id}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">
                  <p>{row.policyNumber}</p>
                  <p className="text-xs text-brand-textMuted">{row.policyId}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">
                  <p>{row.farmerName}</p>
                  <p className="text-xs text-brand-textMuted">{row.cropType}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">{row.claimType}</td>
                <td className="px-3 py-3">
                  <ClaimStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-3">
                  <ClaimSeverityBadge severity={row.severity} />
                </td>
                <td className="px-3 py-3 text-slate-200">{formatMAD(row.estimatedAmount)}</td>
                <td className="px-3 py-3 text-slate-200">{formatDate(row.createdAt)}</td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/claims/${row.id}`}
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
            <p className="text-sm text-slate-100">Aucun dossier ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les signalements de sinistre.
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
