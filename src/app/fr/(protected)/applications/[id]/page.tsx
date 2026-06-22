"use client";

import { use, useEffect, useMemo, useState } from "react";

import {
  acceptInsuranceFieldAuditForReview,
  ApiError,
  assignInsuranceMissionDispatch,
  createInsuranceMissionDispatchDraft,
  CreateInsuranceMissionDispatchDraftResult,
  FieldAgent,
  getInsuranceApplicationById,
  getInsuranceFieldAgents,
  getInsuranceMissionConfig,
  getInsuranceMissionConfigVersions,
  InsuranceApplicationByIdResult,
  InsuranceMissionConfig,
  InsuranceMissionConfigPayload,
  InsuranceMissionConfigSideEffects,
  InsuranceRiskReviewStatus,
  MissionDispatchResult,
  saveInsuranceMissionConfig,
  sendInsuranceMissionDispatch,
  updateInsuranceApplicationStatus,
} from "@/lib/api";
import { InsuranceFieldAudit } from "@/types";
import {
  formatBooleanFr,
  formatDcaStatusFr,
  formatDocumentStatusFr,
  formatSideEffectsSourceFr,
  formatSourceFr,
  formatSourceOfTruthFr,
} from "@/lib/dto-mappers";
import { InsuranceDcaApplication } from "@/types";
import { useTenant } from "@/components/tenant/useTenant";
import { PageTitle } from "@/components/ui/page-title";
import {
  formatAmountForCountry,
  getCountryLabel,
  getIdentityDocumentLabel,
  getPrivacyConsentLabel,
} from "@/lib/country-labels";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value?: string | null) {
  if (!value) return "Non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatFieldAuditStatusFr(status: string | null | undefined): string {
  switch (status) {
    case "FIELD_AUDIT_NOT_STARTED": return "Non démarré";
    case "FIELD_AUDIT_IN_PROGRESS": return "En cours";
    case "FIELD_AUDIT_SUBMITTED": return "Soumis par agent";
    case "FIELD_AUDIT_SECURITY_HOLD": return "Blocage sécurité";
    case "FIELD_AUDIT_ACCEPTED_FOR_REVIEW": return "Accepté pour revue";
    case "READY_FOR_BACK_OFFICE_REVIEW": return "Prêt pour revue back-office";
    default: return status ?? "Non disponible";
  }
}

function formatHashStatusFr(status: string | null | undefined): string {
  switch (status) {
    case "PENDING": return "Vérification en attente";
    case "SERVER_VALIDATED": return "Hash serveur validé";
    case "NEEDS_REVIEW": return "Revue nécessaire";
    case "SECURITY_HOLD": return "Blocage sécurité — hash non validé";
    default: return status ?? "Non disponible";
  }
}

function formatFieldAuditSourceFr(source: string | null | undefined): string {
  switch (source) {
    case "AGENT_APP": return "App agent terrain";
    case "LIVE": return "LIVE";
    case "MANUAL_ESTIMATE": return "Estimation manuelle";
    case "SEED_DEMO": return "Démo seedée";
    case "DEGRADED": return "Dégradé";
    case "UNAVAILABLE": return "Non disponible";
    default: return source ?? "Non disponible";
  }
}

function maskAgentUserId(id: string | null | undefined): string {
  if (!id) return "Non disponible";
  if (id.length <= 8) return `AGT-****`;
  return `AGT-${id.slice(0, 4).toUpperCase()}…${id.slice(-4).toUpperCase()}`;
}

// ── Design system components ─────────────────────────────────────────────────

type DcaAccent = "cyan" | "emerald" | "violet" | "amber" | "rose" | "slate";

function DcaSectionCard({ children, accent = "slate" }: { children: React.ReactNode; accent?: DcaAccent }) {
  const border: Record<DcaAccent, string> = {
    cyan: "border-cyan-400/20",
    emerald: "border-emerald-400/20",
    violet: "border-violet-400/20",
    amber: "border-amber-400/20",
    rose: "border-rose-400/25",
    slate: "border-slate-400/15",
  };
  return (
    <div className={`rounded-2xl border ${border[accent]} bg-[#0b1220] p-5 shadow-lg space-y-4`}>
      {children}
    </div>
  );
}

function DcaSectionHeader({
  kicker,
  title,
  subtitle,
  accent = "slate",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  accent?: DcaAccent;
}) {
  const bl: Record<DcaAccent, string> = {
    cyan: "border-l-cyan-400",
    emerald: "border-l-emerald-400",
    violet: "border-l-violet-500",
    amber: "border-l-amber-400",
    rose: "border-l-rose-400",
    slate: "border-l-slate-500",
  };
  return (
    <div className={`border-l-2 pl-3 ${bl[accent]}`}>
      {kicker && <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{kicker}</p>}
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
    </div>
  );
}

function DcaInfoTile({
  label,
  value,
  mono = false,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`space-y-0.5 ${full ? "col-span-full" : ""}`}>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <div className={`text-sm text-slate-200 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</div>
    </div>
  );
}

function DcaStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-slate-500 text-xs">—</span>;
  const map: Record<string, string> = {
    DRAFT: "border-slate-400/25 bg-slate-800/60 text-slate-300",
    DRAFT_SUBMITTED: "border-cyan-400/35 bg-cyan-500/10 text-cyan-100",
    UNDER_RISK_REVIEW: "border-amber-400/35 bg-amber-500/10 text-amber-100",
    MORE_INFO_REQUIRED: "border-orange-400/35 bg-orange-500/10 text-orange-100",
    READY_FOR_MISSION_CONFIG: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
    MISSION_CONFIG_DRAFT: "border-sky-400/30 bg-sky-500/8 text-sky-200",
    MISSION_CONFIGURED: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
    MISSION_DISPATCH_DRAFT: "border-indigo-400/35 bg-indigo-500/10 text-indigo-100",
    MISSION_SENT: "border-violet-400/35 bg-violet-500/10 text-violet-100",
    FIELD_AUDIT_COMPLETE: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    BACK_OFFICE_REVIEW: "border-violet-400/40 bg-violet-500/15 text-violet-200",
    RAX_SCORED: "border-cyan-400/40 bg-cyan-500/15 text-cyan-200",
    OFFER_SENT: "border-amber-400/35 bg-amber-500/10 text-amber-100",
    FARMER_ACCEPTED: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
    CONTRACT_SIGNED: "border-emerald-400/45 bg-emerald-500/20 text-emerald-100",
    ACTIVE: "border-emerald-400/50 bg-emerald-500/20 text-emerald-100 font-semibold",
    CLAIM_OPEN: "border-rose-400/40 bg-rose-500/15 text-rose-200",
    CLOSED: "border-slate-400/30 bg-slate-700/30 text-slate-400",
    REJECTED: "border-rose-400/35 bg-rose-500/10 text-rose-200",
    UNAVAILABLE: "border-slate-400/20 bg-slate-800/50 text-slate-500",
  };
  const cls = map[status] ?? "border-slate-400/25 bg-slate-800/60 text-slate-300";
  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${cls}`}>
      {formatDcaStatusFr(status as InsuranceDcaApplication["status"] | "UNAVAILABLE")}
    </span>
  );
}

function DcaSourceBadge({ source }: { source: string | null | undefined }) {
  if (!source) return <span className="text-slate-500 text-xs">—</span>;
  const map: Record<string, string> = {
    LIVE: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    MANUAL_ESTIMATE: "border-amber-400/35 bg-amber-500/10 text-amber-200",
    SEED_DEMO: "border-violet-400/30 bg-violet-500/8 text-violet-300",
    EXCEL_IMPORT: "border-cyan-400/30 bg-cyan-500/8 text-cyan-300",
    UNAVAILABLE: "border-slate-400/20 bg-slate-800/50 text-slate-500",
    DEGRADED: "border-orange-400/30 bg-orange-500/8 text-orange-300",
    MANUAL_ENTRY: "border-amber-400/25 bg-amber-500/8 text-amber-300",
  };
  const cls = map[source] ?? "border-slate-400/20 bg-slate-800/50 text-slate-400";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {formatSourceFr(source as InsuranceDcaApplication["source"])}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SideEffectPill({ label, active }: { label: string; active: boolean }) {
  return active ? (
    <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200">
      {label}
    </span>
  ) : (
    <span className="rounded-full border border-slate-400/20 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-slate-500">
      {label}
    </span>
  );
}

function FieldAuditStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const variants: Record<string, string> = {
    FIELD_AUDIT_SUBMITTED: "border-cyan-400/35 bg-cyan-500/10 text-cyan-100",
    FIELD_AUDIT_ACCEPTED_FOR_REVIEW: "border-indigo-400/35 bg-indigo-500/10 text-indigo-100",
    READY_FOR_BACK_OFFICE_REVIEW: "border-violet-400/35 bg-violet-500/10 text-violet-100",
    FIELD_AUDIT_SECURITY_HOLD: "border-rose-400/35 bg-rose-500/10 text-rose-200",
    FIELD_AUDIT_IN_PROGRESS: "border-amber-400/35 bg-amber-500/10 text-amber-200",
  };
  const cls = variants[status] ?? "border-slate-400/25 bg-slate-800/50 text-slate-300";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {formatFieldAuditStatusFr(status)}
    </span>
  );
}

