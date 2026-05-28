import { apiFetch } from "@/lib/api";
import { withSource } from "@/lib/data-source";
import {
  toCommercialOffer,
  toCooperative,
  toFarmer,
  toIotNode,
  toIotReading,
  toNdviSnapshot,
  toParcelle,
  toInsuranceApplication,
  toInsuranceClaim,
  toInsuranceFieldAudit,
  toInsuranceMission,
  toInsurancePolicy,
  toMonitoringAlert,
  toRaxEvaluation,
  toWakamaAlert,
} from "@/lib/dto-mappers";
import {
  applications as seedApplications,
  claims as seedClaims,
  cooperatives as seedCooperatives,
  farmers as seedFarmers,
  fieldAudits as seedFieldAudits,
  iotNodes as seedIotNodes,
  iotReadings as seedIotReadings,
  missions as seedMissions,
  monitoringAlerts as seedMonitoringAlerts,
  ndviSnapshots as seedNdviSnapshots,
  parcelles as seedParcelles,
  policies as seedPolicies,
  pricingOffers as seedPricingOffers,
  raxEvaluations as seedRaxEvaluations,
  wakamaAlerts as seedWakamaAlerts,
} from "@/lib/demo-data";
import {
  CommercialOffer,
  Cooperative,
  Farmer,
  IotNode,
  IotReading,
  NdviSnapshot,
  Parcelle,
  InsuranceApplication,
  InsuranceClaim,
  InsuranceFieldAudit,
  InsuranceMission,
  InsurancePolicy,
  MonitoringAlert,
  RaxEvaluation,
  WakamaAlert,
} from "@/types";

const USE_LIVE_API = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";

interface DashboardOverview {
  applications: InsuranceApplication[];
  missions: InsuranceMission[];
  fieldAudits: InsuranceFieldAudit[];
  raxEvaluations: RaxEvaluation[];
  commercialOffers: CommercialOffer[];
  policies: InsurancePolicy[];
  monitoringAlerts: MonitoringAlert[];
  claims: InsuranceClaim[];
  farmers: Farmer[];
  cooperatives: Cooperative[];
  parcelles: Parcelle[];
  wakamaAlerts: WakamaAlert[];
}

function warnFallback(endpoint: string, error: unknown) {
  console.warn("[Wakama API fallback]", endpoint, error);
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: unknown[] }).data;
  }
  return [];
}

function normalizeSeed<T extends object>(seed: T[]): Array<T & { source: "SEED_DEMO" }> {
  return seed.map((item) => withSource(item, "SEED_DEMO")) as Array<
    T & { source: "SEED_DEMO" }
  >;
}

async function fetchListWithFallback<T extends object>(
  endpoint: string,
  seed: T[],
  mapper: (raw: unknown) => (T & { source?: unknown }) | null,
): Promise<Array<T & { source: "LIVE" | "SEED_DEMO" }>> {
  const seedWithSource = normalizeSeed(seed);
  if (!USE_LIVE_API) return seedWithSource;

  try {
    const payload = await apiFetch<unknown>(endpoint);
    const rawList = asArray(payload);
    const mapped = rawList
      .map((item) => mapper(item))
      .filter((item): item is T & { source?: unknown } => item !== null)
      .map((item) => withSource(item, "LIVE"));

    if (rawList.length > 0 && mapped.length === 0) {
      warnFallback(endpoint, new Error("Mapped array is empty after normalization"));
      return seedWithSource;
    }

    return mapped;
  } catch (error) {
    warnFallback(endpoint, error);
    return seedWithSource;
  }
}

export async function getInsuranceApplications(): Promise<InsuranceApplication[]> {
  return fetchListWithFallback<InsuranceApplication>(
    "/v1/insurance/applications",
    seedApplications,
    toInsuranceApplication,
  );
}

export async function getInsuranceApplicationById(
  id: string,
): Promise<InsuranceApplication | null> {
  const applications = await getInsuranceApplications();
  return applications.find((item) => item.id === id) ?? null;
}

export async function getInsuranceMissions(): Promise<InsuranceMission[]> {
  return fetchListWithFallback<InsuranceMission>(
    "/v1/insurance/missions",
    seedMissions,
    toInsuranceMission,
  );
}

export async function getInsuranceMissionById(
  id: string,
): Promise<InsuranceMission | null> {
  const missions = await getInsuranceMissions();
  return missions.find((item) => item.id === id) ?? null;
}

export async function getInsuranceFieldAudits(): Promise<InsuranceFieldAudit[]> {
  return fetchListWithFallback<InsuranceFieldAudit>(
    "/v1/insurance/field-audits",
    seedFieldAudits,
    toInsuranceFieldAudit,
  );
}

export async function getInsuranceFieldAuditById(
  id: string,
): Promise<InsuranceFieldAudit | null> {
  const audits = await getInsuranceFieldAudits();
  return audits.find((item) => item.id === id) ?? null;
}

export async function getRaxEvaluations(): Promise<RaxEvaluation[]> {
  return fetchListWithFallback<RaxEvaluation>(
    "/v1/insurance/rax",
    seedRaxEvaluations,
    toRaxEvaluation,
  );
}

export async function getRaxEvaluationById(id: string): Promise<RaxEvaluation | null> {
  const evaluations = await getRaxEvaluations();
  return evaluations.find((item) => item.id === id) ?? null;
}

export async function getCommercialOffers(): Promise<CommercialOffer[]> {
  return fetchListWithFallback<CommercialOffer>(
    "/v1/insurance/pricing",
    seedPricingOffers,
    toCommercialOffer,
  );
}

export async function getCommercialOfferById(
  id: string,
): Promise<CommercialOffer | null> {
  const offers = await getCommercialOffers();
  return offers.find((item) => item.id === id) ?? null;
}

