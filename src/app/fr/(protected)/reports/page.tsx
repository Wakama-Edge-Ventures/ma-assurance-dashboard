import { ReportsPanel } from "@/components/reports/reports-panel";
import { AppCard } from "@/components/ui/app-card";
import { PageTitle } from "@/components/ui/page-title";
import {
  getCooperatives,
  getFarmers,
  getInsuranceApplications,
  getInsuranceClaims,
  getInsurancePolicies,
  getSharedWakamaDataOverview,
  getWakamaAlerts,
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
      <PageTitle
        title="Rapports"
        description="Bibliotheque de syntheses, d'exports et de lectures portefeuille pour les operations institutionnelles."
      />

      <AppCard className="space-y-3 p-5">
        <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
          Les rapports presentent une lecture de pilotage et de documentation. Ils ne doivent pas etre interpretes comme une decision automatique sur les dossiers, les polices ou les sinistres.
        </p>
      </AppCard>

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
