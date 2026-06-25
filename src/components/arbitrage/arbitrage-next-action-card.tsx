import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getAreaDeltaSeverity } from "@/lib/workflow";
import { InsuranceFieldAudit } from "@/types";

interface ArbitrageNextActionCardProps {
  audit: InsuranceFieldAudit;
}

export function ArbitrageNextActionCard({ audit }: ArbitrageNextActionCardProps) {
  const severity = getAreaDeltaSeverity(audit.areaDeltaPercent);
  const primary =
    severity === "CRITICAL"
      ? { label: "Revue manuelle requise avant RAX", href: "/fr/arbitrage" }
      : { label: "Envoyer vers l'analyse risque", href: "/fr/rax" };

  return (
    <Card>
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Prochaine action
      </h2>
      <p className="mt-2 text-[13px] text-brand-textMuted">
        Acheminement conseille selon severite de l&apos;ecart surface.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={primary.href}
          className="inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-3.5 py-1.5 font-mono text-[12.5px] text-violet-200 transition-colors hover:bg-violet-500/24"
        >
          {primary.label}
        </Link>
        <Link
          href={`/fr/applications/${audit.applicationId}`}
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir demande liee
        </Link>
      </div>
    </Card>
  );
}
