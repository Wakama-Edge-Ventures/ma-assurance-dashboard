import { BellRing, CircleDollarSign, FileBadge2, RefreshCw, ShieldCheck } from "lucide-react";

import { PoliciesTable, PolicyRow } from "@/components/policies/policies-table";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getCommercialOffers,
  getFarmers,
  getInsuranceApplications,
  getInsurancePolicies,
  getMonitoringAlerts,
} from "@/lib/insurance-service";
import { formatDate, formatMAD, getPolicyExpiryState } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const [policies, offers, applications, farmers, alerts] = await Promise.all([
    getInsurancePolicies(),
    getCommercialOffers(),
    getInsuranceApplications(),
    getFarmers(),
    getMonitoringAlerts(),
  ]);

  const applicationById = new Map(applications.map((item) => [item.id, item]));
  const farmerById = new Map(farmers.map((item) => [item.id, item]));
  const offerById = new Map(offers.map((item) => [item.id, item]));
  const offerByApplicationId = new Map(offers.map((item) => [item.applicationId, item]));

  const rows: PolicyRow[] = policies.map((policy) => {
    const application = applicationById.get(policy.applicationId);
    const farmer =
      (policy.farmerId ? farmerById.get(policy.farmerId) : null) ??
      (application ? farmerById.get(application.farmerId) : null);
    const linkedOffer =
      (policy.offerId ? offerById.get(policy.offerId) : null) ??
      offerByApplicationId.get(policy.applicationId);

    const capitalInsured = policy.totalInsuredCapital ?? policy.coverageMad;
    const premiumTtc =
      policy.totalPremiumTtc ??
      linkedOffer?.totalCommercialPremiumTtc ??
      linkedOffer?.suggestedCommercialPremiumMad ??
      policy.annualPremiumMad;
    const startDate = policy.coverageStartDate ?? policy.effectiveDate;
    const endDate = policy.coverageEndDate ?? policy.expiryDate;

    return {
      id: policy.id,
      policyNumber: policy.policyNumber,
      applicationId: policy.applicationId,
      applicationReference: application?.reference ?? policy.applicationId,
      farmerName: farmer?.fullName ?? "Agriculteur N/A",
      cropType: application?.cropType ?? "Culture N/A",
      capitalInsured,
      premiumTtc,
      coverageText: `${formatDate(startDate)} - ${formatDate(endDate)}`,
      status: policy.status,
      source: policy.source,
      expiryState: getPolicyExpiryState(startDate, endDate),
    };
  });

  const activePolicies = rows.filter((row) => row.status === "ACTIVE").length;
  const totalCapital = rows.reduce((sum, row) => sum + row.capitalInsured, 0);
  const totalPremiumTtc = rows.reduce((sum, row) => sum + row.premiumTtc, 0);
  const expiringSoon = rows.filter(
    (row) => row.expiryState === "EXPIRING_SOON" || row.expiryState === "EXPIRED",
  ).length;
  const policiesWithAlerts = rows.filter((row) =>
    alerts.some((alert) => alert.policyId === row.id && !alert.resolved),
  ).length;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Polices"
        description="Suivi des polices validees par l'assureur et preparation du monitoring operationnel."
      />
      <p className="text-xs text-brand-textMuted">
        Wakama suit et documente ; l&apos;assureur conserve l&apos;emission, les conditions et
        la responsabilite contractuelle.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Polices actives"
          value={String(activePolicies)}
          source="SEED_DEMO"
          icon={ShieldCheck}
        />
        <StatCard
          title="Capital assure total"
          value={formatMAD(totalCapital)}
          source="SEED_DEMO"
          icon={FileBadge2}
        />
        <StatCard
          title="Primes TTC associees"
          value={formatMAD(totalPremiumTtc)}
          source="SEED_DEMO"
          icon={CircleDollarSign}
        />
        <StatCard
          title="Expirant bientot"
          value={String(expiringSoon)}
          source="SEED_DEMO"
          icon={RefreshCw}
        />
        <StatCard
          title="Avec alertes monitoring"
          value={String(policiesWithAlerts)}
          source="SEED_DEMO"
          icon={BellRing}
        />
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Monitoring readiness
        </h2>
        <p className="mt-3 text-sm text-brand-textMuted">
          Une police active peut declencher le monitoring 360deg : NDVI, meteo, IoT, alertes
          et sinistres parametriques.
        </p>
      </Card>

      <PoliciesTable rows={rows} />
    </div>
  );
}
