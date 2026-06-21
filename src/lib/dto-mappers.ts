import {
  CommercialOffer,
  Cooperative,
  DataSource,
  Farmer,
  IotNode,
  IotReading,
  NdviSnapshot,
  InsuranceApplication,
  InsuranceDcaApplication,
  InsuranceDcaApplicationStatus,
  InsuranceDcaClaimHistoryItem,
  InsuranceDcaPreparedDocument,
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

function asBooleanLike(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return null;
}

function asSource(value: unknown, fallback: DataSource = "LIVE"): DataSource {
  return normalizeSource(value, fallback);
}

function maskPhone(value: string | null): string | null {
  if (!value) return null;
  const visible = value.slice(-2);
  if (!visible) return null;
  return `${"*".repeat(Math.max(value.length - 2, 0))}${visible}`;
}

function maskCin(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 2) return `${"*".repeat(value.length)}`;
  return `${value.slice(0, 2)}${"*".repeat(Math.max(value.length - 4, 0))}${value.slice(-2)}`;
}

function toSafeUrl(value: unknown): string | null {
  const raw = asStringLike(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
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

function normalizeWakamaAlertSeverity(value: unknown): WakamaAlert["severity"] {
  const normalized = asStringLike(value)?.trim().toUpperCase();
  if (!normalized) return "UNKNOWN";
  if (normalized === "CRITICAL") return "CRITICAL";
  if (normalized === "WARNING") return "WARNING";
  if (normalized === "INFO") return "INFO";
  return "UNKNOWN";
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

function resolveDcaStatus(value: unknown): InsuranceDcaApplication["status"] {
  const raw = asStringLike(value)?.trim().toUpperCase() ?? null;
  if (!raw) return "UNAVAILABLE";

  const allowed = new Set<InsuranceDcaApplicationStatus>([
    "DRAFT",
    "DRAFT_SUBMITTED",
    "UNDER_RISK_REVIEW",
    "MORE_INFO_REQUIRED",
    "READY_FOR_MISSION_CONFIG",
    "MISSION_CONFIG_DRAFT",
    "MISSION_CONFIGURED",
    "MISSION_DISPATCH_DRAFT",
    "MISSION_SENT",
    "FIELD_AUDIT_COMPLETE",
    "BACK_OFFICE_REVIEW",
    "RAX_SCORED",
    "OFFER_SENT",
    "FARMER_ACCEPTED",
    "CONTRACT_SIGNED",
    "ACTIVE",
    "CLAIM_OPEN",
    "CLOSED",
    "REJECTED",
  ]);

  if (allowed.has(raw as InsuranceDcaApplicationStatus)) {
    return raw as InsuranceDcaApplicationStatus;
  }
  return "UNAVAILABLE";
}

export function formatBooleanFr(value: boolean | null | undefined): string {
  if (value === true) return "Oui";
  if (value === false) return "Non";
  return "Non disponible";
}

export function formatDcaStatusFr(status: string | null | undefined): string {
  const normalized = asStringLike(status)?.trim().toUpperCase();
  if (!normalized) return "Non disponible";

  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    DRAFT_SUBMITTED: "Brouillon soumis",
    UNDER_RISK_REVIEW: "En revue Direction des Risques",
    MORE_INFO_REQUIRED: "Complément requis",
    READY_FOR_MISSION_CONFIG: "Prêt pour paramétrage mission",
    MISSION_CONFIG_DRAFT: "Configuration mission brouillon",
    MISSION_CONFIGURED: "Mission configurée",
    MISSION_DISPATCH_DRAFT: "Dispatch mission préparé",
    MISSION_SENT: "Mission envoyée",
    FIELD_AUDIT_COMPLETE: "Audit terrain terminé",
    BACK_OFFICE_REVIEW: "Revue back-office",
    RAX_SCORED: "RAX calculé",
    OFFER_SENT: "Offre envoyée",
    FARMER_ACCEPTED: "Accord farmer reçu",
    CONTRACT_SIGNED: "Contrat signé",
    ACTIVE: "Actif",
    CLAIM_OPEN: "Sinistre ouvert",
    CLOSED: "Clôturé",
    REJECTED: "Rejeté",
    UNAVAILABLE: "Non disponible",
  };

  if (labels[normalized]) return labels[normalized];
  return normalized.replaceAll("_", " ");
}

export function formatSourceFr(source: string | null | undefined): string {
  const normalized = asStringLike(source)?.trim().toUpperCase();
  if (!normalized) return "Source non qualifiée";

  const labels: Record<string, string> = {
    LIVE: "Donnée réelle",
    SEED_DEMO: "Donnée de démonstration",
    MANUAL_ESTIMATE: "Estimation déclarative",
    DEGRADED: "Mode dégradé",
    UNAVAILABLE: "Non disponible",
    EXCEL_IMPORT: "Import Excel",
    BACKEND: "Backend",
  };

  return labels[normalized] ?? "Source non qualifiée";
}

export function formatDocumentStatusFr(status: string | null | undefined): string {
  const normalized = asStringLike(status)?.trim().toUpperCase();
  if (!normalized) return "Statut non disponible";

  const labels: Record<string, string> = {
    PREPARED: "Préparé",
    UPLOADED: "Téléversé",
    VERIFIED: "Vérifié",
    REJECTED: "Rejeté",
    PENDING: "En attente",
  };

  return labels[normalized] ?? "Statut non disponible";
}

export function formatSideEffectsSourceFr(source: string | null | undefined): string {
  const normalized = asStringLike(source)?.trim().toUpperCase();
  if (!normalized) return "Source non disponible";
  if (normalized === "BACKEND") return "Confirmé par le backend";
  if (normalized === "FRONTEND_FALLBACK") return "Fallback frontend";
  return "Source non disponible";
}

export function formatSourceOfTruthFr(value: string | null | undefined): string {
  const normalized = asStringLike(value)?.trim().toUpperCase();
  if (!normalized) return "Source de vérité non disponible";
  if (normalized === "DEDICATED_DCA_TABLES") return "Tables DCA dédiées";
  if (normalized === "LEGACY_AUDIT_FALLBACK") return "Ancien fallback d’audit";
  return "Source de vérité non disponible";
}

function mapDcaPreparedDocuments(
  source: unknown,
  fallbackSource: DataSource,
): InsuranceDcaPreparedDocument[] {
  if (!Array.isArray(source)) return [];
  return source.map((item) => {
    const o = asObject(item);
    const docType = asStringLike(o?.type ?? o?.documentType) ?? null;
    const name = asStringLike(o?.name ?? o?.fileName ?? o?.label ?? docType) ?? null;
    const sourceFromPayload = o?.source ?? o?.sourceLabel ?? o?.dataSource;
    const sizeRaw = o?.sizeBytes ?? o?.size ?? o?.fileSize;
    const sizeBytes =
      typeof sizeRaw === "number" && Number.isFinite(sizeRaw) ? sizeRaw : null;
    return {
      id: asStringLike(o?.id ?? o?.documentId) ?? null,
      type: docType,
      label: asStringLike(o?.label ?? o?.title ?? o?.name ?? docType) ?? null,
      filename: asStringLike(o?.fileName ?? o?.filename ?? o?.name) ?? null,
      name,
      status: asStringLike(o?.status ?? o?.documentStatus) ?? null,
      url: toSafeUrl(o?.url ?? o?.downloadUrl ?? o?.fileUrl),
      createdAt: asStringLike(o?.createdAt ?? o?.uploadedAt ?? o?.generatedAt) ?? null,
      source: asSource(sourceFromPayload, fallbackSource),
      // Phase 1.5C — backend upload metadata
      hasUploadedFile:
        typeof o?.hasUploadedFile === "boolean" ? o.hasUploadedFile : null,
      originalFilename:
        asStringLike(o?.originalFilename ?? o?.originalFileName) ?? null,
      storedFilename: asStringLike(o?.storedFilename ?? o?.storedFileName) ?? null,
      mimeType: asStringLike(o?.mimeType ?? o?.contentType) ?? null,
      sizeBytes,
      sha256Hash: asStringLike(o?.sha256Hash ?? o?.hash ?? o?.checksum) ?? null,
      receivedAt: asStringLike(o?.receivedAt ?? o?.uploadedAt) ?? null,
      storageProvider: asStringLike(o?.storageProvider ?? o?.storage) ?? null,
      sourceLabel: asStringLike(o?.sourceLabel ?? o?.dataSource) ?? null,
    };
  });
}

function mapDcaClaimHistory(
  source: unknown,
  fallbackSource: DataSource,
): InsuranceDcaClaimHistoryItem[] {
  if (!Array.isArray(source)) return [];
  return source.map((item) => {
    const o = asObject(item);
    const createdAt = asStringLike(o?.createdAt ?? o?.eventDate ?? o?.date) ?? null;
    const parsedYear =
      asNumber(o?.year) ??
      (() => {
        if (!createdAt) return null;
        const date = new Date(createdAt);
        return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear();
      })();
    return {
      id: asStringLike(o?.id ?? o?.claimEventId ?? o?.claimId) ?? null,
      status: asStringLike(o?.status ?? o?.eventType) ?? null,
      createdAt,
      year: parsedYear,
      type: asStringLike(o?.type ?? o?.claimType ?? o?.eventType) ?? null,
      cause: asStringLike(o?.cause ?? o?.claimCause ?? o?.reason ?? o?.type) ?? null,
      estimatedAmount:
        asNumber(o?.estimatedAmount) ??
        asNumber(o?.estimatedLossMad) ??
        asNumber(o?.amount) ??
        null,
      note:
        asStringLike(o?.note ?? o?.notes ?? o?.description ?? o?.crop) ?? null,
      source: asSource(o?.source ?? o?.sourceLabel ?? o?.dataSource, fallbackSource),
    };
  });
}

export function mapInsuranceDcaApplication(raw: unknown): InsuranceDcaApplication | null {
  const o = asObject(raw);
  if (!o) return null;

  const dataObj = asObject(o.data);
  const applicationObj = asObject(o.application) ?? o;
  const dcaDeclarationObj =
    asObject(o.dcaDeclaration) ?? asObject(applicationObj.dcaDeclaration);
  const rawDeclarationObj =
    asObject(dcaDeclarationObj?.rawDeclaration) ??
    asObject(applicationObj.rawDeclaration);

  const id = asStringLike(
    applicationObj.id ?? applicationObj.applicationId ?? o.id ?? o.applicationId,
  );
  if (!id) return null;

  const source = asSource(
    applicationObj.source ??
      asObject(applicationObj.sourceDisclosure)?.source ??
      o.source ??
      dcaDeclarationObj?.sourceLabel ??
      o.sourceLabel,
    "UNAVAILABLE",
  );

  const declarativeSource = asSource(
    asObject(applicationObj.sourceDisclosure)?.source ??
      dcaDeclarationObj?.sourceLabel ??
      source,
    source,
  );

  const farmerObj =
    asObject(o.farmer) ??
    asObject(applicationObj.farmer) ??
    asObject(o.farmerProfile) ??
    asObject(applicationObj.farmerProfile) ??
    asObject(dcaDeclarationObj?.farmer);

  const parcelleObj =
    asObject(o.parcelle) ??
    asObject(o.parcel) ??
    asObject(applicationObj.parcelle) ??
    asObject(applicationObj.parcel) ??
    asObject(dcaDeclarationObj?.parcelle) ??
    asObject(dcaDeclarationObj?.parcel);

  const declaredArea =
    asNumber(applicationObj.declaredArea) ??
    asNumber(applicationObj.superficie) ??
    asNumber(applicationObj.surfaceHa) ??
    asNumber(applicationObj.areaHa) ??
    asNumber(dcaDeclarationObj?.declaredArea) ??
    asNumber(dcaDeclarationObj?.surfaceHa) ??
    asNumber(dcaDeclarationObj?.areaHa) ??
    asNumber(parcelleObj?.declaredArea) ??
    asNumber(parcelleObj?.superficie) ??
    asNumber(parcelleObj?.surfaceHa) ??
    asNumber(parcelleObj?.areaHa) ??
    null;

  const sideEffectsObj =
    asObject(o.sideEffects) ??
    asObject(applicationObj.sideEffects) ??
    asObject(dataObj?.sideEffects);
  const hasSideEffects = Boolean(sideEffectsObj);
  const sideEffects = {
    missionCreated: asBooleanLike(sideEffectsObj?.missionCreated) ?? false,
    policyCreated: asBooleanLike(sideEffectsObj?.policyCreated) ?? false,
    claimCreated: asBooleanLike(sideEffectsObj?.claimCreated) ?? false,
    raxCalculated: asBooleanLike(sideEffectsObj?.raxCalculated) ?? false,
    pricingCalculated: asBooleanLike(sideEffectsObj?.pricingCalculated) ?? false,
    blockchainAnchored: asBooleanLike(sideEffectsObj?.blockchainAnchored) ?? false,
    sideEffectsSource: hasSideEffects ? ("BACKEND" as const) : ("FRONTEND_FALLBACK" as const),
    sourceNote: hasSideEffects
      ? undefined
      : "UNAVAILABLE / assumed false by frontend fallback",
  };

  const preparedDocuments = mapDcaPreparedDocuments(
    o.preparedDocuments ??
      dcaDeclarationObj?.preparedDocuments ??
      applicationObj.preparedDocuments ??
      asObject(applicationObj.dcaDeclaration)?.preparedDocuments ??
      rawDeclarationObj?.documentsPrepared ??
      o.documents,
    source,
  );

  const claimHistory = mapDcaClaimHistory(
    o.declaredClaimEvents ??
      o.claimHistory ??
      o.claimEvents ??
      o.insuranceDcaClaimEvents ??
      dcaDeclarationObj?.claimEvents ??
      dcaDeclarationObj?.declaredClaimEvents ??
      asObject(applicationObj.dcaDeclaration)?.claimEvents ??
      asObject(applicationObj.dcaDeclaration)?.declaredClaimEvents ??
      asObject(rawDeclarationObj?.declaredClaimHistory)?.events,
    source,
  );

  const phoneRaw =
    asStringLike(farmerObj?.phoneMasked ?? farmerObj?.maskedPhone ?? farmerObj?.phone) ?? null;
  const cinRaw =
    asStringLike(farmerObj?.cinMasked ?? farmerObj?.nationalIdMasked ?? farmerObj?.cin) ?? null;

  const frontendStatus = asStringLike(
    o.frontendStatus ?? applicationObj.frontendStatus ?? dataObj?.frontendStatus,
  );
  const backendStatus = asStringLike(applicationObj.status ?? o.status ?? dataObj?.status);
  const status = resolveDcaStatus(frontendStatus ?? backendStatus);

  const consentCndp =
    asBooleanLike(
      dcaDeclarationObj?.consentCndp ??
        asObject(applicationObj.dcaDeclaration)?.consentCndp ??
        applicationObj.cndpConsentChecked ??
        farmerObj?.cndpConsent,
    ) ?? null;

  const consentCndpAt =
    asStringLike(
      applicationObj.cndpConsentTimestamp ??
        farmerObj?.cndpConsentAt ??
        asObject(applicationObj.farmer)?.cndpConsentAt,
    ) ?? null;

  const preferredLanguage =
    asStringLike(
      dcaDeclarationObj?.preferredLanguage ??
        asObject(applicationObj.dcaDeclaration)?.preferredLanguage ??
        rawDeclarationObj?.preferredLanguage,
    ) ?? null;

  const periodYears =
    asNumber(dcaDeclarationObj?.periodYears) ??
    asNumber(asObject(applicationObj.dcaDeclaration)?.periodYears) ??
    null;
  const noClaimsDeclared =
    asBooleanLike(
      dcaDeclarationObj?.noClaimsDeclared ??
        asObject(applicationObj.dcaDeclaration)?.noClaimsDeclared,
    ) ?? null;

  return {
    id,
    reference: asStringLike(applicationObj.reference ?? applicationObj.dcaNumber) ?? null,
    dcaNumber: asStringLike(applicationObj.dcaNumber ?? applicationObj.reference) ?? null,
    status,
    backendStatus,
    source,
    declarativeSource,
    sourceOfTruth: asStringLike(dcaDeclarationObj?.sourceOfTruth) ?? null,
    legacyAuditFallbackUsed:
      asBooleanLike(dcaDeclarationObj?.legacyAuditFallbackUsed) ?? null,
    submittedAt:
      asStringLike(applicationObj.submittedAt ?? applicationObj.createdAt) ?? null,
    createdAt: asStringLike(applicationObj.createdAt ?? o.createdAt) ?? null,
    periodYears,
    noClaimsDeclared,
    applicationCountry: asStringLike(applicationObj.country) ?? null,
    farmerCountry: asStringLike(farmerObj?.country) ?? null,
    parcelleCountry: asStringLike(parcelleObj?.country) ?? null,
    farmer: {
      id: asStringLike(farmerObj?.id ?? farmerObj?.farmerId) ?? null,
      firstName: asStringLike(farmerObj?.firstName) ?? null,
      lastName: asStringLike(farmerObj?.lastName) ?? null,
      phoneMasked:
        asStringLike(farmerObj?.phoneMasked ?? farmerObj?.maskedPhone) ??
        maskPhone(phoneRaw),
      cinMasked:
        asStringLike(farmerObj?.cinMasked ?? farmerObj?.nationalIdMasked) ??
        maskCin(cinRaw),
      preferredLanguage:
        preferredLanguage ??
        asStringLike(
          farmerObj?.preferredLanguage ?? farmerObj?.language ?? farmerObj?.locale,
        ) ??
        null,
      source: asSource(farmerObj?.source ?? source, source),
    },
    parcelle: {
      id: asStringLike(parcelleObj?.id ?? parcelleObj?.parcelleId ?? parcelleObj?.parcelId) ?? null,
      name: asStringLike(parcelleObj?.name ?? parcelleObj?.label) ?? null,
      culture: asStringLike(parcelleObj?.culture ?? parcelleObj?.crop) ?? null,
      superficie:
        asNumber(parcelleObj?.superficie) ??
        asNumber(parcelleObj?.surfaceHa) ??
        asNumber(parcelleObj?.areaHa) ??
        null,
      declaredArea,
      lat: asNumber(parcelleObj?.lat ?? applicationObj.lat ?? o.lat) ?? null,
      lng: asNumber(parcelleObj?.lng ?? applicationObj.lng ?? o.lng) ?? null,
      country: asStringLike(parcelleObj?.country) ?? null,
      source: asSource(parcelleObj?.source ?? source, source),
    },
    crop:
      asStringLike(applicationObj.crop ?? applicationObj.cropCode ?? applicationObj.cropType) ??
      asStringLike(dcaDeclarationObj?.crop) ??
      asStringLike(parcelleObj?.crop ?? parcelleObj?.culture) ??
      null,
    culture:
      asStringLike(applicationObj.culture ?? applicationObj.cropType) ??
      asStringLike(parcelleObj?.culture ?? parcelleObj?.crop) ??
      null,
    declaredArea,
    consentCndp,
    consentCndpAt,
    consentCndpSource: asSource(
      dcaDeclarationObj?.sourceLabel ??
        applicationObj.cndpSource ??
        applicationObj.consentCndpSource ??
        source,
      source,
    ),
    preparedDocuments,
    claimHistory,
    sideEffects,
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
  const id =
    asStringLike(pickFirstValue(o, ["id", "alertId", "alert_id"])) ?? null;
  const type =
    asStringLike(pickFirstValue(o, ["type", "alertType", "alert_type", "category"])) ??
    undefined;
  const title = asStringLike(pickFirstValue(o, ["title", "titre"])) ?? undefined;
  const message =
    asStringLike(pickFirstValue(o, ["message", "description"])) ?? title ?? type ?? null;
  if (!id || !message) return null;

  const createdAt =
    asStringLike(pickFirstValue(o, ["createdAt", "created_at"])) ??
    new Date(0).toISOString();

  return {
    id,
    farmerId:
      asStringLike(pickFirstValue(o, ["farmerId", "farmer_id"])) ?? undefined,
    cooperativeId:
      asStringLike(
        pickFirstValue(o, ["cooperativeId", "cooperative_id", "coopId", "coop_id"]),
      ) ??
      undefined,
    parcelleId:
      asStringLike(pickFirstValue(o, ["parcelleId", "parcelle_id"])) ?? undefined,
    farmerName:
      asStringLike(pickFirstValue(o, ["farmerName", "farmer_name"])) ?? undefined,
    cooperativeName:
      asStringLike(pickFirstValue(o, ["cooperativeName", "cooperative_name"])) ??
      undefined,
    parcelleName:
      asStringLike(pickFirstValue(o, ["parcelleName", "parcelle_name"])) ?? undefined,
    type,
    severity: normalizeWakamaAlertSeverity(pickFirstValue(o, ["severity", "level"])),
    title,
    message,
    read: asBooleanLike(pickFirstValue(o, ["read", "isRead", "is_read"])) ?? undefined,
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
