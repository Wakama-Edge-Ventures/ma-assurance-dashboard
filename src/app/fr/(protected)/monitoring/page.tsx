import { DashboardSection } from "@/components/shared/dashboard-section";
import { monitoringAlerts } from "@/lib/demo-data";

export default function MonitoringPage() {
  const criticalOrWarning = monitoringAlerts.filter(
    (item) => item.level === "CRITICAL" || item.level === "WARNING",
  ).length;
  const unresolved = monitoringAlerts.filter((item) => !item.resolved).length;

  return (
    <DashboardSection
      title="Monitoring"
      description="Surveillance continue et alertes post-emission a valeur d'audit trail."
      kpis={[
        { title: "Alertes totales", value: String(monitoringAlerts.length), source: "SEED_DEMO" },
        { title: "Alerte prioritaire", value: String(criticalOrWarning), source: "SEED_DEMO" },
        { title: "Non resolues", value: String(unresolved), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Regles dynamiques par culture et region.",
        "Chaînage de preuve d'integrite horodatee.",
        "Notifications webhook vers outils assureur.",
      ]}
    />
  );
}
