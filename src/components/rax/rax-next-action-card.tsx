import Link from "next/link";

import { Card } from "@/components/ui/card";
import { RiskTier } from "@/types";

interface RaxNextActionCardProps {
  tier: RiskTier;
  applicationId?: string;
}

export function RaxNextActionCard({ tier, applicationId }: RaxNextActionCardProps) {
  const isLowMedium = tier === "LOW_RISK" || tier === "MEDIUM_RISK";
  const isHigh = tier === "HIGH_RISK";

  const primary = isLowMedium
    ? { label: "Preparer une offre technique", href: "/fr/pricing" }
    : isHigh
      ? { label: "Revue risque avant tarification", href: "/fr/arbitrage" }
      : { label: "Revue direction des risques", href: "/fr/arbitrage" };

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Prochaine action
      </h2>
      <p className="text-sm text-brand-textMuted">
        Recommandation de workflow non decisionnelle, a valider par l&apos;assureur.
      </p>
      <Link
        href={primary.href}
        className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
      >
        {primary.label}
      </Link>
      {applicationId ? (
        <Link
          href={`/fr/applications/${applicationId}`}
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-xs text-brand-textMuted transition-colors hover:bg-slate-900 hover:text-slate-100"
        >
          Ouvrir la demande liee
        </Link>
      ) : null}
    </Card>
  );
}
