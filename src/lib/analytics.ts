/**
 * analytics.ts
 * Pure helper functions that derive analytics data from raw entity arrays.
 * All functions are synchronous — fetch upstream, pass results here.
 */

import {
  Farmer,
  InsuranceApplication,
  InsuranceMission,
  Parcelle,
  RaxEvaluation,
  RiskTier,
  WakamaAlert,
} from "@/types";

// ─── Region stats ────────────────────────────────────────────────────────────

export interface RegionStat {
  region: string;
  farmersCount: number;
  alertsCount: number;
  criticalCount: number;
  avgWrs: number;
  dominantCrop: string;
}

/**
 * Groups farmers by region. For each region:
 *  - counts WakamaAlerts whose farmerId matches a farmer in that region
 *  - computes average wrsScore from RaxEvaluations linked via applications
 *  - picks the dominant primaryCrop
 * Sorted by alertsCount descending.
 */
export function buildRegionStats(
  farmers: Farmer[],
  alerts: WakamaAlert[],
  raxEvals: RaxEvaluation[],
  applications: InsuranceApplication[],
): RegionStat[] {
  // Map applicationId → wrsScore for quick lookup
  const appWrs = new Map<string, number>();
  for (const eval_ of raxEvals) {
    appWrs.set(eval_.applicationId, eval_.wrsScore);
  }

  // Map farmerId → wrsScores[] (a farmer may have multiple applications)
  const farmerWrs = new Map<string, number[]>();
  for (const app of applications) {
    const wrs = appWrs.get(app.id);
    if (wrs !== undefined) {
      const arr = farmerWrs.get(app.farmerId) ?? [];
      arr.push(wrs);
      farmerWrs.set(app.farmerId, arr);
    }
  }

  // Group farmers by region
  const regionFarmers = new Map<string, Farmer[]>();
  for (const farmer of farmers) {
    const key = farmer.region || "Inconnue";
    const arr = regionFarmers.get(key) ?? [];
    arr.push(farmer);
    regionFarmers.set(key, arr);
  }

  const stats: RegionStat[] = [];

  for (const [region, regionFarmerList] of regionFarmers) {
    const farmerIds = new Set(regionFarmerList.map((f) => f.id));

    // Count alerts matching farmers in this region
    let alertsCount = 0;
    let criticalCount = 0;
    for (const alert of alerts) {
      if (alert.farmerId && farmerIds.has(alert.farmerId)) {
        alertsCount++;
        if (alert.severity === "CRITICAL") criticalCount++;
      }
    }

    // Compute avgWrs across all WRS scores for farmers in this region
    const wrsScores: number[] = [];
    for (const farmer of regionFarmerList) {
      const scores = farmerWrs.get(farmer.id);
      if (scores) wrsScores.push(...scores);
    }
    const avgWrs =
      wrsScores.length > 0
        ? wrsScores.reduce((s, v) => s + v, 0) / wrsScores.length
        : 0;

    // Pick dominant crop
    const cropCounts = new Map<string, number>();
    for (const farmer of regionFarmerList) {
      const crop = farmer.primaryCrop || "Inconnue";
      cropCounts.set(crop, (cropCounts.get(crop) ?? 0) + 1);
    }
    let dominantCrop = "Inconnue";
    let maxCount = 0;
    for (const [crop, count] of cropCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantCrop = crop;
      }
    }

    stats.push({
      region,
      farmersCount: regionFarmerList.length,
      alertsCount,
      criticalCount,
      avgWrs,
      dominantCrop,
    });
  }

  return stats.sort((a, b) => b.alertsCount - a.alertsCount);
}

// ─── Culture stats ────────────────────────────────────────────────────────────

export interface CultureStat {
  culture: string;
  farmersCount: number;
  parcellesCount: number;
  avgNdvi: number;
  alertsCount: number;
}

/**
 * Groups farmers by primaryCrop, also counts parcelles whose culture matches.
 * avgNdvi comes from matching parcelles (ndvi field).
 * alertsCount counts WakamaAlerts matching farmers in that crop group.
 * Sorted by farmersCount descending.
 */