function hasWaitingReviewStatus(status: InsuranceDcaApplication["status"]) {
  return status === "DRAFT" || status === "DRAFT_SUBMITTED";
}

const NON_ACTIONABLE_RISK_REVIEW_STATUSES: InsuranceDcaApplication["status"][] = [
  "MISSION_DISPATCH_DRAFT",
  "MISSION_SENT",
  "FIELD_AUDIT_COMPLETE",
  "RAX_SCORED",
  "OFFER_SENT",
  "CONTRACT_SIGNED",
  "ACTIVE",
  "CLAIM_OPEN",
  "CLOSED",
  "UNAVAILABLE",
];

const RISK_REVIEW_NOTE_MAX_LENGTH = 500;

const MISSION_CONFIG_NOTE_MAX_LENGTH = 500;
const MISSION_DISPATCH_NOTE_MAX_LENGTH = 1000;

const MISSION_CONFIG_AND_DISPATCH_COMPATIBLE_STATUSES: InsuranceDcaApplication["status"][] = [
  "READY_FOR_MISSION_CONFIG",
  "MISSION_CONFIG_DRAFT",
  "MISSION_CONFIGURED",
  "MISSION_DISPATCH_DRAFT",
];

const MISSION_DISPATCH_LOCKED_STATUSES: InsuranceDcaApplication["status"][] = [
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
  "UNAVAILABLE",
];

const DEFAULT_MISSION_CONFIG: InsuranceMissionConfigPayload = {
  missionType: "FIELD_AUDIT_PREPARATION",
  proofLevel: "STANDARD",
  surfaceTolerancePercent: 5,
  requiresPolygonCheck: true,
  requiresCinCheck: true,
  requiresLandDocumentCheck: true,
  requiredDocuments: ["CIN", "ATTESTATION_EXPLOITATION", "POLYGONE_GPS"],
  requiredChecks: {
    polygon: true,
    identity: true,
    landDocument: true,
    surfaceTolerance: true,
  },
  status: "MISSION_CONFIG_DRAFT",
};

const DEFAULT_MISSION_CONFIG_SIDE_EFFECTS: InsuranceMissionConfigSideEffects = {
  missionCreated: false,
  missionSent: false,
  fieldAuditCreated: false,
  raxCalculated: false,
  pricingCalculated: false,
  policyCreated: false,
  claimCreated: false,
  evidenceBundleCreated: false,
  blockchainAnchored: false,
};

interface MissionConfigFormState {
  missionType: string;
  proofLevel: string;
  surfaceTolerancePercent: string;
  requiresPolygonCheck: boolean;
  requiresCinCheck: boolean;
  requiresLandDocumentCheck: boolean;
  requiredDocumentsText: string;
  checkPolygon: boolean;
  checkIdentity: boolean;
  checkLandDocument: boolean;
  checkSurfaceTolerance: boolean;
  noteDirectionRisques: string;
  status: string;
}

interface MissionDispatchFormState {
  scheduledWindowStart: string;
  scheduledWindowEnd: string;
  dispatchNote: string;
}

function toMissionConfigFormState(config: InsuranceMissionConfig | null): MissionConfigFormState {
  const source = config
    ? {
        missionType: config.missionType || DEFAULT_MISSION_CONFIG.missionType,
        proofLevel: config.proofLevel || DEFAULT_MISSION_CONFIG.proofLevel,
        surfaceTolerancePercent:
          Number.isFinite(config.surfaceTolerancePercent) && config.surfaceTolerancePercent >= 0
            ? config.surfaceTolerancePercent
            : DEFAULT_MISSION_CONFIG.surfaceTolerancePercent,
        requiresPolygonCheck: config.requiresPolygonCheck,
        requiresCinCheck: config.requiresCinCheck,
        requiresLandDocumentCheck: config.requiresLandDocumentCheck,
        requiredDocuments:
          config.requiredDocuments.length > 0
            ? config.requiredDocuments
            : DEFAULT_MISSION_CONFIG.requiredDocuments,
        requiredChecks: {
          polygon: config.requiredChecks.polygon,
          identity: config.requiredChecks.identity,
          landDocument: config.requiredChecks.landDocument,
          surfaceTolerance: config.requiredChecks.surfaceTolerance,
        },
        noteDirectionRisques: config.noteDirectionRisques,
        status: config.status || DEFAULT_MISSION_CONFIG.status,
      }
    : DEFAULT_MISSION_CONFIG;

  return {
    missionType: source.missionType,
    proofLevel: source.proofLevel,
    surfaceTolerancePercent: String(source.surfaceTolerancePercent),
    requiresPolygonCheck: source.requiresPolygonCheck,
    requiresCinCheck: source.requiresCinCheck,
    requiresLandDocumentCheck: source.requiresLandDocumentCheck,
    requiredDocumentsText: source.requiredDocuments.join(", "),
    checkPolygon: source.requiredChecks.polygon,
    checkIdentity: source.requiredChecks.identity,
    checkLandDocument: source.requiredChecks.landDocument,
    checkSurfaceTolerance: source.requiredChecks.surfaceTolerance,
    noteDirectionRisques: source.noteDirectionRisques ?? "",
    status: source.status,
  };
}

function parseRequiredDocuments(value: string): string[] {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDateTimeLocalInputValue(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoStringFromDateTimeLocal(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function toMissionDispatchFormState(
  draft?: CreateInsuranceMissionDispatchDraftResult["missionDispatchDraft"] | null,
): MissionDispatchFormState {
  return {
    scheduledWindowStart: toDateTimeLocalInputValue(draft?.scheduledWindowStart ?? null),
    scheduledWindowEnd: toDateTimeLocalInputValue(draft?.scheduledWindowEnd ?? null),
    dispatchNote: draft?.dispatchNote ?? "",
  };
}

const RISK_REVIEW_REASONS: Record<InsuranceRiskReviewStatus, string> = {
  UNDER_RISK_REVIEW: "Contrôle dossier avant mission",
  MORE_INFO_REQUIRED: "Complément requis avant poursuite",
  READY_FOR_MISSION_CONFIG: "Revue Direction des Risques terminée",
};

const RISK_REVIEW_ACTION_LABELS: Record<InsuranceRiskReviewStatus, string> = {
  UNDER_RISK_REVIEW: "Prendre en revue",
  MORE_INFO_REQUIRED: "Demander complément",
  READY_FOR_MISSION_CONFIG: "Prêt pour paramétrage mission",
};

function getDetailLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "Requete invalide pour le detail DCA.";
    }
    if (error.status === 401) {
      return "Session expirée (401). Veuillez vous reconnecter.";
    }
    if (error.status === 403) {
      return "Acces refuse (403) sur le detail DCA.";
    }
    if (error.status === 404) {
      return "Dossier introuvable (404).";
    }
    return error.message || "Erreur API sur le detail DCA.";
  }
  return "Service indisponible. Impossible de charger le detail DCA.";
}

function getRiskReviewMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Mise à jour de statut impossible.";
  }
  if (error.status === 400) {
    return "Requete invalide (400) pour la revue Direction des Risques.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Acces refuse (403) pour la revue Direction des Risques.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour la revue Direction des Risques.";
  }
  return error.message || "Erreur API pendant la revue Direction des Risques.";
}

function getMissionConfigLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Impossible de charger la configuration mission.";
  }
  if (error.status === 400) {
    return "Requete invalide (400) sur la configuration mission.";
  }
  if (error.status === 401) {
    return "Session expiree (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Acces refuse (403) sur la configuration mission.";
  }
  return error.message || "Erreur API pendant le chargement de la configuration mission.";
}

function getMissionConfigSaveErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Enregistrement du brouillon impossible.";
  }
  if (error.status === 400) {
    return "Requete invalide (400) pour l'enregistrement du brouillon.";
  }
  if (error.status === 401) {
    return "Session expiree (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Acces refuse (403) pour l'enregistrement du brouillon.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour la configuration mission.";
  }
  return error.message || "Erreur API pendant l'enregistrement du brouillon.";
}

function getMissionDispatchMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Préparation du dispatch impossible.";
  }
  if (error.status === 400) {
    return "Requête invalide (400) pour la préparation du dispatch.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) pour la préparation du dispatch.";
  }
  if (error.status === 404) {
    return "Dossier DCA introuvable (404) pour la préparation du dispatch.";
  }
  return error.message || "Erreur API pendant la préparation du dispatch.";
}

function hasForbiddenSideEffects(
  sideEffects: {
    missionCreated: boolean;
    policyCreated: boolean;
    claimCreated: boolean;
    raxCalculated: boolean;
    pricingCalculated: boolean;
    blockchainAnchored: boolean;
  },
): boolean {
  return (
    sideEffects.missionCreated ||
    sideEffects.policyCreated ||
    sideEffects.claimCreated ||
    sideEffects.raxCalculated ||
    sideEffects.pricingCalculated ||
    sideEffects.blockchainAnchored
  );
}

function hasMissionConfigForbiddenSideEffects(sideEffects: InsuranceMissionConfigSideEffects): boolean {
  return (
    sideEffects.missionCreated ||
    sideEffects.missionSent ||
    sideEffects.fieldAuditCreated ||
    sideEffects.raxCalculated ||
    sideEffects.pricingCalculated ||
    sideEffects.policyCreated ||
    sideEffects.claimCreated ||
    sideEffects.evidenceBundleCreated ||
    sideEffects.blockchainAnchored
  );
}

