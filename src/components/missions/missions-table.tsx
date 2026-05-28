"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { formatDate } from "@/lib/workflow";
import { DataSource, InsuranceMission } from "@/types";

import { MissionStatusBadge } from "./mission-status-badge";
import { MissionsFilters, MissionsFiltersState } from "./missions-filters";

export interface MissionRow extends InsuranceMission {
  applicationReference: string;
  farmerName: string;
  modules: string;
}

interface MissionsTableProps {
  rows: MissionRow[];
}

const defaultFilters: MissionsFiltersState = {
  search: "",
  status: "ALL",
  assignedAgent: "ALL",
  source: "ALL",
};

export function MissionsTable({ rows }: MissionsTableProps) {
  const [filters, setFilters] = useState(defaultFilters);

  const statuses = useMemo(
    () => Array.from(new Set(rows.map((row) => row.status))).sort() as InsuranceMission["status"][],
    [rows],
  );
  const agents = useMemo(
    () => Array.from(new Set(rows.map((row) => row.assignedTo))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.status !== "ALL" && row.status !== filters.status) return false;
      if (filters.assignedAgent !== "ALL" && row.assignedTo !== filters.assignedAgent)
        return false;
      if (filters.source !== "ALL" && row.source !== (filters.source as DataSource)) return false;
      if (!query) return true;
      const haystack = [
        row.id,
        row.applicationReference,
        row.farmerName,
        row.region,
        row.modules,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, rows]);

  return (
    <div className="space-y-4">
      <MissionsFilters
        value={filters}
        statuses={statuses}
        agents={agents}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />
      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/90">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-900/50 text-left text-xs uppercase tracking-wide text-brand-textMuted">
            <tr>
              <th className="px-3 py-3">Mission</th>
              <th className="px-3 py-3">Demande liee</th>
              <th className="px-3 py-3">Agriculteur</th>
              <th className="px-3 py-3">Modules requis</th>
              <th className="px-3 py-3">Agent assigne</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-brand-border/70 last:border-0">
                <td className="px-3 py-3 font-medium text-slate-100">{row.id}</td>
                <td className="px-3 py-3 text-slate-200">{row.applicationReference}</td>
                <td className="px-3 py-3 text-slate-200">{row.farmerName}</td>
                <td className="px-3 py-3 text-xs text-brand-textMuted">{row.modules}</td>
                <td className="px-3 py-3 text-slate-200">{row.assignedTo}</td>
                <td className="px-3 py-3">
                  <MissionStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-3">
                  <DataSourceBadge source={row.source} />
                </td>
                <td className="px-3 py-3 text-slate-200">{formatDate(row.scheduledFor)}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/missions/${row.id}`}
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
            <p className="text-sm text-slate-100">Aucune mission ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Modifiez vos criteres pour afficher des missions.
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
