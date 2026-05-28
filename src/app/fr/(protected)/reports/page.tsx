import { DashboardSection } from "@/components/shared/dashboard-section";
import {
  getInsuranceApplications,
  getInsuranceClaims,
  getMonitoringAlerts,
} from "@/lib/insurance-service";

export default async function ReportsPage() {
  const [applications, claims, monitoringAlerts] = await Promise.all([
    getInsuranceApplications(),
    getInsuranceClaims(),
    getMonitoringAlerts(),
  ]);
  return (
    <DashboardSection
      title="Reports"
      description="Production de rapports de suivi technique et operationnel."
      kpis={[
        { title: "Rapport pipeline", value: String(applications.length), source: "SEED_DEMO" },
        { title: "Rapport alertes", value: String(monitoringAlerts.length), source: "SEED_DEMO" },
        { title: "Rapport sinistres", value: String(claims.length), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Rapports PDF planifies par assureur et perimetre.",
        "Exports CSV conformes schema API futur.",
        "Versionning et signature technique des rapports.",
      ]}
    />
  );
}