export function buildCultureStats(
  farmers: Farmer[],
  parcelles: Parcelle[],
  alerts: WakamaAlert[],
): CultureStat[] {
  // Build map: culture → farmers
  const cultureFarmers = new Map<string, Farmer[]>();
  for (const farmer of farmers) {
    const key = farmer.primaryCrop || "Inconnue";
    const arr = cultureFarmers.get(key) ?? [];
    arr.push(farmer);
    cultureFarmers.set(key, arr);
  }

  // Build map: culture → parcelles (by parcelle.culture)
  const cultureParcelles = new Map<string, Parcelle[]>();
  for (const parcelle of parcelles) {
    const key = parcelle.culture || "Inconnue";
    const arr = cultureParcelles.get(key) ?? [];
    arr.push(parcelle);
    cultureParcelles.set(key, arr);
  }

  // Collect all unique cultures across farmers and parcelles
  const allCultures = new Set([...cultureFarmers.keys(), ...cultureParcelles.keys()]);

  const stats: CultureStat[] = [];

  for (const culture of allCultures) {
    const cFarmers = cultureFarmers.get(culture) ?? [];
    const cParcelles = cultureParcelles.get(culture) ?? [];

    const farmerIds = new Set(cFarmers.map((f) => f.id));

    // Count alerts whose farmerId is in this culture's farmers
    let alertsCount = 0;
    for (const alert of alerts) {
      if (alert.farmerId && farmerIds.has(alert.farmerId)) {
        alertsCount++;
      }
    }

    // avgNdvi from parcelles with a defined ndvi
    const ndviValues = cParcelles
      .map((p) => p.ndvi)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const avgNdvi =
      ndviValues.length > 0
        ? ndviValues.reduce((s, v) => s + v, 0) / ndviValues.length
        : 0;

    stats.push({
      culture,
      farmersCount: cFarmers.length,
      parcellesCount: cParcelles.length,
      avgNdvi,
      alertsCount,
    });
  }

  return stats.sort((a, b) => b.farmersCount - a.farmersCount);
}

// ─── Alert type stats ─────────────────────────────────────────────────────────

export interface AlertTypeStat {
  type: string;
  label: string;
  count: number;
  critical: number;
  warning: number;
  info: number;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  NDVI: "NDVI satellite",
  METEO: "Météo",
  IOT: "Capteurs IoT",
  OTHER: "Autre",
};

/**
 * Groups WakamaAlerts by their type field (NDVI | METEO | IOT | OTHER).
 * Unknown types are bucketed as OTHER.
 */
export function buildAlertTypeStats(alerts: WakamaAlert[]): AlertTypeStat[] {
  const buckets = new Map<string, AlertTypeStat>();

  const canonicalType = (raw?: string): string => {
    if (!raw) return "OTHER";
    const upper = raw.toUpperCase();
    if (upper === "NDVI") return "NDVI";
    if (upper === "METEO" || upper === "WEATHER") return "METEO";
    if (upper === "IOT") return "IOT";
    return "OTHER";
  };

  for (const alert of alerts) {
    const type = canonicalType(alert.type);
    const existing = buckets.get(type) ?? {
      type,
      label: ALERT_TYPE_LABELS[type] ?? "Autre",
      count: 0,
      critical: 0,
      warning: 0,
      info: 0,
    };

    existing.count++;
    if (alert.severity === "CRITICAL") existing.critical++;
    else if (alert.severity === "WARNING") existing.warning++;
    else existing.info++;

    buckets.set(type, existing);
  }

  return Array.from(buckets.values()).sort((a, b) => b.count - a.count);
}

// ─── Risk tier distribution ───────────────────────────────────────────────────

/**
 * Counts RaxEvaluations per riskTier.
 */
export function buildRiskTierDist(raxEvals: RaxEvaluation[]): Record<RiskTier, number> {
  const dist: Record<RiskTier, number> = {
    LOW_RISK: 0,
    MEDIUM_RISK: 0,
    HIGH_RISK: 0,
    UNINSURABLE: 0,
  };
  for (const eval_ of raxEvals) {
    if (eval_.riskTier in dist) {
      dist[eval_.riskTier]++;
    }
  }
  return dist;
}

// ─── Mission stats ────────────────────────────────────────────────────────────

/**
 * Counts InsuranceMissions per status string.
 */
export function buildMissionStats(missions: InsuranceMission[]): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const mission of missions) {
    stats[mission.status] = (stats[mission.status] ?? 0) + 1;
  }
  return stats;
}
