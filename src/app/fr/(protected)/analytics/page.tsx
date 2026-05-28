import { DashboardSection } from "@/components/shared/dashboard-section";
import {
  getInsuranceApplications,
  getInsuranceClaims,
  getInsurancePolicies,
} from "@/lib/insurance-service";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [applications, claims, policies] = await Promise.all([
    getInsuranceApplications(),
    getInsuranceClaims(),
    getInsurancePolicies(),
  ]);
  const conversion = policies.length
    ? ((policies.length / applications.length) * 100).toFixed(1)
    : "0";
  const claimRate = policies.length ? ((claims.length / policies.length) * 100).toFixed(1) : "0";

  return (
    <DashboardSection
      title="Analytics"
      description="Indicateurs de performance technique et pilotage portefeuille."
      kpis={[
        { title: "Conversion dossier->police", value: `${conversion}%`, source: "SEED_DEMO" },
        { title: "Frequence sinistres", value: `${claimRate}%`, source: "SEED_DEMO" },
        { title: "Qualite donnees", value: "MVP DEMO", source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Cohortes region/culture avec tendances saisonnieres.",
        "Suivi precision recommandations RAX/WRS.",
        "Exports BI assureur et rapprochement comptable.",
      ]}
    />
  );
}
