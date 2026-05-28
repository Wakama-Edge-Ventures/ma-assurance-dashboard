import { AlertTriangle, Cpu, FileText } from "lucide-react";

import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  getInsuranceApplications,
  getSharedWakamaDataOverview,
} from "@/lib/insurance-service";
import { formatDate } from "@/lib/workflow";

export const dynamic = "force-dynamic";

function getAlertLinkLabel(alert: {
  farmerName?: string;
  farmerId?: string;
  cooperativeName?: string;
  cooperativeId?: string;
  parcelleName?: string;
  parcelleId?: string;
}) {
  const farmerLabel = alert.farmerName ?? alert.farmerId;
  const coopLabel = alert.cooperativeName ?? alert.cooperativeId;
  const parcelleLabel = alert.parcelleName ?? alert.parcelleId;

  return [
    farmerLabel ? `Agriculteur: ${farmerLabel}` : null,
    coopLabel ? `Cooperative: ${coopLabel}` : null,
    parcelleLabel ? `Parcelle: ${parcelleLabel}` : null,
  ]
    .filter(Boolean)
    .join(" - ");
}

export default async function DashboardPage() {
  const [applications, sharedOverview] = await Promise.all([
    getInsuranceApplications(),
    getSharedWakamaDataOverview(),
  ]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard"
        description="Vue d'ensemble operationnelle des flux assurance agricole et des donnees Wakama partagees."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applications assurance"
          value={String(applications.length)}
          hint="Workflow assurance en mode SEED_DEMO"
          source="SEED_DEMO"
          icon={FileText}
        />
        <StatCard
          title="Alertes Wakama actives"
          value={String(sharedOverview.criticalAlertsCount + sharedOverview.warningAlertsCount)}
          hint="Signaux operationnels contextuels"
          source={sharedOverview.wakamaAlertsLiveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Alertes critiques"
          value={String(sharedOverview.criticalAlertsCount)}
          hint={`Warning: ${sharedOverview.warningAlertsCount} | Info: ${sharedOverview.infoAlertsCount}`}
          source={sharedOverview.wakamaAlertsLiveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={AlertTriangle}
        />
        <StatCard
          title="IoT nodes"
          value={String(sharedOverview.iotNodesCount)}
          hint={`LIVE: ${sharedOverview.iotNodesLiveCount} | SEED_DEMO: ${sharedOverview.iotNodesSeedDemoCount}`}
          source={sharedOverview.iotNodesLiveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={Cpu}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Donnees Wakama live
          </h2>
          <span className="text-xs text-brand-textMuted">
            Ces alertes sont des signaux operationnels Wakama, pas des decisions sinistre.
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Agriculteurs</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{sharedOverview.farmersCount}</p>
            <p className="text-xs text-brand-textMuted">
              LIVE: {sharedOverview.farmersLiveCount} | SEED_DEMO: {sharedOverview.farmersSeedDemoCount}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Cooperatives</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{sharedOverview.cooperativesCount}</p>
            <p className="text-xs text-brand-textMuted">
              LIVE: {sharedOverview.cooperativesLiveCount} | SEED_DEMO: {sharedOverview.cooperativesSeedDemoCount}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Parcelles</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{sharedOverview.parcellesCount}</p>
            <p className="text-xs text-brand-textMuted">
              LIVE: {sharedOverview.parcellesLiveCount} | SEED_DEMO: {sharedOverview.parcellesSeedDemoCount}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Alertes Wakama</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{sharedOverview.wakamaAlertsCount}</p>
            <p className="text-xs text-brand-textMuted">
              LIVE: {sharedOverview.wakamaAlertsLiveCount} | SEED_DEMO: {sharedOverview.wakamaAlertsSeedDemoCount}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Sources globales</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">
              {sharedOverview.liveCount} / {sharedOverview.seedDemoCount}
            </p>
            <p className="text-xs text-brand-textMuted">LIVE / SEED_DEMO</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Alertes Wakama recentes
        </h2>
        <div className="mt-4 space-y-3">
          {sharedOverview.recentAlerts.length === 0 ? (
            <p className="text-sm text-brand-textMuted">Aucune alerte contextuelle disponible.</p>
          ) : (
            sharedOverview.recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{alert.title ?? alert.message}</p>
                    <p className="text-xs text-brand-textMuted">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.type ? (
                      <span className="rounded-full border border-brand-border px-2 py-0.5 text-[11px] text-brand-textMuted">
                        {alert.type}
                      </span>
                    ) : null}
                    <WakamaAlertSeverityBadge severity={alert.severity} />
                    <DataSourceBadge source={alert.source} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-brand-textMuted">
                  {getAlertLinkLabel(alert) || "Lien entite non renseigne"} - {formatDate(alert.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Dernieres applications
        </h2>
        <div className="mt-4 space-y-3">
          {applications.map((application) => (
            <div
              key={application.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-100">{application.reference}</p>
                <p className="text-xs text-brand-textMuted">{application.insurerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <DataSourceBadge source={application.source} />
                <RiskTierBadge tier={application.riskTier} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          A implementer ensuite
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-brand-textMuted">
          <li>- Timeline de dossier multi-etapes avec preuves d&apos;integrite horodatee.</li>
          <li>- Connecteurs NDVI/meteo/IoT affines pour monitoring continu.</li>
          <li>- Actions de triage collaboratif entre assureur et operateurs terrain.</li>
        </ul>
      </Card>
    </div>
  );
}
