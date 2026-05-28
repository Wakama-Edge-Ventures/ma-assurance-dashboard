import { Bell, Leaf, Map as MapIcon, Users, Waves } from "lucide-react";

import { FarmerRow, FarmersTable } from "@/components/farmers/farmers-table";
import { LiveApiStatusNote } from "@/components/ui/live-api-status-note";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getCooperatives,
  getFarmers,
  getParcelles,
  getWakamaAlerts,
} from "@/lib/insurance-service";
import { formatScore } from "@/lib/workflow";

export const dynamic = "force-dynamic";

const severityOrder: Record<string, number> = {
  UNKNOWN: 0,
  INFO: 1,
  WARNING: 2,
  CRITICAL: 3,
};

export default async function FarmersPage() {
  const [farmers, parcelles, alerts, cooperatives] = await Promise.all([
    getFarmers(),
    getParcelles(),
    getWakamaAlerts(),
    getCooperatives(),
  ]);

  const cooperativeById = new Map(cooperatives.map((item) => [item.id, item]));
  const parcelleById = new Map(parcelles.map((item) => [item.id, item]));

  const rows: FarmerRow[] = farmers.map((farmer) => {
    const farmerParcelles = parcelles.filter((parcelle) => parcelle.farmerId === farmer.id);
    const linkedAlerts = alerts.filter((alert) => {
      if (alert.farmerId === farmer.id) return true;
      if (!alert.farmerId && alert.parcelleId) {
        return parcelleById.get(alert.parcelleId)?.farmerId === farmer.id;
      }
      return false;
    });
    const farmerAlertIds = new Set(linkedAlerts.map((alert) => alert.id));
    const highestAlertSeverity = linkedAlerts.reduce<FarmerRow["highestAlertSeverity"]>(
      (highest, current) => {
        if (!highest) return current.severity;
        return severityOrder[current.severity] > severityOrder[highest]
          ? current.severity
          : highest;
      },
      null,
    );
    const cooperative =
      farmer.cooperativeId ??
      farmerParcelles.find((item) => item.cooperativeId)?.cooperativeId ??
      null;
    return {
      id: farmer.id,
      fullName: farmer.fullName,
      phone: farmer.phone,
      region: farmer.region,
      cooperativeName: cooperative
        ? cooperativeById.get(cooperative)?.name ?? "N/A"
        : "N/A",
      parcellesCount: farmerParcelles.length,
      alertsCount: farmerAlertIds.size,
      highestAlertSeverity,
      source: farmer.source,
    };
  });

  const withParcelles = rows.filter((row) => row.parcellesCount > 0).length;
  const linkedAlertsTotal = rows.reduce((sum, row) => sum + row.alertsCount, 0);
  const farmersWithAlerts = rows.filter((row) => row.alertsCount > 0).length;
  const ndviValues = parcelles
    .map((parcelle) => parcelle.ndvi)
    .filter((value): value is number => typeof value === "number");
  const avgNdvi =
    ndviValues.reduce((sum, value) => sum + value, 0) / Math.max(ndviValues.length, 1);
  const liveCount = farmers.filter((item) => item.source === "LIVE").length;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Agriculteurs"
        description="Portefeuille agriculteurs existant dans la base Wakama, enrichi pour l'analyse assurance."
      />
      <LiveApiStatusNote />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          title="Total farmers"
          value={String(farmers.length)}
          source={liveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={Users}
        />
        <StatCard
          title="Farmers LIVE"
          value={String(liveCount)}
          hint={`SEED_DEMO: ${farmers.length - liveCount}`}
          source={liveCount > 0 ? "LIVE" : "SEED_DEMO"}
          icon={Waves}
        />
        <StatCard
          title="Farmers avec alertes"
          value={String(farmersWithAlerts)}
          source={alerts.some((item) => item.source === "LIVE") ? "LIVE" : "SEED_DEMO"}
          icon={Bell}
        />
        <StatCard
          title="Alertes liees"
          value={String(linkedAlertsTotal)}
          source={alerts.some((item) => item.source === "LIVE") ? "LIVE" : "SEED_DEMO"}
          icon={Bell}
        />
        <StatCard
          title="Avec parcelles"
          value={String(withParcelles)}
          source={parcelles.some((item) => item.source === "LIVE") ? "LIVE" : "SEED_DEMO"}
          icon={MapIcon}
        />
        <StatCard
          title="NDVI moyen"
          value={formatScore(avgNdvi)}
          source={parcelles.some((item) => item.source === "LIVE") ? "LIVE" : "SEED_DEMO"}
          icon={Leaf}
        />
      </div>

      <FarmersTable rows={rows} />
    </div>
  );
}
