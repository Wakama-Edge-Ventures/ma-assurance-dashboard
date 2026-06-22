"use client";

import { EvidenceBundlePanel } from "@/components/insurance/evidence-bundle-panel";
import { InsuranceReferencesPanel } from "@/components/insurance/insurance-references-panel";
import { LiveHealthPanel } from "@/components/insurance/live-health-panel";
import { MoroccoReferencesPanel } from "@/components/insurance/morocco-references-panel";
import { useTenant } from "@/components/tenant/useTenant";

export function SettingsLiveInsurancePanel() {
  const { tenant } = useTenant();

  return (
    <div className="space-y-4">
      <LiveHealthPanel />
      {tenant.country === "MA" ? (
        <MoroccoReferencesPanel />
      ) : (
        <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
          Référentiels géographiques Côte d&apos;Ivoire non configurés dans cette version.
        </div>
      )}
      <InsuranceReferencesPanel context="settings" />
      <EvidenceBundlePanel
        title="Evidence bundle - intégrations"
        entityType="INTEGRATION_HEALTH"
        entityId="settings-integrations"
        payload={{ scope: "settings", note: "Health + references snapshot" }}
      />
    </div>
  );
}
