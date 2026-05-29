import Link from "next/link";
import { notFound } from "next/navigation";

import { MonitoringNextActionCard } from "@/components/monitoring/monitoring-next-action-card";
import { MonitoringSeverityBadge } from "@/components/monitoring/monitoring-severity-badge";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { PolicyStatusBadge } from "@/components/policies/policy-status-badge";
import {
  getFarmers,
  getInsuranceApplications,
  getInsurancePolicies,
  getMonitoringAlertById,
} from "@/lib/insurance-service";
import {
  formatDate,
  formatMAD,
  getMonitoringSignalTypeLabel,
  getMonitoringStatusLabel,
} from "@/lib/workflow";

interface MonitoringDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function MonitoringDetailPage({ params }: MonitoringDetailPageProps) {
  const { id } = await params;
  const alert = await getMonitoringAlertById(id);
  if (!alert) notFound();

  const [policies, applications, farmers] = await Promise.all([
    getInsurancePolicies(),
    getInsuranceApplications(),
    getFarmers(),
  ]);

  const policy = policies.find((item) => item.id === alert.policyId) ?? null;
  const application =
    (alert.applicationId
      ? applications.find((item) => item.id === alert.applicationId)
      : null) ?? (policy ? applications.find((item) => item.id === policy.applicationId) : null);
  const farmer =
    (alert.farmerId ? farmers.find((item) => item.id === alert.farmerId) : null) ??
    (application ? farmers.find((item) => item.id === application.farmerId) : null);

  const severity = alert.severity ?? alert.level;
  const type = alert.type ?? "SYSTEM";
  const status = alert.status ?? (alert.resolved ? "RESOLVED" : "OPEN");
  const message = alert.message ?? alert.title;

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Signal ${alert.id}`}
        description="Detail signal de monitoring post-police."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">
              Alert / Signal ID
            </p>
            <p className="text-lg font-semibold text-white">{alert.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <MonitoringSeverityBadge severity={severity} />
            <DataSourceBadge source={alert.source} />
          </div>
        </div>
        <div className="grid gap-3 text-[13px] text-slate-300 md:grid-cols-3">
          <p>Police liee: {policy?.policyNumber ?? alert.policyId}</p>
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>Type: {getMonitoringSignalTypeLabel(type)}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Signal de monitoring non decisionnel - decision sinistre reservee a l&apos;assureur.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Explication du signal
          </h2>
          <div className="mt-3 space-y-2 text-[13px] text-slate-300">
            <p>Type: {getMonitoringSignalTypeLabel(type)}</p>
            <p>Severite: {severity}</p>
            <p>Message: {message}</p>
            <p>Cree le: {formatDate(alert.createdAt)}</p>
            <p>Statut: {getMonitoringStatusLabel(status)}</p>
            <p className="flex items-center gap-2">
              Source:
              <DataSourceBadge source={alert.source} />
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Police liee
          </h2>
          {policy ? (
            <div className="mt-3 space-y-2 text-[13px] text-slate-300">
              <p>
                Police: {policy.policyNumber} ({policy.id})
              </p>
              <div className="flex items-center gap-2">
                <PolicyStatusBadge status={policy.status} />
              </div>
              <p>
                Couverture: {formatDate(policy.coverageStartDate ?? policy.effectiveDate)} -{" "}
                {formatDate(policy.coverageEndDate ?? policy.expiryDate)}
              </p>
              <p>Capital assure: {formatMAD(policy.totalInsuredCapital ?? policy.coverageMad)}</p>
              <Link
                href={`/fr/policies/${policy.id}`}
                className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
              >
                Ouvrir la police
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-brand-textMuted">Police non disponible.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Contexte agriculteur / demande
          </h2>
          <div className="mt-3 space-y-2 text-[13px] text-slate-300">
            <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
            <p>Telephone: {farmer?.phone ?? "N/A"}</p>
            <p>Region: {farmer?.region ?? "N/A"}</p>
            <p>
              Culture/surface: {application?.cropType ?? "N/A"} / {application?.areaHa ?? 0} ha
            </p>
            {application ? (
              <Link
                href={`/fr/applications/${application.id}`}
                className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
              >
                Ouvrir la demande
              </Link>
            ) : null}
          </div>
        </Card>

        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Evidence (placeholder)
          </h2>
          <div className="mt-3 space-y-2 text-[13px] text-slate-300">
            {type === "NDVI" ? <p>NDVI indicatif: baisse detectee par rapport au baseline.</p> : null}
            {type === "WEATHER" ? (
              <p>Meteo indicative: signal pluie/temperature hors plage saisonniere.</p>
            ) : null}
            {type === "IOT" ? <p>IoT indicatif: variation capteur humidite/pression.</p> : null}
            {type === "FIELD" ? <p>Terrain indicatif: observation agent a confirmer.</p> : null}
            {type === "SYSTEM" ? (
              <p className="text-brand-textMuted">Donnees detaillees a connecter.</p>
            ) : null}
            <p className="text-xs text-brand-textMuted">
              Les historiques NDVI et meteo seront separes des donnees live pour conserver la
              stabilite du MVP.
            </p>
          </div>
        </Card>
      </div>

      <MonitoringNextActionCard severity={severity} policyId={policy?.id} />
    </div>
  );
}
