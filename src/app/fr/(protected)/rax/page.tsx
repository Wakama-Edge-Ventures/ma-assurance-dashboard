import { Calculator, CheckCircle2, FileBarChart2, ShieldAlert, ShieldCheck } from "lucide-react";

import { RaxFormulaCard } from "@/components/rax/rax-formula-card";
import { RaxRow, RaxTable } from "@/components/rax/rax-table";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  getFarmers,
  getInsuranceApplications,
  getInsuranceFieldAudits,
  getRaxEvaluations,
} from "@/lib/insurance-service";
import {
  calculateRaxBrut,
  calculateWrs,
  formatScore,
  getRiskTierLabel,
} from "@/lib/workflow";
import { RiskTier } from "@/types";

function resolveMetrics(row: {
  gravity?: number;
  frequency?: number;
  detection?: number;
  raxBrut?: number;
  raxScore: number;
  wrsScore: number;
}) {
  const gravity = typeof row.gravity === "number" && Number.isFinite(row.gravity) ? row.gravity : 3;
  const frequency =
    typeof row.frequency === "number" && Number.isFinite(row.frequency) ? row.frequency : 3;
  const detection =
    typeof row.detection === "number" && Number.isFinite(row.detection) ? row.detection : 0.8;
  const computedRaxBrut = calculateRaxBrut(gravity, frequency, detection);
  const raxBrut =
    typeof row.raxBrut === "number" && Number.isFinite(row.raxBrut)
    ? row.raxBrut
    : Number.isFinite(row.raxScore)
      ? row.raxScore
      : computedRaxBrut;
  const wrsRaw = Number.isFinite(row.wrsScore) ? row.wrsScore : calculateWrs(raxBrut);
  const wrs = Math.max(0, Math.min(100, wrsRaw));

  return { gravity, frequency, detection, raxBrut, wrs };
}

export const dynamic = "force-dynamic";

export default async function RaxPage() {
  const [evaluations, applications, farmers, audits] = await Promise.all([
    getRaxEvaluations(),
    getInsuranceApplications(),
    getFarmers(),
    getInsuranceFieldAudits(),
  ]);

  const applicationById = new Map(applications.map((item) => [item.id, item]));
  const farmerById = new Map(farmers.map((item) => [item.id, item]));
  const auditedApplicationIds = new Set(audits.map((audit) => audit.applicationId));

  const rows: RaxRow[] = evaluations.map((evaluation) => {
    const application = applicationById.get(evaluation.applicationId);
    const farmer = application ? farmerById.get(application.farmerId) : null;
    const metrics = resolveMetrics(evaluation);

    return {
      ...evaluation,
      applicationReference: application?.reference ?? evaluation.applicationId,
      farmerName: farmer?.fullName ?? "Agriculteur N/A",
      cropType: application?.cropType ?? "Culture N/A",
      gravityValue: metrics.gravity,
      frequencyValue: metrics.frequency,
      detectionValue: metrics.detection,
      raxBrutValue: metrics.raxBrut,
      wrsValue: metrics.wrs,
    };
  });

  const wrsAverage =
    rows.reduce((sum, row) => sum + row.wrsValue, 0) / Math.max(rows.length, 1);
  const lowMediumCount = rows.filter(
    (row) => row.riskTier === "LOW_RISK" || row.riskTier === "MEDIUM_RISK",
  ).length;
  const highUninsurableCount = rows.filter(
    (row) => row.riskTier === "HIGH_RISK" || row.riskTier === "UNINSURABLE",
  ).length;
  const readyForPricing = rows.filter(
    (row) =>
      (row.riskTier === "LOW_RISK" || row.riskTier === "MEDIUM_RISK") &&
      auditedApplicationIds.has(row.applicationId),
  ).length;

  const distribution = rows.reduce<Record<RiskTier, number>>(
    (acc, row) => {
      acc[row.riskTier] = (acc[row.riskTier] ?? 0) + 1;
      return acc;
    },
    { LOW_RISK: 0, MEDIUM_RISK: 0, HIGH_RISK: 0, UNINSURABLE: 0 },
  );

  return (
    <div className="space-y-6">
      <PageTitle
        title="RAX / WRS"
        description="Framework de scoring technique du risque agricole pour l'assurance."
      />
      <p className="text-xs text-brand-textMuted">
        RAX/WRS est une aide non decisionnelle ; l&apos;assureur conserve la decision
        d&apos;eligibilite et de tarification.
      </p>

      <RaxFormulaCard />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Evaluations RAX"
          value={String(rows.length)}
          source="SEED_DEMO"
          icon={FileBarChart2}
        />
        <StatCard
          title="WRS moyen"
          value={formatScore(wrsAverage)}
          source="SEED_DEMO"
          icon={Calculator}
        />
        <StatCard
          title="LOW / MEDIUM"
          value={String(lowMediumCount)}
          source="SEED_DEMO"
          icon={ShieldCheck}
        />
        <StatCard
          title="HIGH / UNINSURABLE"
          value={String(highUninsurableCount)}
          source="SEED_DEMO"
          icon={ShieldAlert}
        />
        <StatCard
          title="Prets tarification"
          value={String(readyForPricing)}
          source="SEED_DEMO"
          icon={CheckCircle2}
        />
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Distribution des tiers risque
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(distribution) as RiskTier[]).map((tier) => (
            <div
              key={tier}
              className="flex items-center gap-2 rounded-full border border-brand-border bg-slate-900 px-3 py-1 text-xs text-brand-textMuted"
            >
              <RiskTierBadge tier={tier} />
              <span>
                {getRiskTierLabel(tier)}: {distribution[tier]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <RaxTable rows={rows} />
    </div>
  );
}
