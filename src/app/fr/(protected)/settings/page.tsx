import { ShieldCheck, SlidersHorizontal, Users2 } from "lucide-react";

import { SettingsLiveInsurancePanel } from "@/components/insurance/settings-live-insurance-panel";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { AppCard } from "@/components/ui/app-card";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Parametres"
        description="Profil institutionnel, garde-fous de gouvernance et reglages operationnels du dashboard."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Profil tenant" value="Actif" source="LIVE" icon={Users2} />
        <StatCard title="Controles" value="Lecture encadree" source="LIVE" icon={ShieldCheck} />
        <StatCard title="Modules" value="Parametres" source="SEED_DEMO" icon={SlidersHorizontal} />
      </div>

      <AppCard className="space-y-3 p-5">
        <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
          Cette zone presente des reglages de lecture et de parametrage. Elle ne transforme pas Wakama en moteur de decision et ne contourne pas les garde-fous de session ou de tenant.
        </p>
      </AppCard>

      <SettingsLiveInsurancePanel />
      <SettingsPanel />
    </div>
  );
}
