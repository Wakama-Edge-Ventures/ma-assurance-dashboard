import Link from "next/link";

import { Card } from "@/components/ui/card";

interface PolicyNextActionCardProps {
  status: string;
  hasAlertsOrClaims: boolean;
  applicationId?: string;
}

export function PolicyNextActionCard({
  status,
  hasAlertsOrClaims,
  applicationId,
}: PolicyNextActionCardProps) {
  if (status === "CLAIM_OPEN" || hasAlertsOrClaims) {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Suivre les sinistres.</p>
        <Link
          href="/fr/claims"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir claims
        </Link>
      </Card>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Ouvrir le monitoring 360deg.</p>
        <Link
          href="/fr/monitoring"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir monitoring
        </Link>
      </Card>
    );
  }

  if (status === "EXPIRED" || status === "CLOSED") {
    return (
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Consulter l&apos;historique.</p>
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
      <p className="text-sm text-brand-textMuted">Consulter le dossier associe.</p>
      {applicationId ? (
        <Link
          href={`/fr/applications/${applicationId}`}
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Ouvrir la demande
        </Link>
      ) : null}
    </Card>
  );
}
