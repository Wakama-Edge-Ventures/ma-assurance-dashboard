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
    ? "Dossiers assurance agricole"
    : tenant.terminology.applicationsLabel;
  const description = isAssuranceTenant
    ? "File operationnelle des dossiers, de leurs statuts et de leurs pieces de preuve en lecture encadree."
    : "Vue institutionnelle en lecture seule des dossiers retournes par le pipeline documentaire.";
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
