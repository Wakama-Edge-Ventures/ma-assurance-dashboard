import { apiFetch } from "@/lib/api";
import {
  extractArrayFromApiResponse,
  toCooperative,
  toFarmer,
  toInsuranceMission,
  toParcelle,
  toWakamaAlert,
} from "@/lib/dto-mappers";
import {
  cooperatives as seedCooperativesMa,
  farmers as seedFarmersMa,
  missions as seedMissions,
  parcelles as seedParcellesMa,
  wakamaAlerts as seedWakamaAlertsMa,
} from "@/lib/demo-data";
import type { FieldMapCountryKey } from "@/lib/field-map-country";
import type {
  Cooperative,
  DataSource,
  Farmer,
  InsuranceMission,
  Parcelle,
  WakamaAlert,
} from "@/types";

const USE_LIVE_SHARED_API = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
const USE_LIVE_INSURANCE_API = process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";

export interface FieldMapSnapshot {
  farmers: Farmer[];
  cooperatives: Cooperative[];
  parcelles: Parcelle[];
  alerts: WakamaAlert[];
  missions: InsuranceMission[];
}

function withSource<T extends { source: DataSource }>(
  item: T,
  source: DataSource,
): T {
  return {
    ...item,
    source,
  };
}

function toSeedList<T extends { source: DataSource }>(items: T[]): T[] {
  return items.map((item) => withSource(item, "SEED_DEMO"));
}

function squarePolygon(lat: number, lng: number, halfSideDeg = 0.004): string {
  return JSON.stringify({
    type: "Polygon",
    coordinates: [
      [
        [lng - halfSideDeg, lat - halfSideDeg],
        [lng + halfSideDeg, lat - halfSideDeg],
        [lng + halfSideDeg, lat + halfSideDeg],
        [lng - halfSideDeg, lat + halfSideDeg],
        [lng - halfSideDeg, lat - halfSideDeg],
      ],
    ],
  });
}

// Field-map-only demo fixtures for Cote d'Ivoire tenants. Kept local to this file (instead of
// the shared demo-data.ts) so unrelated pages (farmers/cooperatives tables) are unaffected.
const CI_DEMO_FARMERS: Farmer[] = [
  {
    id: "ci_far_001",
    fullName: "Kouadio Aya",
    nationalIdMasked: "N/A",
    phone: "+2250700000010",
    region: "Yamoussoukro",
    primaryCrop: "Cacao",
    totalAreaHa: 3.2,
    source: "SEED_DEMO",
    lat: 6.8276,
    lng: -5.2893,
  },
  {
    id: "ci_far_002",
    fullName: "Brou Adjoua",
    nationalIdMasked: "N/A",
    phone: "+2250700000011",
    region: "Daloa",
    primaryCrop: "Hevea",
    totalAreaHa: 5.4,
    source: "SEED_DEMO",
    lat: 6.8907,
    lng: -6.4503,
  },
];

const CI_DEMO_COOPERATIVES: Cooperative[] = [
  {
    id: "ci_coop_001",
    name: "Coop Cacao Yamoussoukro",
    region: "Yamoussoukro",
    filiere: "Cacao",
    memberCount: 36,
    aggregatedAreaHa: 180,
    contactName: "Affoue Tanoh",
    source: "SEED_DEMO",
    lat: 6.83,
    lng: -5.29,
  },
];

const CI_DEMO_PARCELLES: Parcelle[] = [
  {
    id: "ci_par_001",
    farmerId: "ci_far_001",
    cooperativeId: "ci_coop_001",
    name: "Parcelle Test CI",
    culture: "Cacao",
    superficie: 2.5,
    areaHa: 2.5,
    lat: 6.8276,
    lng: -5.2893,
    country: "CI",
    polygone: squarePolygon(6.8276, -5.2893),
    ndvi: 0.55,
    status: "ACTIVE",
    source: "SEED_DEMO",
  },
  {
    id: "ci_par_002",
    farmerId: "ci_far_002",
    cooperativeId: "ci_coop_001",
    name: "Parcelle Daloa Sud",
    culture: "Hevea",
    superficie: 5.4,
    areaHa: 5.4,
    lat: 6.8907,
    lng: -6.4503,
    country: "CI",
    polygone: squarePolygon(6.8907, -6.4503),
    ndvi: 0.41,
    status: "WATCH",
    source: "SEED_DEMO",
  },
];

