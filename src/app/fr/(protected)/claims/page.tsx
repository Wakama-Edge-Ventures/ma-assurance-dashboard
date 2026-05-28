import { DashboardSection } from "@/components/shared/dashboard-section";
import { claims } from "@/lib/demo-data";
import { formatCurrencyMad } from "@/lib/utils";

export default function ClaimsPage() {
  const open = claims.filter((item) => item.status === "UNDER_REVIEW").length;
  const estimated = claims.reduce((sum, item) => sum + item.estimatedLossMad, 0);

  return (
    <DashboardSection
      title="Claims"
      description="Preparation du dossier sinistre pour revue et indemnisation assureur."
      kpis={[
        { title: "Sinistres", value: String(claims.length), source: "SEED_DEMO" },
        { title: "En revue", value: String(open), source: "SEED_DEMO" },
        { title: "Perte estimee", value: formatCurrencyMad(estimated), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Gestion des pieces et chronologie d'instruction.",
        "Rapprochement terrain, meteo et teledection.",
        "Export dossier indemnisation pour assureur.",
      ]}
    />
  );
}