export async function getInsurancePolicies(): Promise<InsurancePolicy[]> {
  return fetchListWithFallback<InsurancePolicy>(
    "/v1/insurance/policies",
    seedPolicies,
    toInsurancePolicy,
  );
}

export async function getInsurancePolicyById(id: string): Promise<InsurancePolicy | null> {
  const policies = await getInsurancePolicies();
  return policies.find((item) => item.id === id) ?? null;
}

export async function getMonitoringAlerts(): Promise<MonitoringAlert[]> {
  return fetchListWithFallback<MonitoringAlert>(
    "/v1/insurance/monitoring/alerts",
    seedMonitoringAlerts,
    toMonitoringAlert,
  );
}

export async function getMonitoringAlertById(id: string): Promise<MonitoringAlert | null> {
  const alerts = await getMonitoringAlerts();
  return alerts.find((item) => item.id === id) ?? null;
}

export async function getInsuranceClaims(): Promise<InsuranceClaim[]> {
  return fetchListWithFallback<InsuranceClaim>(
    "/v1/insurance/claims",
    seedClaims,
    toInsuranceClaim,
  );
}

export async function getInsuranceClaimById(id: string): Promise<InsuranceClaim | null> {
  const claims = await getInsuranceClaims();
  return claims.find((item) => item.id === id) ?? null;
}

export async function getFarmers(): Promise<Farmer[]> {
  return fetchListWithFallback<Farmer>("/v1/farmers", seedFarmers, toFarmer);
}

export async function getCooperatives(): Promise<Cooperative[]> {
  return fetchListWithFallback<Cooperative>(
    "/v1/cooperatives",
    seedCooperatives,
    toCooperative,
  );
}

export async function getParcelles(): Promise<Parcelle[]> {
  return fetchListWithFallback<Parcelle>("/v1/parcelles", seedParcelles, toParcelle);
}

export async function getParcelleById(id: string): Promise<Parcelle | null> {
  const parcelles = await getParcelles();
  return parcelles.find((item) => item.id === id) ?? null;
}

export async function getWakamaAlerts(): Promise<WakamaAlert[]> {
  return fetchListWithFallback<WakamaAlert>("/v1/alerts", seedWakamaAlerts, toWakamaAlert);
}

export async function getWakamaAlertById(id: string): Promise<WakamaAlert | null> {
  const alerts = await getWakamaAlerts();
  return alerts.find((item) => item.id === id) ?? null;
}

export async function getNdviSnapshotByParcelleId(
  parcelleId: string,
): Promise<NdviSnapshot | null> {
  const seedMatch =
    seedNdviSnapshots.find((item) => item.parcelleId === parcelleId) ?? null;
  if (!USE_LIVE_API) return seedMatch;

  const endpoint = `/v1/ndvi/${parcelleId}`;
  try {
    const payload = await apiFetch<unknown>(endpoint);
    const rawList = asArray(payload);
    const mapped = rawList
      .map((item) => toNdviSnapshot(item, parcelleId))
      .filter((item): item is NdviSnapshot => item !== null)
      .map((item) => withSource(item, "LIVE"));

    if (rawList.length > 0 && mapped.length === 0) {
      warnFallback(endpoint, new Error("Mapped array is empty after normalization"));
      return seedMatch;
    }

    if (mapped.length > 0) {
      return mapped.sort((a, b) => {
        const da = new Date(a.capturedAt ?? 0).getTime();
        const db = new Date(b.capturedAt ?? 0).getTime();
        return db - da;
      })[0];
    }

    const single = toNdviSnapshot(payload, parcelleId);
    if (single) return withSource(single, "LIVE");
    return seedMatch;
  } catch (error) {
    warnFallback(endpoint, error);
    return seedMatch;
  }
}

export async function getIotNodes(): Promise<IotNode[]> {
  return fetchListWithFallback<IotNode>("/v1/iot/node", seedIotNodes, toIotNode);
}

export async function getIotReadingsByNodeId(nodeId: string): Promise<IotReading[]> {
  const seedMatch = seedIotReadings
    .filter((item) => item.nodeId === nodeId)
    .map((item) => withSource(item, "SEED_DEMO"));
  if (!USE_LIVE_API) return seedMatch;

  const endpoint = `/v1/iot/readings/${nodeId}`;
  try {
    const payload = await apiFetch<unknown>(endpoint);
    const rawList = asArray(payload);
    const mapped = rawList
      .map((item) => toIotReading(item))
      .filter((item): item is IotReading => item !== null)
      .map((item) => withSource(item, "LIVE"));
    if (rawList.length > 0 && mapped.length === 0) {
      warnFallback(endpoint, new Error("Mapped array is empty after normalization"));
      return seedMatch;
    }
    return mapped;
  } catch (error) {
    warnFallback(endpoint, error);
    return seedMatch;
  }
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [
    applications,
    missions,
    fieldAudits,
    raxEvaluations,
    commercialOffers,
    policies,
    monitoringAlerts,
    claims,
    farmers,
    cooperatives,
    parcelles,
    wakamaAlerts,
  ] = await Promise.all([
    getInsuranceApplications(),
    getInsuranceMissions(),
    getInsuranceFieldAudits(),
    getRaxEvaluations(),
    getCommercialOffers(),
    getInsurancePolicies(),
    getMonitoringAlerts(),
    getInsuranceClaims(),
    getFarmers(),
    getCooperatives(),
    getParcelles(),
    getWakamaAlerts(),
  ]);

  return {
    applications,
    missions,
    fieldAudits,
    raxEvaluations,
    commercialOffers,
    policies,
    monitoringAlerts,
    claims,
    farmers,
    cooperatives,
    parcelles,
    wakamaAlerts,
  };
}
