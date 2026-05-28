import {
  CommercialOffer,
  Cooperative,
  DataSource,
  Farmer,
  IotNode,
  IotReading,
  NdviSnapshot,
  InsuranceApplication,
  InsuranceClaim,
  InsuranceFieldAudit,
  InsuranceMission,
  InsurancePolicy,
  MonitoringAlert,
  Parcelle,
  RaxEvaluation,
  WakamaAlert,
} from "@/types";

import { normalizeSource } from "./data-source";
import { calculateRaxBrut, calculateWrs, getRiskTierFromWrs } from "./workflow";

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asStringLike(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asSource(value: unknown, fallback: DataSource = "LIVE"): DataSource {
  return normalizeSource(value, fallback);
}

function getNestedValue(value: unknown, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = value;

  for (const segment of segments) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function pickFirstValue(
  o: Record<string, unknown>,
  keys: string[],
): unknown {
  for (const key of keys) {
    const value = key.includes(".") ? getNestedValue(o, key) : o[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function dedupeKeys(keys: string[]): string[] {
  return Array.from(new Set(keys));
}

export function extractArrayFromApiResponse(
  raw: unknown,
  preferredKeys: string[] = [],
): unknown[] {
  try {
    if (Array.isArray(raw)) return raw;

    const root = asObject(raw);
    if (!root) return [];

    const commonKeys = [
      "data",
      "items",
      "results",
      "farmers",
      "cooperatives",
      "parcelles",
      "alerts",
      "nodes",
      "readings",
    ];

    const candidateKeys = dedupeKeys([...preferredKeys, ...commonKeys]);

    for (const key of candidateKeys) {
      const direct = root[key];
      if (Array.isArray(direct)) return direct;
    }

    const nestedData = asObject(root.data);
    if (!nestedData) return [];

    for (const key of candidateKeys) {
      const nested = nestedData[key];
      if (Array.isArray(nested)) return nested;
    }

    return [];
  } catch {
    return [];
  }
}

function normalizeTaxRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > 1) return value / 100;
  if (value < 0) return 0;
  return value;
}

export function toInsuranceApplication(raw: unknown): InsuranceApplication | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const reference = asString(o.reference);
  const farmerId = asString(o.farmerId);
  const status = asString(o.status) as InsuranceApplication["status"] | null;
  const riskTier = asString(o.riskTier) as InsuranceApplication["riskTier"] | null;
  const areaHa = asNumber(o.areaHa);
  const requestedCoverageMad = asNumber(o.requestedCoverageMad);
  const createdAt = asString(o.createdAt);
  if (!id || !reference || !farmerId || !status || !riskTier || !createdAt) return null;
  if (areaHa === null || requestedCoverageMad === null) return null;
  return {
    id,
    reference,
    farmerId,
    cooperativeId: asString(o.cooperativeId) ?? undefined,
    insurerName: asString(o.insurerName) ?? "Assureur partenaire",
    cropType: asString(o.cropType) ?? "Non renseigne",
    areaHa,
    province: asString(o.province) ?? undefined,
    commune: asString(o.commune) ?? undefined,
    updatedAt: asString(o.updatedAt) ?? undefined,
    requestedCoverageMad,
    status,
    riskTier,
    createdAt,
    source: asSource(o.source, "LIVE"),
  };
}

export function toInsuranceMission(raw: unknown): InsuranceMission | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const applicationId = asString(o.applicationId);
  const missionType = asString(o.missionType) as InsuranceMission["missionType"] | null;
  const status = asString(o.status) as InsuranceMission["status"] | null;
  const scheduledFor = asString(o.scheduledFor);
  if (!id || !applicationId || !missionType || !status || !scheduledFor) return null;
  return {
    id,
    applicationId,
    missionType,
    assignedTo: asString(o.assignedTo) ?? "Equipe operationnelle",
    scheduledFor,
    status,
    region: asString(o.region) ?? "Non renseignee",
    source: asSource(o.source, "LIVE"),
  };
}

export function toInsuranceFieldAudit(raw: unknown): InsuranceFieldAudit | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const applicationId = asString(o.applicationId);
  const farmerId = asString(o.farmerId);
  const declaredAreaHa = asNumber(o.declaredAreaHa);
  const measuredAreaHa = asNumber(o.measuredAreaHa);
  const areaDeltaPercent = asNumber(o.areaDeltaPercent);
  const integrityHash = asString(o.integrityHash);
  const auditMode = asString(o.auditMode) as InsuranceFieldAudit["auditMode"] | null;
  const status = asString(o.status) as InsuranceFieldAudit["status"] | null;
  const createdAt = asString(o.createdAt);
  if (!id || !applicationId || !farmerId || !integrityHash || !auditMode || !status || !createdAt) return null;
  if (declaredAreaHa === null || measuredAreaHa === null || areaDeltaPercent === null) return null;
  return {
    id,
    applicationId,
    missionId: asString(o.missionId) ?? undefined,
    farmerId,
    declaredAreaHa,
    measuredAreaHa,
    areaDeltaPercent,
    declaredPolygon: asString(o.declaredPolygon) ?? undefined,
    measuredPolygon: asString(o.measuredPolygon) ?? undefined,
    assetsApprovedCount: asNumber(o.assetsApprovedCount) ?? 0,
    assetsRejectedCount: asNumber(o.assetsRejectedCount) ?? 0,
    integrityHash,
    auditMode,
    status,
    createdAt,
    completedAt: asString(o.completedAt) ?? undefined,
    vegetationScore: asNumber(o.vegetationScore) ?? 0,
    irrigationType:
      (asString(o.irrigationType) as InsuranceFieldAudit["irrigationType"] | null) ?? "PLUVIAL",
    anomalyDetected: asBoolean(o.anomalyDetected) ?? false,
    notes: asString(o.notes) ?? "",
    source: asSource(o.source, "LIVE"),
  };
}

