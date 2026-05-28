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

export default async function FarmersPage() {
  const [farmers, parcelles, alerts, cooperatives] = await Promise.all([
    getFarmers(),
    getParcelles(),
    getWakamaAlerts(),
    getCooperatives(),
  ]);

  const cooperativeById = new Map(cooperatives.map((item) => [item.id, item]));

  const rows: FarmerRow[] = farmers.map((farmer) => {
    const farmerParcelles = parcelles.filter((parcelle) => parcelle.farmerId === farmer.id);
    const farmerAlerts = alerts.filter((alert) => alert.farmerId === farmer.id);
    const cooperative =
      farmerParcelles.find((item) => item.cooperativeId)?.cooperativeId ?? null;
    return {
      id: farmer.id,
      fullName: farmer.fullName,
      phone: farmer.phone,
      region: farmer.region,
      cooperativeName: cooperative
        ? cooperativeById.get(cooperative)?.name ?? "N/A"
        : "N/A",
      parcellesCount: farmerParcelles.length,
      alertsCount: farmerAlerts.length,
      source: farmer.source,
    };
  });

  const withParcelles = rows.filter((row) => row.parcellesCount > 0).length;
  const activeAlerts = alerts.filter((alert) => alert.severity !== "INFO").length;
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total farmers"
          value={String(farmers.length)}
          source="SEED_DEMO"
          icon={Users}
        />
        <StatCard
          title="Avec parcelles"
          value={String(withParcelles)}
          source="SEED_DEMO"
          icon={MapIcon}
        />
        <StatCard
          title="Alertes actives"
          value={String(activeAlerts)}
          source="SEED_DEMO"
          icon={Bell}
        />
        <StatCard
          title="NDVI moyen"
          value={formatScore(avgNdvi)}
          source="SEED_DEMO"
          icon={Leaf}
        />
        <StatCard
          title="LIVE / DEMO"
          value={`${liveCount} / ${farmers.length - liveCount}`}
          source="SEED_DEMO"
          icon={Waves}
        />
      </div>

      <FarmersTable rows={rows} />
    </div>
  );
}
