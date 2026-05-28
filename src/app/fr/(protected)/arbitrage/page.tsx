import { DashboardSection } from "@/components/shared/dashboard-section";
import {
  getInsuranceApplications,
  getInsuranceFieldAudits,
} from "@/lib/insurance-service";

export default async function ArbitragePage() {
  const [applications, fieldAudits] = await Promise.all([
    getInsuranceApplications(),
    getInsuranceFieldAudits(),
  ]);
  const highRisk = applications.filter((item) => item.riskTier === "HIGH_RISK").length;
  const anomalies = fieldAudits.filter((item) => item.anomalyDetected).length;

  return (
    <DashboardSection
      title="Arbitrage"
      description="Aide a la revue humaine des cas sensibles avant decision assureur."
      kpis={[
        { title: "Cas a arbitrer", value: String(highRisk), source: "SEED_DEMO" },
        { title: "Audits avec anomalie", value: String(anomalies), source: "SEED_DEMO" },
        { title: "SLA cible", value: "48h", source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Matrice de priorisation multi-criteres.",
        "Journal d'explications et evidence pack.",
        "Escalade superviseur pour cas non conclusifs.",
      ]}
    />
  );
}