function hasMissionDispatchForbiddenSideEffects(
  sideEffects: CreateInsuranceMissionDispatchDraftResult["sideEffects"],
): boolean {
  return (
    (sideEffects.missionCreated ?? false) ||
    sideEffects.missionSent ||
    sideEffects.fieldAuditCreated ||
    sideEffects.raxCalculated ||
    sideEffects.pricingCalculated ||
    sideEffects.policyCreated ||
    sideEffects.claimCreated ||
    sideEffects.evidenceBundleCreated ||
    sideEffects.blockchainAnchored
  );
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { tenant } = useTenant();
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const isAssuranceTenant = tenant.id === "assurance-ma";
  const policyLabel = tenant.terminology.policyLabel;
  const claimLabel = tenant.terminology.claimLabel;
  const policyLabelCapitalized = policyLabel.charAt(0).toUpperCase() + policyLabel.slice(1);
  const claimLabelCapitalized = claimLabel.charAt(0).toUpperCase() + claimLabel.slice(1);
  const detailSectionSubtitle = isAssuranceTenant
    ? "Lecture seule du dossier DCA."
    : "Lecture seule du dossier institutionnel.";
  const detailPageTitlePrefix = isAssuranceTenant ? "Dossier DCA" : "Dossier";
  const detailPageDescription = isAssuranceTenant
    ? "Lecture seule du detail d'un dossier DCA farmer."
    : "Lecture seule du dossier institutionnel. Les donnees et decisions restent sous controle de l'institution.";
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<InsuranceApplicationByIdResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskReviewNote, setRiskReviewNote] = useState("");
  const [riskReviewActionLoading, setRiskReviewActionLoading] =
    useState<InsuranceRiskReviewStatus | null>(null);
  const [riskReviewFeedback, setRiskReviewFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [missionConfigLoading, setMissionConfigLoading] = useState(false);
  const [missionConfigSaving, setMissionConfigSaving] = useState(false);
  const [missionConfigError, setMissionConfigError] = useState<string | null>(null);
  const [missionConfigFeedback, setMissionConfigFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [missionConfig, setMissionConfig] = useState<InsuranceMissionConfig | null>(null);
  const [missionConfigVersionsCount, setMissionConfigVersionsCount] = useState(0);
  const [missionConfigLatestVersion, setMissionConfigLatestVersion] = useState<number | null>(null);
  const [missionConfigSideEffects, setMissionConfigSideEffects] = useState<InsuranceMissionConfigSideEffects>(
    DEFAULT_MISSION_CONFIG_SIDE_EFFECTS,
  );
  const [missionConfigForm, setMissionConfigForm] = useState<MissionConfigFormState>(
    toMissionConfigFormState(null),
  );
  const [missionDispatchSaving, setMissionDispatchSaving] = useState(false);
  const [missionDispatchFeedback, setMissionDispatchFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [missionDispatchSideEffects, setMissionDispatchSideEffects] =
    useState<CreateInsuranceMissionDispatchDraftResult["sideEffects"] | null>(null);
  const [missionDispatchForm, setMissionDispatchForm] = useState<MissionDispatchFormState>(
    toMissionDispatchFormState(null),
  );
  const [fieldAgents, setFieldAgents] = useState<FieldAgent[]>([]);
  const [fieldAgentsLoading, setFieldAgentsLoading] = useState(false);
  const [selectedAgentUserId, setSelectedAgentUserId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [dispatchResult, setDispatchResult] = useState<MissionDispatchResult | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [acceptAuditLoading, setAcceptAuditLoading] = useState(false);
  const [acceptAuditFeedback, setAcceptAuditFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setResult(null);
      setError(null);

      try {
        const response = await getInsuranceApplicationById(applicationId);
        if (!mounted) return;
        setResult(response);
      } catch (loadError) {
        if (!mounted) return;
        setError(getDetailLoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function refreshApplicationAfterMutation() {
    const response = await getInsuranceApplicationById(applicationId);
    setResult(response);
    setError(null);
  }

  async function handleRiskReviewAction(status: InsuranceRiskReviewStatus) {
    if (riskReviewActionLoading) return;

    setRiskReviewFeedback(null);
    setRiskReviewActionLoading(status);

    try {
      const response = await updateInsuranceApplicationStatus(applicationId, {
        status,
        riskReviewNote: riskReviewNote.trim() || undefined,
        riskReviewReason: RISK_REVIEW_REASONS[status],
      });

      await refreshApplicationAfterMutation();

      if (!response.sideEffectsPresent) {
        setRiskReviewFeedback({
          type: "critical",
          message:
            "Erreur critique: la réponse backend ne contient pas sideEffects. Action non validée côté revue Direction des Risques.",
        });
        return;
      }

      if (hasForbiddenSideEffects(response.sideEffects)) {
        setRiskReviewFeedback({
          type: "critical",
          message:
            "Erreur critique: un effet secondaire interdit a été détecté (mission/RAX/pricing/police/sinistre/blockchain). Action non validée.",
        });
        return;
      }

      const backendStatus = response.status ?? status;
      setRiskReviewFeedback({
        type: "success",
        message: `Statut mis à jour: ${formatDcaStatusFr(backendStatus)}.`,
      });
    } catch (mutationError) {
      setRiskReviewFeedback({
        type: "error",
        message: getRiskReviewMutationErrorMessage(mutationError),
      });
    } finally {
      setRiskReviewActionLoading(null);
    }
  }

  async function handleMissionConfigSave() {
    if (missionConfigSaving || missionConfigLoading) return;

    const surfaceTolerancePercent = Number(missionConfigForm.surfaceTolerancePercent);
    if (!Number.isFinite(surfaceTolerancePercent) || surfaceTolerancePercent < 0) {
      setMissionConfigFeedback({
        type: "error",
        message: "Le pourcentage de tolerance surface doit etre un nombre positif.",
      });
      return;
    }

    const requiredDocuments = parseRequiredDocuments(missionConfigForm.requiredDocumentsText);
    if (requiredDocuments.length === 0) {
      setMissionConfigFeedback({
        type: "error",
        message: "Au moins un document requis doit etre renseigne.",
      });
      return;
    }

    const payload: InsuranceMissionConfigPayload = {
      missionType: missionConfigForm.missionType.trim() || DEFAULT_MISSION_CONFIG.missionType,
      proofLevel: missionConfigForm.proofLevel.trim() || DEFAULT_MISSION_CONFIG.proofLevel,
      surfaceTolerancePercent,
      requiresPolygonCheck: missionConfigForm.requiresPolygonCheck,
      requiresCinCheck: missionConfigForm.requiresCinCheck,
      requiresLandDocumentCheck: missionConfigForm.requiresLandDocumentCheck,
      requiredDocuments,
      requiredChecks: {
        polygon: missionConfigForm.checkPolygon,
        identity: missionConfigForm.checkIdentity,
        landDocument: missionConfigForm.checkLandDocument,
        surfaceTolerance: missionConfigForm.checkSurfaceTolerance,
      },
      noteDirectionRisques: missionConfigForm.noteDirectionRisques.trim() || undefined,
      status: missionConfigForm.status.trim() || DEFAULT_MISSION_CONFIG.status,
    };

    setMissionConfigSaving(true);
    setMissionConfigError(null);
    setMissionConfigFeedback(null);

    try {
      const savedConfig = await saveInsuranceMissionConfig(applicationId, payload);
      const sideEffects = savedConfig?.sideEffects ?? DEFAULT_MISSION_CONFIG_SIDE_EFFECTS;
      setMissionConfig(savedConfig);
      setMissionConfigSideEffects(sideEffects);
      setMissionConfigForm(toMissionConfigFormState(savedConfig));

      const versions = await getInsuranceMissionConfigVersions(applicationId).catch((error) => {
        if (error instanceof ApiError && error.status === 404) return [];
        throw error;
      });
      setMissionConfigVersionsCount(versions.length);
      setMissionConfigLatestVersion(
        versions.length > 0
          ? Math.max(...versions.map((item) => item.version ?? 0))
          : (savedConfig?.version ?? null),
      );

      if (hasMissionConfigForbiddenSideEffects(sideEffects)) {
        setMissionConfigFeedback({
          type: "critical",
          message:
            "Erreur critique: un effet secondaire interdit a ete detecte (mission terrain, audit, RAX, pricing, police, sinistre, evidence, blockchain).",
        });
        return;
      }

      setMissionConfigFeedback({
        type: "success",
        message: "Brouillon mission enregistre. Aucune mission terrain n'a ete envoyee.",
      });
    } catch (saveError) {
      setMissionConfigFeedback({
        type: "error",
        message: getMissionConfigSaveErrorMessage(saveError),
      });
    } finally {
      setMissionConfigSaving(false);
    }
  }

  async function handleMissionDispatchDraftPrepare() {
    if (missionDispatchSaving || missionConfigLoading) return;

    const missionConfigId = missionConfig?.id?.trim() ?? "";
    if (!missionConfigId) {
      setMissionDispatchFeedback({
        type: "error",
        message: "Configuration mission requise avant préparation du dispatch.",
      });
      return;
    }

    const scheduledWindowStartIso = toIsoStringFromDateTimeLocal(missionDispatchForm.scheduledWindowStart);
    const scheduledWindowEndIso = toIsoStringFromDateTimeLocal(missionDispatchForm.scheduledWindowEnd);

    if (scheduledWindowStartIso && scheduledWindowEndIso) {
      const startDate = new Date(scheduledWindowStartIso);
      const endDate = new Date(scheduledWindowEndIso);
      if (endDate.getTime() <= startDate.getTime()) {
        setMissionDispatchFeedback({
          type: "error",
          message: "La fenêtre de fin doit être postérieure au début.",
        });
        return;
      }
    }

    setMissionDispatchSaving(true);
    setMissionDispatchFeedback(null);

    try {
      const response = await createInsuranceMissionDispatchDraft(applicationId, {
        missionConfigId,
        dispatchMode: "DRAFT_ONLY",
        scheduledWindowStart: scheduledWindowStartIso,
        scheduledWindowEnd: scheduledWindowEndIso,
        dispatchNote: missionDispatchForm.dispatchNote.trim() || undefined,
      });

      setMissionDispatchForm(toMissionDispatchFormState(response.missionDispatchDraft));
      setMissionDispatchSideEffects(response.sideEffects);
      await refreshApplicationAfterMutation();

      if (hasMissionDispatchForbiddenSideEffects(response.sideEffects)) {
        setMissionDispatchFeedback({
          type: "critical",
          message:
            "ALERTE — Un effet secondaire interdit a été détecté. Vérifier immédiatement le backend.",
        });
        return;
      }

      setMissionDispatchFeedback({
        type: "success",
        message: "Dispatch mission préparé",
      });
    } catch (mutationError) {
      setMissionDispatchFeedback({
        type: "error",
        message: getMissionDispatchMutationErrorMessage(mutationError),
      });
    } finally {
      setMissionDispatchSaving(false);
    }
  }

  async function handleAssignAgent() {
    if (assignLoading || !selectedAgentUserId) return;
    const missionConfigId = missionConfig?.id?.trim() ?? "";
    if (!missionConfigId) {
      setAssignFeedback({ type: "error", message: "Configuration mission requise avant assignation." });
      return;
    }
    setAssignLoading(true);
    setAssignFeedback(null);
    try {
      const result = await assignInsuranceMissionDispatch(applicationId, {
        missionConfigId,
        assignedAgentUserId: selectedAgentUserId,
        dispatchNote: missionDispatchForm.dispatchNote.trim() || undefined,
      });
      setDispatchResult(result);
      setAssignFeedback({ type: "success", message: `Agent assigné — statut: ${result.status}` });
    } catch (err) {
      setAssignFeedback({ type: "error", message: err instanceof Error ? err.message : "Erreur lors de l'assignation." });
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleSendDispatch() {
    if (sendLoading || !dispatchResult?.missionConfigId) return;
    setSendLoading(true);
    setSendFeedback(null);
    try {
      const result = await sendInsuranceMissionDispatch(applicationId, dispatchResult.missionConfigId);
      setDispatchResult(result);
      await refreshApplicationAfterMutation();
      setSendFeedback({ type: "success", message: `Dispatch envoyé — statut: ${result.status}. Visible dans l'Agent App.` });
    } catch (err) {
      setSendFeedback({ type: "error", message: err instanceof Error ? err.message : "Erreur lors de l'envoi." });
    } finally {
      setSendLoading(false);
    }
  }

  async function handleAcceptFieldAuditForReview() {
    if (!latestFieldAudit || acceptAuditLoading) return;
    setAcceptAuditLoading(true);
    setAcceptAuditFeedback(null);
    try {
      await acceptInsuranceFieldAuditForReview(latestFieldAudit.id);
      await refreshApplicationAfterMutation();
      setAcceptAuditFeedback({
        type: "success",
        message: "Audit terrain accepté pour revue back-office. Aucun RAX ni tarification déclenchés.",
      });
    } catch (err) {
      setAcceptAuditFeedback({
        type: "error",
        message: err instanceof ApiError ? err.message : "Erreur inattendue lors de l'acceptation.",
      });
    } finally {
      setAcceptAuditLoading(false);
    }
  }

  const application = result?.application ?? null;
  const latestFieldAudit: InsuranceFieldAudit | null = result?.latestFieldAudit ?? null;
  const showMissionConfigSection = application
    ? MISSION_CONFIG_AND_DISPATCH_COMPATIBLE_STATUSES.includes(application.status)
    : false;
  const showMissionDispatchSection = showMissionConfigSection;
  const missionConfigId = missionConfig?.id?.trim() ?? "";
  const missionDispatchLockedByStatus = application
    ? MISSION_DISPATCH_LOCKED_STATUSES.includes(application.status)
    : true;

  useEffect(() => {
    let mounted = true;

    if (!showMissionConfigSection) {
      setMissionConfigLoading(false);
      setMissionConfigError(null);
      setMissionConfigFeedback(null);
      setMissionConfig(null);
      setMissionConfigVersionsCount(0);
      setMissionConfigLatestVersion(null);
      setMissionConfigSideEffects(DEFAULT_MISSION_CONFIG_SIDE_EFFECTS);
      setMissionConfigForm(toMissionConfigFormState(null));
      setMissionDispatchSaving(false);
      setMissionDispatchFeedback(null);
      setMissionDispatchSideEffects(null);
      setMissionDispatchForm(toMissionDispatchFormState(null));
      return () => {
        mounted = false;
      };
    }

    async function loadMissionConfig() {
      setMissionConfigLoading(true);
      setMissionConfigError(null);
      setMissionConfigFeedback(null);

      try {
        const [config, versions] = await Promise.all([
          getInsuranceMissionConfig(applicationId).catch((error) => {
            if (error instanceof ApiError && error.status === 404) return null;
            throw error;
          }),
          getInsuranceMissionConfigVersions(applicationId).catch((error) => {
            if (error instanceof ApiError && error.status === 404) return [];
            throw error;
          }),
        ]);

        if (!mounted) return;

        setMissionConfig(config);
        setMissionConfigForm(toMissionConfigFormState(config));
        setMissionConfigSideEffects(config?.sideEffects ?? DEFAULT_MISSION_CONFIG_SIDE_EFFECTS);
        setMissionConfigVersionsCount(versions.length);
        setMissionConfigLatestVersion(
          versions.length > 0
            ? Math.max(...versions.map((item) => item.version ?? 0))
            : (config?.version ?? null),
        );
      } catch (loadError) {
        if (!mounted) return;
        setMissionConfigError(getMissionConfigLoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setMissionConfigLoading(false);
        }
      }
    }

    void loadMissionConfig();

    // Load field agents list for assign UI
    setFieldAgentsLoading(true);
    getInsuranceFieldAgents()
      .then((agents) => { if (mounted) setFieldAgents(agents); })
      .catch(() => { /* non-critical */ })
      .finally(() => { if (mounted) setFieldAgentsLoading(false); });

    return () => {
      mounted = false;
    };
  }, [applicationId, showMissionConfigSection]);

  const waitingLine = useMemo(
    () => (application ? hasWaitingReviewStatus(application.status) : false),
    [application],
  );
  const canRunRiskReviewActions = application
    ? !NON_ACTIONABLE_RISK_REVIEW_STATUSES.includes(application.status)
    : false;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Chargement du detail DCA...
      </div>
    );
  }

  if (error) {
    return (
      <DcaSectionCard accent="rose">
        <DcaSectionHeader
          kicker="Détail DCA"
          title={`Dossier ${applicationId}`}
          subtitle={detailSectionSubtitle}
          accent="rose"
        />
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      </DcaSectionCard>
    );
  }

  if (!application) {
    return (
      <DcaSectionCard accent="slate">
        <DcaSectionHeader
          kicker="Détail DCA"
          title={`Dossier ${applicationId}`}
          subtitle={detailSectionSubtitle}
          accent="slate"
        />
        <p className="text-sm text-slate-400">
          Dossier introuvable. Aucune donnée DCA disponible pour cet identifiant.
        </p>
      </DcaSectionCard>
    );
  }

  const declaredArea =
    application.declaredArea ??
    application.parcelle.declaredArea ??
    application.parcelle.superficie ??
    null;
  const hasCountryMismatch =
    application.applicationCountry === "MA" &&
    application.farmerCountry === "MA" &&
    application.parcelleCountry === "CI";
  const referenceValue =
    application.reference ??
    application.dcaNumber ??
    `En attente de génération — ID technique ${application.id}`;
  const dcaCountry =
    application.applicationCountry ?? application.farmerCountry ?? application.parcelleCountry ?? null;
  const identityDocumentLabel = getIdentityDocumentLabel(dcaCountry);
  const privacyConsentLabel = getPrivacyConsentLabel(dcaCountry);
  const hasAnyReceivedDocument = application.preparedDocuments.some((doc) => doc.hasUploadedFile === true);
  const preparedDocumentsTitle = hasAnyReceivedDocument
    ? "Documents DCA reçus"
    : "Pièces justificatives préparées";
  const workflowBadgeOverride = {
    label: `Parcours assurance · ${formatSourceFr(application.source)}`,
    live: application.source === "LIVE",
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title={`${detailPageTitlePrefix} ${application.reference ?? application.dcaNumber ?? application.id}`}
        description={detailPageDescription}
        workflowBadgeOverride={workflowBadgeOverride}
      />

      {dcaCountry && (
        <p className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/8 px-3 py-1 text-[11px] font-medium text-cyan-200">
          Pays dossier : {getCountryLabel(dcaCountry)}
        </p>
      )}

      {result?.detailNote ? <p className="text-xs text-slate-400">{result.detailNote}</p> : null}

      {/* ── 1. Résumé DCA ── */}
      <DcaSectionCard accent="cyan">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <DcaSectionHeader
              kicker={isAssuranceTenant ? "Dossier de couverture agricole" : "Declaration de capacite agricole (DCA)"}
              title={referenceValue}
              subtitle={`ID technique : ${application.id}`}
              accent="cyan"
            />
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <DcaStatusBadge status={application.status} />
            <DcaSourceBadge source={application.source} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DcaInfoTile
            label="Date de soumission"
            value={formatDate(application.submittedAt ?? application.createdAt)}
          />
          <DcaInfoTile
            label="Source déclarative"
            value={<DcaSourceBadge source={application.declarativeSource ?? application.source} />}
          />
          <DcaInfoTile
            label="Table de vérité"
            value={formatSourceOfTruthFr(application.sourceOfTruth)}
          />
        </div>

        {application.backendStatus && application.backendStatus !== application.status && (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/40 px-4 py-2 text-[11px] text-slate-400">
            Statut backend : {formatDcaStatusFr(application.backendStatus as InsuranceDcaApplication["status"] | "UNAVAILABLE")} — code : {application.backendStatus}
          </div>
        )}

        {waitingLine && (
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-2.5 text-xs text-amber-200">
            Dossier reçu — en attente d&apos;analyse par l&apos;institution.
          </div>
        )}

        <p className="text-[11px] text-slate-500">
          Wakama prépare, structure et documente. L&apos;institution reste seule décisionnaire.
        </p>
      </DcaSectionCard>

      {/* ── 2. Farmer ── */}
      <DcaSectionCard accent="emerald">
        <DcaSectionHeader
          kicker="Bénéficiaire"
          title="Agriculteur"
          subtitle="Identité masquée — données déclarées à la souscription"
          accent="emerald"
        />
        <div className="grid gap-4 md:grid-cols-3">
          <DcaInfoTile
            label="Nom / Prénom"
            value={
              [application.farmer.firstName, application.farmer.lastName].filter(Boolean).join(" ") ||
              "Non disponible"
            }
          />
          <DcaInfoTile label="Téléphone masqué" value={application.farmer.phoneMasked ?? "—"} mono />
          <DcaInfoTile label={`${identityDocumentLabel} masquée`} value={application.farmer.cinMasked ?? "—"} mono />
          <DcaInfoTile label="Langue préférée" value={application.farmer.preferredLanguage ?? "—"} />
          <DcaInfoTile
            label="Source"
            value={<DcaSourceBadge source={application.farmer.source ?? "UNAVAILABLE"} />}
          />
        </div>
      </DcaSectionCard>

      {/* ── 3. Parcelle ── */}
      <DcaSectionCard accent="emerald">
        <DcaSectionHeader
          kicker="Objet du risque"
          title="Parcelle agricole"
          subtitle="Données géographiques et culturales déclarées"
          accent="emerald"
        />
        <div className="grid gap-4 md:grid-cols-3">
          <DcaInfoTile label="Nom parcelle" value={application.parcelle.name ?? "—"} />
          <DcaInfoTile
            label="Culture"
            value={application.parcelle.culture ?? application.crop ?? application.culture ?? "—"}
          />
          <DcaInfoTile
            label="Superficie déclarée"
            value={
              declaredArea !== null && declaredArea !== undefined ? `${declaredArea} ha` : "—"
            }
          />
          <DcaInfoTile label="Latitude" value={application.parcelle.lat ?? "—"} />
          <DcaInfoTile label="Longitude" value={application.parcelle.lng ?? "—"} />
          <DcaInfoTile
            label="Source"
            value={<DcaSourceBadge source={application.parcelle.source ?? "UNAVAILABLE"} />}
          />
        </div>
        {hasCountryMismatch && (
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-2.5 text-xs text-amber-200">
            Attention : metadonnee pays parcelle incoherente avec la DCA. A verifier cote backend.
          </div>
        )}
      </DcaSectionCard>

      {/* ── 4. Documents reçus ── */}
      <DcaSectionCard accent="slate">
        <DcaSectionHeader
          kicker="Pièces justificatives"
          title={preparedDocumentsTitle}
          subtitle="Dossier structuré par Wakama pour l'institution"
          accent="slate"
        />

        <p className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-2 text-xs text-slate-400">
          Cette section confirme uniquement la réception serveur des pièces. La revue documentaire, l&apos;OCR et l&apos;ouverture sécurisée seront traités dans une phase ultérieure.
        </p>

        {application.preparedDocuments.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun document disponible pour ce dossier.</p>
        ) : (
          <div className="space-y-3">
            {application.preparedDocuments.map((doc, index) => {
              const received = doc.hasUploadedFile === true;
              return (
                <div
                  key={`${doc.id ?? "doc"}-${index}`}
                  className="rounded-xl border border-slate-400/10 bg-slate-900/35 p-4 space-y-3"
                >
                  {/* Header row: type + reception badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {doc.type ?? doc.label ?? doc.name ?? "Document"}
                    </span>
                    {received ? (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200">
                        Reçu backend
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-400/25 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-slate-400">
                        Préparé / en attente fichier
                      </span>
                    )}
                    <DcaSourceBadge source={doc.sourceLabel ?? doc.source} />
                  </div>

                  {/* Metadata grid */}
                  <div className="grid gap-3 md:grid-cols-3">
                    <DcaInfoTile label="Libellé" value={doc.label ?? doc.filename ?? doc.name ?? doc.type ?? "—"} />
                    <DcaInfoTile label="Statut métier" value={formatDocumentStatusFr(doc.status)} />
                    <DcaInfoTile label="Date préparation" value={formatDate(doc.createdAt)} />
                    {received && (
                      <>
                        <DcaInfoTile label="Nom original" value={doc.originalFilename ?? doc.filename ?? "—"} mono />
                        <DcaInfoTile label="Type MIME" value={doc.mimeType ?? "—"} mono />
                        <DcaInfoTile
                          label="Taille"
                          value={
                            doc.sizeBytes !== null && doc.sizeBytes !== undefined
                              ? doc.sizeBytes >= 1_048_576
                                ? `${(doc.sizeBytes / 1_048_576).toFixed(2)} Mo`
                                : doc.sizeBytes >= 1024
                                  ? `${(doc.sizeBytes / 1024).toFixed(1)} Ko`
                                  : `${doc.sizeBytes} o`
                              : "—"
                          }
                        />
                        <DcaInfoTile label="Reçu le" value={formatDate(doc.receivedAt ?? doc.createdAt)} />
                        <DcaInfoTile label="Fournisseur stockage" value={doc.storageProvider ?? "—"} />
                        {doc.sha256Hash && (
                          <div className="space-y-0.5 md:col-span-3">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Hash SHA-256</p>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-300 break-all">
                                {doc.sha256Hash.length > 16
                                  ? `${doc.sha256Hash.slice(0, 8)}…${doc.sha256Hash.slice(-8)}`
                                  : doc.sha256Hash}
                              </span>
                              <button
                                type="button"
                                onClick={() => { void navigator.clipboard.writeText(doc.sha256Hash!); }}
                                className="shrink-0 rounded border border-slate-400/20 bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-400 hover:bg-slate-700/50"
                              >
                                Copier
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Download button — always disabled in Phase 1.5C */}
                  <div className="flex items-center gap-3">
                    {doc.url && !received ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-400/20 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700/40"
                      >
                        Ouvrir document (lien existant)
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-slate-400/15 bg-slate-800/30 px-3 py-1.5 text-xs text-slate-500"
                      >
                        Ouverture sécurisée des fichiers non activée dans cette version.
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DcaSectionCard>

      {/* ── 5. Historique sinistres ── */}
      <DcaSectionCard accent="amber">
        <DcaSectionHeader
          kicker="Antécédents"
          title={isAssuranceTenant ? "Historique sinistres farmer" : "Historique incidents dossier"}
          subtitle="Sinistres déclarés lors de la souscription"
          accent="amber"
        />
        {application.claimHistory.length === 0 ? (
          <p className="text-sm text-slate-400">
            {isAssuranceTenant
              ? "Aucun antécédent de sinistre déclaré ou disponible."
              : "Aucun incident déclaré ou disponible pour ce dossier."}
          </p>
        ) : (
          <div className="space-y-3">
            {application.claimHistory.map((item, index) => (
              <div
                key={`${item.id ?? "claim"}-${index}`}
                className="grid gap-3 rounded-xl border border-slate-400/10 bg-slate-900/35 p-4 md:grid-cols-3"
              >
                <DcaInfoTile label="Année" value={item.year ?? "—"} />
                <DcaInfoTile label="Type / Cause" value={item.type ?? item.cause ?? "—"} />
                <DcaInfoTile
                  label="Montant estimé"
                  value={formatAmountForCountry(item.estimatedAmount, dcaCountry)}
                />
                <DcaInfoTile label="Note" value={item.note ?? "—"} />
                <DcaInfoTile label="Source" value={<DcaSourceBadge source={item.source} />} />
              </div>
            ))}
          </div>
        )}
        {application.periodYears !== null && application.periodYears !== undefined && (
          <div className="rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-2.5">
            <DcaInfoTile label="Période déclarée" value={`${application.periodYears} ans`} />
          </div>
        )}
      </DcaSectionCard>

      {/* ── 6. Consentement données personnelles ── */}
      <DcaSectionCard accent="slate">
        <DcaSectionHeader
          kicker="Conformité"
          title={privacyConsentLabel}
          subtitle="Données personnelles — usage exclusif préparation du dossier institutionnel"
          accent="slate"
        />
        <div className="grid gap-4 md:grid-cols-3">
          <DcaInfoTile label="Consentement donné" value={formatBooleanFr(application.consentCndp)} />
          <DcaInfoTile label="Date consentement" value={formatDate(application.consentCndpAt)} />
          <DcaInfoTile
            label="Source"
            value={<DcaSourceBadge source={application.consentCndpSource ?? "UNAVAILABLE"} />}
          />
        </div>
      </DcaSectionCard>

      {/* ── 7. Effets secondaires backend ── */}
      <DcaSectionCard accent="slate">
        <DcaSectionHeader
          kicker="Traçabilité"
          title="Effets secondaires backend"
          subtitle="État retourné par le backend — aucune action déclenchée depuis cet écran"
          accent="slate"
        />
        <div className="flex flex-wrap gap-2">
          <SideEffectPill label="Mission" active={application.sideEffects.missionCreated} />
          <SideEffectPill label={policyLabelCapitalized} active={application.sideEffects.policyCreated} />
          <SideEffectPill label={claimLabelCapitalized} active={application.sideEffects.claimCreated} />
          <SideEffectPill label="RAX" active={application.sideEffects.raxCalculated} />
          <SideEffectPill label="Tarification" active={application.sideEffects.pricingCalculated} />
          <SideEffectPill label="Blockchain" active={application.sideEffects.blockchainAnchored} />
        </div>
        {application.sideEffects.sideEffectsSource && (
          <p className="text-[11px] text-slate-500">
            Source : {formatSideEffectsSourceFr(application.sideEffects.sideEffectsSource)}
          </p>
        )}
        {application.sideEffects.sourceNote && (
          <p className="text-[11px] text-slate-500">Fallback frontend actif</p>
        )}
      </DcaSectionCard>

      {/* ── 8. Revue back-office audit terrain ── */}
      <DcaSectionCard accent="violet">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="Terrain — Phase 33A"
            title="Revue back-office audit terrain"
            subtitle="Consultation des données soumises par l'agent terrain"
            accent="violet"
          />
          {latestFieldAudit && <FieldAuditStatusBadge status={latestFieldAudit.fieldAuditStatus} />}
        </div>

        {latestFieldAudit ? (
          <>
            {/* Hash status + security hold */}
            <div className="flex flex-wrap items-center gap-2">
              {latestFieldAudit.hashStatus === "SERVER_VALIDATED" ? (
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-100">
                  Hash serveur validé
                </span>
              ) : latestFieldAudit.hashStatus === "SECURITY_HOLD" ? (
                <span className="rounded-full border border-rose-400/35 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-200">
                  Blocage sécurité
                </span>
              ) : (
                <span className="rounded-full border border-slate-400/30 bg-slate-800/60 px-2.5 py-0.5 text-[11px] text-slate-300">
                  {formatHashStatusFr(latestFieldAudit.hashStatus)}
                </span>
              )}
            </div>

            {latestFieldAudit.hashStatus === "SECURITY_HOLD" && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                <p className="font-semibold text-rose-100">Blocage sécurité — hash non validé</p>
                <p className="mt-1">Hash payload non validé par le serveur. Revue manuelle requise avant toute suite. Action de revue bloquée.</p>
              </div>
            )}

            {/* Data grid */}
            <div className="grid gap-x-4 gap-y-3 rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-4 text-[13px] md:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">ID audit terrain</p>
                <p className="mt-0.5 font-mono text-xs text-slate-200 break-all">{latestFieldAudit.id}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Statut hash</p>
                <p className={`mt-0.5 text-sm font-medium ${
                  latestFieldAudit.hashStatus === "SERVER_VALIDATED"
                    ? "text-emerald-300"
                    : latestFieldAudit.hashStatus === "SECURITY_HOLD"
                      ? "text-rose-300"
                      : "text-slate-300"
                }`}>
                  {formatHashStatusFr(latestFieldAudit.hashStatus)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Source</p>
                <p className="mt-0.5 text-slate-300">{formatFieldAuditSourceFr(latestFieldAudit.source)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Agent terrain</p>
                <p className="mt-0.5 font-mono text-xs text-slate-300">{maskAgentUserId(latestFieldAudit.agentUserId)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Surface mesurée</p>
                <p className="mt-0.5 text-slate-300">
                  {latestFieldAudit.measuredSurfaceHa !== null && latestFieldAudit.measuredSurfaceHa !== undefined
                    ? `${latestFieldAudit.measuredSurfaceHa.toLocaleString("fr-FR")} ha`
                    : "Non disponible"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Polygone mesuré</p>
                <p className="mt-0.5 text-slate-300">{latestFieldAudit.measuredPolygonGeojson ? "Présent" : "Absent"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Synchronisé le</p>
                <p className="mt-0.5 text-slate-300">{formatDate(latestFieldAudit.syncedAt)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Créé le</p>
                <p className="mt-0.5 text-slate-300">{formatDate(latestFieldAudit.createdAt)}</p>
              </div>
            </div>

            {/* SideEffects badge grid */}
            <div className="rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-3 space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Effets secondaires — cette revue</p>
              <div className="flex flex-wrap gap-2">
                <SideEffectPill label="fieldAuditCreated" active={true} />
                <SideEffectPill label="raxCalculated" active={false} />
                <SideEffectPill label="pricingCalculated" active={false} />
                <SideEffectPill label="policyCreated" active={false} />
                <SideEffectPill label="claimCreated" active={false} />
                <SideEffectPill label="evidenceBundleCreated" active={false} />
                <SideEffectPill label="blockchainAnchored" active={false} />
              </div>
            </div>

            {/* Action: accept for review */}
            {latestFieldAudit.fieldAuditStatus === "FIELD_AUDIT_SUBMITTED" &&
              latestFieldAudit.hashStatus !== "SECURITY_HOLD" && (
              <div className="space-y-2 rounded-xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Action contrôlée</p>
                <button
                  type="button"
                  disabled={acceptAuditLoading}
                  onClick={() => { void handleAcceptFieldAuditForReview(); }}
                  className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {acceptAuditLoading ? "Traitement en cours…" : "Accepter pour revue back-office"}
                </button>
                <p className="text-[11px] text-slate-500">
                  N&apos;enclenche ni RAX, ni tarification, ni evidence bundle, ni ancrage blockchain.
                </p>
              </div>
            )}

            {acceptAuditFeedback && (
              <p className={`rounded-xl border px-3 py-2 text-xs ${
                acceptAuditFeedback.type === "success"
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/25 bg-rose-500/10 text-rose-200"
              }`}>
                {acceptAuditFeedback.message}
              </p>
            )}

            <p className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-2 text-xs text-slate-400">
              {`Aucun RAX déclenché par cette revue. Aucun ${policyLabel}, aucun ${claimLabel}, aucun evidence bundle ni ancrage blockchain depuis cet écran.`}
            </p>
          </>
        ) : (
          <>
            <p className="rounded-xl border border-slate-400/20 bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
              Audit terrain non disponible — aucun audit terrain soumis pour cette DCA.
            </p>

            <div className="rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-3 space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Effets secondaires — cette revue</p>
              <div className="flex flex-wrap gap-2">
                <SideEffectPill label="fieldAuditCreated" active={false} />
                <SideEffectPill label="raxCalculated" active={false} />
                <SideEffectPill label="pricingCalculated" active={false} />
                <SideEffectPill label="policyCreated" active={false} />
                <SideEffectPill label="claimCreated" active={false} />
                <SideEffectPill label="evidenceBundleCreated" active={false} />
                <SideEffectPill label="blockchainAnchored" active={false} />
              </div>
            </div>
          </>
        )}

        <p className="text-[11px] text-slate-500">
          Wakama prépare et documente. L&apos;institution reste décisionnaire.
        </p>
      </DcaSectionCard>

      {/* ── 9. Configuration mission contrôlée ── */}
      {showMissionConfigSection ? (
        <DcaSectionCard accent="emerald">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <DcaSectionHeader
              kicker="Protocole de preuve"
              title="Configuration mission contrôlée"
              subtitle="Prépare le protocole sans envoyer l'audit terrain"
              accent="emerald"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-100">
                Brouillon Direction des Risques
              </span>
              <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] text-cyan-200">
                Aucune mission envoyée
              </span>
            </div>
          </div>

          <p className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
            Cette configuration prépare le protocole de preuve. Elle ne déclenche pas encore d’audit terrain.
          </p>

          <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
            {missionConfig ? (
              <p>
                Draft existant chargé
                {missionConfig.version !== null ? ` (version ${missionConfig.version})` : ""}.
              </p>
            ) : (
              <p>Aucun draft existant detecte. Valeurs par defaut pre-remplies.</p>
            )}
            <p>Versions disponibles: {missionConfigVersionsCount}</p>
            <p>
              Dernière version connue:{" "}
              {missionConfigLatestVersion === null ? "Non disponible" : missionConfigLatestVersion}
            </p>
            <p>Source API: GET/POST /v1/insurance/applications/:id/mission-config</p>
            <p>Source API: GET /v1/insurance/applications/:id/mission-config/versions</p>
          </div>

          {missionConfigLoading ? (
            <p className="text-xs text-slate-400">Chargement de la configuration mission...</p>
          ) : null}
          {missionConfigError ? (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {missionConfigError}
            </p>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Type de mission</span>
              <select
                value={missionConfigForm.missionType}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({ ...prev, missionType: event.target.value }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="FIELD_AUDIT_PREPARATION">FIELD_AUDIT_PREPARATION</option>
                <option value="PARCEL_VERIFICATION">PARCEL_VERIFICATION</option>
                <option value="DOCUMENT_REVIEW">DOCUMENT_REVIEW</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Niveau de preuve</span>
              <select
                value={missionConfigForm.proofLevel}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({ ...prev, proofLevel: event.target.value }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="STANDARD">STANDARD</option>
                <option value="ELEVATED">ELEVATED</option>
                <option value="STRICT">STRICT</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Tolérance surface %</span>
              <input
                type="number"
                min={0}
                step="0.1"
                value={missionConfigForm.surfaceTolerancePercent}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    surfaceTolerancePercent: event.target.value,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Statut</span>
              <input
                type="text"
                value={missionConfigForm.status}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({ ...prev, status: event.target.value }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={missionConfigForm.requiresPolygonCheck}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    requiresPolygonCheck: event.target.checked,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
              />
              Vérification polygone
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={missionConfigForm.requiresCinCheck}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    requiresCinCheck: event.target.checked,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
              />
              Vérification CIN
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={missionConfigForm.requiresLandDocumentCheck}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    requiresLandDocumentCheck: event.target.checked,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
              />
              Vérification document foncier
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={missionConfigForm.checkSurfaceTolerance}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    checkSurfaceTolerance: event.target.checked,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
              />
              Contrôle tolérance surface
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={missionConfigForm.checkPolygon}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    checkPolygon: event.target.checked,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
              />
              Check requis: polygon
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={missionConfigForm.checkIdentity}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    checkIdentity: event.target.checked,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
              />
              Check requis: identity
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={missionConfigForm.checkLandDocument}
                onChange={(event) =>
                  setMissionConfigForm((prev) => ({
                    ...prev,
                    checkLandDocument: event.target.checked,
                  }))
                }
                disabled={missionConfigSaving || missionConfigLoading}
              />
              Check requis: landDocument
            </label>
          </div>

          <label className="space-y-1 text-sm text-slate-300">
            <span>Documents requis (séparés par virgule ou ligne)</span>
            <textarea
              value={missionConfigForm.requiredDocumentsText}
              onChange={(event) =>
                setMissionConfigForm((prev) => ({
                  ...prev,
                  requiredDocumentsText: event.target.value,
                }))
              }
              disabled={missionConfigSaving || missionConfigLoading}
              className="min-h-20 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-300">
            <span>Note Direction des Risques</span>
            <textarea
              value={missionConfigForm.noteDirectionRisques}
              onChange={(event) =>
                setMissionConfigForm((prev) => ({
                  ...prev,
                  noteDirectionRisques: event.target.value.slice(0, MISSION_CONFIG_NOTE_MAX_LENGTH),
                }))
              }
              maxLength={MISSION_CONFIG_NOTE_MAX_LENGTH}
              disabled={missionConfigSaving || missionConfigLoading}
              className="min-h-24 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            />
            <p className="text-[11px] text-slate-500">
              {missionConfigForm.noteDirectionRisques.length}/{MISSION_CONFIG_NOTE_MAX_LENGTH}
            </p>
          </label>

          <div>
            <button
              type="button"
              onClick={() => void handleMissionConfigSave()}
              disabled={missionConfigSaving || missionConfigLoading}
              className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
            >
              {missionConfigSaving ? "Enregistrement..." : "Enregistrer le brouillon"}
            </button>
          </div>

          {missionConfigFeedback ? (
            <p
              className={
                missionConfigFeedback.type === "success"
                  ? "rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
                  : missionConfigFeedback.type === "critical"
                    ? "rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-xs text-rose-100"
                    : "rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100"
              }
            >
              {missionConfigFeedback.message}
            </p>
          ) : null}

          <div className="rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Effets secondaires mission-config</p>
            <div className="flex flex-wrap gap-2">
              <SideEffectPill label="missionCreated" active={missionConfigSideEffects.missionCreated} />
              <SideEffectPill label="missionSent" active={missionConfigSideEffects.missionSent} />
              <SideEffectPill label="fieldAuditCreated" active={missionConfigSideEffects.fieldAuditCreated} />
              <SideEffectPill label="raxCalculated" active={missionConfigSideEffects.raxCalculated} />
              <SideEffectPill label="pricingCalculated" active={missionConfigSideEffects.pricingCalculated} />
              <SideEffectPill label="policyCreated" active={missionConfigSideEffects.policyCreated} />
              <SideEffectPill label="claimCreated" active={missionConfigSideEffects.claimCreated} />
              <SideEffectPill label="evidenceBundleCreated" active={missionConfigSideEffects.evidenceBundleCreated} />
              <SideEffectPill label="blockchainAnchored" active={missionConfigSideEffects.blockchainAnchored} />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Wakama prépare et documente. L&apos;institution décide.
          </p>
        </DcaSectionCard>
      ) : null}

      {/* ── 10. Préparation dispatch mission ── */}
      {showMissionDispatchSection ? (
        <DcaSectionCard accent="cyan">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <DcaSectionHeader
              kicker="Opérationnel"
              title="Préparation dispatch mission"
              subtitle="Planification sans envoi agent — mission non lancée"
              accent="cyan"
            />
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/8 px-2.5 py-0.5 text-[11px] text-cyan-300">
              Non envoyée
            </span>
          </div>

          <div className="grid gap-2 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-sm text-slate-300 md:grid-cols-2">
            <p>Configuration mission liée: {missionConfigId || "Non disponible"}</p>
            <p>Statut configuration: {missionConfig?.status || "Non disponible"}</p>
            <p>
              Version mission config:{" "}
              {missionConfig?.version ?? missionConfigLatestVersion ?? "Non disponible"}
            </p>
            <p>Source API: POST /v1/insurance/applications/:id/mission-dispatch-draft</p>
          </div>

          {!missionConfigId ? (
            <p className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
              Configuration mission requise avant préparation du dispatch.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-300">
                  <span>Fenêtre souhaitée début</span>
                  <input
                    type="datetime-local"
                    value={missionDispatchForm.scheduledWindowStart}
                    onChange={(event) =>
                      setMissionDispatchForm((prev) => ({
                        ...prev,
                        scheduledWindowStart: event.target.value,
                      }))
                    }
                    disabled={missionDispatchSaving || missionDispatchLockedByStatus}
                    className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="space-y-1 text-sm text-slate-300">
                  <span>Fenêtre souhaitée fin</span>
                  <input
                    type="datetime-local"
                    value={missionDispatchForm.scheduledWindowEnd}
                    onChange={(event) =>
                      setMissionDispatchForm((prev) => ({
                        ...prev,
                        scheduledWindowEnd: event.target.value,
                      }))
                    }
                    disabled={missionDispatchSaving || missionDispatchLockedByStatus}
                    className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm text-slate-300">
                <span>Note dispatch</span>
                <textarea
                  value={missionDispatchForm.dispatchNote}
                  onChange={(event) =>
                    setMissionDispatchForm((prev) => ({
                      ...prev,
                      dispatchNote: event.target.value.slice(0, MISSION_DISPATCH_NOTE_MAX_LENGTH),
                    }))
                  }
                  maxLength={MISSION_DISPATCH_NOTE_MAX_LENGTH}
                  disabled={missionDispatchSaving || missionDispatchLockedByStatus}
                  className="min-h-24 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <p className="text-[11px] text-slate-500">
                  {missionDispatchForm.dispatchNote.length}/{MISSION_DISPATCH_NOTE_MAX_LENGTH}
                </p>
              </label>

              <label className="space-y-1 text-sm text-slate-300">
                <span>Agent suggéré</span>
                <input
                  type="text"
                  value="Agent App non activée dans cette phase — aucun agent envoyé"
                  disabled
                  className="w-full rounded-lg border border-slate-600/50 bg-slate-900/50 px-3 py-2 text-xs text-slate-400"
                />
              </label>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => void handleMissionDispatchDraftPrepare()}
              disabled={!missionConfigId || missionDispatchSaving || missionDispatchLockedByStatus}
              className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
            >
              {missionDispatchSaving ? "Préparation..." : "Préparer le dispatch"}
            </button>
          </div>

          {missionDispatchFeedback ? (
            <p
              className={
                missionDispatchFeedback.type === "success"
                  ? "rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
                  : missionDispatchFeedback.type === "critical"
                    ? "rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-xs text-rose-100"
                    : "rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100"
              }
            >
              {missionDispatchFeedback.message}
            </p>
          ) : null}

          {missionDispatchSideEffects ? (
            <div className="rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Effets secondaires dispatch</p>
              <div className="flex flex-wrap gap-2">
                {missionDispatchSideEffects.missionCreated !== undefined && (
                  <SideEffectPill label="missionCreated" active={missionDispatchSideEffects.missionCreated} />
                )}
                <SideEffectPill label="missionSent" active={missionDispatchSideEffects.missionSent} />
                <SideEffectPill label="fieldAuditCreated" active={missionDispatchSideEffects.fieldAuditCreated} />
                <SideEffectPill label="raxCalculated" active={missionDispatchSideEffects.raxCalculated} />
                <SideEffectPill label="pricingCalculated" active={missionDispatchSideEffects.pricingCalculated} />
                <SideEffectPill label="policyCreated" active={missionDispatchSideEffects.policyCreated} />
                <SideEffectPill label="claimCreated" active={missionDispatchSideEffects.claimCreated} />
                <SideEffectPill label="evidenceBundleCreated" active={missionDispatchSideEffects.evidenceBundleCreated} />
                <SideEffectPill label="blockchainAnchored" active={missionDispatchSideEffects.blockchainAnchored} />
              </div>
            </div>
          ) : null}

          <p className="text-[11px] text-slate-500">
            Wakama prépare et documente. L&apos;institution décide.
          </p>
        </DcaSectionCard>
      ) : null}

      {/* ── 11. Assignation agent ── */}
      {showMissionDispatchSection && missionConfigId ? (
        <DcaSectionCard accent="amber">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <DcaSectionHeader
              kicker="Agent terrain"
              title="Assignation agent de terrain"
              subtitle="Rend la mission visible dans l'Agent App — ne lance pas l'audit"
              accent="amber"
            />
          </div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-200">
            Cette action rend la mission visible dans l&apos;Agent App. Elle ne lance pas l&apos;audit terrain.
          </div>

          {dispatchResult ? (
            <div className="rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-[11px] text-slate-300 space-y-1">
              <p className="font-medium text-slate-200">Statut dispatch</p>
              <p>Statut: <span className={dispatchResult.status === "MISSION_SENT" ? "text-emerald-300" : "text-cyan-300"}>{dispatchResult.status}</span></p>
              <p>Mode filtrage: {dispatchResult.assignmentFilteringMode}</p>
              <p>Agent assigné: {dispatchResult.assignedAgentUserId ?? "—"}</p>
              <p>fieldAuditCreated: false | insuranceMissionCreated: false</p>
            </div>
          ) : null}

          <div className="space-y-3">
            <label className="space-y-1 text-sm text-slate-300 block">
              <span>Sélectionner un agent de terrain</span>
              <select
                value={selectedAgentUserId}
                onChange={(e) => setSelectedAgentUserId(e.target.value)}
                disabled={assignLoading || sendLoading || fieldAgentsLoading}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">{fieldAgentsLoading ? "Chargement..." : "— Choisir un agent —"}</option>
                {fieldAgents.map((a) => (
                  <option key={a.userId} value={a.userId}>
                    {a.displayName} ({a.email}) — {a.status}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => void handleAssignAgent()}
                disabled={!selectedAgentUserId || assignLoading || sendLoading}
                className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {assignLoading ? "Assignation..." : "Assigner l'agent"}
              </button>

              <button
                type="button"
                onClick={() => void handleSendDispatch()}
                disabled={!dispatchResult || dispatchResult.status === "MISSION_SENT" || sendLoading || assignLoading}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {sendLoading ? "Envoi..." : "Envoyer à l'Agent App"}
              </button>
            </div>
          </div>

          {assignFeedback ? (
            <p className={assignFeedback.type === "success"
              ? "rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
              : "rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100"
            }>
              {assignFeedback.message}
            </p>
          ) : null}

          {sendFeedback ? (
            <p className={sendFeedback.type === "success"
              ? "rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
              : "rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100"
            }>
              {sendFeedback.message}
            </p>
          ) : null}

          <p className="text-[11px] text-slate-500">
            Wakama prépare et documente. L&apos;institution décide.
          </p>
        </DcaSectionCard>
      ) : null}

      {/* ── 12. Revue Direction des Risques ── */}
      <DcaSectionCard accent={canRunRiskReviewActions ? "cyan" : "amber"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="Direction des Risques"
            title="Revue Direction des Risques"
            subtitle="Transition de statut contrôlée — aucun RAX ni pricing depuis cet écran"
            accent={canRunRiskReviewActions ? "cyan" : "amber"}
          />
          <DcaStatusBadge status={application.status} />
        </div>

        {application.backendStatus && application.backendStatus !== application.status && (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/40 px-4 py-2 text-[11px] text-slate-400">
            Statut backend : {formatDcaStatusFr(application.backendStatus as InsuranceDcaApplication["status"] | "UNAVAILABLE")} — code : {application.backendStatus}
          </div>
        )}

        {canRunRiskReviewActions ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3">
            <p className="text-xs font-semibold text-emerald-200">Actions de revue disponibles</p>
            <p className="mt-1 text-[11px] text-emerald-100/80">
              Wakama prépare et documente. L&apos;institution reste décisionnaire.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-3">
            <p className="text-xs font-semibold text-amber-200">Actions non actionnables dans ce statut</p>
            <p className="mt-1 text-[11px] text-amber-100/80">
              Ce statut ne peut pas être modifié dans cette phase. Wakama prépare et documente. L&apos;institution reste décisionnaire.
            </p>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-sm text-slate-300">
          <label htmlFor="risk-review-note" className="font-medium text-slate-200">
            Note Direction des Risques (optionnelle)
          </label>
          <textarea
            id="risk-review-note"
            value={riskReviewNote}
            onChange={(event) => setRiskReviewNote(event.target.value.slice(0, RISK_REVIEW_NOTE_MAX_LENGTH))}
            maxLength={RISK_REVIEW_NOTE_MAX_LENGTH}
            placeholder="Saisir une note interne (max 500 caractères)"
            disabled={Boolean(riskReviewActionLoading)}
            className="min-h-28 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p className="text-[11px] text-slate-500">
            {riskReviewNote.length}/{RISK_REVIEW_NOTE_MAX_LENGTH}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => void handleRiskReviewAction("UNDER_RISK_REVIEW")}
              disabled={!canRunRiskReviewActions || Boolean(riskReviewActionLoading)}
              className="w-full rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
            >
              {riskReviewActionLoading === "UNDER_RISK_REVIEW" ? "Mise à jour..." : "Prendre en revue"}
            </button>
            <p className="text-[11px] text-slate-500">Payload status: UNDER_RISK_REVIEW</p>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => void handleRiskReviewAction("MORE_INFO_REQUIRED")}
              disabled={!canRunRiskReviewActions || Boolean(riskReviewActionLoading)}
              className="w-full rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
            >
              {riskReviewActionLoading === "MORE_INFO_REQUIRED" ? "Mise à jour..." : "Demander complément"}
            </button>
            <p className="text-[11px] text-slate-500">Payload status: MORE_INFO_REQUIRED</p>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => void handleRiskReviewAction("READY_FOR_MISSION_CONFIG")}
              disabled={!canRunRiskReviewActions || Boolean(riskReviewActionLoading)}
              className="w-full rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
            >
              {riskReviewActionLoading === "READY_FOR_MISSION_CONFIG"
                ? "Mise à jour..."
                : "Prêt pour paramétrage mission"}
            </button>
            <p className="text-[11px] text-slate-500">Payload status: READY_FOR_MISSION_CONFIG</p>
          </div>
        </div>

        {riskReviewFeedback ? (
          <p
            className={
              riskReviewFeedback.type === "success"
                ? "rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
                : riskReviewFeedback.type === "critical"
                  ? "rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-xs text-rose-100"
                  : "rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100"
            }
          >
            {riskReviewFeedback.message}
          </p>
        ) : null}

        <div className="grid gap-2 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-[11px] text-slate-400 md:grid-cols-3">
          <p>{RISK_REVIEW_ACTION_LABELS.UNDER_RISK_REVIEW}: {RISK_REVIEW_REASONS.UNDER_RISK_REVIEW}</p>
          <p>{RISK_REVIEW_ACTION_LABELS.MORE_INFO_REQUIRED}: {RISK_REVIEW_REASONS.MORE_INFO_REQUIRED}</p>
          <p>
            {RISK_REVIEW_ACTION_LABELS.READY_FOR_MISSION_CONFIG}:{" "}
            {RISK_REVIEW_REASONS.READY_FOR_MISSION_CONFIG}
          </p>
        </div>

        <p className="text-[11px] text-slate-500">
          {`Aucune mission, aucun RAX, aucun pricing, aucun ${policyLabel}, aucun ${claimLabel} et aucun ancrage blockchain ne sont déclenchés depuis cette revue.`}
        </p>
        <p className="text-[11px] text-slate-500">
          Wakama prépare et documente. L&apos;institution reste décisionnaire.
        </p>
      </DcaSectionCard>
    </div>
  );
}
