import Link from "next/link";
import { notFound } from "next/navigation";

import { PricingBreakdownCard } from "@/components/pricing/pricing-breakdown-card";
import { PricingDecisionBadge } from "@/components/pricing/pricing-decision-badge";
import { PricingNextActionCard } from "@/components/pricing/pricing-next-action-card";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import {
  getCommercialOffers,
  getFarmers,
  getInsuranceApplications,
  getRaxEvaluations,
} from "@/lib/insurance-service";
import {
  formatDate,
  formatScore,
  getFarmerDecisionLabel,
  getOfferStatusLabel,
  isExpiredDate,
} from "@/lib/workflow";

interface PricingDetailPageProps {
  params: Promise<{ id: string }>;
}

function resolveDecision(input: {
  farmerDecision?: string;
  status: string;
}): "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" {
  if (input.farmerDecision === "ACCEPTED" || input.status === "FARMER_ACCEPTED") {
    return "ACCEPTED";
  }
  if (input.farmerDecision === "REJECTED" || input.status === "FARMER_REJECTED") {
    return "REJECTED";
  }
  if (input.farmerDecision === "EXPIRED" || input.status === "EXPIRED") {
    return "EXPIRED";
  }
  return "PENDING";
}

function resolveOfferMetrics(offer: {
  totalInsuredCapital?: number;
  purePremiumAmount?: number;
  managementFees?: number;
  taxRateApplied?: number;
  taxAmount?: number;
  totalCommercialPremiumTtc?: number;
  technicalPremiumMad: number;
  suggestedCommercialPremiumMad: number;
}) {
  const pure = offer.purePremiumAmount ?? offer.technicalPremiumMad;
  const total = offer.totalCommercialPremiumTtc ?? offer.suggestedCommercialPremiumMad;
  const fees = offer.managementFees ?? Math.max(0, total - pure);
  const taxRate = offer.taxRateApplied ?? 0;
  const taxes = offer.taxAmount ?? Math.max(0, total - pure - fees);
  const capital = offer.totalInsuredCapital ?? 0;
  return { pure, fees, taxes, total, capital, taxRate };
}

export const dynamic = "force-dynamic";

export default async function PricingDetailPage({ params }: PricingDetailPageProps) {
  const { id } = await params;
  const [offers, applications, farmers, raxEvaluations] = await Promise.all([
    getCommercialOffers(),
    getInsuranceApplications(),
    getFarmers(),
    getRaxEvaluations(),
  ]);
  const offer = offers.find((item) => item.id === id) ?? null;
  if (!offer) notFound();

  const application = applications.find((item) => item.id === offer.applicationId) ?? null;
  const farmer = application ? farmers.find((item) => item.id === application.farmerId) : null;
  const linkedRax =
    (offer.raxEvaluationId
      ? raxEvaluations.find((item) => item.id === offer.raxEvaluationId)
      : null) ?? raxEvaluations.find((item) => item.applicationId === offer.applicationId);

  const decision = resolveDecision(offer);
  const metrics = resolveOfferMetrics(offer);
  const expired = offer.expiresAt ? isExpiredDate(offer.expiresAt) : false;

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Offre ${offer.id}`}
        description="Detail de suggestion de prime technique."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Offer ID</p>
            <p className="text-lg font-semibold text-white">{offer.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <PricingDecisionBadge decision={decision} />
            <DataSourceBadge source={offer.source} />
          </div>
        </div>
        <div className="grid gap-3 text-[13px] text-slate-300 md:grid-cols-3">
          <p>Demande liee: {application?.reference ?? offer.applicationId}</p>
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>Decision farmer: {getFarmerDecisionLabel(decision)}</p>
          <p>Statut offre: {getOfferStatusLabel(offer.status)}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Offre technique preparee pour validation assureur - non contractuelle tant
          qu&apos;elle n&apos;est pas validee par l&apos;assureur.
        </p>
      </Card>

      <PricingBreakdownCard
        totalInsuredCapital={metrics.capital || application?.requestedCoverageMad || 0}
        purePremiumAmount={metrics.pure}
        managementFees={metrics.fees}
        taxRateApplied={metrics.taxRate}
        taxAmount={metrics.taxes}
        totalCommercialPremiumTtc={metrics.total}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Risque lie RAX/WRS
          </h2>
          {linkedRax ? (
            <>
              <div className="flex items-center gap-2">
                <RiskTierBadge tier={linkedRax.riskTier} />
              </div>
              <div className="grid gap-2 text-[13px] text-slate-300 md:grid-cols-2">
                <p>WRS: {formatScore(linkedRax.wrsScore)}</p>
                <p>RAX brut: {formatScore(linkedRax.raxBrut ?? linkedRax.raxScore)}</p>
                <p>G: {formatScore(linkedRax.gravity ?? 0)}</p>
                <p>F: {formatScore(linkedRax.frequency ?? 0)}</p>
                <p>D: {formatScore(linkedRax.detection ?? 0)}</p>
              </div>
              <Link
                href={`/fr/rax/${linkedRax.id}`}
                className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
              >
                Ouvrir la fiche RAX/WRS
              </Link>
            </>
          ) : (
            <p className="text-sm text-brand-textMuted">
              Evaluation RAX non disponible sur ce dossier.
            </p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Decision farmer
          </h2>
          <div className="space-y-2 text-[13px] text-slate-300">
            <p>Decision: {getFarmerDecisionLabel(decision)}</p>
            <p>
              Horodatage decision:{" "}
              {offer.farmerDecisionAt ? formatDate(offer.farmerDecisionAt) : "N/A"}
            </p>
            <p>Motif de refus: {offer.farmerRejectionReason ?? "N/A"}</p>
            <p>Jeton URL court: {offer.shortUrlToken ?? "N/A"}</p>
            <p>Jeton de passage guichet: {offer.agencyPickupToken ?? "N/A"}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Validite et workflow
          </h2>
          <div className="space-y-2 text-[13px] text-slate-300">
            <p>Generee le: {offer.generatedAt ? formatDate(offer.generatedAt) : "N/A"}</p>
            <p>Expire le: {offer.expiresAt ? formatDate(offer.expiresAt) : "N/A"}</p>
            <p>Etat expiration: {expired ? "Expiree" : "Valide"}</p>
            <p className="flex items-center gap-2">
              Source:
              <DataSourceBadge source={offer.source} />
            </p>
          </div>
          <PricingNextActionCard decision={decision} applicationId={offer.applicationId} />
        </Card>

        <Card className="space-y-3">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Integrite
          </h2>
          <p className="text-[13px] text-slate-300">
            Le hash de l&apos;offre pourra etre ancre de maniere asynchrone. L&apos;ancrage
            Solana ne bloque pas le workflow metier.
          </p>
        </Card>
      </div>
    </div>
  );
}
