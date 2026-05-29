import { AlertOctagon, ClipboardList, FolderClock, FolderKanban, HandCoins } from "lucide-react";

import { ClaimsTable, ClaimRow } from "@/components/claims/claims-table";
import { InsuranceReferencesPanel } from "@/components/insurance/insurance-references-panel";
import { AppSection } from "@/components/ui/app-section";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getFarmers,
  getInsuranceApplications,
  getInsuranceClaims,
  getInsurancePolicies,
  getMonitoringAlerts,
} from "@/lib/insurance-service";
import {
  formatMAD,
  getClaimTypeLabel,
  getMonitoringSeverityLabel,
  getMonitoringSeverityOrder,
} from "@/lib/workflow";

function resolveSeverity(input: { severity?: string; monitoringSeverity?: string }) {
  if (input.severity === "CRITICAL" || input.monitoringSeverity === "CRITICAL") {
    return "CRITICAL";
  }
  if (input.severity === "WARNING" || input.monitoringSeverity === "WARNING") {
    return "WARNING";
  }
  return "INFO";
}

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  const [claims, policies, alerts, applications, farmers] = await Promise.all([
    getInsuranceClaims(),
    getInsurancePolicies(),
    getMonitoringAlerts(),
    getInsuranceApplications(),
    getFarmers(),
  ]);

  const policyById = new Map(policies.map((item) => [item.id, item]));
  const applicationById = new Map(applications.map((item) => [item.id, item]));
  const farmerById = new Map(farmers.map((item) => [item.id, item]));
  const alertById = new Map(alerts.map((item) => [item.id, item]));

  const rows: ClaimRow[] = claims.map((claim) => {
    const policy = policyById.get(claim.policyId);
    const application =
      (claim.applicationId ? applicationById.get(claim.applicationId) : null) ??
      (policy ? applicationById.get(policy.applicationId) : null);
    const farmer =
      (claim.farmerId ? farmerById.get(claim.farmerId) : null) ??
      (application ? farmerById.get(application.farmerId) : null);
    const linkedAlert = claim.monitoringAlertId
      ? alertById.get(claim.monitoringAlertId)
      : alerts.find((alert) => alert.policyId === claim.policyId);

    return {
      id: claim.id,
      claimNumber: claim.claimNumber,
      policyId: claim.policyId,
      policyNumber: policy?.policyNumber ?? claim.policyId,
      farmerName: farmer?.fullName ?? "Agriculteur N/A",
      cropType: application?.cropType ?? "Culture N/A",
      claimType: getClaimTypeLabel(claim.claimType),
      status: claim.status,
      severity: resolveSeverity({
        severity: claim.severity,
        monitoringSeverity: linkedAlert?.severity ?? linkedAlert?.level,
      }),
      estimatedAmount: claim.estimatedAmount ?? claim.estimatedLossMad,
      createdAt: claim.createdAt ?? linkedAlert?.createdAt ?? "2026-01-01",
      source: claim.source,
    };
  });

  const openClaims = rows.filter((row) => ["OPEN", "DECLARED", "UNDER_REVIEW"].includes(row.status))
    .length;
  const criticalLinked = rows.filter((row) => row.severity === "CRITICAL").length;
  const inReview = rows.filter((row) => row.status === "UNDER_REVIEW").length;
  const closed = rows.filter((row) =>
    ["CLOSED", "APPROVED", "REJECTED", "APPROVED_BY_INSURER", "REJECTED_BY_INSURER"].includes(
      row.status,
    ),
  ).length;
  const indicativeTotal = rows.reduce((sum, row) => sum + row.estimatedAmount, 0);

  const severityDistribution = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.severity] = (acc[row.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageTitle
        title="Alertes & Sinistres"
        description="Suivi des signalements, alertes critiques et dossiers de revue sinistre."
      />
      <p className="text-xs text-brand-textMuted">
        Wakama documente les signaux et les preuves ; l&apos;assureur conserve la decision
        d&apos;indemnisation.
      </p>

      <InsuranceReferencesPanel context="claims" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Signalements ouverts"
          value={String(openClaims)}
          source="SEED_DEMO"
          icon={ClipboardList}
        />
        <StatCard
          title="Alertes critiques liees"
          value={String(criticalLinked)}
          source="SEED_DEMO"
          icon={AlertOctagon}
        />
        <StatCard
          title="Dossiers en revue assureur"
          value={String(inReview)}
          source="SEED_DEMO"
          icon={FolderClock}
        />
        <StatCard
          title="Dossiers clotures"
          value={String(closed)}
          source="SEED_DEMO"
          icon={FolderKanban}
        />
        <StatCard
          title="Estimation indicative totale"
          value={formatMAD(indicativeTotal)}
          source="SEED_DEMO"
          icon={HandCoins}
        />
      </div>

      <AppSection title="Lien alertes critiques">
        <p className="text-[13px] text-brand-textMuted">
          Les alertes CRITICAL du Monitoring 360deg peuvent ouvrir un suivi sinistre, mais
          ne declenchent pas automatiquement une indemnisation.
        </p>
      </AppSection>

      <AppSection title="Distribution severite">
        <div className="flex flex-wrap gap-2">
          {Object.entries(severityDistribution)
            .sort(
              ([a], [b]) => getMonitoringSeverityOrder(b) - getMonitoringSeverityOrder(a),
            )
            .map(([severity, count]) => (
              <span
                key={severity}
                className="rounded-full border border-slate-400/10 bg-slate-800/60 px-3 py-1 font-mono text-[11px] text-slate-400"
              >
                {getMonitoringSeverityLabel(severity)}: {count}
              </span>
            ))}
        </div>
      </AppSection>

      <ClaimsTable rows={rows} />
    </div>
  );
}
