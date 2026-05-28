import { DashboardSection } from "@/components/shared/dashboard-section";
import { getInsuranceMissions } from "@/lib/insurance-service";

export default async function MissionsPage() {
  const missions = await getInsuranceMissions();
  const planned = missions.filter((item) => item.status === "PLANNED").length;
  const inProgress = missions.filter((item) => item.status === "IN_PROGRESS").length;

  return (
    <DashboardSection
      title="Missions"
      description="Planification et execution des verifications terrain et distance."
      kpis={[
        { title: "Missions totales", value: String(missions.length), source: "SEED_DEMO" },
        { title: "Planifiees", value: String(planned), source: "SEED_DEMO" },
        { title: "En cours", value: String(inProgress), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Carte regionale avec optimisation de tournées.",
        "Affectation automatique selon charge inspecteur.",
        "Synchronisation offline/mobile pour audits terrain.",
      ]}
    />
  );
}
