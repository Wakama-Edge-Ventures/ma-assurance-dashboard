"use client";

import { useTenant } from "@/components/tenant/useTenant";
import { ApplicationsLivePanel } from "@/components/insurance/applications-live-panel";
import { PageTitle } from "@/components/ui/page-title";

export const dynamic = "force-dynamic";

export default function ApplicationsPage() {
  const { tenant } = useTenant();
  const isAssuranceTenant = tenant.id === "assurance-ma";

  const title = isAssuranceTenant
    ? "Demandes d'assurance - DCA Farmer"
    : tenant.terminology.applicationsLabel;
  const description = isAssuranceTenant
    ? "Lecture seule des dossiers DCA retournes par GET /v1/insurance/applications."
    : "Vue institutionnelle en lecture seule des dossiers retournes par GET /v1/insurance/applications.";
  const note = tenant.demoMode
    ? "Demo institutionnelle - maquette d'illustration. Les donnees et decisions restent sous controle de l'institution."
    : null;
  const disclaimer = isAssuranceTenant
    ? "Wakama prepare, structure et documente. La decision finale reste reservee a l'assureur."
    : tenant.terminology.decisionDisclaimer;

  return (
    <div className="space-y-6">
      <PageTitle title={title} description={description} />

      {note ? <p className="text-xs text-brand-textMuted">{note}</p> : null}

      <p className="text-xs text-brand-textMuted">{disclaimer}</p>

      <ApplicationsLivePanel />
    </div>
  );
}
