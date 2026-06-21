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
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Preparer la revue assureur.</p>
        <Link
          href="/fr/reports"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir reports
        </Link>
      </Card>
    );
  }

  if (status === "UNDER_REVIEW") {
    return (
      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Completer les elements de preuve.</p>
        <Link
          href="/fr/monitoring"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
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
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Archiver dans les rapports.</p>
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
      {policyId ? (
        <Link
          href={`/fr/policies/${policyId}`}
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir la police
        </Link>
      ) : (
        <Link
          href="/fr/claims"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Retour claims
        </Link>
      )}
    </Card>
  );
}
