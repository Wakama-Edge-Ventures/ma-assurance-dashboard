import { DashboardSection } from "@/components/shared/dashboard-section";
import { getInsuranceApplications } from "@/lib/insurance-service";

export default async function ApplicationsPage() {
  const applications = await getInsuranceApplications();
  const submitted = applications.filter((item) => item.status !== "DRAFT").length;
  const auditNeeded = applications.filter(
    (item) => item.status === "REQUIRES_FIELD_AUDIT",
  ).length;

  return (
    <DashboardSection
      title="Applications"
      description="Collecte et orchestration technique des demandes recues."
      kpis={[
        { title: "Total dossiers", value: String(applications.length), source: "SEED_DEMO" },
        { title: "Soumis", value: String(submitted), source: "SEED_DEMO" },
        { title: "Audit terrain requis", value: String(auditNeeded), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Workflow de validation documentaire par lot.",
        "Historique detaille des changements de statut.",
        "Connecteur API asynchrone vers le moteur underwriting.",
      ]}
    />
  );
}
