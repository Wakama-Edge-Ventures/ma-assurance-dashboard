import { DashboardSection } from "@/components/shared/dashboard-section";
import { cooperatives } from "@/lib/demo-data";

export default function CooperativesPage() {
  const totalMembers = cooperatives.reduce((sum, item) => sum + item.memberCount, 0);
  const totalArea = cooperatives.reduce((sum, item) => sum + item.aggregatedAreaHa, 0);

  return (
    <DashboardSection
      title="Cooperatives"
      description="Suivi des structures collectives partenaires pour portefeuille rural."
      kpis={[
        { title: "Cooperatives", value: String(cooperatives.length), source: "SEED_DEMO" },
        { title: "Membres", value: String(totalMembers), source: "SEED_DEMO" },
        { title: "Surface agregee", value: `${totalArea} ha`, source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Scoring collectif par historique de sinistralite.",
        "Pilotage des campagnes de souscription groupees.",
        "Canal de communication cooperative-assureur.",
      ]}
    />
  );
}
