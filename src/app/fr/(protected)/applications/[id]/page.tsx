import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationNextActionCard } from "@/components/applications/application-next-action-card";
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import {
  getFarmers,
  getInsuranceApplicationById,
  getRaxEvaluations,
} from "@/lib/insurance-service";
import { formatDate } from "@/lib/workflow";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const application = await getInsuranceApplicationById(id);
  if (!application) notFound();

  const [farmers, raxEvaluations] = await Promise.all([
    getFarmers(),
    getRaxEvaluations(),
  ]);
  const farmer = farmers.find((item) => item.id === application.farmerId);
  const rax = raxEvaluations.find((item) => item.applicationId === application.id);

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Demande ${application.reference}`}
        description="Vue detaillee du dossier de souscription."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Reference / ID</p>
            <p className="text-lg font-semibold text-slate-100">
              {application.reference} ({application.id})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ApplicationStatusBadge status={application.status} />
            <RiskTierBadge tier={application.riskTier} />
            <DataSourceBadge source={application.source} />
          </div>
        </div>
        <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-3">
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>Culture: {application.cropType}</p>
          <p>Surface declaree: {application.areaHa} ha</p>
          <p>Province/Commune: {application.province ?? farmer?.region ?? "N/A"}</p>
          <p>Date creation: {formatDate(application.createdAt)}</p>
          <p>Derniere mise a jour: {formatDate(application.updatedAt ?? application.createdAt)}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Recommandation non decisionnelle — decision finale reservee a l&apos;assureur.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Timeline du dossier
          </h2>
          <div className="mt-4">
            <ApplicationTimeline
              currentStatus={application.status}
              createdAt={application.createdAt}
              updatedAt={application.updatedAt}
            />
          </div>
        </Card>

        <ApplicationNextActionCard status={application.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Agriculteur et parcelle
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <p>Identite: {farmer?.fullName ?? "N/A"}</p>
            <p>KYC: A confirmer par l&apos;assureur</p>
            <p>Telephone: {farmer?.phone ?? "N/A"}</p>
            <p>Region: {farmer?.region ?? "N/A"}</p>
            <p>Surface declaree: {application.areaHa} ha</p>
            <p>Culture principale: {application.cropType}</p>
            <p>WRS: {typeof rax?.wrsScore === "number" ? rax.wrsScore.toFixed(0) : "N/A"}</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Evidence et integrite
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <p className="flex items-center gap-2">
              Source:
              <DataSourceBadge source={application.source} />
            </p>
            <p>Statut hash d&apos;integrite: En attente de branchement backend</p>
            <p className="text-brand-textMuted">
              L&apos;ancrage Solana sera asynchrone et non bloquant dans les phases
              suivantes.
            </p>
          </div>
          <Link
            href="/fr/monitoring"
            className="mt-4 inline-block rounded-md border border-brand-border px-3 py-2 text-xs text-brand-textMuted transition-colors hover:bg-slate-900 hover:text-slate-100"
          >
            Ouvrir monitoring
          </Link>
        </Card>
      </div>
    </div>
  );
}
