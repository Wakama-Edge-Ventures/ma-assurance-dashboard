import { SettingsPanel } from "@/components/settings/settings-panel";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[24px] font-semibold text-white">
          Paramètres assureur
        </h1>
        <p className="mt-0.5 text-[13px] text-slate-400">
          Centre de configuration des règles techniques, seuils, missions et
          rapports Wakama Assurance.
        </p>
      </div>
      <SettingsPanel />
    </div>
  );
}
