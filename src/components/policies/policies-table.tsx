"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
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

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Police</th>
              <th className="px-3 py-3">Demande liee</th>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">Culture</th>
              <th className="px-3 py-3">Capital assure</th>
              <th className="px-3 py-3">Prime TTC</th>
              <th className="px-3 py-3">Couverture</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 font-medium text-slate-100">
                  <p>{row.policyNumber}</p>
                  <p className="text-xs text-brand-textMuted">{row.id}</p>
                </td>
                <td className="px-3 py-3 text-slate-200">{row.applicationReference}</td>
                <td className="px-3 py-3 text-slate-200">{row.farmerName}</td>
                <td className="px-3 py-3 text-slate-200">{row.cropType}</td>
                <td className="px-3 py-3 text-slate-200">{formatMAD(row.capitalInsured)}</td>
                <td className="px-3 py-3 text-slate-200">{formatMAD(row.premiumTtc)}</td>
                <td className="px-3 py-3 text-slate-200">
                  <p>{row.coverageText}</p>
                  <p className="text-xs text-brand-textMuted">
                    {getPolicyExpiryStateLabel(row.expiryState)}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <PolicyStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/policies/${row.id}`}
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
            <p className="text-sm text-slate-100">Aucune police ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Ajustez les criteres pour afficher les polices communiquees par l&apos;assureur.
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
