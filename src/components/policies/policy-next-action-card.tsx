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
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Suivre les sinistres.</p>
        <Link
          href="/fr/claims"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir claims
        </Link>
      </Card>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Ouvrir le monitoring 360deg.</p>
        <Link
          href="/fr/monitoring"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir monitoring
        </Link>
      </Card>
    );
  }

  if (status === "EXPIRED" || status === "CLOSED") {
    return (
      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Consulter l&apos;historique.</p>
        <Link
          href="/fr/reports"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir reports
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Prochaine action
      </h2>
      <p className="text-sm text-brand-textMuted">Consulter le dossier associe.</p>
      {applicationId ? (
        <Link
          href={`/fr/applications/${applicationId}`}
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir la demande
        </Link>
      ) : null}
    </Card>
  );
}