export function toRaxEvaluation(raw: unknown): RaxEvaluation | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const applicationId = asString(o.applicationId);
  const gravity = asNumber(o.gravity) ?? asNumber(o.g);
  const frequency = asNumber(o.frequency) ?? asNumber(o.f);
  const detection = asNumber(o.detection) ?? asNumber(o.d);
  const explicitRaxBrut = asNumber(o.raxBrut);
  const explicitRaxScore = asNumber(o.raxScore);
  const explicitWrs =
    asNumber(o.wrsScore) ?? asNumber(o.wrs) ?? asNumber(o.wrsNormalized);

  const derivedRaxBrut =
    gravity !== null && frequency !== null && detection !== null
      ? calculateRaxBrut(gravity, frequency, detection)
      : null;
  const raxBrut = explicitRaxBrut ?? derivedRaxBrut ?? explicitRaxScore;
  const wrsScore = explicitWrs ?? (raxBrut !== null ? calculateWrs(raxBrut) : null);
  const riskTier =
    (asString(o.riskTier) as RaxEvaluation["riskTier"] | null) ??
    (wrsScore !== null ? getRiskTierFromWrs(wrsScore) : null);

  if (!id || !applicationId || wrsScore === null || raxBrut === null || !riskTier) return null;
  return {
    id,
    applicationId,
    gravity: gravity ?? undefined,
    frequency: frequency ?? undefined,
    detection: detection ?? undefined,
    raxBrut: explicitRaxBrut ?? derivedRaxBrut ?? raxBrut,
    wrsScore,
    raxScore: explicitRaxScore ?? raxBrut,
    riskTier,
    recommendation: asString(o.recommendation) ?? "",
    source: asSource(o.source, "LIVE"),
  };
}

