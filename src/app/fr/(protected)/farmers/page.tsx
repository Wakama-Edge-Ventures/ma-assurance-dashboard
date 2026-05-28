import { DashboardSection } from "@/components/shared/dashboard-section";
import { getFarmers } from "@/lib/insurance-service";

export default async function FarmersPage() {
  const farmers = await getFarmers();
  const totalArea = farmers.reduce((sum, item) => sum + item.totalAreaHa, 0);

  return (
    <DashboardSection
      title="Farmers"
      description="Base referentielle des exploitants pour onboarding et suivi terrain."
      kpis={[
        { title: "Exploitants", value: String(farmers.length), source: "SEED_DEMO" },
        { title: "Surface totale", value: `${totalArea} ha`, source: "SEED_DEMO" },
        { title: "Regions couvertes", value: "3", source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Deduplication KYC et controles CNDP.",
        "Historique annuel des rendements.",
        "Connexion aux registres cooperatifs.",
      ]}
    />
  );
}
