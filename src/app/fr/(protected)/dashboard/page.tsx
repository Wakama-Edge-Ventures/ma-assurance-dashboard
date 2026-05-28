import { AlertTriangle, FileText, Map as MapIcon, Users } from "lucide-react";

import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  getCooperatives,
  getDashboardOverview,
  getFarmers,
  getParcelles,
  getWakamaAlerts,
} from "@/lib/insurance-service";
import { formatDate } from "@/lib/workflow";

export default async function DashboardPage() {
  const [{ applications }, farmers, cooperatives, parcelles, wakamaAlerts] =
    await Promise.all([
      getDashboardOverview(),
      getFarmers(),
      getCooperatives(),
      getParcelles(),
      getWakamaAlerts(),
    ]);
  const activeAlerts = wakamaAlerts.filter((alert) => alert.severity !== "INFO").length;
  const farmerById = new Map(farmers.map((item) => [item.id, item]));
  const parcelleById = new Map(parcelles.map((item) => [item.id, item]));
  const recentWakamaAlerts = [...wakamaAlerts]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard"
        description="Vue d'ensemble operationnelle des flux assurance agricole."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applications ouvertes"
          value={String(applications.length)}
          hint="Pipelines techniques en cours"
          source="SEED_DEMO"
          icon={FileText}
        />
        <StatCard
          title="Agriculteurs / cooperatives"
          value={`${farmers.length} / ${cooperatives.length}`}
          hint="Contexte terrain partage Wakama"
          source="SEED_DEMO"
          icon={Users}
        />
        <StatCard
          title="Parcelles suivies"
          value={String(parcelles.length)}
          hint="Surfaces observees en read-only"
          source="SEED_DEMO"
          icon={MapIcon}
        />
        <StatCard
          title="Alertes actives Wakama"
          value={String(activeAlerts)}
          hint="Surveillance non bloquante"
          source="SEED_DEMO"
          icon={AlertTriangle}
        />
      </div>

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
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Alertes Wakama recentes
          </h2>
          <span className="text-xs text-brand-textMuted">
            Alertes Wakama = signaux operationnels existants, non decisions sinistre.
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {recentWakamaAlerts.length === 0 ? (
            <p className="text-sm text-brand-textMuted">
              Aucune alerte contextuelle disponible.
            </p>
          ) : (
            recentWakamaAlerts.map((alert) => {
              const linkedParcelle = alert.parcelleId
                ? parcelleById.get(alert.parcelleId)
                : null;
              const linkedFarmer = alert.farmerId
                ? farmerById.get(alert.farmerId)
                : linkedParcelle?.farmerId
                  ? farmerById.get(linkedParcelle.farmerId)
                  : null;

              return (
                <div
                  key={alert.id}
                  className="rounded-lg border border-brand-border bg-slate-900/50 px-3 py-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {alert.title ?? alert.message}
                      </p>
                      <p className="text-xs text-brand-textMuted">{alert.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <WakamaAlertSeverityBadge severity={alert.severity} />
                      <DataSourceBadge source={alert.source} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-brand-textMuted">
                    {linkedFarmer ? `Agriculteur: ${linkedFarmer.fullName}` : "Agriculteur: N/A"}{" "}
                    -{" "}
                    {linkedParcelle ? `Parcelle: ${linkedParcelle.name}` : "Parcelle: N/A"} -{" "}
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          A implementer ensuite
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-brand-textMuted">
          <li>- Timeline de dossier multi-etapes avec preuves d&apos;integrite horodatee.</li>
          <li>- Widgets live relies a l&apos;API `https://api.wakama.farm`.</li>
          <li>
            - Actions de triage collaboratif entre assureur et operateurs terrain.
          </li>
        </ul>
      </Card>
    </div>
  );
}
