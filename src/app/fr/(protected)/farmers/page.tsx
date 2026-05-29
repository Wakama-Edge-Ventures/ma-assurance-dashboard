import { Bell, Leaf, Map as MapIcon, Users, Waves } from "lucide-react";

import { FarmerRow, FarmersTable } from "@/components/farmers/farmers-table";
import { PageTitle } from "@/components/ui/page-title";
import { AppSection } from "@/components/ui/app-section";
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

  const sharedSource = liveCount > 0 ? "LIVE" : "SEED_DEMO";
  const alertsSource = alerts.some((item) => item.source === "LIVE") ? "LIVE" : "SEED_DEMO";
  const parcellesSource = parcelles.some((item) => item.source === "LIVE") ? "LIVE" : "SEED_DEMO";

  return (
    <div className="space-y-6">
      <PageTitle
        title="Agriculteurs"
        description="Portefeuille agriculteurs existant dans la base Wakama, enrichi pour l'analyse assurance."
      />

      {/* KPI section */}
      <AppSection
        title="Synthèse portefeuille"
        badge={
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/28 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-400">
            <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            live
          </span>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title="Total farmers"
            value={String(farmers.length)}
            source={sharedSource}
            icon={Users}
          />
          <StatCard
            title="Farmers LIVE"
            value={String(liveCount)}
            hint={`SEED_DEMO: ${farmers.length - liveCount}`}
            source={sharedSource}
            icon={Waves}
          />
          <StatCard
            title="Farmers avec alertes"
            value={String(farmersWithAlerts)}
            source={alertsSource}
            icon={Bell}
          />
          <StatCard
            title="Alertes liees"
            value={String(linkedAlertsTotal)}
            source={alertsSource}
            icon={Bell}
          />
          <StatCard
            title="Avec parcelles"
            value={String(withParcelles)}
            source={parcellesSource}
            icon={MapIcon}
          />
          <StatCard
            title="NDVI moyen"
            value={formatScore(avgNdvi)}
            source={parcellesSource}
            icon={Leaf}
          />
        </div>
      </AppSection>

      {/* Table section */}
      <AppSection title="Portefeuille agriculteurs">
        <FarmersTable rows={rows} />
      </AppSection>
    </div>
  );
}
