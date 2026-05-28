import { Bell, Cpu, Map as MapIcon, Sprout, Users } from "lucide-react";

import {
  CooperativeRow,
  CooperativesTable,
} from "@/components/cooperatives/cooperatives-table";
import { LiveApiStatusNote } from "@/components/ui/live-api-status-note";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getCooperatives,
  getFarmers,
  getIotNodes,
  getParcelles,
  getWakamaAlerts,
} from "@/lib/insurance-service";

export default async function CooperativesPage() {
  const [cooperatives, farmers, parcelles, alerts, iotNodes] = await Promise.all([
    getCooperatives(),
    getFarmers(),
    getParcelles(),
    getWakamaAlerts(),
    getIotNodes(),
  ]);

  const parcelleById = new Map(parcelles.map((item) => [item.id, item]));
  const farmerCooperativeById = new Map<string, string>();

  for (const farmer of farmers) {
    if (farmer.cooperativeId) {
      farmerCooperativeById.set(farmer.id, farmer.cooperativeId);
    }
  }
  for (const parcelle of parcelles) {
    if (parcelle.farmerId && parcelle.cooperativeId && !farmerCooperativeById.has(parcelle.farmerId)) {
      farmerCooperativeById.set(parcelle.farmerId, parcelle.cooperativeId);
    }
  }

  const rows: CooperativeRow[] = cooperatives.map((cooperative) => {
    const cooperativeParcelles = parcelles.filter(
      (parcelle) => parcelle.cooperativeId === cooperative.id,
    );
    const farmersByParcelle = new Set(
      cooperativeParcelles
        .map((parcelle) => parcelle.farmerId)
        .filter((value): value is string => Boolean(value)),
    );
    const fallbackFarmers = farmers.filter((farmer) => farmer.region === cooperative.region);
    const cooperativeAlerts = alerts.filter((alert) => {
      if (alert.cooperativeId === cooperative.id) return true;

      if (alert.parcelleId) {
        const linkedParcelle = parcelleById.get(alert.parcelleId);
        if (linkedParcelle?.cooperativeId === cooperative.id) return true;
      }

      if (alert.farmerId) {
        return farmerCooperativeById.get(alert.farmerId) === cooperative.id;
      }

      return false;
    });
    const cooperativeNodes = iotNodes.filter((node) => node.cooperativeId === cooperative.id);

    return {
      id: cooperative.id,
      name: cooperative.name,
      region: cooperative.region,
      filiere: cooperative.filiere ?? "N/A",
      farmersCount: Math.max(farmersByParcelle.size, fallbackFarmers.length),
      parcellesCount: cooperativeParcelles.length,
      iotCount: cooperativeNodes.length,
      alertsCount: cooperativeAlerts.length,
      source: cooperative.source,
    };
  });

  const linkedFarmers = rows.reduce((sum, row) => sum + row.farmersCount, 0);
  const linkedParcelles = rows.reduce((sum, row) => sum + row.parcellesCount, 0);
  const linkedAlerts = rows.reduce((sum, row) => sum + row.alertsCount, 0);
  const totalIot = rows.reduce((sum, row) => sum + row.iotCount, 0);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Coopératives"
        description="Cooperatives existantes dans la base Wakama, utilisees comme contexte terrain assurance."
      />
      <LiveApiStatusNote />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total cooperatives"
          value={String(cooperatives.length)}
          source="SEED_DEMO"
          icon={Users}
        />
        <StatCard
          title="Agriculteurs lies"
          value={String(linkedFarmers)}
          source="SEED_DEMO"
          icon={Sprout}
        />
        <StatCard
          title="Parcelles liees"
          value={String(linkedParcelles)}
          source="SEED_DEMO"
          icon={MapIcon}
        />
        <StatCard
          title="IoT nodes"
          value={String(totalIot)}
          source="SEED_DEMO"
          icon={Cpu}
        />
        <StatCard
          title="Alertes actives"
          value={String(linkedAlerts)}
          source="SEED_DEMO"
          icon={Bell}
        />
      </div>

      <CooperativesTable rows={rows} />
    </div>
  );
}
