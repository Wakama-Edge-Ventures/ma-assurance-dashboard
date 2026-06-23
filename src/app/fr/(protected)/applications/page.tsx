"use client";

import { useTenant } from "@/components/tenant/useTenant";
import { ApplicationsLivePanel } from "@/components/insurance/applications-live-panel";
import { PageTitle } from "@/components/ui/page-title";
import { useTenantSessionConsistency } from "@/hooks/useTenantSessionConsistency";

export const dynamic = "force-dynamic";

export default function ApplicationsPage() {
  const { tenant } = useTenant();
  const tenantConsistency = useTenantSessionConsistency();
  const isAssuranceTenant = tenant.id === "assurance-ma";

  const title = isAssuranceTenant
    ? "Demandes d'assurance agricole - DCA"
    : tenant.terminology.applicationsLabel;
  const description = isAssuranceTenant
    ? "Lecture seule des dossiers DCA, declaration de capacite agricole retournee par GET /v1/insurance/applications."
    : "Vue institutionnelle en lecture seule des dossiers retournes par GET /v1/insurance/applications.";
  const note = tenant.demoMode
    ? "Demo institutionnelle - maquette d'illustration. Les donnees et decisions restent sous controle de l'institution."
    : null;
  const disclaimer = tenant.terminology.decisionDisclaimer;

  return (
    <div className="space-y-6">
      <PageTitle
        title={title}
        description={description}
        forceNonLive={tenantConsistency.checking || tenantConsistency.state !== "MATCH"}
      />

      {note ? <p className="text-xs text-brand-textMuted">{note}</p> : null}

      <p className="text-xs text-brand-textMuted">{disclaimer}</p>

      <ApplicationsLivePanel />
    </div>
  );
}
