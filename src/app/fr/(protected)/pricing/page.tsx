import { BadgeDollarSign, CircleCheck, CircleEllipsis, FileStack, HandCoins } from "lucide-react";

import { PricingFormulaCard } from "@/components/pricing/pricing-formula-card";
import { PricingRow, PricingTable } from "@/components/pricing/pricing-table";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getCommercialOffers,
  getFarmers,
  getInsuranceApplications,
  getRaxEvaluations,
} from "@/lib/insurance-service";
import { formatMAD } from "@/lib/workflow";

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

export default async function PricingPage() {
  const [offers, applications, farmers, raxEvaluations] = await Promise.all([
    getCommercialOffers(),
    getInsuranceApplications(),
    getFarmers(),
    getRaxEvaluations(),
  ]);

  const applicationById = new Map(applications.map((item) => [item.id, item]));
  const farmerById = new Map(farmers.map((item) => [item.id, item]));
  const raxByApplicationId = new Map(
    raxEvaluations.map((item) => [item.applicationId, item]),
  );

  const rows: PricingRow[] = offers.map((offer) => {
    const application = applicationById.get(offer.applicationId);
    const farmer = application ? farmerById.get(application.farmerId) : null;
    const rax = application ? raxByApplicationId.get(application.id) : null;
    const metrics = resolveOfferMetrics(offer);
    return {
      id: offer.id,
      applicationId: offer.applicationId,
      applicationReference: application?.reference ?? offer.applicationId,
      farmerName: farmer?.fullName ?? "Agriculteur N/A",
      cropType: application?.cropType ?? "Culture N/A",
      totalInsuredCapital: metrics.capital || application?.requestedCoverageMad || 0,
      purePremiumAmount: metrics.pure,
      managementFees: metrics.fees,
      taxAmount: metrics.taxes,
      totalCommercialPremiumTtc: metrics.total,
      farmerDecision: resolveDecision(offer),
      riskTier: rax?.riskTier,
      source: offer.source,
    };
  });

  const pendingCount = rows.filter((row) => row.farmerDecision === "PENDING").length;
  const acceptedCount = rows.filter((row) => row.farmerDecision === "ACCEPTED").length;
  const avgTtc =
    rows.reduce((sum, row) => sum + row.totalCommercialPremiumTtc, 0) /
    Math.max(rows.length, 1);
  const totalCapital = rows.reduce((sum, row) => sum + row.totalInsuredCapital, 0);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Tarification"
        description="Suggestions de primes techniques preparees a partir du WRS et du dossier de preuve."
      />
      <p className="text-xs text-brand-textMuted">
        Wakama prepare une proposition technique ; l&apos;assureur conserve la validation
        commerciale et contractuelle.
      </p>

      <PricingFormulaCard />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Offres preparees"
          value={String(rows.length)}
          source="SEED_DEMO"
          icon={FileStack}
        />
        <StatCard
          title="En attente farmer"
          value={String(pendingCount)}
          source="SEED_DEMO"
          icon={CircleEllipsis}
        />
        <StatCard
          title="Offres acceptees"
          value={String(acceptedCount)}
          source="SEED_DEMO"
          icon={CircleCheck}
        />
        <StatCard
          title="Prime TTC moyenne"
          value={formatMAD(avgTtc)}
          source="SEED_DEMO"
          icon={BadgeDollarSign}
        />
        <StatCard
          title="Capital assure total"
          value={formatMAD(totalCapital)}
          source="SEED_DEMO"
          icon={HandCoins}
        />
      </div>

      <PricingTable rows={rows} />
    </div>
  );
}
