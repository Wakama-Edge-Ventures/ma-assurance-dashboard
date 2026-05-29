import Link from "next/link";

import { Card } from "@/components/ui/card";

interface MonitoringNextActionCardProps {
  severity: "INFO" | "WARNING" | "CRITICAL";
  policyId?: string;
}

export function MonitoringNextActionCard({
  severity,
  policyId,
}: MonitoringNextActionCardProps) {
  if (severity === "CRITICAL") {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Ouvrir un suivi sinistre.</p>
        <Link
          href="/fr/claims"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir claims
        </Link>
      </Card>
    );
  }

  if (severity === "WARNING") {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Surveiller et documenter.</p>
        <Link
          href="/fr/reports"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir reports
        </Link>
      </Card>
    );
  }

  if (policyId) {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Consulter la police associee.</p>
        <Link
          href={`/fr/policies/${policyId}`}
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir la police
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        Prochaine action
      </h2>
      <p className="text-sm text-brand-textMuted">Revenir au monitoring.</p>
      <Link
        href="/fr/monitoring"
        className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors hover:bg-slate-900"
      >
        Ouvrir monitoring
      </Link>
    </Card>
  );
}
