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
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Prochaine action
      </h2>
      <p className="text-sm text-brand-textMuted">
        Recommandation de workflow non decisionnelle, a valider par l&apos;assureur.
      </p>
      <Link
        href={primary.href}
        className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
      >
        {primary.label}
      </Link>
      {applicationId ? (
        <Link
          href={`/fr/applications/${applicationId}`}
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Ouvrir la demande liee
        </Link>
      ) : null}
    </Card>
  );
}
