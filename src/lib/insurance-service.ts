import { apiFetch } from "@/lib/api";
import { withSource } from "@/lib/data-source";
import {
  extractArrayFromApiResponse,
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
const DEBUG_API_SHAPES = process.env.NEXT_PUBLIC_DEBUG_API_SHAPES === "true";
const PAGINATION_PAGE_SIZE = 100;
const MAX_PAGINATION_PAGES = 20;

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

function getRootKeys(value: unknown): string[] {
  if (Array.isArray(value)) return ["[array]"];
  if (value && typeof value === "object") return Object.keys(value as Record<string, unknown>);
  return [];
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function isPayloadNonEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return getRootKeys(value).length > 0;
  return value !== null && value !== undefined && value !== "";
}

function getFirstItemKeys(list: unknown[]): string[] {
  if (list.length === 0) return [];
  const first = list[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) return [];
  return Object.keys(first as Record<string, unknown>);
}

function warnShape(endpoint: string, payload: unknown) {
  console.warn("[Wakama API shape]", endpoint, "root keys:", getRootKeys(payload));
}

function warnMappedEmpty(
  endpoint: string,
  rawLength: number,
  mapperName: string,
  firstItemKeys: string[],
) {
  console.warn(
    `[Wakama API fallback] ${endpoint} mapped 0/${rawLength} with ${mapperName}. First item keys: ${JSON.stringify(firstItemKeys)}`,
  );
}

function debugApiShape(endpoint: string, payload: unknown, rawList: unknown[]) {
  if (!DEBUG_API_SHAPES) return;
  console.warn(
    "[Wakama API debug]",
    endpoint,
    "root keys:",
    getRootKeys(payload),
    "array length:",
    rawList.length,
    "first item keys:",
    getFirstItemKeys(rawList),
  );
}

function buildPaginatedEndpoint(baseEndpoint: string, page: number, pageSize: number): string {
  const url = new URL(baseEndpoint, "https://wakama.local");
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  return `${url.pathname}${url.search}`;
}

function getPaginationMeta(payload: unknown): {
  total: number | null;
  page: number | null;
  pageSize: number | null;
} {
  const root = asObject(payload);
  if (!root) {
    return { total: null, page: null, pageSize: null };
  }

  const dataObj = asObject(root.data);

  const total = asFiniteNumber(root.total) ?? asFiniteNumber(dataObj?.total) ?? null;
  const page = asFiniteNumber(root.page) ?? asFiniteNumber(dataObj?.page) ?? null;
  const pageSize =
    asFiniteNumber(root.pageSize) ??
    asFiniteNumber(root.limit) ??
    asFiniteNumber(dataObj?.pageSize) ??
    asFiniteNumber(dataObj?.limit) ??
    null;

  return { total, page, pageSize };
}

function mapLiveItems<T extends object>(
  endpoint: string,
  mapperName: string,
  rawList: unknown[],
  mapper: (raw: unknown) => (T & { source?: unknown }) | null,
): Array<T & { source: "LIVE" | "SEED_DEMO" }> | null {
  const mapped = rawList
    .map((item) => mapper(item))
    .filter((item): item is T & { source?: unknown } => item !== null)
    .map((item) => withSource(item, "LIVE"));

  if (rawList.length > 0 && mapped.length === 0) {
    warnMappedEmpty(endpoint, rawList.length, mapperName, getFirstItemKeys(rawList));
    return null;
  }

  return mapped;
}

function dedupeById<T extends object>(items: T[]): T[] {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const item of items) {
    const idValue =
      item && typeof item === "object" && "id" in item
        ? (item as { id?: unknown }).id
        : undefined;
    const id = typeof idValue === "string" ? idValue : null;

    if (!id) {
      deduped.push(item);
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(item);
  }

  return deduped;
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
  mapperName: string,
  preferredKeys: string[] = [],
): Promise<Array<T & { source: "LIVE" | "SEED_DEMO" }>> {
  const seedWithSource = normalizeSeed(seed);
  if (!USE_LIVE_API) return seedWithSource;

  try {
    const payload = await apiFetch<unknown>(endpoint);
    const rawList = extractArrayFromApiResponse(payload, preferredKeys);
    debugApiShape(endpoint, payload, rawList);

    if (isPayloadNonEmpty(payload) && rawList.length === 0) {
      warnShape(endpoint, payload);
      return seedWithSource;
    }

    const mapped = mapLiveItems(endpoint, mapperName, rawList, mapper);
    return mapped ?? seedWithSource;
  } catch (error) {
    warnFallback(endpoint, error);
    return seedWithSource;
  }
}

async function fetchPaginatedListWithFallback<T extends object>(
  endpoint: string,
  seed: T[],
  mapper: (raw: unknown) => (T & { source?: unknown }) | null,
  mapperName: string,
  preferredKeys: string[] = [],
): Promise<Array<T & { source: "LIVE" | "SEED_DEMO" }>> {
  const seedWithSource = normalizeSeed(seed);
  if (!USE_LIVE_API) return seedWithSource;

  try {
    const firstEndpoint = buildPaginatedEndpoint(endpoint, 1, PAGINATION_PAGE_SIZE);
    const firstPayload = await apiFetch<unknown>(firstEndpoint);
    const firstList = extractArrayFromApiResponse(firstPayload, preferredKeys);
    debugApiShape(firstEndpoint, firstPayload, firstList);

    if (isPayloadNonEmpty(firstPayload) && firstList.length === 0) {
      warnShape(firstEndpoint, firstPayload);
      return seedWithSource;
    }

    let combinedRaw = [...firstList];
    const pagination = getPaginationMeta(firstPayload);
    const total = pagination.total;
    const firstPageSize =
      pagination.pageSize && pagination.pageSize > 0
        ? pagination.pageSize
        : PAGINATION_PAGE_SIZE;

    if (total !== null && total > combinedRaw.length) {
      const expectedPages = Math.ceil(total / firstPageSize);
      const maxPages = Math.min(Math.max(expectedPages, 1), MAX_PAGINATION_PAGES);

      for (let page = 2; page <= maxPages; page += 1) {
        const pageEndpoint = buildPaginatedEndpoint(endpoint, page, PAGINATION_PAGE_SIZE);
        const pagePayload = await apiFetch<unknown>(pageEndpoint);
        const pageList = extractArrayFromApiResponse(pagePayload, preferredKeys);
        debugApiShape(pageEndpoint, pagePayload, pageList);

        if (isPayloadNonEmpty(pagePayload) && pageList.length === 0) {
          warnShape(pageEndpoint, pagePayload);
          break;
        }

        if (pageList.length === 0) break;

        combinedRaw = combinedRaw.concat(pageList);
        if (combinedRaw.length >= total) break;
      }
    }

    const mapped = mapLiveItems(endpoint, mapperName, combinedRaw, mapper);
    if (!mapped) return seedWithSource;
    return dedupeById(mapped);
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
    "toInsuranceApplication",
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
    "toInsuranceMission",
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
    "toInsuranceFieldAudit",
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
    "toRaxEvaluation",
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
    "toCommercialOffer",
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
    "toInsurancePolicy",
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
    "toMonitoringAlert",
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
    "toInsuranceClaim",
  );
}

export async function getInsuranceClaimById(id: string): Promise<InsuranceClaim | null> {
  const claims = await getInsuranceClaims();
  return claims.find((item) => item.id === id) ?? null;
}

export async function getFarmers(): Promise<Farmer[]> {
  return fetchPaginatedListWithFallback<Farmer>(
    "/v1/farmers",
    seedFarmers,
    toFarmer,
    "toFarmer",
    ["farmers", "items", "results", "data"],
  );
}

export async function getCooperatives(): Promise<Cooperative[]> {
  return fetchPaginatedListWithFallback<Cooperative>(
    "/v1/cooperatives",
    seedCooperatives,
    toCooperative,
    "toCooperative",
    ["cooperatives", "items", "results", "data"],
  );
}

export async function getParcelles(): Promise<Parcelle[]> {
  return fetchPaginatedListWithFallback<Parcelle>(
    "/v1/parcelles",
    seedParcelles,
    toParcelle,
    "toParcelle",
    ["parcelles", "plots", "items", "results", "data"],
  );
}

export async function getParcelleById(id: string): Promise<Parcelle | null> {
  const parcelles = await getParcelles();
  return parcelles.find((item) => item.id === id) ?? null;
}

export async function getWakamaAlerts(): Promise<WakamaAlert[]> {
  return fetchPaginatedListWithFallback<WakamaAlert>(
    "/v1/alerts",
    seedWakamaAlerts,
    toWakamaAlert,
    "toWakamaAlert",
    ["alerts", "items", "results", "data"],
  );
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
    const rawList = extractArrayFromApiResponse(payload, ["items", "results", "data"]);
    debugApiShape(endpoint, payload, rawList);

    if (isPayloadNonEmpty(payload) && rawList.length === 0) {
      warnShape(endpoint, payload);
      return seedMatch;
    }

    const mapped = rawList
      .map((item) => toNdviSnapshot(item, parcelleId))
      .filter((item): item is NdviSnapshot => item !== null)
      .map((item) => withSource(item, "LIVE"));

    if (rawList.length > 0 && mapped.length === 0) {
      warnMappedEmpty(endpoint, rawList.length, "toNdviSnapshot", getFirstItemKeys(rawList));
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
  return fetchListWithFallback<IotNode>(
    "/v1/iot/node",
    seedIotNodes,
    toIotNode,
    "toIotNode",
    ["nodes", "iotNodes", "items", "results", "data"],
  );
}

export async function getIotReadingsByNodeId(nodeId: string): Promise<IotReading[]> {
  const seedMatch = seedIotReadings
    .filter((item) => item.nodeId === nodeId)
    .map((item) => withSource(item, "SEED_DEMO"));
  if (!USE_LIVE_API) return seedMatch;

  const endpoint = `/v1/iot/readings/${nodeId}`;
  try {
    const payload = await apiFetch<unknown>(endpoint);
    const rawList = extractArrayFromApiResponse(payload, [
      "readings",
      "items",
      "results",
      "data",
    ]);
    debugApiShape(endpoint, payload, rawList);

    if (isPayloadNonEmpty(payload) && rawList.length === 0) {
      warnShape(endpoint, payload);
      return seedMatch;
    }

    const mapped = rawList
      .map((item) => toIotReading(item))
      .filter((item): item is IotReading => item !== null)
      .map((item) => withSource(item, "LIVE"));

    if (rawList.length > 0 && mapped.length === 0) {
      warnMappedEmpty(endpoint, rawList.length, "toIotReading", getFirstItemKeys(rawList));
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
