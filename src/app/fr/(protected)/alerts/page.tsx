import { AlertTriangle, Bell, BellRing, Info, Waves } from "lucide-react";

import {
  WakamaAlertRow,
  WakamaAlertsTable,
} from "@/components/alerts/wakama-alerts-table";
import { LiveApiStatusNote } from "@/components/ui/live-api-status-note";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getCooperatives,
  getFarmers,
  getParcelles,
  getWakamaAlerts,
} from "@/lib/insurance-service";

export const dynamic = "force-dynamic";

function getLinkedEntityLabel(input: {
  farmerName?: string;
  cooperativeName?: string;
  parcelleName?: string;
  farmerId?: string;
  cooperativeId?: string;
  parcelleId?: string;
}): string {
  if (input.farmerName) return `Agriculteur: ${input.farmerName}`;
  if (input.cooperativeName) return `Cooperative: ${input.cooperativeName}`;
  if (input.parcelleName) return `Parcelle: ${input.parcelleName}`;
  if (input.farmerId) return `Agriculteur: ${input.farmerId}`;
  if (input.cooperativeId) return `Cooperative: ${input.cooperativeId}`;
  if (input.parcelleId) return `Parcelle: ${input.parcelleId}`;
  return "Contexte non renseigne";
}

export default async function AlertsPage() {
  const [alerts, farmers, cooperatives, parcelles] = await Promise.all([
    getWakamaAlerts(),
    getFarmers(),
    getCooperatives(),
    getParcelles(),
  ]);

  const farmerById = new Map(farmers.map((item) => [item.id, item]));
  const cooperativeById = new Map(cooperatives.map((item) => [item.id, item]));
  const parcelleById = new Map(parcelles.map((item) => [item.id, item]));

  const rows: WakamaAlertRow[] = alerts
    .map((alert) => {
      const linkedParcelle = alert.parcelleId ? parcelleById.get(alert.parcelleId) : null;
      const linkedFarmer = alert.farmerId
        ? farmerById.get(alert.farmerId)
        : linkedParcelle?.farmerId
          ? farmerById.get(linkedParcelle.farmerId)
          : null;
      const linkedCooperative = alert.cooperativeId
        ? cooperativeById.get(alert.cooperativeId)
        : linkedParcelle?.cooperativeId
          ? cooperativeById.get(linkedParcelle.cooperativeId)
          : null;

      return {
        id: alert.id,
        title: alert.title ?? alert.message,
        message: alert.message,
        severity: alert.severity,
        type: alert.type ?? "UNKNOWN",
        linkedEntity: getLinkedEntityLabel({
          farmerName: alert.farmerName ?? linkedFarmer?.fullName,
          cooperativeName: alert.cooperativeName ?? linkedCooperative?.name,
          parcelleName: alert.parcelleName ?? linkedParcelle?.name,
          farmerId: alert.farmerId,
          cooperativeId: alert.cooperativeId,
          parcelleId: alert.parcelleId,
        }),
        createdAt: alert.createdAt,
        source: alert.source,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const criticalCount = rows.filter((row) => row.severity === "CRITICAL").length;
  const warningCount = rows.filter((row) => row.severity === "WARNING").length;
  const infoCount = rows.filter((row) => row.severity === "INFO").length;
  const unreadCount = alerts.filter((item) => item.read === false).length;
  const liveCount = alerts.filter((item) => item.source === "LIVE").length;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Alertes Wakama"
        description="Signaux operationnels issus du terrain, des parcelles, des cooperatives, de l'IoT et du monitoring agricole."
      />
      <LiveApiStatusNote />
      <p className="text-xs text-brand-textMuted">
        Ces alertes documentent un risque operationnel. Elles ne declenchent pas automatiquement
        une indemnisation.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total alertes"
          value={String(rows.length)}
          source={liveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={Bell}
        />
        <StatCard
          title="Critiques"
          value={String(criticalCount)}
          source={liveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Warning"
          value={String(warningCount)}
          source={liveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={BellRing}
        />
        <StatCard
          title="Info"
          value={String(infoCount)}
          source={liveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={Info}
        />
        <StatCard
          title="Non lues"
          value={String(unreadCount)}
          hint={`LIVE: ${liveCount} | SEED_DEMO: ${alerts.length - liveCount}`}
          source={liveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={Waves}
        />
      </div>

      <WakamaAlertsTable rows={rows} />
    </div>
  );
}
