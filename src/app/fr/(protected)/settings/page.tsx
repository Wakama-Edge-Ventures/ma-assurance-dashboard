import { DashboardSection } from "@/components/shared/dashboard-section";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <DashboardSection
      title="Settings"
      description="Parametrage global du dashboard et gouvernance operationnelle."
      kpis={[
        { title: "Environnement", value: "MVP DEMO", source: "SEED_DEMO" },
        { title: "Locale", value: "fr-MA", source: "SEED_DEMO" },
        { title: "API cible", value: "api.wakama.farm", source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Gestion des roles et permissions par assureur.",
        "Configuration notifications et SLA.",
        "Options d'integration API et webhooks.",
      ]}
    />
  );
}
