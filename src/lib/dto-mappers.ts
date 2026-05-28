import {
  CommercialOffer,
  Cooperative,
  DataSource,
  Farmer,
  InsuranceApplication,
  InsuranceClaim,
  InsuranceFieldAudit,
  InsuranceMission,
  InsurancePolicy,
  MonitoringAlert,
  RaxEvaluation,
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
  const id = asString(o.id);
  const applicationId = asString(o.applicationId);
  const technicalPremiumMad = asNumber(o.technicalPremiumMad);
  const suggestedCommercialPremiumMad = asNumber(o.suggestedCommercialPremiumMad);
  const deductiblePct = asNumber(o.deductiblePct);
  const status = asString(o.status) as CommercialOffer["status"] | null;
  if (!id || !applicationId || !status) return null;
  if (technicalPremiumMad === null || suggestedCommercialPremiumMad === null || deductiblePct === null) return null;
  return {
    id,
    applicationId,
    insurerName: asString(o.insurerName) ?? "Assureur partenaire",
    technicalPremiumMad,
    suggestedCommercialPremiumMad,
    deductiblePct,
    status,
    source: asSource(o.source, "LIVE"),
  };
}

export function toInsurancePolicy(raw: unknown): InsurancePolicy | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const policyNumber = asString(o.policyNumber);
  const applicationId = asString(o.applicationId);
  const coverageMad = asNumber(o.coverageMad);
  const annualPremiumMad = asNumber(o.annualPremiumMad);
  const effectiveDate = asString(o.effectiveDate);
  const expiryDate = asString(o.expiryDate);
  const status = asString(o.status) as InsurancePolicy["status"] | null;
  if (!id || !policyNumber || !applicationId || !effectiveDate || !expiryDate || !status) return null;
  if (coverageMad === null || annualPremiumMad === null) return null;
  return {
    id,
    policyNumber,
    applicationId,
    insurerName: asString(o.insurerName) ?? "Assureur partenaire",
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
  const id = asString(o.id);
  const policyId = asString(o.policyId);
  const title = asString(o.title);
  const createdAt = asString(o.createdAt);
  const level = asString(o.level) as MonitoringAlert["level"] | null;
  const resolved = asBoolean(o.resolved);
  if (!id || !policyId || !title || !createdAt || !level || resolved === null) return null;
  return {
    id,
    policyId,
    level,
    title,
    createdAt,
    resolved,
    source: asSource(o.source, "LIVE"),
  };
}

export function toInsuranceClaim(raw: unknown): InsuranceClaim | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const claimNumber = asString(o.claimNumber);
  const policyId = asString(o.policyId);
  const claimType = asString(o.claimType) as InsuranceClaim["claimType"] | null;
  const estimatedLossMad = asNumber(o.estimatedLossMad);
  const status = asString(o.status) as InsuranceClaim["status"] | null;
  if (!id || !claimNumber || !policyId || !claimType || !status || estimatedLossMad === null) return null;
  return {
    id,
    claimNumber,
    policyId,
    claimType,
    estimatedLossMad,
    status,
    source: asSource(o.source, "LIVE"),
  };
}

export function toFarmer(raw: unknown): Farmer | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const fullName = asString(o.fullName);
  const totalAreaHa = asNumber(o.totalAreaHa);
  if (!id || !fullName || totalAreaHa === null) return null;
  return {
    id,
    fullName,
    nationalIdMasked: asString(o.nationalIdMasked) ?? "N/A",
    phone: asString(o.phone) ?? "N/A",
    region: asString(o.region) ?? "Non renseignee",
    primaryCrop: asString(o.primaryCrop) ?? "Non renseignee",
    totalAreaHa,
    source: asSource(o.source, "LIVE"),
  };
}

export function toCooperative(raw: unknown): Cooperative | null {
  const o = asObject(raw);
  if (!o) return null;
  const id = asString(o.id);
  const name = asString(o.name);
  const memberCount = asNumber(o.memberCount);
  if (!id || !name || memberCount === null) return null;
  return {
    id,
    name,
    region: asString(o.region) ?? "Non renseignee",
    memberCount,
    aggregatedAreaHa: asNumber(o.aggregatedAreaHa) ?? 0,
    contactName: asString(o.contactName) ?? "N/A",
    source: asSource(o.source, "LIVE"),
  };
}