export function toCommercialOffer(raw: unknown): CommercialOffer | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id) ?? asString(o.offerId);
  const applicationId = asString(o.applicationId);

  const purePremiumAmount =
    asNumber(o.purePremiumAmount) ??
    asNumber(o.pure_premium_amount) ??
    asNumber(o.technicalPremiumMad);
  const managementFees =
    asNumber(o.managementFees) ??
    asNumber(o.management_fees) ??
    (() => {
      const suggested = asNumber(o.suggestedCommercialPremiumMad);
      if (purePremiumAmount === null || suggested === null) return null;
      return Math.max(0, suggested - purePremiumAmount);
    })();
  const taxRateRaw =
    asNumber(o.taxRateApplied) ?? asNumber(o.tax_rate_applied) ?? asNumber(o.taxRate);
  const taxRateApplied = taxRateRaw !== null ? normalizeTaxRate(taxRateRaw) : 0;
  const taxAmount =
    asNumber(o.taxAmount) ??
    asNumber(o.tax_amount) ??
    (purePremiumAmount !== null && managementFees !== null
      ? (purePremiumAmount + managementFees) * taxRateApplied
      : null);

  const totalCommercialPremiumTtc =
    asNumber(o.totalCommercialPremiumTtc) ??
    asNumber(o.total_commercial_premium_ttc) ??
    asNumber(o.suggestedCommercialPremiumMad) ??
    (purePremiumAmount !== null && managementFees !== null && taxAmount !== null
      ? purePremiumAmount + managementFees + taxAmount
      : null);

  const status =
    (asString(o.status) as CommercialOffer["status"] | null) ??
    (asString(o.offerStatus) as CommercialOffer["status"] | null) ??
    "DRAFT";
  if (!id || !applicationId || purePremiumAmount === null || totalCommercialPremiumTtc === null) {
    return null;
  }

  return {
    id,
    applicationId,
    raxEvaluationId: asString(o.raxEvaluationId) ?? asString(o.raxId) ?? undefined,
    insurerName: asString(o.insurerName) ?? "Assureur partenaire",
    totalInsuredCapital:
      asNumber(o.totalInsuredCapital) ?? asNumber(o.total_insured_capital) ?? undefined,
    purePremiumAmount,
    managementFees: managementFees ?? 0,
    taxRateApplied,
    taxAmount: taxAmount ?? 0,
    totalCommercialPremiumTtc,
    farmerDecision:
      (asString(o.farmerDecision) as CommercialOffer["farmerDecision"] | null) ??
      (asString(o.farmer_decision) as CommercialOffer["farmerDecision"] | null) ??
      undefined,
    farmerDecisionAt:
      asString(o.farmerDecisionAt) ?? asString(o.farmer_decision_at) ?? undefined,
    farmerRejectionReason:
      asString(o.farmerRejectionReason) ??
      asString(o.farmer_rejection_reason) ??
      undefined,
    generatedAt: asString(o.generatedAt) ?? asString(o.generated_at) ?? undefined,
    expiresAt: asString(o.expiresAt) ?? asString(o.expires_at) ?? undefined,
    shortUrlToken: asString(o.shortUrlToken) ?? asString(o.short_url_token) ?? undefined,
    agencyPickupToken:
      asString(o.agencyPickupToken) ?? asString(o.agency_pickup_token) ?? undefined,
    technicalPremiumMad: purePremiumAmount,
    suggestedCommercialPremiumMad: totalCommercialPremiumTtc,
    deductiblePct: asNumber(o.deductiblePct) ?? 0,
    status,
    source: asSource(o.source, "LIVE"),
  };
}

export function toInsurancePolicy(raw: unknown): InsurancePolicy | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id) ?? asString(o.policyId);
  const policyNumber = asString(o.policyNumber) ?? asString(o.policy_number);
  const applicationId = asString(o.applicationId) ?? asString(o.application_id);

  const totalInsuredCapital =
    asNumber(o.totalInsuredCapital) ?? asNumber(o.total_insured_capital);
  const totalPremiumTtc = asNumber(o.totalPremiumTtc) ?? asNumber(o.total_premium_ttc);

  const coverageStartDate =
    asString(o.coverageStartDate) ??
    asString(o.coverage_start_date) ??
    asString(o.effectiveDate);
  const coverageEndDate =
    asString(o.coverageEndDate) ??
    asString(o.coverage_end_date) ??
    asString(o.expiryDate);

  const coverageMad = asNumber(o.coverageMad) ?? totalInsuredCapital;
  const annualPremiumMad = asNumber(o.annualPremiumMad) ?? totalPremiumTtc;
  const effectiveDate = coverageStartDate;
  const expiryDate = coverageEndDate;
  const status = asString(o.status) as InsurancePolicy["status"] | null;
  if (!id || !policyNumber || !applicationId || !effectiveDate || !expiryDate || !status) {
    return null;
  }
  if (coverageMad === null || annualPremiumMad === null) return null;
  return {
    id,
    offerId: asString(o.offerId) ?? asString(o.offer_id) ?? undefined,
    farmerId: asString(o.farmerId) ?? asString(o.farmer_id) ?? undefined,
    policyNumber,
    applicationId,
    insurerName: asString(o.insurerName) ?? "Assureur partenaire",
    totalInsuredCapital: totalInsuredCapital ?? coverageMad,
    totalPremiumTtc: totalPremiumTtc ?? annualPremiumMad,
    coverageStartDate,
    coverageEndDate,
    issuedAt: asString(o.issuedAt) ?? asString(o.issued_at) ?? undefined,
    coverageMad,
    annualPremiumMad,
    effectiveDate,
    expiryDate,
    status,
    source: asSource(o.source, "LIVE"),
  };
}

