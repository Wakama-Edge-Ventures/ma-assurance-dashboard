import Link from "next/link";
import { notFound } from "next/navigation";

import { GuidedDemoPanel } from "@/components/demo/guided-demo-panel";
import { PipelineStepper } from "@/components/demo/pipeline-stepper";
import { PolicyNextActionCard } from "@/components/policies/policy-next-action-card";
import { PolicyStatusBadge } from "@/components/policies/policy-status-badge";
import { Card } from "@/components/ui/card";
import { isScenarioEntityId } from "@/lib/demo-scenario";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import {
  getCommercialOffers,
  getFarmers,
  getInsuranceApplications,
  getInsurancePolicies,
  getInsurancePolicyById,
  getMonitoringAlerts,
  getRaxEvaluations,
} from "@/lib/insurance-service";
import {
  formatDate,
  formatMAD,
  formatScore,
  getFarmerDecisionLabel,
  getPolicyExpiryState,
  getPolicyExpiryStateLabel,
} from "@/lib/workflow";

interface PolicyDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function PolicyDetailPage({ params }: PolicyDetailPageProps) {
  const { id } = await params;
  const [policy, policies, applications, farmers, offers, raxEvaluations, alerts] =
    await Promise.all([
      getInsurancePolicyById(id),
      getInsurancePolicies(),
      getInsuranceApplications(),
      getFarmers(),
      getCommercialOffers(),
      getRaxEvaluations(),
      getMonitoringAlerts(),
    ]);

  if (!policy) notFound();

  const policyMap = new Map(policies.map((item) => [item.id, item]));
  const application = applications.find((item) => item.id === policy.applicationId) ?? null;
  const farmer =
    (policy.farmerId ? farmers.find((item) => item.id === policy.farmerId) : null) ??
    (application ? farmers.find((item) => item.id === application.farmerId) : null);
  const linkedOffer =
    (policy.offerId ? offers.find((item) => item.id === policy.offerId) : null) ??
    offers.find((item) => item.applicationId === policy.applicationId) ??
    null;
  const linkedRax =
    (linkedOffer?.raxEvaluationId
      ? raxEvaluations.find((item) => item.id === linkedOffer.raxEvaluationId)
      : null) ?? raxEvaluations.find((item) => item.applicationId === policy.applicationId) ?? null;

  const policyAlerts = alerts
    .filter((alert) => alert.policyId === policy.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const openAlertsCount = policyAlerts.filter((alert) => !alert.resolved).length;
  const hasAlerts = openAlertsCount > 0;

  const capitalInsured = policy.totalInsuredCapital ?? policy.coverageMad;
  const premiumTtc =
    policy.totalPremiumTtc ??
    linkedOffer?.totalCommercialPremiumTtc ??
    linkedOffer?.suggestedCommercialPremiumMad ??
    policy.annualPremiumMad;
  const startDate = policy.coverageStartDate ?? policy.effectiveDate;
  const endDate = policy.coverageEndDate ?? policy.expiryDate;
  const expiryState = getPolicyExpiryState(startDate, endDate);
  const decision = linkedOffer?.farmerDecision ?? "PENDING";

  const currentPolicy = policyMap.get(policy.id) ?? policy;
  const demoStepId = isScenarioEntityId(policy.id) ? "step-policy" : undefined;

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Police ${currentPolicy.policyNumber}`}
        description="Suivi operationnel Wakama sur police communiquee par l'assureur."
      />
      {demoStepId && <PipelineStepper activeStepId={demoStepId} />}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">
              Policy ID / Number
            </p>
            <p className="text-lg font-semibold text-white">
              {currentPolicy.id} - {currentPolicy.policyNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PolicyStatusBadge status={currentPolicy.status} />
            <DataSourceBadge source={currentPolicy.source} />
          </div>
        </div>
        <div className="grid gap-3 text-[13px] text-slate-300 md:grid-cols-3">
          <p>Demande liee: {application?.reference ?? currentPolicy.applicationId}</p>
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>Statut: {currentPolicy.status}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Police suivie par Wakama apres validation assureur - emission et responsabilite
          contractuelle reservees a l&apos;assureur.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Couverture
          </h2>
          <div className="mt-3 grid gap-2 text-[13px] text-slate-300 md:grid-cols-2">
            <p>Capital assure: {formatMAD(capitalInsured)}</p>
            <p>Prime TTC: {formatMAD(premiumTtc)}</p>
            <p>Date debut: {formatDate(startDate)}</p>
            <p>Date fin: {formatDate(endDate)}</p>
            <p>
              Culture/surface: {application?.cropType ?? "N/A"} / {application?.areaHa ?? 0} ha
            </p>
            <p>Statut: {currentPolicy.status}</p>
            <p>Echeance: {getPolicyExpiryStateLabel(expiryState)}</p>
          </div>
        </Card>

        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Offre commerciale liee
          </h2>
          {linkedOffer ? (
            <div className="mt-3 space-y-2 text-[13px] text-slate-300">
              <p>Offre: {linkedOffer.id}</p>
              <p>
                Prime TTC:{" "}
                {formatMAD(
                  linkedOffer.totalCommercialPremiumTtc ??
                    linkedOffer.suggestedCommercialPremiumMad,
                )}
              </p>
              <p>Decision farmer: {getFarmerDecisionLabel(decision)}</p>
              <p>Jeton de passage guichet: {linkedOffer.agencyPickupToken ?? "N/A"}</p>
              <Link
                href={`/fr/pricing/${linkedOffer.id}`}
                className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
              >
                Ouvrir la tarification
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-brand-textMuted">
              Aucune offre associee disponible.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Risque lie
          </h2>
          {linkedRax ? (
            <div className="mt-3 space-y-2 text-[13px] text-slate-300">
              <div className="flex items-center gap-2">
                <RiskTierBadge tier={linkedRax.riskTier} />
              </div>
              <p>WRS: {formatScore(linkedRax.wrsScore)}</p>
              <p>G/F/D: {formatScore(linkedRax.gravity ?? 0)} / {formatScore(linkedRax.frequency ?? 0)} / {formatScore(linkedRax.detection ?? 0)}</p>
              <Link
                href={`/fr/rax/${linkedRax.id}`}
                className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
              >
                Ouvrir la fiche RAX/WRS
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-brand-textMuted">
              Evaluation risque non disponible pour cette police.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Monitoring readiness
          </h2>
          <div className="mt-3 space-y-2 text-[13px] text-slate-300">
            <p>Monitoring actif: {currentPolicy.status === "ACTIVE" ? "Oui" : "Non"}</p>
            <p>Alertes liees: {openAlertsCount}</p>
            <p>
              Derniere alerte:{" "}
              {policyAlerts[0]?.createdAt ? formatDate(policyAlerts[0].createdAt) : "N/A"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/fr/monitoring"
                className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
              >
                Ouvrir monitoring
              </Link>
              <Link
                href="/fr/claims"
                className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
              >
                Ouvrir claims
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Integrite
          </h2>
          <p className="mt-3 text-[13px] text-slate-300">
            Le hash de la police communiquee par l&apos;assureur pourra etre ancre de maniere
            asynchrone. L&apos;ancrage Solana ne bloque pas le workflow metier.
          </p>
        </Card>

        <PolicyNextActionCard
          status={currentPolicy.status}
          hasAlertsOrClaims={hasAlerts}
          applicationId={currentPolicy.applicationId}
        />
      </div>
      {demoStepId && <GuidedDemoPanel currentStepId={demoStepId} />}
    </div>
  );
}
