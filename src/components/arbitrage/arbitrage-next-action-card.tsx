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
      : { label: "Envoyer vers RAX / WRS", href: "/fr/rax" };

  return (
    <Card>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        Prochaine action
      </h2>
      <p className="mt-2 text-sm text-brand-textMuted">
        Acheminement conseille selon severite de l&apos;ecart surface.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={primary.href}
          className="rounded-md bg-brand-violet px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          {primary.label}
        </Link>
        <Link
          href={`/fr/applications/${audit.applicationId}`}
          className="rounded-xl border border-brand-border/15 px-3 py-2 text-sm text-brand-textMuted transition-colors hover:bg-brand-surfaceRaised/70 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-100"
        >
          Ouvrir demande liee
        </Link>
      </div>
    </Card>
  );
}
