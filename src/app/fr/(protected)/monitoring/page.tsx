import { Activity, AlertTriangle, Leaf, ShieldAlert, ShieldCheck } from "lucide-react";

import { MonitoringRow, MonitoringTable } from "@/components/monitoring/monitoring-table";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getFarmers,
  getInsuranceApplications,
  getInsurancePolicies,
  getMonitoringAlerts,
  getRaxEvaluations,
} from "@/lib/insurance-service";
import {
  formatDate,
  getMonitoringSeverityLabel,
  getMonitoringSignalTypeLabel,
} from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const [alerts, policies, applications, farmers, raxEvaluations] = await Promise.all([
    getMonitoringAlerts(),
    getInsurancePolicies(),
    getInsuranceApplications(),
    getFarmers(),
    getRaxEvaluations(),
  ]);

  const policyById = new Map(policies.map((item) => [item.id, item]));
  const applicationById = new Map(applications.map((item) => [item.id, item]));
  const farmerById = new Map(farmers.map((item) => [item.id, item]));
  const raxByApplicationId = new Map(
    raxEvaluations.map((item) => [item.applicationId, item]),
  );

  const rows: MonitoringRow[] = alerts.map((alert) => {
    const policy = policyById.get(alert.policyId);
    const application =
      (alert.applicationId ? applicationById.get(alert.applicationId) : null) ??
      (policy ? applicationById.get(policy.applicationId) : null);
    const farmer =
      (alert.farmerId ? farmerById.get(alert.farmerId) : null) ??
      (application ? farmerById.get(application.farmerId) : null);
    return {
      id: alert.id,
      policyId: alert.policyId,
      policyNumber: policy?.policyNumber ?? alert.policyId,
      farmerName: farmer?.fullName ?? "Agriculteur N/A",
      cropType: application?.cropType ?? "Culture N/A",
      region: application?.province ?? application?.commune ?? farmer?.region ?? "N/A",
      type: alert.type ?? "SYSTEM",
      severity: alert.severity ?? alert.level,
      message: alert.message ?? alert.title,
      createdAt: alert.createdAt,
      source: alert.source,
    };
  });

  const policiesUnderMonitoring = new Set(rows.map((row) => row.policyId)).size;
  const activeAlerts = alerts.filter((item) => !item.resolved).length;
  const criticalAlerts = alerts.filter(
    (item) => (item.severity ?? item.level) === "CRITICAL" && !item.resolved,
  ).length;

  const lastNdvi = rows
    .filter((row) => row.type === "NDVI")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const highRiskPolicies = policies.filter((policy) => {
    const rax = raxByApplicationId.get(policy.applicationId);
    return rax?.riskTier === "HIGH_RISK" || rax?.riskTier === "UNINSURABLE";
  }).length;

  const severityDistribution = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.severity] = (acc[row.severity] ?? 0) + 1;
    return acc;
  }, {});
  const typeDistribution = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageTitle
        title="Monitoring 360°"
        description="Surveillance post-police des parcelles assurees : NDVI, meteo, IoT et alertes operationnelles."
      />
      <p className="text-xs text-brand-textMuted">
        Wakama detecte et documente les signaux ; l&apos;assureur conserve l&apos;analyse
        sinistre et la decision d&apos;indemnisation.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Polices sous monitoring"
          value={String(policiesUnderMonitoring)}
          source="SEED_DEMO"
          icon={ShieldCheck}
        />
        <StatCard
          title="Alertes actives"
          value={String(activeAlerts)}
          source="SEED_DEMO"
          icon={Activity}
        />
        <StatCard
          title="Alertes critiques"
          value={String(criticalAlerts)}
          source="SEED_DEMO"
          icon={AlertTriangle}
        />
        <StatCard
          title="Dernier signal NDVI"
          value={lastNdvi ? formatDate(lastNdvi.createdAt) : "N/A"}
          source="SEED_DEMO"
          icon={Leaf}
        />
        <StatCard
          title="Polices risque eleve"
          value={String(highRiskPolicies)}
          source="SEED_DEMO"
          icon={ShieldAlert}
        />
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Resume monitoring
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(severityDistribution).map(([severity, count]) => (
              <span
                key={severity}
                className="rounded-full border border-brand-border bg-slate-900 px-3 py-1 text-xs text-brand-textMuted"
              >
                {getMonitoringSeverityLabel(severity)}: {count}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeDistribution).map(([type, count]) => (
              <span
                key={type}
                className="rounded-full border border-brand-border bg-slate-900 px-3 py-1 text-xs text-brand-textMuted"
              >
                {getMonitoringSignalTypeLabel(type)}: {count}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Monitoring readiness
        </h2>
        <p className="mt-3 text-sm text-brand-textMuted">
          En MVP, les signaux peuvent etre SEED_DEMO. En production, ils seront alimentes
          par Copernicus/Sentinel-2, Open-Meteo, IoT et agents terrain.
        </p>
      </Card>

      <MonitoringTable rows={rows} />
    </div>
  );
}
