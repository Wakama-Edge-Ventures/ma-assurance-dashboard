import Link from "next/link";

import { Card } from "@/components/ui/card";

interface ClaimNextActionCardProps {
  status: string;
  policyId?: string;
}

export function ClaimNextActionCard({ status, policyId }: ClaimNextActionCardProps) {
  if (status === "OPEN" || status === "DECLARED") {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Preparer la revue assureur.</p>
        <Link
          href="/fr/reports"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir reports
        </Link>
      </Card>
    );
  }

  if (status === "UNDER_REVIEW") {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Completer les elements de preuve.</p>
        <Link
          href="/fr/monitoring"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir monitoring
        </Link>
      </Card>
    );
  }

  if (
    status === "APPROVED" ||
    status === "REJECTED" ||
    status === "APPROVED_BY_INSURER" ||
    status === "REJECTED_BY_INSURER" ||
    status === "CLOSED"
  ) {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Archiver dans les rapports.</p>
        <Link
          href="/fr/reports"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir reports
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Prochaine action
      </h2>
      {policyId ? (
        <Link
          href={`/fr/policies/${policyId}`}
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir la police
        </Link>
      ) : (
        <Link
          href="/fr/claims"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Retour claims
        </Link>
      )}
    </Card>
  );
}
