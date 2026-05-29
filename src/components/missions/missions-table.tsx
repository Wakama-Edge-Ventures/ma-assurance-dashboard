"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
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
      <AppTable>
        <table className={APP_TABLE_CLASSNAMES.table}>
          <thead className={APP_TABLE_CLASSNAMES.head}>
            <tr>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Mission</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Demande liee</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agriculteur</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Modules requis</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Agent assigne</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Statut</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
              <th className={APP_TABLE_CLASSNAMES.headCell}>Date</th>
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
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.farmerName}</td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} text-xs text-brand-textMuted`}>{row.modules}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.assignedTo}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <MissionStatusBadge status={row.status} />
                </td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <DataSourceBadge source={row.source} />
                </td>
                <td className={`${APP_TABLE_CLASSNAMES.bodyCell} tabular-nums`}>{formatDate(row.scheduledFor)}</td>
                <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                  <Link
                    href={`/fr/missions/${row.id}`}
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
            <p className="text-sm text-slate-900 dark:text-slate-100">Aucune mission ne correspond aux filtres.</p>
            <p className="text-xs text-brand-textMuted">
              Modifiez vos criteres pour afficher des missions.
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
