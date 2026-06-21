import { Bell, Leaf, Map as MapIcon, Users, Waves } from "lucide-react";

import { FarmerRow, FarmersTable } from "@/components/farmers/farmers-table";
import { AppSection } from "@/components/ui/app-section";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { EmptyLiveDataCard } from "@/components/ui/empty-live-data-card";
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
  const demoFallbackEnabled = process.env.NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK === "true";

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
      farmer.cooperativeId ?? farmerParcelles.find((item) => item.cooperativeId)?.cooperativeId ?? null;

    return {
      id: farmer.id,
      fullName: farmer.fullName,
      phone: farmer.phone,
      region: farmer.region,
      cooperativeName: cooperative ? cooperativeById.get(cooperative)?.name ?? "N/A" : "N/A",
      parcellesCount: farmerParcelles.length,
      alertsCount: farmerAlertIds.size,
      highestAlertSeverity,
      source: farmer.source,
    };
  });

  const liveRows = rows.filter((row) => row.source === "LIVE");
  const seedDemoRows = rows.filter((row) => row.source === "SEED_DEMO");

  const liveFarmersCount = liveRows.length;
  const fallbackFarmersDisplayed = demoFallbackEnabled ? seedDemoRows.length : 0;
  const liveParcellesCount = parcelles.filter((item) => item.source === "LIVE").length;
  const liveAlertsCount = alerts.filter((item) => item.source === "LIVE").length;

  const farmersWithAlerts = rows.filter((row) => row.alertsCount > 0).length;
  const linkedAlertsTotal = rows.reduce((sum, row) => sum + row.alertsCount, 0);
  const withParcelles = rows.filter((row) => row.parcellesCount > 0).length;

  const ndviValues = parcelles
    .map((parcelle) => parcelle.ndvi)
    .filter((value): value is number => typeof value === "number");
  const avgNdvi =
    ndviValues.reduce((sum, value) => sum + value, 0) / Math.max(ndviValues.length, 1);

  const showLiveEmptyState = liveFarmersCount === 0;
  const showDemoPreview = demoFallbackEnabled && seedDemoRows.length > 0;
  const showDemoWarningBanner = showLiveEmptyState && showDemoPreview;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Agriculteurs"
        description="Portefeuille agriculteurs — données live ou fallback demo selon disponibilité"
      />

      <AppSection title="Synthese portefeuille">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Farmers LIVE" value={String(liveFarmersCount)} source="LIVE" icon={Users} />
          <StatCard
            title="Farmers affiches en fallback demo"
            value={String(fallbackFarmersDisplayed)}
            hint="SEED_DEMO"
            source="SEED_DEMO"
            icon={Waves}
          />
          <StatCard
            title="Parcelles LIVE"
            value={String(liveParcellesCount)}
            source="LIVE"
            icon={MapIcon}
          />
          <StatCard
            title="Alertes LIVE"
            value={String(liveAlertsCount)}
            source="LIVE"
            icon={Bell}
          />
          <StatCard
            title="Farmers avec alertes"
            value={String(farmersWithAlerts)}
            source={liveAlertsCount > 0 ? "LIVE" : fallbackFarmersDisplayed > 0 ? "SEED_DEMO" : "UNAVAILABLE"}
            icon={Bell}
          />
          <StatCard
            title="Parcelles / NDVI"
            value={String(withParcelles)}
            hint={"NDVI " + formatScore(avgNdvi) + " · alertes liees " + linkedAlertsTotal}
            source={liveParcellesCount > 0 ? "LIVE" : fallbackFarmersDisplayed > 0 ? "SEED_DEMO" : "UNAVAILABLE"}
            icon={Leaf}
          />
        </div>
      </AppSection>

      {showDemoWarningBanner ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Les agriculteurs affiches ci-dessous sont des exemples SEED_DEMO. Aucun agriculteur LIVE n&apos;est encore enregistre dans le backend assurance.
        </div>
      ) : null}

      {showLiveEmptyState ? (
        <EmptyLiveDataCard
          title="Aucun agriculteur LIVE"
          description="Le backend assurance est pret, mais les vrais agriculteurs seront crees via le tunnel Farmer/Agent."
        />
      ) : null}

      {liveRows.length > 0 ? (
        <AppSection
          title="Portefeuille agriculteurs — données live ou fallback demo selon disponibilité"
          subtitle="Les lignes SEED_DEMO servent uniquement à prévisualiser l’interface tant qu’aucun farmer live n’est enregistré."
        >
          <p className="text-[13px] text-slate-300">Portefeuille live — agriculteurs enregistrés</p>
          <div className="mt-3">
            <FarmersTable rows={liveRows} />
          </div>
        </AppSection>
      ) : null}

      {showDemoPreview ? (
        <AppSection
          title="Prévisualisation SEED_DEMO"
          subtitle="Les lignes SEED_DEMO servent uniquement à prévisualiser l’interface tant qu’aucun farmer live n’est enregistré."
        >
          <p className="text-[13px] text-slate-300">Portefeuille demo — exemples non réels</p>
          <div className="mt-3">
            <FarmersTable rows={seedDemoRows} />
          </div>
        </AppSection>
      ) : null}

      <DisclosureNote />
    </div>
  );
}
