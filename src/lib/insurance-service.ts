import { apiFetch } from "@/lib/api";
import { normalizeSource, withSource } from "@/lib/data-source";
import {
  applications as seedApplications,
  claims as seedClaims,
  cooperatives as seedCooperatives,
  farmers as seedFarmers,
  missions as seedMissions,
  monitoringAlerts as seedMonitoringAlerts,
  policies as seedPolicies,
  pricingOffers as seedPricingOffers,
  raxEvaluations as seedRaxEvaluations,
} from "@/lib/demo-data";
import {
  CommercialOffer,
  Cooperative,
  Farmer,
  InsuranceApplication,
  InsuranceClaim,
  InsuranceMission,
  InsurancePolicy,
  MonitoringAlert,
  RaxEvaluation,
} from "@/types";

const USE_LIVE_API = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";

interface DashboardOverview {
  applications: InsuranceApplication[];
  missions: InsuranceMission[];
  raxEvaluations: RaxEvaluation[];
  commercialOffers: CommercialOffer[];
  policies: InsurancePolicy[];
  monitoringAlerts: MonitoringAlert[];
  claims: InsuranceClaim[];
  farmers: Farmer[];
  cooperatives: Cooperative[];
}

function warnFallback(endpoint: string, error: unknown) {
  console.warn("[Wakama API fallback]", endpoint, error);
}

function normalizeArraySource<T extends { source?: unknown }>(
  items: T[],
  fallback: "LIVE" | "SEED_DEMO",
) {
  return items.map((item) =>
    withSource(item, normalizeSource(item.source, fallback)),
  );
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }
  return [];
}

async function fetchListWithFallback<T extends { source?: unknown }>(
  endpoint: string,
  seed: T[],
) {
  const seedWithSource = normalizeArraySource(seed, "SEED_DEMO");
  if (!USE_LIVE_API) return seedWithSource;

  try {
    const payload = await apiFetch<unknown>(endpoint);
    const list = asArray<T>(payload);
    return normalizeArraySource(list, "LIVE");
  } catch (error) {
    warnFallback(endpoint, error);
    return seedWithSource;
  }
}

export async function getInsuranceApplications(): Promise<InsuranceApplication[]> {
  return fetchListWithFallback<InsuranceApplication>(
    "/v1/insurance/applications",
    seedApplications,
  );
}

export async function getInsuranceMissions(): Promise<InsuranceMission[]> {
  return fetchListWithFallback<InsuranceMission>("/v1/insurance/missions", seedMissions);
}

export async function getRaxEvaluations(): Promise<RaxEvaluation[]> {
  return fetchListWithFallback<RaxEvaluation>("/v1/insurance/rax", seedRaxEvaluations);
}

export async function getCommercialOffers(): Promise<CommercialOffer[]> {
  return fetchListWithFallback<CommercialOffer>("/v1/insurance/pricing", seedPricingOffers);
}

export async function getInsurancePolicies(): Promise<InsurancePolicy[]> {
  return fetchListWithFallback<InsurancePolicy>("/v1/insurance/policies", seedPolicies);
}

export async function getMonitoringAlerts(): Promise<MonitoringAlert[]> {
  return fetchListWithFallback<MonitoringAlert>(
    "/v1/insurance/monitoring/alerts",
    seedMonitoringAlerts,
  );
}

export async function getInsuranceClaims(): Promise<InsuranceClaim[]> {
  return fetchListWithFallback<InsuranceClaim>("/v1/insurance/claims", seedClaims);
}

export async function getFarmers(): Promise<Farmer[]> {
  return fetchListWithFallback<Farmer>("/v1/farmers", seedFarmers);
}

export async function getCooperatives(): Promise<Cooperative[]> {
  return fetchListWithFallback<Cooperative>("/v1/cooperatives", seedCooperatives);
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [
    applications,
    missions,
    raxEvaluations,
    commercialOffers,
    policies,
    monitoringAlerts,
    claims,
    farmers,
    cooperatives,
  ] = await Promise.all([
    getInsuranceApplications(),
    getInsuranceMissions(),
    getRaxEvaluations(),
    getCommercialOffers(),
    getInsurancePolicies(),
    getMonitoringAlerts(),
    getInsuranceClaims(),
    getFarmers(),
    getCooperatives(),
  ]);

  return {
    applications,
    missions,
    raxEvaluations,
    commercialOffers,
    policies,
    monitoringAlerts,
    claims,
    farmers,
    cooperatives,
  };
}

