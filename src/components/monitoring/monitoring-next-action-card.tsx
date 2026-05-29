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
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Ouvrir un suivi sinistre.</p>
        <Link
          href="/fr/claims"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir claims
        </Link>
      </Card>
    );
  }

  if (severity === "WARNING") {
    return (
      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Surveiller et documenter.</p>
        <Link
          href="/fr/reports"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir reports
        </Link>
      </Card>
    );
  }

  if (policyId) {
    return (
      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine action
        </h2>
        <p className="text-sm text-brand-textMuted">Consulter la police associee.</p>
        <Link
          href={`/fr/policies/${policyId}`}
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir la police
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Prochaine action
      </h2>
      <p className="text-sm text-brand-textMuted">Revenir au monitoring.</p>
      <Link
        href="/fr/monitoring"
        className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
      >
        Ouvrir monitoring
      </Link>
    </Card>
  );
}