export function toMonitoringAlert(raw: unknown): MonitoringAlert | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id) ?? asString(o.alertId);
  const policyId = asString(o.policyId) ?? asString(o.policy_id);
  const createdAt = asString(o.createdAt) ?? asString(o.created_at);
  const severity =
    (asString(o.severity) as MonitoringAlert["level"] | null) ??
    (asString(o.level) as MonitoringAlert["level"] | null);
  const type =
    (asString(o.type) as MonitoringAlert["type"] | null) ??
    (asString(o.signalType) as MonitoringAlert["type"] | null) ??
    (asString(o.signal_type) as MonitoringAlert["type"] | null) ??
    "SYSTEM";
  const message = asString(o.message) ?? asString(o.title);
  const status =
    (asString(o.status) as MonitoringAlert["status"] | null) ??
    ((asBoolean(o.resolved) ?? false) ? "RESOLVED" : "OPEN");

  if (!id || !policyId || !createdAt || !severity || !message) return null;
  return {
    id,
    policyId,
    applicationId: asString(o.applicationId) ?? asString(o.application_id) ?? undefined,
    farmerId: asString(o.farmerId) ?? asString(o.farmer_id) ?? undefined,
    type,
    severity,
    status,
    message,
    level: severity,
    title: message,
    createdAt,
    resolved: status === "RESOLVED",
    source: asSource(o.source, "LIVE"),
  };
}

export function toInsuranceClaim(raw: unknown): InsuranceClaim | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id) ?? asString(o.claimId);
  const claimNumber = asString(o.claimNumber) ?? id;
  const policyId = asString(o.policyId) ?? asString(o.policy_id);
  const claimType =
    (asString(o.claimType) as InsuranceClaim["claimType"] | null) ??
    (asString(o.claim_type) as InsuranceClaim["claimType"] | null) ??
    (asString(o.type) as InsuranceClaim["claimType"] | null);
  const estimatedLossMad =
    asNumber(o.estimatedLossMad) ??
    asNumber(o.estimatedAmount) ??
    asNumber(o.estimated_amount);
  const status = asString(o.status) as InsuranceClaim["status"] | null;
  if (!id || !claimNumber || !policyId || !claimType || !status || estimatedLossMad === null) {
    return null;
  }
  return {
    id,
    claimNumber,
    policyId,
    applicationId: asString(o.applicationId) ?? asString(o.application_id) ?? undefined,
    farmerId: asString(o.farmerId) ?? asString(o.farmer_id) ?? undefined,
    monitoringAlertId:
      asString(o.monitoringAlertId) ?? asString(o.monitoring_alert_id) ?? undefined,
    severity:
      (asString(o.severity) as InsuranceClaim["severity"] | null) ??
      (asString(o.level) as InsuranceClaim["severity"] | null) ??
      undefined,
    estimatedAmount: asNumber(o.estimatedAmount) ?? asNumber(o.estimated_amount) ?? undefined,
    description: asString(o.description) ?? asString(o.message) ?? undefined,
    createdAt: asString(o.createdAt) ?? asString(o.created_at) ?? undefined,
    updatedAt: asString(o.updatedAt) ?? asString(o.updated_at) ?? undefined,
    claimType,
    estimatedLossMad,
    status,
    source: asSource(o.source, "LIVE"),
  };
}

export function toParcelle(raw: unknown): Parcelle | null {
  const o = asObject(raw);
  if (!o) return null;
  const id =
    asStringLike(pickFirstValue(o, ["id", "parcelleId", "parcelle_id", "plotId", "plot_id"])) ??
    null;
  const farmerId =
    asStringLike(pickFirstValue(o, ["farmerId", "farmer_id"])) ?? undefined;
  const cooperativeId =
    asStringLike(pickFirstValue(o, ["cooperativeId", "cooperative_id"])) ?? undefined;
  const name =
    asStringLike(pickFirstValue(o, ["name", "nom", "label"])) ??
    undefined;
  const culture = asStringLike(pickFirstValue(o, ["culture", "crop"])) ?? undefined;

  if (!id || (!name && !culture && !farmerId)) return null;

  const area =
    asNumber(
      pickFirstValue(o, ["areaHa", "superficie", "surface", "surfaceHa", "area_ha"]),
    ) ?? undefined;

  return {
    id,
    farmerId,
    cooperativeId,
    name: name ?? culture ?? `Parcelle ${id}`,
    culture,
    superficie: area,
    areaHa: area,
    lat: asNumber(pickFirstValue(o, ["lat", "latitude"])) ?? undefined,
    lng: asNumber(pickFirstValue(o, ["lng", "longitude"])) ?? undefined,
    polygone:
      asStringLike(pickFirstValue(o, ["polygone", "polygon", "geojson"])) ?? undefined,
    ndvi:
      asNumber(pickFirstValue(o, ["ndvi", "ndviValue", "ndvi_value"])) ?? undefined,
    status: asStringLike(pickFirstValue(o, ["status", "statut"])) ?? undefined,
    source: asSource(o.source, "LIVE"),
  };
}