const CI_DEMO_ALERTS: WakamaAlert[] = [
  {
    id: "ci_wal_001",
    farmerId: "ci_far_002",
    cooperativeId: "ci_coop_001",
    parcelleId: "ci_par_002",
    type: "NDVI",
    severity: "WARNING",
    title: "Stress hydrique modere",
    message: "Baisse NDVI observee sur la parcelle de Daloa.",
    read: false,
    createdAt: "2026-06-10",
    source: "SEED_DEMO",
  },
];

interface FieldMapSeedBundle {
  farmers: Farmer[];
  cooperatives: Cooperative[];
  parcelles: Parcelle[];
  alerts: WakamaAlert[];
}

function resolveSeedByCountry(countryKey?: FieldMapCountryKey): FieldMapSeedBundle {
  if (countryKey === "CI") {
    return {
      farmers: CI_DEMO_FARMERS,
      cooperatives: CI_DEMO_COOPERATIVES,
      parcelles: CI_DEMO_PARCELLES,
      alerts: CI_DEMO_ALERTS,
    };
  }

  if (countryKey === "MA") {
    return {
      farmers: seedFarmersMa,
      cooperatives: seedCooperativesMa,
      parcelles: seedParcellesMa,
      alerts: seedWakamaAlertsMa,
    };
  }

  // PANAF / unresolved tenant: neutral pan-African demo union. Items keep their own
  // SEED_DEMO source, so this never gets mislabeled as LIVE data for any single country.
  return {
    farmers: [...seedFarmersMa, ...CI_DEMO_FARMERS],
    cooperatives: [...seedCooperativesMa, ...CI_DEMO_COOPERATIVES],
    parcelles: [...seedParcellesMa, ...CI_DEMO_PARCELLES],
    alerts: [...seedWakamaAlertsMa, ...CI_DEMO_ALERTS],
  };
}

async function fetchStrictList<T extends { source: DataSource }>(
  endpoint: string,
  seed: T[],
  mapper: (raw: unknown) => T | null,
  preferredKeys: string[],
  useLive: boolean,
): Promise<T[]> {
  if (!useLive) {
    return toSeedList(seed);
  }

  try {
    const payload = await apiFetch<unknown>(endpoint);
    const rawList = extractArrayFromApiResponse(payload, preferredKeys);
    const mapped = rawList
      .map((item) => mapper(item))
      .filter((item): item is T => item !== null)
      .map((item) => withSource(item, "LIVE"));

    // A successful but empty live response is truthful and must stay empty.
    if (rawList.length === 0) {
      return [];
    }

    if (mapped.length > 0) {
      return mapped;
    }

    // If the live shape is unusable, prefer the explicit demo fallback over fake live.
    return toSeedList(seed);
  } catch {
    return toSeedList(seed);
  }
}

export async function getFieldMapSnapshot(
  tenantCountryKey?: FieldMapCountryKey,
): Promise<FieldMapSnapshot> {
  const seed = resolveSeedByCountry(tenantCountryKey);
  const countryQuery =
    tenantCountryKey && tenantCountryKey !== "PANAF"
      ? `&country=${encodeURIComponent(tenantCountryKey)}`
      : "";

  const [farmers, cooperatives, parcelles, alerts, missions] = await Promise.all([
    fetchStrictList(
      `/v1/farmers?page=1&pageSize=100${countryQuery}`,
      seed.farmers,
      toFarmer,
      ["farmers", "items", "results", "data"],
      USE_LIVE_SHARED_API,
    ),
    fetchStrictList(
      `/v1/cooperatives?page=1&pageSize=100${countryQuery}`,
      seed.cooperatives,
      toCooperative,
      ["cooperatives", "items", "results", "data"],
      USE_LIVE_SHARED_API,
    ),
    fetchStrictList(
      `/v1/parcelles?page=1&pageSize=100${countryQuery}`,
      seed.parcelles,
      toParcelle,
      ["parcelles", "plots", "items", "results", "data"],
      USE_LIVE_SHARED_API,
    ),
    fetchStrictList(
      `/v1/alerts?page=1&pageSize=100${countryQuery}`,
      seed.alerts,
      toWakamaAlert,
      ["alerts", "items", "results", "data"],
      USE_LIVE_SHARED_API,
    ),
    fetchStrictList(
      "/v1/insurance/missions",
      seedMissions,
      toInsuranceMission,
      ["missions", "items", "results", "data"],
      USE_LIVE_INSURANCE_API,
    ),
  ]);

  return {
    farmers,
    cooperatives,
    parcelles,
    alerts,
    missions,
  };
}
