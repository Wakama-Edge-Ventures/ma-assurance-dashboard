import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { ReportsPanel } from "@/components/reports/reports-panel";
import {
  getInsuranceApplications,
  getInsuranceClaims,
  getInsurancePolicies,
  getWakamaAlerts,
  getFarmers,
  getCooperatives,
  getSharedWakamaDataOverview,
} from "@/lib/insurance-service";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [
    farmers,
    cooperatives,
    applications,
    policies,
    claims,
    alerts,
    sharedOverview,
  ] = await Promise.all([
    getFarmers(),
    getCooperatives(),
    getInsuranceApplications(),
    getInsurancePolicies(),
    getInsuranceClaims(),
    getWakamaAlerts(),
    getSharedWakamaDataOverview(),
  ]);

  const sharedMode = sharedOverview.liveCount > 0 ? "LIVE" : "SEED_DEMO";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] font-semibold text-white">Rapports</h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Génération, prévisualisation et export des rapports portefeuille, risques, missions
            et conformité.
          </p>
        </div>
        <DataSourceBadge source={sharedMode} />
      </div>

      <ReportsPanel
        farmers={farmers}
        cooperatives={cooperatives}
        applications={applications}
        policies={policies}
        claims={claims}
        alerts={alerts}
        sharedMode={sharedMode}
        generatedAt={new Date().toISOString()}
      />
    </div>
  );
}