export function toWakamaAlert(raw: unknown): WakamaAlert | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id) ?? asString(o.alertId);
  const createdAt = asString(o.createdAt) ?? asString(o.created_at);
  const severity =
    (asString(o.severity) as WakamaAlert["severity"] | null) ??
    (asString(o.level) as WakamaAlert["severity"] | null);
  const message = asString(o.message) ?? asString(o.description);
  if (!id || !createdAt || !severity || !message) return null;
  return {
    id,
    farmerId: asString(o.farmerId) ?? asString(o.farmer_id) ?? undefined,
    cooperativeId: asString(o.cooperativeId) ?? asString(o.cooperative_id) ?? undefined,
    parcelleId: asString(o.parcelleId) ?? asString(o.parcelle_id) ?? undefined,
    type: asString(o.type) ?? undefined,
    severity,
    title: asString(o.title) ?? undefined,
    message,
    read: asBoolean(o.read) ?? undefined,
    createdAt,
    source: asSource(o.source, "LIVE"),
  };
}

export function toNdviSnapshot(
  raw: unknown,
  parcelleIdFallback?: string,
): NdviSnapshot | null {
  const o = asObject(raw);
  if (!o) return null;
  const parcelleId = asString(o.parcelleId) ?? asString(o.parcelle_id) ?? parcelleIdFallback ?? null;
  const ndvi = asNumber(o.ndvi);
  if (!parcelleId || ndvi === null) return null;
  return {
    parcelleId,
    ndvi,
    capturedAt: asString(o.capturedAt) ?? asString(o.captured_at) ?? undefined,
    provider: asString(o.provider) ?? undefined,
    source: asSource(o.source, "LIVE"),
  };
}

export function toIotNode(raw: unknown): IotNode | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  if (!id) return null;
  return {
    id,
    cooperativeId: asString(o.cooperativeId) ?? asString(o.cooperative_id) ?? undefined,
    farmerId: asString(o.farmerId) ?? asString(o.farmer_id) ?? undefined,
    name: asString(o.name) ?? undefined,
    status: asString(o.status) ?? undefined,
    lat: asNumber(o.lat) ?? asNumber(o.latitude) ?? undefined,
    lng: asNumber(o.lng) ?? asNumber(o.longitude) ?? undefined,
    lastSeenAt: asString(o.lastSeenAt) ?? asString(o.last_seen_at) ?? undefined,
    source: asSource(o.source, "LIVE"),
  };
}

export function toIotReading(raw: unknown): IotReading | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const nodeId = asString(o.nodeId) ?? asString(o.node_id);
  const capturedAt = asString(o.capturedAt) ?? asString(o.captured_at);
  if (!id || !nodeId || !capturedAt) return null;
  return {
    id,
    nodeId,
    temperatureAir: asNumber(o.temperatureAir) ?? asNumber(o.temperature_air) ?? undefined,
    humidityAir: asNumber(o.humidityAir) ?? asNumber(o.humidity_air) ?? undefined,
    soilMoisture: asNumber(o.soilMoisture) ?? asNumber(o.soil_moisture) ?? undefined,
    soilTemperature:
      asNumber(o.soilTemperature) ?? asNumber(o.soil_temperature) ?? undefined,
    capturedAt,
    source: asSource(o.source, "LIVE"),
  };
}

