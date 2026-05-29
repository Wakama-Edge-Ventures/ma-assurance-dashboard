import { EvidenceBundlePanel } from "@/components/insurance/evidence-bundle-panel";
import { InsuranceReferencesPanel } from "@/components/insurance/insurance-references-panel";
import { LiveHealthPanel } from "@/components/insurance/live-health-panel";
import { MoroccoReferencesPanel } from "@/components/insurance/morocco-references-panel";

export function SettingsLiveInsurancePanel() {
  return (
    <div className="space-y-4">
      <LiveHealthPanel />
      <MoroccoReferencesPanel />
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
