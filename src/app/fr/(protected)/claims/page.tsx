import { DashboardSection } from "@/components/shared/dashboard-section";
import { getInsuranceClaims } from "@/lib/insurance-service";
import { formatMAD } from "@/lib/workflow";

export default async function ClaimsPage() {
  const claims = await getInsuranceClaims();
  const open = claims.filter((item) => item.status === "UNDER_REVIEW").length;
  const estimated = claims.reduce((sum, item) => sum + item.estimatedLossMad, 0);

  return (
    <DashboardSection
      title="Claims"
      description="Preparation du dossier sinistre pour revue et indemnisation assureur."
      kpis={[
        { title: "Sinistres", value: String(claims.length), source: "SEED_DEMO" },
        { title: "En revue", value: String(open), source: "SEED_DEMO" },
        { title: "Perte estimee", value: formatMAD(estimated), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Gestion des pieces et chronologie d'instruction.",
        "Rapprochement terrain, meteo et teledection.",
        "Export dossier indemnisation pour assureur.",
      ]}
    />
  );
}