export function toFarmer(raw: unknown): Farmer | null {
  const o = asObject(raw);
  if (!o) return null;
  const id =
    asStringLike(pickFirstValue(o, ["id", "farmerId", "farmer_id"])) ?? null;

  const firstName =
    asStringLike(
      pickFirstValue(o, ["firstName", "prenom", "first_name"]),
    ) ?? undefined;
  const lastName =
    asStringLike(pickFirstValue(o, ["lastName", "nom", "last_name"])) ?? undefined;

  const explicitName =
    asStringLike(
      pickFirstValue(o, ["fullName", "name", "nomComplet", "nom_complet"]),
    ) ?? undefined;

  const phone =
    asStringLike(pickFirstValue(o, ["phone", "telephone", "téléphone", "mobile"])) ??
    undefined;
  const email = asStringLike(pickFirstValue(o, ["email"])) ?? undefined;

  const joinedName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const fullName = explicitName ?? (joinedName || undefined) ?? phone ?? email ?? null;

  const totalAreaHa =
    asNumber(
      pickFirstValue(o, ["totalAreaHa", "total_area_ha", "surface", "superficie", "areaHa"]),
    ) ?? 0;

  if (!id || !fullName) return null;

  const cooperativeFromObject = asObject(pickFirstValue(o, ["cooperative"]));
  const cooperativeId =
    asStringLike(
      pickFirstValue(o, [
        "cooperativeId",
        "cooperative_id",
        "coopId",
        "cooperative.id",
      ]),
    ) ??
    asStringLike(cooperativeFromObject?.id) ??
    undefined;

  const cooperativeName =
    asStringLike(
      pickFirstValue(o, [
        "cooperativeName",
        "cooperative_name",
        "cooperative.name",
        "cooperative.nom",
      ]),
    ) ??
    asStringLike(cooperativeFromObject?.name) ??
    asStringLike(cooperativeFromObject?.nom) ??
    undefined;

  const locationParts = [
    asStringLike(pickFirstValue(o, ["region", "région", "province"])),
    asStringLike(pickFirstValue(o, ["commune", "village", "city", "locality"])),
  ].filter(Boolean);

  return {
    id,
    fullName,
    nationalIdMasked:
      asStringLike(pickFirstValue(o, ["nationalIdMasked", "national_id_masked"])) ?? "N/A",
    phone: phone ?? "N/A",
    region:
      (locationParts.length > 0
        ? locationParts.join(" / ")
        : asStringLike(pickFirstValue(o, ["address"]))) ?? "Non renseignee",
    primaryCrop:
      asStringLike(pickFirstValue(o, ["primaryCrop", "culture", "mainCrop", "main_crop"])) ??
      cooperativeName ??
      "Non renseignee",
    totalAreaHa,
    source: asSource(o.source, "LIVE"),
    cooperativeId,
    cooperativeName,
    kycStatus:
      asStringLike(pickFirstValue(o, ["kycStatus", "kyc_status", "statusKyc"])) ?? undefined,
    lat: asNumber(pickFirstValue(o, ["lat", "latitude"])) ?? undefined,
    lng: asNumber(pickFirstValue(o, ["lng", "longitude"])) ?? undefined,
  };
}

export function toCooperative(raw: unknown): Cooperative | null {
  const o = asObject(raw);
  if (!o) return null;
  const id =
    asStringLike(pickFirstValue(o, ["id", "cooperativeId", "cooperative_id", "coopId"])) ??
    null;
  const name =
    asStringLike(
      pickFirstValue(o, [
        "name",
        "nom",
        "cooperativeName",
        "cooperative_name",
        "raisonSociale",
        "raison_sociale",
      ]),
    ) ?? null;
  if (!id || !name) return null;

  const memberCount =
    asNumber(
      pickFirstValue(o, [
        "memberCount",
        "membersCount",
        "members_count",
        "nbMembres",
        "farmersCount",
        "farmers_count",
      ]),
    ) ?? 0;

  const aggregatedAreaHa =
    asNumber(
      pickFirstValue(o, [
        "aggregatedAreaHa",
        "aggregated_area_ha",
        "surface",
        "superficie",
        "areaHa",
      ]),
    ) ?? 0;

  return {
    id,
    name,
    region:
      asStringLike(
        pickFirstValue(o, ["region", "région", "province", "commune", "city", "village"]),
      ) ??
      asStringLike(pickFirstValue(o, ["address"])) ??
      "Non renseignee",
    filiere:
      asStringLike(
        pickFirstValue(o, ["filiere", "filière", "sector", "culture", "mainCrop", "main_crop"]),
      ) ??
      asStringLike(pickFirstValue(o, ["valueChain", "value_chain"])) ??
      undefined,
    memberCount,
    aggregatedAreaHa,
    contactName:
      asStringLike(pickFirstValue(o, ["contactName", "contact_name", "managerName"])) ?? "N/A",
    source: asSource(o.source, "LIVE"),
    lat: asNumber(pickFirstValue(o, ["lat", "latitude"])) ?? undefined,
    lng: asNumber(pickFirstValue(o, ["lng", "longitude"])) ?? undefined,
  };
}
