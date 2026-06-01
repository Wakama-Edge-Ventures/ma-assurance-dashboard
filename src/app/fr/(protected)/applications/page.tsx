import { ApplicationsLivePanel } from "@/components/insurance/applications-live-panel";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Demandes d'assurance - DCA Farmer"
        description="Lecture seule des dossiers DCA retournés par GET /v1/insurance/applications."
      />

      <p className="text-xs text-brand-textMuted">
        Wakama prépare, structure et documente. La décision finale reste réservée à l&apos;assureur.
      </p>

      <ApplicationsLivePanel />
    </div>
  );
}
