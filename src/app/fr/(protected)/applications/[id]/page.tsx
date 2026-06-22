"use client";

import { use, useEffect, useMemo, useState } from "react";

import {
  acceptInsuranceFieldAuditForReview,
  ApiError,
  assignInsuranceMissionDispatch,
  calculateIraxDecisionAssessment,
  createClaimCase,
  createInsuranceMissionDispatchDraft,
  createIrax1Mission,
  CreateInsuranceMissionDispatchDraftResult,
  FieldAgent,
  generateEvidenceBundle,
  generateIraxConsolidatedAssessment,
  generateMonitoringSnapshot,
  generateFraudForensicReview,
  generateOperationsCockpit,
  generateGovernanceCompliance,
  generatePricingOffer,
  generateIraxPlanning,
  generateIraxScientificAssessment,
  getEvidenceBundle,
  getInsuranceApplicationById,
  getInsuranceFieldAgents,
  getInstitutionDecision,
  getInsuranceMissionConfig,
  getInsuranceMissionConfigVersions,
  getIrax1FieldAssessment,
  getIraxConsolidatedAssessment,
  getIraxDecisionAssessment,
  getIraxPlanning,
  getIraxScientificAssessment,
  getMonitoringSnapshot,
  getFraudForensicReview,
  getOperationsCockpit,
  getGovernanceCompliance,
  getPolicyContract,
  getPricingOffer,
  listClaimCases,
  InsuranceApplicationByIdResult,
  InsuranceIrax1FieldAssessment,
  InsuranceIraxConsolidatedAssessment,
  InsuranceIraxConsolidatedAssessmentStatus,
  InsuranceIraxDecisionAssessment,
  InsuranceIraxDecisionAssessmentStatus,
  InsuranceIraxPlanning,
  InsuranceIraxPlanningStatus,
  InsuranceIraxScientificAssessment,
  InsuranceIraxScientificAssessmentStatus,
  InsuranceMissionConfig,
  InsuranceMissionConfigPayload,
  InsuranceMissionConfigSideEffects,
  InsuranceRiskReviewStatus,
  Irax1FrapStatus,
  issuePolicyContract,
  MissionDispatchResult,
  recordInstitutionDecision,
  saveInsuranceMissionConfig,
  sendInsuranceMissionDispatch,
  updateClaimCaseStatus,
  updateEvidenceBundleStatus,
  updateMonitoringSnapshotStatus,
  updateFraudForensicReviewStatus,
  updateOperationsCockpitStatus,
  updateGovernanceComplianceStatus,
  updatePolicyContractStatus,
  updatePricingOfferStatus,
  updateInsuranceApplicationStatus,
  updateInstitutionDecisionStatus,
  updateIrax1FieldAssessmentStatus,
  updateIraxConsolidatedAssessmentStatus,
  updateIraxDecisionAssessmentStatus,
  updateIraxPlanningStatus,
  updateIraxScientificAssessmentStatus,
} from "@/lib/api";
import {
  InsuranceClaimCase,
  InsuranceClaimCaseStatus,
  InsuranceEvidenceBundle,
  InsuranceEvidenceBundleStatus,
  InsuranceFieldAudit,
  InsuranceInstitutionDecision,
  InsuranceInstitutionDecisionStatus,
  InsuranceInstitutionDecisionType,
  InsuranceMonitoringSnapshot,
  InsuranceMonitoringSnapshotStatus,
  InsuranceFraudForensicReview,
  InsuranceFraudForensicReviewStatus,
  InsuranceOperationsCockpitSnapshot,
  InsuranceOperationsCockpitSnapshotStatus,
  InsuranceGovernanceComplianceSnapshot,
  InsuranceGovernanceComplianceSnapshotStatus,
  InsurancePolicyContract,
  InsurancePolicyContractStatus,
  InsurancePricingOffer,
  InsurancePricingOfferStatus,
} from "@/types";
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

function getIraxPlanningLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Impossible de charger le plan IRAX-P.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) au plan IRAX-P.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour le plan IRAX-P.";
  }
  return error.message || "Erreur API pendant le chargement du plan IRAX-P.";
}

function getIraxPlanningMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Action IRAX-P impossible.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) pour cette action IRAX-P.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour le plan IRAX-P.";
  }
  return error.message || "Erreur API pendant l'action IRAX-P.";
}

function hasIraxPlanningForbiddenSideEffects(sideEffects: InsuranceMissionConfigSideEffects): boolean {
  return hasMissionConfigForbiddenSideEffects(sideEffects);
}

function getIrax1LoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Impossible de charger le FRAP IRAX1.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) au FRAP IRAX1.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour le FRAP IRAX1.";
  }
  return error.message || "Erreur API pendant le chargement du FRAP IRAX1.";
}

function getIrax1MutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Action IRAX1 impossible.";
  }
  if (error.status === 400) {
    return "Requête invalide (400) pour cette action IRAX1.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) pour cette action IRAX1.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour cette action IRAX1.";
  }
  if (error.status === 409) {
    return error.message || "Action IRAX1 impossible dans l'état actuel (409).";
  }
  return error.message || "Erreur API pendant l'action IRAX1.";
}

const IRAX1_STATUS_LABELS_FR: Record<string, string> = {
  IRAX1_MISSION_DRAFT: "Mission en brouillon",
  IRAX1_MISSION_READY: "Mission prête",
  IRAX1_MISSION_SENT: "Mission envoyée à l'agent",
  IRAX1_IN_PROGRESS: "Mission en cours sur le terrain",
  IRAX1_SUBMITTED: "FRAP soumis par l'agent",
  IRAX1_ACCEPTED_FOR_REVIEW: "FRAP accepté pour revue",
  IRAX1_REJECTED_FOR_CORRECTION: "Renvoyé à l'agent pour correction",
  IRAX1_CLOSED: "Mission IRAX1 clôturée",
  UNDER_BACK_OFFICE_REVIEW: "En revue back-office",
  ACCEPTED_FOR_IRAX3: "Accepté — prêt pour IRAX3",
  NEEDS_FIELD_CORRECTION: "Correction terrain requise",
  REJECTED_INVALID_EVIDENCE: "Rejeté — preuves invalides",
};

function formatIrax1StatusFr(status: string | null | undefined): string {
  if (!status) return "Aucune mission IRAX1";
  return IRAX1_STATUS_LABELS_FR[status] ?? status;
}

function Irax1JsonSection({ title, value }: { title: string; value: Record<string, unknown> | null }) {
  if (!value) {
    return (
      <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-slate-500">Non disponible — en attente de soumission terrain.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
      <dl className="mt-1 space-y-0.5">
        {Object.entries(value).map(([key, entryValue]) => (
          <div key={key} className="flex flex-wrap justify-between gap-2">
            <dt className="text-slate-500">{key}</dt>
            <dd className="text-right text-slate-200">
              {Array.isArray(entryValue)
                ? entryValue.length > 0
                  ? entryValue.join(", ")
                  : "Aucun"
                : entryValue === null || entryValue === undefined
                  ? "—"
                  : typeof entryValue === "object"
                    ? JSON.stringify(entryValue)
                    : String(entryValue)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const IRAX2_STATUS_LABELS_FR: Record<string, string> = {
  SRAP_GENERATED: "SRAP généré",
  UNDER_BACK_OFFICE_REVIEW: "En revue scientifique back-office",
  ACCEPTED_FOR_IRAX3: "Accepté — prêt pour IRAX3",
  NEEDS_MORE_SCIENTIFIC_DATA: "Données scientifiques complémentaires requises",
  REJECTED_INSUFFICIENT_DATA: "Rejeté — données insuffisantes",
};

const IRAX2_NEXT_STEP_LABELS_FR: Record<string, string> = {
  WAITING_FOR_FIELD_ASSESSMENT: "En attente de l'évaluation terrain IRAX1",
  REQUEST_MORE_SCIENTIFIC_DATA: "Demander des données scientifiques complémentaires",
  READY_FOR_IRAX3: "Prêt pour IRAX3",
  NEEDS_BACK_OFFICE_REVIEW: "Revue scientifique back-office requise",
  BLOCKED_INSUFFICIENT_DATA: "Bloqué — données insuffisantes",
};

function formatIrax2StatusFr(status: string | null | undefined): string {
  if (!status) return "Aucun SRAP";
  return IRAX2_STATUS_LABELS_FR[status] ?? status;
}

function formatIrax2NextStepFr(step: string | null | undefined): string {
  if (!step) return "—";
  return IRAX2_NEXT_STEP_LABELS_FR[step] ?? step;
}

function Irax2AvailabilityBadge({ value }: { value: unknown }) {
  const label = typeof value === "string" ? value : "UNAVAILABLE";
  const styles =
    label === "LIVE"
      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
      : label === "SEED_DEMO"
        ? "border-sky-400/35 bg-sky-500/10 text-sky-200"
        : label === "DEGRADED"
          ? "border-amber-400/35 bg-amber-500/10 text-amber-200"
          : "border-slate-500/30 bg-slate-800/40 text-slate-400";
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${styles}`}>{label}</span>;
}

function Irax2JsonSection({ title, value }: { title: string; value: Record<string, unknown> | null }) {
  if (!value) {
    return (
      <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-slate-500">Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
      <dl className="mt-1 space-y-0.5">
        {Object.entries(value).map(([key, entryValue]) => (
          <div key={key} className="flex flex-wrap justify-between gap-2">
            <dt className="text-slate-500">{key}</dt>
            <dd className="text-right text-slate-200">
              {key.toLowerCase().includes("availability") || key === "status" ? (
                <Irax2AvailabilityBadge value={entryValue} />
              ) : Array.isArray(entryValue) ? (
                entryValue.length > 0 ? (
                  entryValue.join(", ")
                ) : (
                  "Aucun"
                )
              ) : entryValue === null || entryValue === undefined ? (
                "—"
              ) : typeof entryValue === "object" ? (
                JSON.stringify(entryValue)
              ) : (
                String(entryValue)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function getIraxScientificLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Impossible de charger le SRAP IRAX2.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) au SRAP IRAX2.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour le SRAP IRAX2.";
  }
  return error.message || "Erreur API pendant le chargement du SRAP IRAX2.";
}

function getIraxScientificMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Action IRAX2 impossible.";
  }
  if (error.status === 400) {
    return "Requête invalide (400) pour cette action IRAX2.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) pour cette action IRAX2.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404), ou aucun plan IRAX-P / SRAP existant pour cette action IRAX2.";
  }
  if (error.status === 409) {
    return error.message || "Action IRAX2 impossible dans l'état actuel (409).";
  }
  return error.message || "Erreur API pendant l'action IRAX2.";
}

function hasIraxScientificForbiddenSideEffects(sideEffects: InsuranceMissionConfigSideEffects): boolean {
  return hasMissionConfigForbiddenSideEffects(sideEffects);
}

const IRAX3_STATUS_LABELS_FR: Record<string, string> = {
  CRIP_GENERATED: "CRIP généré",
  UNDER_CONSOLIDATION_REVIEW: "En revue de consolidation",
  ACCEPTED_FOR_IRAX_D: "Accepté — prêt pour IRAX-D",
  NEEDS_MORE_FIELD_DATA: "Données terrain complémentaires requises",
  NEEDS_MORE_SCIENTIFIC_DATA: "Données scientifiques complémentaires requises",
  REJECTED_INSUFFICIENT_EVIDENCE: "Rejeté — preuves insuffisantes",
};

const IRAX3_NEXT_STEP_LABELS_FR: Record<string, string> = {
  WAITING_FOR_FIELD_ASSESSMENT: "En attente de l'évaluation terrain IRAX1",
  WAITING_FOR_SCIENTIFIC_ASSESSMENT: "En attente de l'évaluation scientifique IRAX2",
  REQUEST_FIELD_CORRECTION: "Correction terrain requise",
  REQUEST_SCIENTIFIC_COMPLETION: "Complément scientifique requis",
  READY_FOR_IRAX_D: "Prêt pour IRAX-D",
  BLOCKED_INSUFFICIENT_EVIDENCE: "Bloqué — preuves insuffisantes",
  NEEDS_CONSOLIDATION_REVIEW: "Revue de consolidation requise",
};

function formatIrax3StatusFr(status: string | null | undefined): string {
  if (!status) return "Aucun CRIP";
  return IRAX3_STATUS_LABELS_FR[status] ?? status;
}

function formatIrax3NextStepFr(step: string | null | undefined): string {
  if (!step) return "—";
  return IRAX3_NEXT_STEP_LABELS_FR[step] ?? step;
}

function Irax3JsonSection({ title, value }: { title: string; value: Record<string, unknown> | null }) {
  if (!value) {
    return (
      <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-slate-500">Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
      <dl className="mt-1 space-y-0.5">
        {Object.entries(value).map(([key, entryValue]) => (
          <div key={key} className="flex flex-wrap justify-between gap-2">
            <dt className="text-slate-500">{key}</dt>
            <dd className="text-right text-slate-200">
              {key.toLowerCase().includes("availability") || key === "status" ? (
                <Irax2AvailabilityBadge value={entryValue} />
              ) : Array.isArray(entryValue) ? (
                entryValue.length > 0 ? (
                  entryValue.join(", ")
                ) : (
                  "Aucun"
                )
              ) : entryValue === null || entryValue === undefined ? (
                "—"
              ) : typeof entryValue === "object" ? (
                JSON.stringify(entryValue)
              ) : (
                String(entryValue)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Irax3ContradictionMatrix({ contradictions }: { contradictions: Record<string, unknown>[] }) {
  if (contradictions.length === 0) {
    return (
      <div className="space-y-1 rounded-lg border border-emerald-400/15 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
        <p className="text-[10px] uppercase tracking-wide text-emerald-400">3. Matrice des contradictions</p>
        <p>Aucune contradiction détectée entre les sources.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border border-rose-400/20 bg-rose-500/5 px-3 py-2 text-xs text-slate-200">
      <p className="text-[10px] uppercase tracking-wide text-rose-300">3. Matrice des contradictions</p>
      <ul className="mt-1 space-y-1.5">
        {contradictions.map((entry, index) => (
          <li key={index} className="rounded border border-rose-400/15 bg-slate-900/40 px-2 py-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-slate-300">
                {String(entry.sourceA ?? "?")} ↔ {String(entry.sourceB ?? "?")} ({String(entry.topic ?? "?")})
              </span>
              <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[10px] uppercase text-rose-200">
                {String(entry.severity ?? "UNKNOWN")}
              </span>
            </div>
            <p className="mt-1 text-slate-300">{String(entry.description ?? "")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getIraxConsolidatedLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Impossible de charger le CRIP IRAX3.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) au CRIP IRAX3.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour le CRIP IRAX3.";
  }
  return error.message || "Erreur API pendant le chargement du CRIP IRAX3.";
}

function getIraxConsolidatedMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Action IRAX3 impossible.";
  }
  if (error.status === 400) {
    return "Requête invalide (400) pour cette action IRAX3.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) pour cette action IRAX3.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404), ou aucun plan IRAX-P existant pour cette action IRAX3.";
  }
  if (error.status === 409) {
    return error.message || "Action IRAX3 impossible dans l'état actuel (409).";
  }
  return error.message || "Erreur API pendant l'action IRAX3.";
}

function hasIraxConsolidatedForbiddenSideEffects(sideEffects: InsuranceMissionConfigSideEffects): boolean {
  return hasMissionConfigForbiddenSideEffects(sideEffects);
}

const IRAX_D_STATUS_LABELS_FR: Record<string, string> = {
  IRAX_D_CALCULATED: "CRDP calculé",
  UNDER_RISK_REVIEW: "En revue de risque",
  NEEDS_MORE_DATA: "Données complémentaires requises",
  ACCEPTED_FOR_INSTITUTION_REVIEW: "Accepté — pour revue institutionnelle",
  BLOCKED_INSUFFICIENT_DATA: "Bloqué — données insuffisantes",
};

const IRAX_D_NEXT_STEP_LABELS_FR: Record<string, string> = {
  WAITING_FOR_CRIP: "En attente du CRIP IRAX3",
  REQUEST_MORE_DATA: "Données complémentaires requises",
  READY_FOR_INSTITUTION_REVIEW: "Prêt pour la revue institutionnelle",
  NEEDS_RISK_REVIEW: "Revue de risque requise",
  BLOCKED_INSUFFICIENT_DATA: "Bloqué — données insuffisantes",
};

function formatIraxDStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucun CRDP";
  return IRAX_D_STATUS_LABELS_FR[status] ?? status;
}

function formatIraxDNextStepFr(step: string | null | undefined): string {
  if (!step) return "—";
  return IRAX_D_NEXT_STEP_LABELS_FR[step] ?? step;
}

const INSTITUTION_DECISION_STATUS_LABELS_FR: Record<InsuranceInstitutionDecisionStatus, string> = {
  DRAFT_REVIEW: "Brouillon de revue",
  UNDER_INSTITUTION_REVIEW: "En revue institutionnelle",
  DECISION_RECORDED: "Décision enregistrée",
  READY_FOR_PRICING: "Prêt pour pricing",
  NEEDS_MORE_INFORMATION: "Informations complémentaires requises",
  CLOSED_NO_OFFER: "Clôturé sans offre",
};

const INSTITUTION_DECISION_TYPE_LABELS_FR: Record<InsuranceInstitutionDecisionType, string> = {
  PROCEED_TO_PRICING: "Poursuivre vers pricing",
  REQUEST_MORE_INFORMATION: "Demander informations complémentaires",
  DECLINE_TO_PROCEED: "Ne pas poursuivre",
  DEFER_FOR_COMMITTEE: "Reporter au comité",
};

const PRICING_OFFER_STATUS_LABELS_FR: Record<InsurancePricingOfferStatus, string> = {
  OFFER_DRAFT: "Brouillon d'offre",
  OFFER_PREPARED: "Offre préparée",
  UNDER_OFFER_REVIEW: "En revue d'offre",
  OFFER_APPROVED_FOR_CONTRACT: "Approuvée pour contrat",
  OFFER_NEEDS_MORE_INFORMATION: "Informations complémentaires requises",
  OFFER_DECLINED: "Offre déclinée",
  OFFER_EXPIRED: "Offre expirée",
};

const POLICY_CONTRACT_STATUS_LABELS_FR: Record<InsurancePolicyContractStatus, string> = {
  CONTRACT_DRAFT: "Brouillon contrat",
  READY_FOR_SIGNATURE: "Prêt pour signature",
  ISSUED_PENDING_PAYMENT: "Émis en attente paiement",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
};

function formatInstitutionDecisionStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucune décision";
  return INSTITUTION_DECISION_STATUS_LABELS_FR[status as InsuranceInstitutionDecisionStatus] ?? status;
}

function formatInstitutionDecisionTypeFr(type: string | null | undefined): string {
  if (!type) return "—";
  return INSTITUTION_DECISION_TYPE_LABELS_FR[type as InsuranceInstitutionDecisionType] ?? type;
}

function formatPricingOfferStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucune offre";
  return PRICING_OFFER_STATUS_LABELS_FR[status as InsurancePricingOfferStatus] ?? status;
}

function formatPolicyContractStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucun contrat";
  return POLICY_CONTRACT_STATUS_LABELS_FR[status as InsurancePolicyContractStatus] ?? status;
}

const EVIDENCE_BUNDLE_STATUS_LABELS_FR: Record<InsuranceEvidenceBundleStatus, string> = {
  BUNDLE_GENERATED: "Bundle généré",
  UNDER_EVIDENCE_REVIEW: "En revue des preuves",
  READY_FOR_ANCHORING: "Prêt pour ancrage futur",
  NEEDS_EVIDENCE_COMPLETION: "Complément de preuve requis",
  BLOCKED_INTEGRITY_ISSUE: "Bloqué — problème d'intégrité",
};

const CLAIM_CASE_STATUS_LABELS_FR: Record<InsuranceClaimCaseStatus, string> = {
  CLAIM_REPORTED: "Sinistre déclaré",
  UNDER_CLAIM_REVIEW: "En revue de sinistre",
  NEEDS_MORE_EVIDENCE: "Preuves complémentaires requises",
  READY_FOR_LOSS_ASSESSMENT: "Prêt pour évaluation des pertes",
  ACCEPTED_FOR_SETTLEMENT_REVIEW: "Accepté pour revue de règlement",
  CLOSED_NO_SETTLEMENT: "Clôturé sans règlement",
  CANCELLED: "Annulé",
};

const MONITORING_SNAPSHOT_STATUS_LABELS_FR: Record<InsuranceMonitoringSnapshotStatus, string> = {
  MONITORING_SNAPSHOT_GENERATED: "Surveillance générée",
  UNDER_MONITORING_REVIEW: "En revue de surveillance",
  ALERTS_REQUIRING_ATTENTION: "Alertes à traiter",
  NO_ACTION_REQUIRED: "Aucune action requise",
  NEEDS_DATA_REFRESH: "Rafraîchissement de données requis",
};

function formatEvidenceBundleStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucun bundle";
  return EVIDENCE_BUNDLE_STATUS_LABELS_FR[status as InsuranceEvidenceBundleStatus] ?? status;
}

function formatClaimCaseStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucun sinistre";
  return CLAIM_CASE_STATUS_LABELS_FR[status as InsuranceClaimCaseStatus] ?? status;
}

function formatMonitoringSnapshotStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucune surveillance";
  return MONITORING_SNAPSHOT_STATUS_LABELS_FR[status as InsuranceMonitoringSnapshotStatus] ?? status;
}

const FRAUD_FORENSIC_REVIEW_STATUS_LABELS_FR: Record<InsuranceFraudForensicReviewStatus, string> = {
  FORENSIC_REVIEW_GENERATED: "Revue générée",
  UNDER_FORENSIC_REVIEW: "En revue forensic",
  ANOMALY_REVIEW_REQUIRED: "Revue anomalies requise",
  CLEARED_FOR_STANDARD_PROCESSING: "Traitement standard validé",
  NEEDS_ADDITIONAL_EVIDENCE: "Preuves complémentaires requises",
  ESCALATED_TO_INSTITUTION_COMMITTEE: "Escaladé au comité institution",
  CLOSED_NO_ACTION: "Clôturé sans action",
};

function formatFraudForensicReviewStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucune revue IFDO";
  return FRAUD_FORENSIC_REVIEW_STATUS_LABELS_FR[status as InsuranceFraudForensicReviewStatus] ?? status;
}

const OPERATIONS_COCKPIT_STATUS_LABELS_FR: Record<InsuranceOperationsCockpitSnapshotStatus, string> = {
  OPERATIONS_SNAPSHOT_GENERATED: "Cockpit généré",
  UNDER_OPERATIONS_REVIEW: "En revue opérations",
  ACTIONS_REQUIRED: "Actions requises",
  NO_OPERATIONAL_ACTION_REQUIRED: "Aucune action requise",
  NEEDS_REFRESH: "Rafraîchissement requis",
};

function formatOperationsCockpitStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucun cockpit opérations";
  return OPERATIONS_COCKPIT_STATUS_LABELS_FR[status as InsuranceOperationsCockpitSnapshotStatus] ?? status;
}

const GOVERNANCE_COMPLIANCE_STATUS_LABELS_FR: Record<InsuranceGovernanceComplianceSnapshotStatus, string> = {
  COMPLIANCE_SNAPSHOT_GENERATED: "Conformité générée",
  UNDER_COMPLIANCE_REVIEW: "En revue conformité",
  GAPS_REQUIRING_ACTION: "Écarts à traiter",
  READY_FOR_AUDIT_REVIEW: "Prêt pour revue audit",
  NO_COMPLIANCE_ACTION_REQUIRED: "Aucune action requise",
  NEEDS_COMPLIANCE_REFRESH: "Rafraîchissement requis",
};

function formatGovernanceComplianceStatusFr(status: string | null | undefined): string {
  if (!status) return "Aucune conformité ICGO";
  return GOVERNANCE_COMPLIANCE_STATUS_LABELS_FR[status as InsuranceGovernanceComplianceSnapshotStatus] ?? status;
}

function parseLineItems(value: string): string[] {
  return value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatUnknownValue(value: unknown): string {
  if (value === null || value === undefined) return "Aucune donnée disponible.";
  if (Array.isArray(value)) return value.length ? value.join(" • ") : "Aucune donnée disponible.";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
}

function InstitutionDecisionValueBlock({ title, value }: { title: string; value: unknown }) {
  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  return (
    <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
      {isObject ? (
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] text-slate-200">
          {formatUnknownValue(value)}
        </pre>
      ) : (
        <p className="text-slate-200">{formatUnknownValue(value)}</p>
      )}
    </div>
  );
}

function getIraxDecisionLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Impossible de charger le CRDP IRAX-D.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) au CRDP IRAX-D.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404) pour le CRDP IRAX-D.";
  }
  return error.message || "Erreur API pendant le chargement du CRDP IRAX-D.";
}

function getIraxDecisionMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Action IRAX-D impossible.";
  }
  if (error.status === 400) {
    return "Requête invalide (400) pour cette action IRAX-D.";
  }
  if (error.status === 401) {
    return "Session expirée (401). Veuillez vous reconnecter.";
  }
  if (error.status === 403) {
    return "Accès refusé (403) pour cette action IRAX-D.";
  }
  if (error.status === 404) {
    return "Dossier introuvable (404), ou aucun CRDP existant pour cette action IRAX-D.";
  }
  if (error.status === 409) {
    return (
      error.message ||
      "IRAX-D nécessite un CRIP IRAX3 accepté pour IRAX-D (action impossible dans l'état actuel)."
    );
  }
  return error.message || "Erreur API pendant l'action IRAX-D.";
}

function hasIraxDecisionForbiddenSideEffects(sideEffects: InsuranceMissionConfigSideEffects): boolean {
  return hasMissionConfigForbiddenSideEffects(sideEffects);
}

function getInstitutionDecisionLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Impossible de charger la décision institutionnelle.";
  }
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) à la décision institutionnelle.";
  if (error.status === 404) return "Dossier introuvable (404) pour la décision institutionnelle.";
  return error.message || "Erreur API pendant le chargement de la décision institutionnelle.";
}

function getInstitutionDecisionMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Service indisponible. Action institutionnelle impossible.";
  }
  if (error.status === 400) return "Requête invalide (400) pour cette action institutionnelle.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action institutionnelle.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action institutionnelle.";
  if (error.status === 409) return error.message || "Prérequis IRAX-D manquants ou décision déjà enregistrée.";
  return error.message || "Erreur API pendant l'action institutionnelle.";
}

function getPricingOfferLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger l'offre tarifaire.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) à l'offre tarifaire.";
  if (error.status === 404) return "Dossier introuvable (404) pour l'offre tarifaire.";
  return error.message || "Erreur API pendant le chargement de l'offre tarifaire.";
}

function getPricingOfferMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action pricing impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action pricing.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action pricing.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action pricing.";
  if (error.status === 409) return error.message || "Prérequis institutionnels manquants pour le pricing.";
  return error.message || "Erreur API pendant l'action pricing.";
}

function getPolicyContractLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger le contrat.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) au contrat.";
  if (error.status === 404) return "Dossier introuvable (404) pour le contrat.";
  return error.message || "Erreur API pendant le chargement du contrat.";
}

function getPolicyContractMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action contrat impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action contrat.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action contrat.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action contrat.";
  if (error.status === 409) return error.message || "L'offre doit être approuvée pour émettre le contrat.";
  return error.message || "Erreur API pendant l'action contrat.";
}

function getEvidenceBundleLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger le bundle de preuves.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) au bundle de preuves.";
  if (error.status === 404) return "Dossier introuvable (404) pour le bundle de preuves.";
  return error.message || "Erreur API pendant le chargement du bundle de preuves.";
}

function getEvidenceBundleMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action IBDO impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action IBDO.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action IBDO.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action IBDO.";
  return error.message || "Erreur API pendant l'action IBDO.";
}

function getClaimCaseLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger les sinistres.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) aux sinistres.";
  if (error.status === 404) return "Dossier introuvable (404) pour les sinistres.";
  return error.message || "Erreur API pendant le chargement des sinistres.";
}

function getClaimCaseMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action sinistre impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action sinistre.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action sinistre.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action sinistre.";
  if (error.status === 409) return error.message || "Un contrat de police actif est requis pour déclarer un sinistre.";
  return error.message || "Erreur API pendant l'action sinistre.";
}

function getMonitoringSnapshotLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger la surveillance.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) à la surveillance.";
  if (error.status === 404) return "Dossier introuvable (404) pour la surveillance.";
  return error.message || "Erreur API pendant le chargement de la surveillance.";
}

function getMonitoringSnapshotMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action IDDO impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action IDDO.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action IDDO.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action IDDO.";
  return error.message || "Erreur API pendant l'action IDDO.";
}

function getFraudForensicReviewLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger la revue IFDO.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) à la revue IFDO.";
  if (error.status === 404) return "Dossier introuvable (404) pour la revue IFDO.";
  return error.message || "Erreur API pendant le chargement de la revue IFDO.";
}

function getFraudForensicReviewMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action IFDO impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action IFDO.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action IFDO.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action IFDO.";
  return error.message || "Erreur API pendant l'action IFDO.";
}

function getOperationsCockpitLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger le cockpit opérations.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) au cockpit opérations.";
  if (error.status === 404) return "Dossier introuvable (404) pour le cockpit opérations.";
  return error.message || "Erreur API pendant le chargement du cockpit opérations.";
}

function getOperationsCockpitMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action ICOO impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action ICOO.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action ICOO.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action ICOO.";
  return error.message || "Erreur API pendant l'action ICOO.";
}

function getGovernanceComplianceLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Impossible de charger la conformité ICGO.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) à la conformité ICGO.";
  if (error.status === 404) return "Dossier introuvable (404) pour la conformité ICGO.";
  return error.message || "Erreur API pendant le chargement de la conformité ICGO.";
}

function getGovernanceComplianceMutationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Service indisponible. Action ICGO impossible.";
  if (error.status === 400) return "Requête invalide (400) pour cette action ICGO.";
  if (error.status === 401) return "Session expirée (401). Veuillez vous reconnecter.";
  if (error.status === 403) return "Accès refusé (403) pour cette action ICGO.";
  if (error.status === 404) return "Dossier introuvable (404) pour cette action ICGO.";
  return error.message || "Erreur API pendant l'action ICGO.";
}

function IraxCoherenceValue({ value }: { value: boolean | "UNKNOWN" }) {
  if (value === "UNKNOWN") {
    return <span className="text-slate-500">Non disponible</span>;
  }
  return value ? (
    <span className="text-emerald-300">Cohérent</span>
  ) : (
    <span className="text-rose-300">Incohérence détectée</span>
  );
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
  const [iraxPlanning, setIraxPlanning] = useState<InsuranceIraxPlanning | null>(null);
  const [iraxPlanningLoading, setIraxPlanningLoading] = useState(false);
  const [iraxPlanningGenerating, setIraxPlanningGenerating] = useState(false);
  const [iraxPlanningStatusSaving, setIraxPlanningStatusSaving] = useState<InsuranceIraxPlanningStatus | null>(null);
  const [iraxPlanningError, setIraxPlanningError] = useState<string | null>(null);
  const [iraxPlanningFeedback, setIraxPlanningFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [irax1FieldAssessment, setIrax1FieldAssessment] = useState<InsuranceIrax1FieldAssessment | null>(null);
  const [irax1Loading, setIrax1Loading] = useState(false);
  const [irax1Creating, setIrax1Creating] = useState(false);
  const [irax1StatusSaving, setIrax1StatusSaving] = useState<Irax1FrapStatus | null>(null);
  const [irax1Error, setIrax1Error] = useState<string | null>(null);
  const [irax1Feedback, setIrax1Feedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [irax1SelectedAgentUserId, setIrax1SelectedAgentUserId] = useState<string>("");
  const [iraxScientificAssessment, setIraxScientificAssessment] = useState<InsuranceIraxScientificAssessment | null>(
    null,
  );
  const [iraxScientificLoading, setIraxScientificLoading] = useState(false);
  const [iraxScientificGenerating, setIraxScientificGenerating] = useState(false);
  const [iraxScientificStatusSaving, setIraxScientificStatusSaving] =
    useState<InsuranceIraxScientificAssessmentStatus | null>(null);
  const [iraxScientificError, setIraxScientificError] = useState<string | null>(null);
  const [iraxScientificFeedback, setIraxScientificFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [iraxConsolidatedAssessment, setIraxConsolidatedAssessment] =
    useState<InsuranceIraxConsolidatedAssessment | null>(null);
  const [iraxConsolidatedLoading, setIraxConsolidatedLoading] = useState(false);
  const [iraxConsolidatedGenerating, setIraxConsolidatedGenerating] = useState(false);
  const [iraxConsolidatedStatusSaving, setIraxConsolidatedStatusSaving] =
    useState<InsuranceIraxConsolidatedAssessmentStatus | null>(null);
  const [iraxConsolidatedError, setIraxConsolidatedError] = useState<string | null>(null);
  const [iraxConsolidatedFeedback, setIraxConsolidatedFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [iraxDecisionAssessment, setIraxDecisionAssessment] =
    useState<InsuranceIraxDecisionAssessment | null>(null);
  const [iraxDecisionLoading, setIraxDecisionLoading] = useState(false);
  const [iraxDecisionCalculating, setIraxDecisionCalculating] = useState(false);
  const [iraxDecisionStatusSaving, setIraxDecisionStatusSaving] =
    useState<InsuranceIraxDecisionAssessmentStatus | null>(null);
  const [iraxDecisionError, setIraxDecisionError] = useState<string | null>(null);
  const [iraxDecisionFeedback, setIraxDecisionFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [institutionDecision, setInstitutionDecision] = useState<InsuranceInstitutionDecision | null>(null);
  const [institutionDecisionLoading, setInstitutionDecisionLoading] = useState(false);
  const [institutionDecisionSaving, setInstitutionDecisionSaving] = useState(false);
  const [institutionDecisionStatusSaving, setInstitutionDecisionStatusSaving] =
    useState<InsuranceInstitutionDecisionStatus | null>(null);
  const [institutionDecisionError, setInstitutionDecisionError] = useState<string | null>(null);
  const [institutionDecisionFeedback, setInstitutionDecisionFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [institutionDecisionType, setInstitutionDecisionType] =
    useState<InsuranceInstitutionDecisionType>("PROCEED_TO_PRICING");
  const [institutionDecisionRationale, setInstitutionDecisionRationale] = useState("");
  const [institutionDecisionConditions, setInstitutionDecisionConditions] = useState("");
  const [institutionDecisionRequiredActions, setInstitutionDecisionRequiredActions] = useState("");
  const [institutionDecisionAuthorityLevel, setInstitutionDecisionAuthorityLevel] = useState("");
  const [institutionDecisionCommitteeNote, setInstitutionDecisionCommitteeNote] = useState("");
  const [pricingOffer, setPricingOffer] = useState<InsurancePricingOffer | null>(null);
  const [pricingOfferLoading, setPricingOfferLoading] = useState(false);
  const [pricingOfferGenerating, setPricingOfferGenerating] = useState(false);
  const [pricingOfferStatusSaving, setPricingOfferStatusSaving] = useState<InsurancePricingOfferStatus | null>(null);
  const [pricingOfferError, setPricingOfferError] = useState<string | null>(null);
  const [pricingOfferFeedback, setPricingOfferFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [policyContract, setPolicyContract] = useState<InsurancePolicyContract | null>(null);
  const [policyContractLoading, setPolicyContractLoading] = useState(false);
  const [policyContractIssuing, setPolicyContractIssuing] = useState(false);
  const [policyContractStatusSaving, setPolicyContractStatusSaving] =
    useState<InsurancePolicyContractStatus | null>(null);
  const [policyContractError, setPolicyContractError] = useState<string | null>(null);
  const [policyContractFeedback, setPolicyContractFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [evidenceBundle, setEvidenceBundle] = useState<InsuranceEvidenceBundle | null>(null);
  const [evidenceBundleLoading, setEvidenceBundleLoading] = useState(false);
  const [evidenceBundleGenerating, setEvidenceBundleGenerating] = useState(false);
  const [evidenceBundleStatusSaving, setEvidenceBundleStatusSaving] =
    useState<InsuranceEvidenceBundleStatus | null>(null);
  const [evidenceBundleError, setEvidenceBundleError] = useState<string | null>(null);
  const [evidenceBundleFeedback, setEvidenceBundleFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [claimCases, setClaimCases] = useState<InsuranceClaimCase[]>([]);
  const [claimCasesLoading, setClaimCasesLoading] = useState(false);
  const [claimCaseCreating, setClaimCaseCreating] = useState(false);
  const [claimCaseStatusSaving, setClaimCaseStatusSaving] = useState<string | null>(null);
  const [claimCasesError, setClaimCasesError] = useState<string | null>(null);
  const [claimCaseFeedback, setClaimCaseFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [claimCaseForm, setClaimCaseForm] = useState({ claimType: "", eventDate: "", notes: "" });
  const [monitoringSnapshot, setMonitoringSnapshot] = useState<InsuranceMonitoringSnapshot | null>(null);
  const [monitoringSnapshotLoading, setMonitoringSnapshotLoading] = useState(false);
  const [monitoringSnapshotGenerating, setMonitoringSnapshotGenerating] = useState(false);
  const [monitoringSnapshotStatusSaving, setMonitoringSnapshotStatusSaving] =
    useState<InsuranceMonitoringSnapshotStatus | null>(null);
  const [monitoringSnapshotError, setMonitoringSnapshotError] = useState<string | null>(null);
  const [monitoringSnapshotFeedback, setMonitoringSnapshotFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [fraudForensicReview, setFraudForensicReview] = useState<InsuranceFraudForensicReview | null>(null);
  const [fraudForensicReviewLoading, setFraudForensicReviewLoading] = useState(false);
  const [fraudForensicReviewGenerating, setFraudForensicReviewGenerating] = useState(false);
  const [fraudForensicReviewStatusSaving, setFraudForensicReviewStatusSaving] =
    useState<InsuranceFraudForensicReviewStatus | null>(null);
  const [fraudForensicReviewError, setFraudForensicReviewError] = useState<string | null>(null);
  const [fraudForensicReviewFeedback, setFraudForensicReviewFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [operationsCockpit, setOperationsCockpit] = useState<InsuranceOperationsCockpitSnapshot | null>(null);
  const [operationsCockpitLoading, setOperationsCockpitLoading] = useState(false);
  const [operationsCockpitGenerating, setOperationsCockpitGenerating] = useState(false);
  const [operationsCockpitStatusSaving, setOperationsCockpitStatusSaving] =
    useState<InsuranceOperationsCockpitSnapshotStatus | null>(null);
  const [operationsCockpitError, setOperationsCockpitError] = useState<string | null>(null);
  const [operationsCockpitFeedback, setOperationsCockpitFeedback] = useState<{
    type: "success" | "error" | "critical";
    message: string;
  } | null>(null);
  const [governanceCompliance, setGovernanceCompliance] = useState<InsuranceGovernanceComplianceSnapshot | null>(
    null,
  );
  const [governanceComplianceLoading, setGovernanceComplianceLoading] = useState(false);
  const [governanceComplianceGenerating, setGovernanceComplianceGenerating] = useState(false);
  const [governanceComplianceStatusSaving, setGovernanceComplianceStatusSaving] =
    useState<InsuranceGovernanceComplianceSnapshotStatus | null>(null);
  const [governanceComplianceError, setGovernanceComplianceError] = useState<string | null>(null);
  const [governanceComplianceFeedback, setGovernanceComplianceFeedback] = useState<{
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

  useEffect(() => {
    let mounted = true;

    async function loadPricingOffer() {
      setPricingOfferLoading(true);
      setPricingOfferError(null);

      try {
        const offer = await getPricingOffer(applicationId);
        if (!mounted) return;
        setPricingOffer(offer);
      } catch (loadError) {
        if (!mounted) return;
        setPricingOfferError(getPricingOfferLoadErrorMessage(loadError));
      } finally {
        if (mounted) setPricingOfferLoading(false);
      }
    }

    void loadPricingOffer();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadPolicyContract() {
      setPolicyContractLoading(true);
      setPolicyContractError(null);

      try {
        const contract = await getPolicyContract(applicationId);
        if (!mounted) return;
        setPolicyContract(contract);
      } catch (loadError) {
        if (!mounted) return;
        setPolicyContractError(getPolicyContractLoadErrorMessage(loadError));
      } finally {
        if (mounted) setPolicyContractLoading(false);
      }
    }

    void loadPolicyContract();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadEvidenceBundle() {
      setEvidenceBundleLoading(true);
      setEvidenceBundleError(null);

      try {
        const bundle = await getEvidenceBundle(applicationId);
        if (!mounted) return;
        setEvidenceBundle(bundle);
      } catch (loadError) {
        if (!mounted) return;
        setEvidenceBundleError(getEvidenceBundleLoadErrorMessage(loadError));
      } finally {
        if (mounted) setEvidenceBundleLoading(false);
      }
    }

    void loadEvidenceBundle();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadClaimCases() {
      setClaimCasesLoading(true);
      setClaimCasesError(null);

      try {
        const claims = await listClaimCases(applicationId);
        if (!mounted) return;
        setClaimCases(claims);
      } catch (loadError) {
        if (!mounted) return;
        setClaimCasesError(getClaimCaseLoadErrorMessage(loadError));
      } finally {
        if (mounted) setClaimCasesLoading(false);
      }
    }

    void loadClaimCases();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadMonitoringSnapshot() {
      setMonitoringSnapshotLoading(true);
      setMonitoringSnapshotError(null);

      try {
        const snapshot = await getMonitoringSnapshot(applicationId);
        if (!mounted) return;
        setMonitoringSnapshot(snapshot);
      } catch (loadError) {
        if (!mounted) return;
        setMonitoringSnapshotError(getMonitoringSnapshotLoadErrorMessage(loadError));
      } finally {
        if (mounted) setMonitoringSnapshotLoading(false);
      }
    }

    void loadMonitoringSnapshot();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadFraudForensicReview() {
      setFraudForensicReviewLoading(true);
      setFraudForensicReviewError(null);

      try {
        const review = await getFraudForensicReview(applicationId);
        if (!mounted) return;
        setFraudForensicReview(review);
      } catch (loadError) {
        if (!mounted) return;
        setFraudForensicReviewError(getFraudForensicReviewLoadErrorMessage(loadError));
      } finally {
        if (mounted) setFraudForensicReviewLoading(false);
      }
    }

    void loadFraudForensicReview();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadOperationsCockpit() {
      setOperationsCockpitLoading(true);
      setOperationsCockpitError(null);

      try {
        const snapshot = await getOperationsCockpit(applicationId);
        if (!mounted) return;
        setOperationsCockpit(snapshot);
      } catch (loadError) {
        if (!mounted) return;
        setOperationsCockpitError(getOperationsCockpitLoadErrorMessage(loadError));
      } finally {
        if (mounted) setOperationsCockpitLoading(false);
      }
    }

    void loadOperationsCockpit();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadGovernanceCompliance() {
      setGovernanceComplianceLoading(true);
      setGovernanceComplianceError(null);

      try {
        const snapshot = await getGovernanceCompliance(applicationId);
        if (!mounted) return;
        setGovernanceCompliance(snapshot);
      } catch (loadError) {
        if (!mounted) return;
        setGovernanceComplianceError(getGovernanceComplianceLoadErrorMessage(loadError));
      } finally {
        if (mounted) setGovernanceComplianceLoading(false);
      }
    }

    void loadGovernanceCompliance();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function loadInstitutionDecision() {
      setInstitutionDecisionLoading(true);
      setInstitutionDecisionError(null);

      try {
        const decision = await getInstitutionDecision(applicationId);
        if (!mounted) return;
        setInstitutionDecision(decision);
      } catch (loadError) {
        if (!mounted) return;
        setInstitutionDecisionError(getInstitutionDecisionLoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setInstitutionDecisionLoading(false);
        }
      }
    }

    void loadInstitutionDecision();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function refreshApplicationAfterMutation() {
    const response = await getInsuranceApplicationById(applicationId);
    setResult(response);
    setError(null);
  }

  useEffect(() => {
    let mounted = true;

    async function loadIraxPlanning() {
      setIraxPlanningLoading(true);
      setIraxPlanningError(null);

      try {
        const plan = await getIraxPlanning(applicationId);
        if (!mounted) return;
        setIraxPlanning(plan);
      } catch (loadError) {
        if (!mounted) return;
        setIraxPlanningError(getIraxPlanningLoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setIraxPlanningLoading(false);
        }
      }
    }

    void loadIraxPlanning();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function handleGenerateIraxPlanning() {
    if (iraxPlanningGenerating) return;

    setIraxPlanningFeedback(null);
    setIraxPlanningGenerating(true);

    try {
      const plan = await generateIraxPlanning(applicationId);
      setIraxPlanning(plan);
      setIraxPlanningError(null);

      if (plan && hasIraxPlanningForbiddenSideEffects(plan.sideEffects)) {
        setIraxPlanningFeedback({
          type: "critical",
          message:
            "Erreur critique: un effet secondaire interdit a été détecté (mission/audit terrain/RAX/tarification/police/sinistre/blockchain). Plan non validé.",
        });
        return;
      }

      setIraxPlanningFeedback({
        type: "success",
        message: `Plan IRAX-P généré (version ${plan?.version ?? 1}).`,
      });
    } catch (mutationError) {
      setIraxPlanningFeedback({
        type: "error",
        message: getIraxPlanningMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxPlanningGenerating(false);
    }
  }

  async function handleUpdateIraxPlanningStatus(status: InsuranceIraxPlanningStatus) {
    if (iraxPlanningStatusSaving) return;

    setIraxPlanningFeedback(null);
    setIraxPlanningStatusSaving(status);

    try {
      const plan = await updateIraxPlanningStatus(applicationId, status);
      setIraxPlanning(plan);
      setIraxPlanningFeedback({
        type: "success",
        message: `Statut IRAX-P mis à jour: ${status}.`,
      });
    } catch (mutationError) {
      setIraxPlanningFeedback({
        type: "error",
        message: getIraxPlanningMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxPlanningStatusSaving(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadIrax1FieldAssessment() {
      setIrax1Loading(true);
      setIrax1Error(null);

      try {
        const fieldAssessment = await getIrax1FieldAssessment(applicationId);
        if (!mounted) return;
        setIrax1FieldAssessment(fieldAssessment);
      } catch (loadError) {
        if (!mounted) return;
        setIrax1Error(getIrax1LoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setIrax1Loading(false);
        }
      }
    }

    void loadIrax1FieldAssessment();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function handleCreateIrax1Mission() {
    if (irax1Creating) return;

    setIrax1Feedback(null);
    setIrax1Creating(true);

    try {
      const mission = await createIrax1Mission(
        applicationId,
        irax1SelectedAgentUserId.trim() ? irax1SelectedAgentUserId.trim() : null,
      );
      setIrax1FieldAssessment(mission);
      setIrax1Error(null);
      setIrax1Feedback({
        type: "success",
        message: mission
          ? `Mission IRAX1 prête (statut ${formatIrax1StatusFr(mission.status)}).`
          : "Mission IRAX1 traitée.",
      });
    } catch (mutationError) {
      setIrax1Feedback({
        type: "error",
        message: getIrax1MutationErrorMessage(mutationError),
      });
    } finally {
      setIrax1Creating(false);
    }
  }

  async function handleUpdateIrax1FrapStatus(status: Irax1FrapStatus) {
    if (irax1StatusSaving) return;

    setIrax1Feedback(null);
    setIrax1StatusSaving(status);

    try {
      const fieldAssessment = await updateIrax1FieldAssessmentStatus(applicationId, status);
      setIrax1FieldAssessment(fieldAssessment);
      setIrax1Feedback({
        type: "success",
        message: `Statut FRAP IRAX1 mis à jour: ${formatIrax1StatusFr(status)}.`,
      });
    } catch (mutationError) {
      setIrax1Feedback({
        type: "error",
        message: getIrax1MutationErrorMessage(mutationError),
      });
    } finally {
      setIrax1StatusSaving(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadIraxScientificAssessment() {
      setIraxScientificLoading(true);
      setIraxScientificError(null);

      try {
        const srap = await getIraxScientificAssessment(applicationId);
        if (!mounted) return;
        setIraxScientificAssessment(srap);
      } catch (loadError) {
        if (!mounted) return;
        setIraxScientificError(getIraxScientificLoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setIraxScientificLoading(false);
        }
      }
    }

    void loadIraxScientificAssessment();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function handleGenerateIraxScientificAssessment() {
    if (iraxScientificGenerating) return;

    setIraxScientificFeedback(null);
    setIraxScientificGenerating(true);

    try {
      const srap = await generateIraxScientificAssessment(applicationId);
      setIraxScientificAssessment(srap);
      setIraxScientificError(null);

      if (srap && hasIraxScientificForbiddenSideEffects(srap.sideEffects)) {
        setIraxScientificFeedback({
          type: "critical",
          message:
            "Erreur critique: un effet secondaire interdit a été détecté (mission/RAX/pricing/police/sinistre/evidence/blockchain). SRAP non validé.",
        });
        return;
      }

      setIraxScientificFeedback({
        type: "success",
        message: `SRAP IRAX2 généré (version ${srap?.version ?? 1}).`,
      });
    } catch (mutationError) {
      setIraxScientificFeedback({
        type: "error",
        message: getIraxScientificMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxScientificGenerating(false);
    }
  }

  async function handleUpdateIraxScientificAssessmentStatus(status: InsuranceIraxScientificAssessmentStatus) {
    if (iraxScientificStatusSaving) return;

    setIraxScientificFeedback(null);
    setIraxScientificStatusSaving(status);

    try {
      const srap = await updateIraxScientificAssessmentStatus(applicationId, status);
      setIraxScientificAssessment(srap);
      setIraxScientificFeedback({
        type: "success",
        message: `Statut SRAP IRAX2 mis à jour: ${formatIrax2StatusFr(status)}.`,
      });
    } catch (mutationError) {
      setIraxScientificFeedback({
        type: "error",
        message: getIraxScientificMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxScientificStatusSaving(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadIraxConsolidatedAssessment() {
      setIraxConsolidatedLoading(true);
      setIraxConsolidatedError(null);

      try {
        const crip = await getIraxConsolidatedAssessment(applicationId);
        if (!mounted) return;
        setIraxConsolidatedAssessment(crip);
      } catch (loadError) {
        if (!mounted) return;
        setIraxConsolidatedError(getIraxConsolidatedLoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setIraxConsolidatedLoading(false);
        }
      }
    }

    void loadIraxConsolidatedAssessment();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function handleGenerateIraxConsolidatedAssessment() {
    if (iraxConsolidatedGenerating) return;

    setIraxConsolidatedFeedback(null);
    setIraxConsolidatedGenerating(true);

    try {
      const crip = await generateIraxConsolidatedAssessment(applicationId);
      setIraxConsolidatedAssessment(crip);
      setIraxConsolidatedError(null);

      if (crip && hasIraxConsolidatedForbiddenSideEffects(crip.sideEffects)) {
        setIraxConsolidatedFeedback({
          type: "critical",
          message:
            "Erreur critique: un effet secondaire interdit a été détecté (mission/RAX/pricing/police/sinistre/evidence/blockchain). CRIP non validé.",
        });
        return;
      }

      setIraxConsolidatedFeedback({
        type: "success",
        message: `CRIP IRAX3 généré (version ${crip?.version ?? 1}).`,
      });
    } catch (mutationError) {
      setIraxConsolidatedFeedback({
        type: "error",
        message: getIraxConsolidatedMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxConsolidatedGenerating(false);
    }
  }

  async function handleUpdateIraxConsolidatedAssessmentStatus(status: InsuranceIraxConsolidatedAssessmentStatus) {
    if (iraxConsolidatedStatusSaving) return;

    setIraxConsolidatedFeedback(null);
    setIraxConsolidatedStatusSaving(status);

    try {
      const crip = await updateIraxConsolidatedAssessmentStatus(applicationId, status);
      setIraxConsolidatedAssessment(crip);
      setIraxConsolidatedFeedback({
        type: "success",
        message: `Statut CRIP IRAX3 mis à jour: ${formatIrax3StatusFr(status)}.`,
      });
    } catch (mutationError) {
      setIraxConsolidatedFeedback({
        type: "error",
        message: getIraxConsolidatedMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxConsolidatedStatusSaving(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadIraxDecisionAssessment() {
      setIraxDecisionLoading(true);
      setIraxDecisionError(null);

      try {
        const crdp = await getIraxDecisionAssessment(applicationId);
        if (!mounted) return;
        setIraxDecisionAssessment(crdp);
      } catch (loadError) {
        if (!mounted) return;
        setIraxDecisionError(getIraxDecisionLoadErrorMessage(loadError));
      } finally {
        if (mounted) {
          setIraxDecisionLoading(false);
        }
      }
    }

    void loadIraxDecisionAssessment();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  async function handleCalculateIraxDecisionAssessment() {
    if (iraxDecisionCalculating) return;

    setIraxDecisionFeedback(null);
    setIraxDecisionCalculating(true);

    try {
      const crdp = await calculateIraxDecisionAssessment(applicationId);
      setIraxDecisionAssessment(crdp);
      setIraxDecisionError(null);

      if (crdp && hasIraxDecisionForbiddenSideEffects(crdp.sideEffects)) {
        setIraxDecisionFeedback({
          type: "critical",
          message:
            "Erreur critique: un effet secondaire interdit a été détecté (mission/pricing/police/sinistre/evidence/blockchain). CRDP non validé.",
        });
        return;
      }

      setIraxDecisionFeedback({
        type: "success",
        message: `CRDP IRAX-D calculé (version ${crdp?.version ?? 1}).`,
      });
    } catch (mutationError) {
      setIraxDecisionFeedback({
        type: "error",
        message: getIraxDecisionMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxDecisionCalculating(false);
    }
  }

  async function handleUpdateIraxDecisionAssessmentStatus(status: InsuranceIraxDecisionAssessmentStatus) {
    if (iraxDecisionStatusSaving) return;

    setIraxDecisionFeedback(null);
    setIraxDecisionStatusSaving(status);

    try {
      const crdp = await updateIraxDecisionAssessmentStatus(applicationId, status);
      setIraxDecisionAssessment(crdp);
      setIraxDecisionFeedback({
        type: "success",
        message: `Statut CRDP IRAX-D mis à jour: ${formatIraxDStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setIraxDecisionFeedback({
        type: "error",
        message: getIraxDecisionMutationErrorMessage(mutationError),
      });
    } finally {
      setIraxDecisionStatusSaving(null);
    }
  }

  async function handleRecordInstitutionDecision() {
    if (institutionDecisionSaving) return;

    setInstitutionDecisionFeedback(null);
    setInstitutionDecisionSaving(true);

    try {
      const decision = await recordInstitutionDecision(applicationId, {
        decisionType: institutionDecisionType,
        decisionRationale: institutionDecisionRationale.trim(),
        conditions: parseLineItems(institutionDecisionConditions),
        requiredActions: parseLineItems(institutionDecisionRequiredActions),
        authorityLevel: institutionDecisionAuthorityLevel.trim() || null,
        committeeNote: institutionDecisionCommitteeNote.trim() || null,
      });

      setInstitutionDecision(decision);
      setInstitutionDecisionError(null);
      setInstitutionDecisionFeedback({
        type: "success",
        message: `Décision institutionnelle enregistrée: ${formatInstitutionDecisionTypeFr(
          decision?.decisionType ?? institutionDecisionType,
        )}.`,
      });
    } catch (mutationError) {
      setInstitutionDecisionFeedback({
        type: "error",
        message: getInstitutionDecisionMutationErrorMessage(mutationError),
      });
    } finally {
      setInstitutionDecisionSaving(false);
    }
  }

  async function handleUpdateInstitutionDecisionStatus(status: InsuranceInstitutionDecisionStatus) {
    if (institutionDecisionStatusSaving) return;

    setInstitutionDecisionFeedback(null);
    setInstitutionDecisionStatusSaving(status);

    try {
      const decision = await updateInstitutionDecisionStatus(applicationId, status);
      setInstitutionDecision(decision);
      setInstitutionDecisionFeedback({
        type: "success",
        message: `Statut de revue institutionnelle mis à jour: ${formatInstitutionDecisionStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setInstitutionDecisionFeedback({
        type: "error",
        message: getInstitutionDecisionMutationErrorMessage(mutationError),
      });
    } finally {
      setInstitutionDecisionStatusSaving(null);
    }
  }

  async function handleGeneratePricingOffer() {
    if (pricingOfferGenerating) return;

    setPricingOfferFeedback(null);
    setPricingOfferGenerating(true);

    try {
      const offer = await generatePricingOffer(applicationId);
      setPricingOffer(offer);
      setPricingOfferError(null);
      setPricingOfferFeedback({
        type: "success",
        message: `Offre tarifaire préparée (${formatPricingOfferStatusFr(offer?.status)}).`,
      });
    } catch (mutationError) {
      setPricingOfferFeedback({
        type: "error",
        message: getPricingOfferMutationErrorMessage(mutationError),
      });
    } finally {
      setPricingOfferGenerating(false);
    }
  }

  async function handleUpdatePricingOfferStatus(status: InsurancePricingOfferStatus) {
    if (pricingOfferStatusSaving) return;

    setPricingOfferFeedback(null);
    setPricingOfferStatusSaving(status);

    try {
      const offer = await updatePricingOfferStatus(applicationId, status);
      setPricingOffer(offer);
      setPricingOfferFeedback({
        type: "success",
        message: `Statut offre mis à jour: ${formatPricingOfferStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setPricingOfferFeedback({
        type: "error",
        message: getPricingOfferMutationErrorMessage(mutationError),
      });
    } finally {
      setPricingOfferStatusSaving(null);
    }
  }

  async function handleIssuePolicyContract() {
    if (policyContractIssuing) return;

    setPolicyContractFeedback(null);
    setPolicyContractIssuing(true);

    try {
      const contract = await issuePolicyContract(applicationId);
      setPolicyContract(contract);
      setPolicyContractError(null);
      setPolicyContractFeedback({
        type: "success",
        message: `Contrat émis: ${formatPolicyContractStatusFr(contract?.status)}.`,
      });
    } catch (mutationError) {
      setPolicyContractFeedback({
        type: "error",
        message: getPolicyContractMutationErrorMessage(mutationError),
      });
    } finally {
      setPolicyContractIssuing(false);
    }
  }

  async function handleUpdatePolicyContractStatus(status: InsurancePolicyContractStatus) {
    if (policyContractStatusSaving) return;

    setPolicyContractFeedback(null);
    setPolicyContractStatusSaving(status);

    try {
      const contract = await updatePolicyContractStatus(applicationId, status);
      setPolicyContract(contract);
      setPolicyContractFeedback({
        type: "success",
        message: `Statut contrat mis à jour: ${formatPolicyContractStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setPolicyContractFeedback({
        type: "error",
        message: getPolicyContractMutationErrorMessage(mutationError),
      });
    } finally {
      setPolicyContractStatusSaving(null);
    }
  }

  async function handleGenerateEvidenceBundle() {
    if (evidenceBundleGenerating) return;

    setEvidenceBundleFeedback(null);
    setEvidenceBundleGenerating(true);

    try {
      const bundle = await generateEvidenceBundle(applicationId);
      setEvidenceBundle(bundle);
      setEvidenceBundleError(null);
      setEvidenceBundleFeedback({
        type: "success",
        message: `Bundle de preuves généré (${formatEvidenceBundleStatusFr(bundle?.status)}).`,
      });
    } catch (mutationError) {
      setEvidenceBundleFeedback({
        type: "error",
        message: getEvidenceBundleMutationErrorMessage(mutationError),
      });
    } finally {
      setEvidenceBundleGenerating(false);
    }
  }

  async function handleUpdateEvidenceBundleStatus(status: InsuranceEvidenceBundleStatus) {
    if (evidenceBundleStatusSaving) return;

    setEvidenceBundleFeedback(null);
    setEvidenceBundleStatusSaving(status);

    try {
      const bundle = await updateEvidenceBundleStatus(applicationId, status);
      setEvidenceBundle(bundle);
      setEvidenceBundleFeedback({
        type: "success",
        message: `Statut bundle mis à jour: ${formatEvidenceBundleStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setEvidenceBundleFeedback({
        type: "error",
        message: getEvidenceBundleMutationErrorMessage(mutationError),
      });
    } finally {
      setEvidenceBundleStatusSaving(null);
    }
  }

  async function handleCreateClaimCase() {
    if (claimCaseCreating) return;
    if (!claimCaseForm.claimType.trim()) {
      setClaimCaseFeedback({ type: "error", message: "Le type de sinistre est requis." });
      return;
    }

    setClaimCaseFeedback(null);
    setClaimCaseCreating(true);

    try {
      const claim = await createClaimCase(applicationId, {
        claimType: claimCaseForm.claimType.trim(),
        eventDate: claimCaseForm.eventDate.trim() || null,
        notes: claimCaseForm.notes.trim() || null,
      });
      if (claim) {
        setClaimCases((previous) => [claim, ...previous]);
      }
      setClaimCasesError(null);
      setClaimCaseForm({ claimType: "", eventDate: "", notes: "" });
      setClaimCaseFeedback({
        type: "success",
        message: `Dossier sinistre créé: ${claim?.claimReference ?? ""}.`,
      });
    } catch (mutationError) {
      setClaimCaseFeedback({
        type: "error",
        message: getClaimCaseMutationErrorMessage(mutationError),
      });
    } finally {
      setClaimCaseCreating(false);
    }
  }

  async function handleUpdateClaimCaseStatus(claimId: string, status: InsuranceClaimCaseStatus) {
    if (claimCaseStatusSaving) return;

    setClaimCaseFeedback(null);
    setClaimCaseStatusSaving(`${claimId}:${status}`);

    try {
      const claim = await updateClaimCaseStatus(applicationId, claimId, status);
      if (claim) {
        setClaimCases((previous) => previous.map((item) => (item.id === claimId ? claim : item)));
      }
      setClaimCaseFeedback({
        type: "success",
        message: `Statut sinistre mis à jour: ${formatClaimCaseStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setClaimCaseFeedback({
        type: "error",
        message: getClaimCaseMutationErrorMessage(mutationError),
      });
    } finally {
      setClaimCaseStatusSaving(null);
    }
  }

  async function handleGenerateMonitoringSnapshot() {
    if (monitoringSnapshotGenerating) return;

    setMonitoringSnapshotFeedback(null);
    setMonitoringSnapshotGenerating(true);

    try {
      const snapshot = await generateMonitoringSnapshot(applicationId);
      setMonitoringSnapshot(snapshot);
      setMonitoringSnapshotError(null);
      setMonitoringSnapshotFeedback({
        type: "success",
        message: `Surveillance générée (${formatMonitoringSnapshotStatusFr(snapshot?.status)}).`,
      });
    } catch (mutationError) {
      setMonitoringSnapshotFeedback({
        type: "error",
        message: getMonitoringSnapshotMutationErrorMessage(mutationError),
      });
    } finally {
      setMonitoringSnapshotGenerating(false);
    }
  }

  async function handleUpdateMonitoringSnapshotStatus(status: InsuranceMonitoringSnapshotStatus) {
    if (monitoringSnapshotStatusSaving) return;

    setMonitoringSnapshotFeedback(null);
    setMonitoringSnapshotStatusSaving(status);

    try {
      const snapshot = await updateMonitoringSnapshotStatus(applicationId, status);
      setMonitoringSnapshot(snapshot);
      setMonitoringSnapshotFeedback({
        type: "success",
        message: `Statut surveillance mis à jour: ${formatMonitoringSnapshotStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setMonitoringSnapshotFeedback({
        type: "error",
        message: getMonitoringSnapshotMutationErrorMessage(mutationError),
      });
    } finally {
      setMonitoringSnapshotStatusSaving(null);
    }
  }

  async function handleGenerateFraudForensicReview() {
    if (fraudForensicReviewGenerating) return;

    setFraudForensicReviewFeedback(null);
    setFraudForensicReviewGenerating(true);

    try {
      const review = await generateFraudForensicReview(applicationId);
      setFraudForensicReview(review);
      setFraudForensicReviewError(null);
      setFraudForensicReviewFeedback({
        type: "success",
        message: `Revue IFDO générée (${formatFraudForensicReviewStatusFr(review?.status)}).`,
      });
    } catch (mutationError) {
      setFraudForensicReviewFeedback({
        type: "error",
        message: getFraudForensicReviewMutationErrorMessage(mutationError),
      });
    } finally {
      setFraudForensicReviewGenerating(false);
    }
  }

  async function handleUpdateFraudForensicReviewStatus(status: InsuranceFraudForensicReviewStatus) {
    if (fraudForensicReviewStatusSaving) return;

    setFraudForensicReviewFeedback(null);
    setFraudForensicReviewStatusSaving(status);

    try {
      const review = await updateFraudForensicReviewStatus(applicationId, status);
      setFraudForensicReview(review);
      setFraudForensicReviewFeedback({
        type: "success",
        message: `Statut revue IFDO mis à jour: ${formatFraudForensicReviewStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setFraudForensicReviewFeedback({
        type: "error",
        message: getFraudForensicReviewMutationErrorMessage(mutationError),
      });
    } finally {
      setFraudForensicReviewStatusSaving(null);
    }
  }

  async function handleGenerateOperationsCockpit() {
    if (operationsCockpitGenerating) return;

    setOperationsCockpitFeedback(null);
    setOperationsCockpitGenerating(true);

    try {
      const snapshot = await generateOperationsCockpit(applicationId);
      setOperationsCockpit(snapshot);
      setOperationsCockpitError(null);
      setOperationsCockpitFeedback({
        type: "success",
        message: `Cockpit opérations généré (${formatOperationsCockpitStatusFr(snapshot?.status)}).`,
      });
    } catch (mutationError) {
      setOperationsCockpitFeedback({
        type: "error",
        message: getOperationsCockpitMutationErrorMessage(mutationError),
      });
    } finally {
      setOperationsCockpitGenerating(false);
    }
  }

  async function handleUpdateOperationsCockpitStatus(status: InsuranceOperationsCockpitSnapshotStatus) {
    if (operationsCockpitStatusSaving) return;

    setOperationsCockpitFeedback(null);
    setOperationsCockpitStatusSaving(status);

    try {
      const snapshot = await updateOperationsCockpitStatus(applicationId, status);
      setOperationsCockpit(snapshot);
      setOperationsCockpitFeedback({
        type: "success",
        message: `Statut cockpit opérations mis à jour: ${formatOperationsCockpitStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setOperationsCockpitFeedback({
        type: "error",
        message: getOperationsCockpitMutationErrorMessage(mutationError),
      });
    } finally {
      setOperationsCockpitStatusSaving(null);
    }
  }

  async function handleGenerateGovernanceCompliance() {
    if (governanceComplianceGenerating) return;

    setGovernanceComplianceFeedback(null);
    setGovernanceComplianceGenerating(true);

    try {
      const snapshot = await generateGovernanceCompliance(applicationId);
      setGovernanceCompliance(snapshot);
      setGovernanceComplianceError(null);
      setGovernanceComplianceFeedback({
        type: "success",
        message: `Conformité ICGO générée (${formatGovernanceComplianceStatusFr(snapshot?.status)}).`,
      });
    } catch (mutationError) {
      setGovernanceComplianceFeedback({
        type: "error",
        message: getGovernanceComplianceMutationErrorMessage(mutationError),
      });
    } finally {
      setGovernanceComplianceGenerating(false);
    }
  }

  async function handleUpdateGovernanceComplianceStatus(status: InsuranceGovernanceComplianceSnapshotStatus) {
    if (governanceComplianceStatusSaving) return;

    setGovernanceComplianceFeedback(null);
    setGovernanceComplianceStatusSaving(status);

    try {
      const snapshot = await updateGovernanceComplianceStatus(applicationId, status);
      setGovernanceCompliance(snapshot);
      setGovernanceComplianceFeedback({
        type: "success",
        message: `Statut conformité ICGO mis à jour: ${formatGovernanceComplianceStatusFr(status)}.`,
      });
    } catch (mutationError) {
      setGovernanceComplianceFeedback({
        type: "error",
        message: getGovernanceComplianceMutationErrorMessage(mutationError),
      });
    } finally {
      setGovernanceComplianceStatusSaving(null);
    }
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
  const canRecordInstitutionDecision =
    iraxDecisionAssessment?.status === "ACCEPTED_FOR_INSTITUTION_REVIEW" && !institutionDecision;
  const institutionDecisionPrerequisiteBlocked =
    iraxDecisionAssessment?.status !== "ACCEPTED_FOR_INSTITUTION_REVIEW";
  const canOperateInstitutionFlow = true;
  const pricingOfferPrerequisiteBlocked =
    institutionDecision?.status !== "READY_FOR_PRICING" || institutionDecision?.decisionType !== "PROCEED_TO_PRICING";
  const policyContractPrerequisiteBlocked =
    pricingOffer?.status !== "OFFER_APPROVED_FOR_CONTRACT";
  const claimCasePrerequisiteBlocked = !policyContract;

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

      {/* ── IRAX-P — Planification & orchestration du risque ── */}
      <DcaSectionCard accent="amber">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IRAX-P — Pré-orchestration"
            title="Planification & orchestration du risque"
            subtitle={`Pays : ${getCountryLabel(iraxPlanning?.country ?? dcaCountry)} — moteur ${
              iraxPlanning?.algorithmVersion ?? "IRAX_P_V1_2026"
            }`}
            accent="amber"
          />
          <div className="flex flex-wrap items-center gap-2">
            {iraxPlanning ? (
              <>
                <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-100">
                  Version {iraxPlanning.version}
                </span>
                <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] text-cyan-200">
                  {iraxPlanning.status}
                </span>
              </>
            ) : (
              <span className="rounded-full border border-slate-400/20 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-slate-500">
                Aucun plan généré
              </span>
            )}
          </div>
        </div>

        <p className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
          IRAX-P prépare le plan d&apos;investigation. L&apos;institution reste seule décisionnaire.
        </p>

        {iraxPlanningLoading ? <p className="text-xs text-slate-400">Chargement du plan IRAX-P...</p> : null}
        {iraxPlanningError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {iraxPlanningError}
          </p>
        ) : null}

        {iraxPlanning ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <DcaInfoTile label="Segment de revue" value={iraxPlanning.riskSegmentation.segment} />
              <DcaInfoTile label="Confiance" value={iraxPlanning.riskSegmentation.confidence} />
              <DcaInfoTile label="Prochaine étape recommandée" value={iraxPlanning.nextRecommendedStep} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <DcaInfoTile
                label="Complétude profil agriculteur"
                value={iraxPlanning.dataQuality.farmerProfileCompleteness}
              />
              <DcaInfoTile label="Complétude parcelle" value={iraxPlanning.dataQuality.parcelCompleteness} />
              <DcaInfoTile label="Statut NDVI" value={iraxPlanning.dataQuality.ndviStatus} />
              <DcaInfoTile label="Documents" value={iraxPlanning.dataQuality.documentsStatus} />
              <DcaInfoTile label="Historique sinistres" value={iraxPlanning.dataQuality.claimsHistoryStatus} />
              <DcaInfoTile label="Cohérence géo/pays" value={iraxPlanning.dataQuality.geoCountryCoherence} />
            </div>

            <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Cohérences vérifiées</p>
              <p>
                Pays agriculteur ↔ dossier :{" "}
                <IraxCoherenceValue value={iraxPlanning.coherenceChecks.farmerCountryMatchesApplication} />
              </p>
              <p>
                Pays parcelle ↔ dossier :{" "}
                <IraxCoherenceValue value={iraxPlanning.coherenceChecks.parcelleCountryMatchesApplication} />
              </p>
              <p>
                GPS dans les bornes du pays :{" "}
                <IraxCoherenceValue value={iraxPlanning.coherenceChecks.gpsWithinPlausibleCountryBounds} />
              </p>
            </div>

            {iraxPlanning.riskSegmentation.reasons.length > 0 ? (
              <div className="rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Raisons du segment</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxPlanning.riskSegmentation.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Plan terrain IRAX1{" "}
                  {iraxPlanning.fieldInvestigationPlan.requiresFieldMission
                    ? `(priorité ${iraxPlanning.fieldInvestigationPlan.missionPriority})`
                    : "(non requis)"}
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxPlanning.fieldInvestigationPlan.objectives.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Plan back-office IRAX2</p>
                <div className="flex flex-wrap gap-2">
                  <SideEffectPill label="NDVI requis" active={iraxPlanning.backOfficeInvestigationPlan.ndviNeeded} />
                  <SideEffectPill
                    label="Météo requise"
                    active={iraxPlanning.backOfficeInvestigationPlan.weatherNeeded}
                  />
                  <SideEffectPill label="Hydro requis" active={iraxPlanning.backOfficeInvestigationPlan.hydroNeeded} />
                  <SideEffectPill
                    label="Agronomie requise"
                    active={iraxPlanning.backOfficeInvestigationPlan.agronomyNeeded}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Checklist documents — {iraxPlanning.documentChecklist.status}
              </p>
              <p>Attendus : {iraxPlanning.documentChecklist.expected.join(", ") || "—"}</p>
              <p>Préparés : {iraxPlanning.documentChecklist.prepared.join(", ") || "—"}</p>
              <p>Manquants : {iraxPlanning.documentChecklist.missing.join(", ") || "Aucun"}</p>
            </div>

            {iraxPlanning.blockers.length > 0 ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <p className="text-[10px] uppercase tracking-wide text-rose-300">Blocages</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxPlanning.blockers.map((blocker, index) => (
                    <li key={index}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {iraxPlanning.warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <p className="text-[10px] uppercase tracking-wide text-amber-300">Avertissements</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxPlanning.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Effets secondaires IRAX-P</p>
              <div className="flex flex-wrap gap-2">
                <SideEffectPill label="Mission" active={iraxPlanning.sideEffects.missionCreated} />
                <SideEffectPill label="Audit terrain" active={iraxPlanning.sideEffects.fieldAuditCreated} />
                <SideEffectPill label="RAX" active={iraxPlanning.sideEffects.raxCalculated} />
                <SideEffectPill label="Tarification" active={iraxPlanning.sideEffects.pricingCalculated} />
                <SideEffectPill label={policyLabelCapitalized} active={iraxPlanning.sideEffects.policyCreated} />
                <SideEffectPill label={claimLabelCapitalized} active={iraxPlanning.sideEffects.claimCreated} />
                <SideEffectPill label="Blockchain" active={iraxPlanning.sideEffects.blockchainAnchored} />
              </div>
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateIraxPlanning()}
            disabled={iraxPlanningGenerating || iraxPlanningLoading}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {iraxPlanningGenerating
              ? "Génération..."
              : iraxPlanning
                ? "Régénérer le plan IRAX-P"
                : "Générer le plan IRAX-P"}
          </button>

          {iraxPlanning ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateIraxPlanningStatus("REVIEWED")}
                disabled={iraxPlanningStatusSaving !== null}
                className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxPlanningStatusSaving === "REVIEWED" ? "..." : "Marquer revu"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxPlanningStatus("APPROVED_FOR_FIELD_PLANNING")}
                disabled={iraxPlanningStatusSaving !== null}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxPlanningStatusSaving === "APPROVED_FOR_FIELD_PLANNING"
                  ? "..."
                  : "Approuver pour planification terrain"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxPlanningStatus("NEEDS_MORE_INFO")}
                disabled={iraxPlanningStatusSaving !== null}
                className="rounded-full border border-orange-400/35 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxPlanningStatusSaving === "NEEDS_MORE_INFO" ? "..." : "Demander des informations"}
              </button>
            </>
          ) : null}
        </div>

        {iraxPlanningFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              iraxPlanningFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : iraxPlanningFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {iraxPlanningFeedback.message}
          </p>
        ) : null}

        <p className="text-[11px] text-slate-500">
          IRAX-P prépare le plan d&apos;investigation. L&apos;institution reste seule décisionnaire.
        </p>
      </DcaSectionCard>

      {/* ── IRAX1 — Investigation terrain ── */}
      <DcaSectionCard accent="cyan">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IRAX1 — Front Office Investigation"
            title="IRAX1 — Investigation terrain"
            subtitle={`FRAP — Field Risk Assessment Package — moteur ${irax1FieldAssessment?.algorithmVersion ?? "IRAX1_FRAP_V1_2026"}`}
            accent="cyan"
          />
          <div className="flex flex-wrap items-center gap-2">
            {irax1FieldAssessment ? (
              <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] text-cyan-200">
                {formatIrax1StatusFr(irax1FieldAssessment.status)}
              </span>
            ) : (
              <span className="rounded-full border border-slate-400/20 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-slate-500">
                Aucune mission IRAX1
              </span>
            )}
          </div>
        </div>

        <p className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
          IRAX1 produit la vérité terrain. L&apos;institution reste seule décisionnaire.
        </p>

        {irax1Loading ? <p className="text-xs text-slate-400">Chargement du FRAP IRAX1...</p> : null}
        {irax1Error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {irax1Error}
          </p>
        ) : null}

        {irax1FieldAssessment ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <DcaInfoTile label="Agent assigné" value={irax1FieldAssessment.agentUserId ?? "Non assigné"} mono />
              <DcaInfoTile label="Plan IRAX-P source" value={irax1FieldAssessment.iraxPlanningId ?? "—"} mono />
              <DcaInfoTile label="Source" value={irax1FieldAssessment.sourceLabel} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Objectifs terrain</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {(
                    (irax1FieldAssessment.fieldMissionPlanSnapshot?.objectives as string[] | undefined) ?? []
                  ).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Preuves attendues</p>
                <p>
                  Photos :{" "}
                  {(
                    (irax1FieldAssessment.fieldMissionPlanSnapshot?.photoRequirements as string[] | undefined) ?? []
                  ).join(", ") || "—"}
                </p>
                <p>
                  Documents :{" "}
                  {(
                    (irax1FieldAssessment.fieldMissionPlanSnapshot?.documentChecks as string[] | undefined) ?? []
                  ).join(", ") || "—"}
                </p>
                <p>
                  GPS :{" "}
                  {(
                    (irax1FieldAssessment.fieldMissionPlanSnapshot?.gpsChecks as string[] | undefined) ?? []
                  ).join(", ") || "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Irax1JsonSection title="Vérification géospatiale" value={irax1FieldAssessment.geospatialVerification} />
              <Irax1JsonSection title="Vérification parcelle" value={irax1FieldAssessment.parcelVerification} />
              <Irax1JsonSection
                title="Activité agricole observée"
                value={irax1FieldAssessment.agriculturalActivityVerification}
              />
              <Irax1JsonSection title="Vérification actifs/documents" value={irax1FieldAssessment.assetVerification} />
              <Irax1JsonSection title="Collecte de preuves" value={irax1FieldAssessment.evidenceCollection} />
              <Irax1JsonSection title="Détection d'anomalies" value={irax1FieldAssessment.anomalyDetection} />
              <Irax1JsonSection
                title="Intelligence risque terrain"
                value={irax1FieldAssessment.fieldRiskIntelligence}
              />
              <Irax1JsonSection title="Transfert de preuves (IBDO)" value={irax1FieldAssessment.evidenceTransfer} />
              <Irax1JsonSection title="Rapport terrain" value={irax1FieldAssessment.fieldReport} />
            </div>

            {irax1FieldAssessment.blockers.length > 0 ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <p className="text-[10px] uppercase tracking-wide text-rose-300">Blocages</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {irax1FieldAssessment.blockers.map((blocker, index) => (
                    <li key={index}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {irax1FieldAssessment.warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <p className="text-[10px] uppercase tracking-wide text-amber-300">Avertissements</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {irax1FieldAssessment.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-3">
              <DcaInfoTile label="Soumis le" value={formatDate(irax1FieldAssessment.submittedAt)} />
              <DcaInfoTile label="Revu le" value={formatDate(irax1FieldAssessment.reviewedAt)} />
              <DcaInfoTile label="Accepté le" value={formatDate(irax1FieldAssessment.acceptedAt)} />
            </div>
          </>
        ) : null}

        <div className="space-y-3">
          <label className="space-y-1 text-sm text-slate-300 block">
            <span>Agent de terrain (optionnel — sinon mission prête sans envoi)</span>
            <select
              value={irax1SelectedAgentUserId}
              onChange={(e) => setIrax1SelectedAgentUserId(e.target.value)}
              disabled={irax1Creating || fieldAgentsLoading}
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleCreateIrax1Mission()}
            disabled={irax1Creating || irax1Loading}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {irax1Creating
              ? "Traitement..."
              : irax1FieldAssessment
                ? "Créer / Envoyer mission IRAX1"
                : "Créer mission IRAX1"}
          </button>

          {irax1FieldAssessment ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateIrax1FrapStatus("IRAX1_ACCEPTED_FOR_REVIEW")}
                disabled={irax1StatusSaving !== null}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {irax1StatusSaving === "IRAX1_ACCEPTED_FOR_REVIEW" ? "..." : "Marquer FRAP en revue"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIrax1FrapStatus("UNDER_BACK_OFFICE_REVIEW")}
                disabled={irax1StatusSaving !== null}
                className="rounded-full border border-violet-400/35 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-100 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {irax1StatusSaving === "UNDER_BACK_OFFICE_REVIEW" ? "..." : "Démarrer revue back-office"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIrax1FrapStatus("NEEDS_FIELD_CORRECTION")}
                disabled={irax1StatusSaving !== null}
                className="rounded-full border border-orange-400/35 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {irax1StatusSaving === "NEEDS_FIELD_CORRECTION" ? "..." : "Demander correction terrain"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIrax1FrapStatus("ACCEPTED_FOR_IRAX3")}
                disabled={irax1StatusSaving !== null}
                className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {irax1StatusSaving === "ACCEPTED_FOR_IRAX3" ? "..." : "Accepter pour IRAX3"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIrax1FrapStatus("REJECTED_INVALID_EVIDENCE")}
                disabled={irax1StatusSaving !== null}
                className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {irax1StatusSaving === "REJECTED_INVALID_EVIDENCE" ? "..." : "Rejeter (preuves invalides)"}
              </button>
            </>
          ) : null}
        </div>

        {irax1Feedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              irax1Feedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : irax1Feedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {irax1Feedback.message}
          </p>
        ) : null}

        <p className="text-[11px] text-slate-500">
          IRAX1 produit la vérité terrain. L&apos;institution reste seule décisionnaire.
        </p>
      </DcaSectionCard>

      {/* ── IRAX2 — Intelligence scientifique back-office ── */}
      <DcaSectionCard accent="violet">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IRAX2 — Scientific Back Office"
            title="IRAX2 — Intelligence scientifique back-office"
            subtitle={`SRAP — Scientific Risk Assessment Package — protocole ${iraxScientificAssessment?.protocolVersion ?? "IRAX2_SRAP_V1_2026"}`}
            accent="violet"
          />
          <div className="flex flex-wrap items-center gap-2">
            {iraxScientificAssessment ? (
              <span className="rounded-full border border-violet-400/35 bg-violet-500/10 px-2.5 py-0.5 text-[11px] text-violet-200">
                {formatIrax2StatusFr(iraxScientificAssessment.status)}
              </span>
            ) : (
              <span className="rounded-full border border-slate-400/20 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-slate-500">
                Aucun SRAP
              </span>
            )}
          </div>
        </div>

        <p className="rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
          IRAX2 produit le SRAP scientifique. Il ne décide pas. L&apos;institution reste seule décisionnaire.
        </p>

        {iraxScientificLoading ? <p className="text-xs text-slate-400">Chargement du SRAP IRAX2...</p> : null}
        {iraxScientificError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {iraxScientificError}
          </p>
        ) : null}

        {iraxScientificAssessment ? (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <DcaInfoTile label="Pays" value={iraxScientificAssessment.country} />
              <DcaInfoTile label="Source" value={iraxScientificAssessment.sourceLabel} />
              <DcaInfoTile label="Version" value={String(iraxScientificAssessment.version)} />
              <DcaInfoTile
                label="Prochaine étape recommandée"
                value={formatIrax2NextStepFr(iraxScientificAssessment.nextRecommendedStep)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Irax2JsonSection title="1. Agrégation des données" value={iraxScientificAssessment.dataAggregation} />
              <Irax2JsonSection
                title="2. Intelligence géospatiale"
                value={iraxScientificAssessment.geospatialIntelligence}
              />
              <Irax2JsonSection title="3. Intelligence climatique" value={iraxScientificAssessment.climateIntelligence} />
              <Irax2JsonSection
                title="4. Intelligence hydrologique"
                value={iraxScientificAssessment.hydrologyIntelligence}
              />
              <Irax2JsonSection
                title="5. Intelligence agronomique"
                value={iraxScientificAssessment.agronomicIntelligence}
              />
              <Irax2JsonSection
                title="6. Intelligence économique"
                value={iraxScientificAssessment.economicIntelligence}
              />
              <Irax2JsonSection
                title="7. Intelligence supply chain"
                value={iraxScientificAssessment.supplyChainIntelligence}
              />
              <Irax2JsonSection title="8. Corrélation des risques" value={iraxScientificAssessment.riskCorrelation} />
              <Irax2JsonSection title="9. Analyse prédictive" value={iraxScientificAssessment.predictiveAnalytics} />
              <Irax2JsonSection title="10. Rapport scientifique" value={iraxScientificAssessment.scientificReport} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Signaux requis</p>
                <p>{iraxScientificAssessment.requiredSignals.join(", ") || "Aucun"}</p>
              </div>
              <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Signaux indisponibles</p>
                <p>{iraxScientificAssessment.unavailableSignals.join(", ") || "Aucun"}</p>
              </div>
              <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Signaux dégradés</p>
                <p>{iraxScientificAssessment.degradedSignals.join(", ") || "Aucun"}</p>
              </div>
            </div>

            {iraxScientificAssessment.blockers.length > 0 ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <p className="text-[10px] uppercase tracking-wide text-rose-300">Blocages</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxScientificAssessment.blockers.map((blocker, index) => (
                    <li key={index}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {iraxScientificAssessment.warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <p className="text-[10px] uppercase tracking-wide text-amber-300">Avertissements</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxScientificAssessment.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <DcaInfoTile label="Généré le" value={formatDate(iraxScientificAssessment.generatedAt)} />
              <DcaInfoTile label="Revu le" value={formatDate(iraxScientificAssessment.reviewedAt)} />
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateIraxScientificAssessment()}
            disabled={iraxScientificGenerating || iraxScientificLoading}
            className="rounded-full border border-violet-400/35 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-100 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {iraxScientificGenerating ? "Traitement..." : "Générer / Actualiser SRAP"}
          </button>

          {iraxScientificAssessment ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateIraxScientificAssessmentStatus("UNDER_BACK_OFFICE_REVIEW")}
                disabled={iraxScientificStatusSaving !== null}
                className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxScientificStatusSaving === "UNDER_BACK_OFFICE_REVIEW" ? "..." : "Démarrer revue scientifique"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxScientificAssessmentStatus("NEEDS_MORE_SCIENTIFIC_DATA")}
                disabled={iraxScientificStatusSaving !== null}
                className="rounded-full border border-orange-400/35 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxScientificStatusSaving === "NEEDS_MORE_SCIENTIFIC_DATA" ? "..." : "Demander données complémentaires"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxScientificAssessmentStatus("ACCEPTED_FOR_IRAX3")}
                disabled={iraxScientificStatusSaving !== null}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxScientificStatusSaving === "ACCEPTED_FOR_IRAX3" ? "..." : "Accepter pour IRAX3"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxScientificAssessmentStatus("REJECTED_INSUFFICIENT_DATA")}
                disabled={iraxScientificStatusSaving !== null}
                className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxScientificStatusSaving === "REJECTED_INSUFFICIENT_DATA" ? "..." : "Rejeter données insuffisantes"}
              </button>
            </>
          ) : null}
        </div>

        {iraxScientificFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              iraxScientificFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : iraxScientificFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {iraxScientificFeedback.message}
          </p>
        ) : null}

        <p className="text-[11px] text-slate-500">
          IRAX2 produit le SRAP scientifique. Il ne décide pas. L&apos;institution reste seule décisionnaire.
        </p>
      </DcaSectionCard>

      {/* ── IRAX3 — Consolidation des risques ── */}
      <DcaSectionCard accent="emerald">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IRAX3 — Consolidation des risques"
            title="IRAX3 — Consolidation des risques"
            subtitle={`CRIP — Consolidated Risk Intelligence Package — protocole ${iraxConsolidatedAssessment?.protocolVersion ?? "IRAX3_CRIP_V1_2026"}`}
            accent="emerald"
          />
          <div className="flex flex-wrap items-center gap-2">
            {iraxConsolidatedAssessment ? (
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-200">
                {formatIrax3StatusFr(iraxConsolidatedAssessment.status)}
              </span>
            ) : (
              <span className="rounded-full border border-slate-400/20 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-slate-500">
                Aucun CRIP
              </span>
            )}
          </div>
        </div>

        <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          IRAX3 consolide les vérités déclarative, terrain et scientifique. Il prépare IRAX-D sans décider.
        </p>

        {iraxConsolidatedLoading ? <p className="text-xs text-slate-400">Chargement du CRIP IRAX3...</p> : null}
        {iraxConsolidatedError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {iraxConsolidatedError}
          </p>
        ) : null}

        {iraxConsolidatedAssessment ? (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <DcaInfoTile label="Pays" value={iraxConsolidatedAssessment.country} />
              <DcaInfoTile label="Source" value={iraxConsolidatedAssessment.sourceLabel} />
              <DcaInfoTile label="Version" value={String(iraxConsolidatedAssessment.version)} />
              <DcaInfoTile
                label="Prochaine étape recommandée"
                value={formatIrax3NextStepFr(iraxConsolidatedAssessment.nextRecommendedStep)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Irax3JsonSection title="1. Préparation des entrées" value={iraxConsolidatedAssessment.inputReadiness} />
              <Irax3JsonSection
                title="2. Cohérence inter-moteurs"
                value={iraxConsolidatedAssessment.crossEngineConsistency}
              />
              <Irax3ContradictionMatrix contradictions={iraxConsolidatedAssessment.contradictionMatrix} />
              <Irax3JsonSection
                title="4. Signaux de risque consolidés"
                value={iraxConsolidatedAssessment.consolidatedRiskSignals}
              />
              <Irax3JsonSection title="5. Synthèse des preuves" value={iraxConsolidatedAssessment.evidenceSynthesis} />
              <Irax3JsonSection
                title="6. Analyse des données manquantes"
                value={iraxConsolidatedAssessment.missingDataAnalysis}
              />
              <Irax3JsonSection title="7. Synthèse des blocages" value={iraxConsolidatedAssessment.blockerSynthesis} />
              <Irax3JsonSection title="8. Synthèse des alertes" value={iraxConsolidatedAssessment.warningSynthesis} />
              <Irax3JsonSection title="9. Préparation IRAX-D" value={iraxConsolidatedAssessment.iraxDPreparation} />
              <Irax3JsonSection title="10. Rapport consolidé" value={iraxConsolidatedAssessment.consolidatedReport} />
            </div>

            <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Actions suivantes requises</p>
              <p>{iraxConsolidatedAssessment.requiredNextActions.join(" • ") || "Aucune"}</p>
            </div>

            {iraxConsolidatedAssessment.blockers.length > 0 ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <p className="text-[10px] uppercase tracking-wide text-rose-300">Blocages</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxConsolidatedAssessment.blockers.map((blocker, index) => (
                    <li key={index}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {iraxConsolidatedAssessment.warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <p className="text-[10px] uppercase tracking-wide text-amber-300">Avertissements</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxConsolidatedAssessment.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <DcaInfoTile label="Généré le" value={formatDate(iraxConsolidatedAssessment.generatedAt)} />
              <DcaInfoTile label="Revu le" value={formatDate(iraxConsolidatedAssessment.reviewedAt)} />
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateIraxConsolidatedAssessment()}
            disabled={iraxConsolidatedGenerating || iraxConsolidatedLoading}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {iraxConsolidatedGenerating ? "Traitement..." : "Générer / Actualiser CRIP"}
          </button>

          {iraxConsolidatedAssessment ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateIraxConsolidatedAssessmentStatus("UNDER_CONSOLIDATION_REVIEW")}
                disabled={iraxConsolidatedStatusSaving !== null}
                className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxConsolidatedStatusSaving === "UNDER_CONSOLIDATION_REVIEW" ? "..." : "Démarrer revue de consolidation"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxConsolidatedAssessmentStatus("NEEDS_MORE_FIELD_DATA")}
                disabled={iraxConsolidatedStatusSaving !== null}
                className="rounded-full border border-orange-400/35 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxConsolidatedStatusSaving === "NEEDS_MORE_FIELD_DATA" ? "..." : "Demander correction terrain"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxConsolidatedAssessmentStatus("NEEDS_MORE_SCIENTIFIC_DATA")}
                disabled={iraxConsolidatedStatusSaving !== null}
                className="rounded-full border border-orange-400/35 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxConsolidatedStatusSaving === "NEEDS_MORE_SCIENTIFIC_DATA" ? "..." : "Demander complément scientifique"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxConsolidatedAssessmentStatus("ACCEPTED_FOR_IRAX_D")}
                disabled={iraxConsolidatedStatusSaving !== null}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxConsolidatedStatusSaving === "ACCEPTED_FOR_IRAX_D" ? "..." : "Accepter pour IRAX-D"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxConsolidatedAssessmentStatus("REJECTED_INSUFFICIENT_EVIDENCE")}
                disabled={iraxConsolidatedStatusSaving !== null}
                className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxConsolidatedStatusSaving === "REJECTED_INSUFFICIENT_EVIDENCE" ? "..." : "Rejeter preuves insuffisantes"}
              </button>
            </>
          ) : null}
        </div>

        {iraxConsolidatedFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              iraxConsolidatedFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : iraxConsolidatedFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {iraxConsolidatedFeedback.message}
          </p>
        ) : null}

        <p className="text-[11px] text-slate-500">
          IRAX3 consolide les vérités déclarative, terrain et scientifique. Il prépare IRAX-D sans décider.
          L&apos;institution reste seule décisionnaire.
        </p>
      </DcaSectionCard>

      {/* ── IRAX-D — Calcul déterministe du risque ── */}
      <DcaSectionCard accent="emerald">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IRAX-D — Calcul déterministe du risque"
            title="IRAX-D — Calcul déterministe du risque"
            subtitle={`CRDP — Calculated Risk Deterministic Package — algorithme ${iraxDecisionAssessment?.algorithmVersion ?? "IRAX_D_RAX_V1_2026"}`}
            accent="emerald"
          />
          <div className="flex flex-wrap items-center gap-2">
            {iraxDecisionAssessment ? (
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-200">
                {formatIraxDStatusFr(iraxDecisionAssessment.status)}
              </span>
            ) : (
              <span className="rounded-full border border-slate-400/20 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-slate-500">
                Aucun CRDP
              </span>
            )}
          </div>
        </div>

        <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          IRAX-D calcule un niveau de risque déterministe à partir du CRIP. Il ne décide pas. L&apos;institution
          reste seule décisionnaire.
        </p>

        {iraxDecisionLoading ? <p className="text-xs text-slate-400">Chargement du CRDP IRAX-D...</p> : null}
        {iraxDecisionError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {iraxDecisionError}
          </p>
        ) : null}

        {iraxDecisionAssessment ? (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <DcaInfoTile label="Pays" value={iraxDecisionAssessment.country} />
              <DcaInfoTile label="Source" value={iraxDecisionAssessment.sourceLabel} />
              <DcaInfoTile label="Version" value={String(iraxDecisionAssessment.version)} />
              <DcaInfoTile
                label="Prochaine étape recommandée"
                value={formatIraxDNextStepFr(iraxDecisionAssessment.nextRecommendedStep)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Irax3JsonSection title="1. Préparation des entrées" value={iraxDecisionAssessment.inputReadiness} />
              <Irax3JsonSection
                title="2. Entrées déterministes"
                value={iraxDecisionAssessment.deterministicInputs}
              />
              <Irax3JsonSection title="3. Sévérité (gravité)" value={iraxDecisionAssessment.severityAssessment} />
              <Irax3JsonSection title="4. Fréquence" value={iraxDecisionAssessment.frequencyAssessment} />
              <Irax3JsonSection title="5. Détectabilité" value={iraxDecisionAssessment.detectabilityAssessment} />
              <Irax3JsonSection title="6. Calcul RAX (R = G x F x D)" value={iraxDecisionAssessment.raxCalculation} />
              <Irax3JsonSection title="7. Calcul WRS" value={iraxDecisionAssessment.wrsCalculation} />
              <Irax3JsonSection title="8. Niveau de risque (tier)" value={iraxDecisionAssessment.riskTier} />
              <Irax3JsonSection title="10. Limitations" value={iraxDecisionAssessment.limitations} />
            </div>

            <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">9. Trace de calcul</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                {iraxDecisionAssessment.calculationTrace.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {iraxDecisionAssessment.blockers.length > 0 ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <p className="text-[10px] uppercase tracking-wide text-rose-300">Blocages</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxDecisionAssessment.blockers.map((blocker, index) => (
                    <li key={index}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {iraxDecisionAssessment.warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <p className="text-[10px] uppercase tracking-wide text-amber-300">Avertissements</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {iraxDecisionAssessment.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <DcaInfoTile label="Calculé le" value={formatDate(iraxDecisionAssessment.generatedAt)} />
              <DcaInfoTile label="Revu le" value={formatDate(iraxDecisionAssessment.reviewedAt)} />
            </div>
          </>
        ) : (
          <p className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-2 text-xs text-slate-400">
            IRAX-D nécessite un CRIP IRAX3 accepté pour IRAX-D.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleCalculateIraxDecisionAssessment()}
            disabled={iraxDecisionCalculating || iraxDecisionLoading}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {iraxDecisionCalculating ? "Traitement..." : "Calculer / Actualiser IRAX-D"}
          </button>

          {iraxDecisionAssessment ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateIraxDecisionAssessmentStatus("UNDER_RISK_REVIEW")}
                disabled={iraxDecisionStatusSaving !== null}
                className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxDecisionStatusSaving === "UNDER_RISK_REVIEW" ? "..." : "Démarrer revue risque"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxDecisionAssessmentStatus("NEEDS_MORE_DATA")}
                disabled={iraxDecisionStatusSaving !== null}
                className="rounded-full border border-orange-400/35 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxDecisionStatusSaving === "NEEDS_MORE_DATA" ? "..." : "Demander données complémentaires"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxDecisionAssessmentStatus("ACCEPTED_FOR_INSTITUTION_REVIEW")}
                disabled={iraxDecisionStatusSaving !== null}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxDecisionStatusSaving === "ACCEPTED_FOR_INSTITUTION_REVIEW"
                  ? "..."
                  : "Accepter pour revue institutionnelle"}
              </button>
              <button
                type="button"
                onClick={() => void handleUpdateIraxDecisionAssessmentStatus("BLOCKED_INSUFFICIENT_DATA")}
                disabled={iraxDecisionStatusSaving !== null}
                className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
              >
                {iraxDecisionStatusSaving === "BLOCKED_INSUFFICIENT_DATA" ? "..." : "Bloquer données insuffisantes"}
              </button>
            </>
          ) : null}
        </div>

        {iraxDecisionFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              iraxDecisionFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : iraxDecisionFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {iraxDecisionFeedback.message}
          </p>
        ) : null}

        <p className="text-[11px] text-slate-500">
          IRAX-D calcule un niveau de risque déterministe à partir du CRIP. Il ne décide pas. L&apos;institution
          reste seule décisionnaire.
        </p>
      </DcaSectionCard>

      <DcaSectionCard accent="amber">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="Institution Review"
            title="Décision institutionnelle — Revue humaine"
            subtitle="Cette décision est enregistrée par l'institution. Wakama fournit le calcul et la traçabilité, mais ne décide pas."
            accent="amber"
          />
          <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-100">
            {formatInstitutionDecisionStatusFr(institutionDecision?.status)}
          </span>
        </div>

        {institutionDecisionLoading ? (
          <p className="text-xs text-slate-400">Chargement de la décision institutionnelle...</p>
        ) : null}

        {institutionDecisionError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {institutionDecisionError}
          </p>
        ) : null}

        {institutionDecision ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <DcaInfoTile label="Statut décision" value={formatInstitutionDecisionStatusFr(institutionDecision.status)} />
              <DcaInfoTile label="Type de décision" value={formatInstitutionDecisionTypeFr(institutionDecision.decisionType)} />
              <DcaInfoTile label="Decision label" value={institutionDecision.decisionLabel || "—"} />
              <DcaInfoTile label="Authority level" value={institutionDecision.authorityLevel || "—"} />
              <DcaInfoTile label="Décidé par" value={institutionDecision.decidedByUserId || "—"} mono />
              <DcaInfoTile label="Décidé le" value={formatDate(institutionDecision.decidedAt)} />
              <DcaInfoTile label="Revu par" value={institutionDecision.reviewedByUserId || "—"} mono />
              <DcaInfoTile label="Revu le" value={formatDate(institutionDecision.reviewedAt)} />
            </div>

            <InstitutionDecisionValueBlock title="Rationale / justification" value={institutionDecision.decisionRationale} />
            <div className="grid gap-3 md:grid-cols-2">
              <InstitutionDecisionValueBlock title="Conditions" value={institutionDecision.conditions} />
              <InstitutionDecisionValueBlock title="Required actions" value={institutionDecision.requiredActions} />
              <InstitutionDecisionValueBlock title="Pricing readiness" value={institutionDecision.pricingReadiness} />
              <InstitutionDecisionValueBlock title="Offer preparation" value={institutionDecision.offerPreparation} />
              <InstitutionDecisionValueBlock title="Committee review" value={institutionDecision.committeeReview} />
              <InstitutionDecisionValueBlock title="Side effects" value={institutionDecision.sideEffects} />
            </div>

            {institutionDecision.blockers.length > 0 ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <p className="text-[10px] uppercase tracking-wide text-rose-300">Blocages</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {institutionDecision.blockers.map((blocker, index) => (
                    <li key={index}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {institutionDecision.warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <p className="text-[10px] uppercase tracking-wide text-amber-300">Avertissements</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {institutionDecision.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucune décision institutionnelle enregistrée. Un CRDP accepté est requis pour enregistrer une décision.
          </div>
        )}

        <div className="space-y-3 rounded-xl border border-slate-400/10 bg-slate-900/35 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Sélection décision</span>
              <select
                value={institutionDecisionType}
                onChange={(event) => setInstitutionDecisionType(event.target.value as InsuranceInstitutionDecisionType)}
                disabled={institutionDecisionSaving || !canRecordInstitutionDecision}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="PROCEED_TO_PRICING">Poursuivre vers pricing</option>
                <option value="REQUEST_MORE_INFORMATION">Demander informations complémentaires</option>
                <option value="DECLINE_TO_PROCEED">Ne pas poursuivre</option>
                <option value="DEFER_FOR_COMMITTEE">Reporter au comité</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Authority level</span>
              <input
                type="text"
                value={institutionDecisionAuthorityLevel}
                onChange={(event) => setInstitutionDecisionAuthorityLevel(event.target.value)}
                disabled={institutionDecisionSaving || !canRecordInstitutionDecision}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="UNDERWRITING_MANAGER"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm text-slate-300">
            <span>Rationale / justification</span>
            <textarea
              value={institutionDecisionRationale}
              onChange={(event) => setInstitutionDecisionRationale(event.target.value)}
              disabled={institutionDecisionSaving || !canRecordInstitutionDecision}
              className="min-h-24 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              <span>Conditions</span>
              <textarea
                value={institutionDecisionConditions}
                onChange={(event) => setInstitutionDecisionConditions(event.target.value)}
                disabled={institutionDecisionSaving || !canRecordInstitutionDecision}
                className="min-h-24 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Une ligne par condition"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-300">
              <span>Required actions</span>
              <textarea
                value={institutionDecisionRequiredActions}
                onChange={(event) => setInstitutionDecisionRequiredActions(event.target.value)}
                disabled={institutionDecisionSaving || !canRecordInstitutionDecision}
                className="min-h-24 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Une ligne par action"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm text-slate-300">
            <span>Committee note</span>
            <textarea
              value={institutionDecisionCommitteeNote}
              onChange={(event) => setInstitutionDecisionCommitteeNote(event.target.value)}
              disabled={institutionDecisionSaving || !canRecordInstitutionDecision}
              className="min-h-20 w-full rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>
        </div>

        {institutionDecisionPrerequisiteBlocked ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            Aucune décision institutionnelle ne peut être enregistrée tant que le CRDP IRAX-D n&apos;est pas accepté pour revue institutionnelle.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleRecordInstitutionDecision()}
            disabled={institutionDecisionSaving || !canRecordInstitutionDecision}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {institutionDecisionSaving ? "Enregistrement..." : "Enregistrer décision institutionnelle"}
          </button>

          <button
            type="button"
            onClick={() => void handleUpdateInstitutionDecisionStatus("READY_FOR_PRICING")}
            disabled={!institutionDecision || institutionDecisionStatusSaving !== null}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {institutionDecisionStatusSaving === "READY_FOR_PRICING" ? "..." : "Marquer prêt pour pricing"}
          </button>

          <button
            type="button"
            onClick={() => void handleUpdateInstitutionDecisionStatus("NEEDS_MORE_INFORMATION")}
            disabled={!institutionDecision || institutionDecisionStatusSaving !== null}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {institutionDecisionStatusSaving === "NEEDS_MORE_INFORMATION" ? "..." : "Demander informations complémentaires"}
          </button>

          <button
            type="button"
            onClick={() => void handleUpdateInstitutionDecisionStatus("CLOSED_NO_OFFER")}
            disabled={!institutionDecision || institutionDecisionStatusSaving !== null}
            className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {institutionDecisionStatusSaving === "CLOSED_NO_OFFER" ? "..." : "Clôturer sans offre"}
          </button>
        </div>

        {institutionDecisionFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              institutionDecisionFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : institutionDecisionFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {institutionDecisionFeedback.message}
          </p>
        ) : null}

        <p className="text-[11px] text-slate-500">
          Aucun pricing automatique, aucune police, aucune quittance, aucun claim et aucun ancrage blockchain ne sont déclenchés ici.
        </p>
        <p className="text-[11px] text-slate-500">
          Wakama fournit le calcul et la traçabilité. L&apos;institution reste seule décisionnaire.
        </p>
      </DcaSectionCard>

      <DcaSectionCard accent="emerald">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="Pricing"
            title="Pricing — Préparation tarifaire"
            subtitle="Le pricing prépare une proposition tarifaire. Il ne crée ni police, ni quittance, ni paiement."
            accent="emerald"
          />
          <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-100">
            {formatPricingOfferStatusFr(pricingOffer?.status)}
          </span>
        </div>

        {pricingOfferLoading ? <p className="text-xs text-slate-400">Chargement de l&apos;offre tarifaire...</p> : null}
        {pricingOfferError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {pricingOfferError}
          </p>
        ) : null}

        {pricingOffer ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <DcaInfoTile label="Statut offre" value={formatPricingOfferStatusFr(pricingOffer.status)} />
              <DcaInfoTile label="Pricing version" value={pricingOffer.pricingVersion || "—"} />
              <DcaInfoTile label="Source label" value={pricingOffer.sourceLabel || "—"} />
              <DcaInfoTile label="Version" value={pricingOffer.version} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InstitutionDecisionValueBlock title="Pricing inputs" value={pricingOffer.pricingInputs} />
              <InstitutionDecisionValueBlock title="Coverage proposal" value={pricingOffer.coverageProposal} />
              <InstitutionDecisionValueBlock title="Premium computation" value={pricingOffer.premiumComputation} />
              <InstitutionDecisionValueBlock title="Taxes and fees" value={pricingOffer.taxesAndFees} />
              <InstitutionDecisionValueBlock title="Discounts and adjustments" value={pricingOffer.discountsAndAdjustments} />
              <InstitutionDecisionValueBlock title="Exclusions" value={pricingOffer.exclusions} />
              <InstitutionDecisionValueBlock title="Conditions" value={pricingOffer.conditions} />
              <InstitutionDecisionValueBlock title="Offer summary" value={pricingOffer.offerSummary} />
              <InstitutionDecisionValueBlock title="Offer validity" value={pricingOffer.offerValidity} />
              <InstitutionDecisionValueBlock title="Required actions" value={pricingOffer.requiredActions} />
              <InstitutionDecisionValueBlock title="Side effects" value={pricingOffer.sideEffects} />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucune offre tarifaire préparée pour ce dossier.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleGeneratePricingOffer()}
            disabled={pricingOfferGenerating || !canOperateInstitutionFlow || pricingOfferPrerequisiteBlocked}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {pricingOfferGenerating ? "..." : "Générer / Actualiser offre tarifaire"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePricingOfferStatus("UNDER_OFFER_REVIEW")}
            disabled={!pricingOffer || pricingOfferStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {pricingOfferStatusSaving === "UNDER_OFFER_REVIEW" ? "..." : "Démarrer revue offre"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePricingOfferStatus("OFFER_APPROVED_FOR_CONTRACT")}
            disabled={!pricingOffer || pricingOfferStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {pricingOfferStatusSaving === "OFFER_APPROVED_FOR_CONTRACT" ? "..." : "Approuver pour contrat"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePricingOfferStatus("OFFER_NEEDS_MORE_INFORMATION")}
            disabled={!pricingOffer || pricingOfferStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {pricingOfferStatusSaving === "OFFER_NEEDS_MORE_INFORMATION" ? "..." : "Demander informations complémentaires"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePricingOfferStatus("OFFER_DECLINED")}
            disabled={!pricingOffer || pricingOfferStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {pricingOfferStatusSaving === "OFFER_DECLINED" ? "..." : "Décliner offre"}
          </button>
        </div>

        {pricingOfferPrerequisiteBlocked ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            Le pricing reste bloqué tant que la décision institutionnelle n&apos;est pas prête pour pricing.
          </p>
        ) : null}

        {pricingOfferFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              pricingOfferFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : pricingOfferFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {pricingOfferFeedback.message}
          </p>
        ) : null}
      </DcaSectionCard>

      <DcaSectionCard accent="slate">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="Policy / Contract"
            title="Police / Contrat — Émission contrôlée"
            subtitle="Le contrat est émis uniquement par action humaine institutionnelle. Aucun paiement ni quittance payée n’est créé automatiquement."
            accent="slate"
          />
          <span className="rounded-full border border-slate-400/35 bg-slate-700/30 px-2.5 py-0.5 text-[11px] text-slate-100">
            {formatPolicyContractStatusFr(policyContract?.status)}
          </span>
        </div>

        {policyContractLoading ? <p className="text-xs text-slate-400">Chargement du contrat...</p> : null}
        {policyContractError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {policyContractError}
          </p>
        ) : null}

        {policyContract ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <DcaInfoTile label="Statut contrat" value={formatPolicyContractStatusFr(policyContract.status)} />
              <DcaInfoTile label="Policy number" value={policyContract.policyNumber || "—"} mono />
              <DcaInfoTile label="Contract reference" value={policyContract.contractReference || "—"} mono />
              <DcaInfoTile label="Contract version" value={policyContract.contractVersion || "—"} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InstitutionDecisionValueBlock title="Insured party snapshot" value={policyContract.insuredPartySnapshot} />
              <InstitutionDecisionValueBlock title="Parcel snapshot" value={policyContract.parcelSnapshot} />
              <InstitutionDecisionValueBlock title="Coverage terms" value={policyContract.coverageTerms} />
              <InstitutionDecisionValueBlock title="Premium snapshot" value={policyContract.premiumSnapshot} />
              <InstitutionDecisionValueBlock title="Conditions" value={policyContract.conditions} />
              <InstitutionDecisionValueBlock title="Exclusions" value={policyContract.exclusions} />
              <InstitutionDecisionValueBlock title="Contract documents" value={policyContract.contractDocuments} />
              <InstitutionDecisionValueBlock title="Receipt draft" value={policyContract.receiptDraft} />
              <InstitutionDecisionValueBlock title="Issuance audit" value={policyContract.issuanceAudit} />
              <InstitutionDecisionValueBlock title="Side effects" value={policyContract.sideEffects} />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucun contrat émis pour ce dossier.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleIssuePolicyContract()}
            disabled={policyContractIssuing || !canOperateInstitutionFlow || policyContractPrerequisiteBlocked}
            className="rounded-full border border-slate-300/35 bg-slate-200/10 px-4 py-1.5 text-xs text-slate-100 transition hover:bg-slate-200/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {policyContractIssuing ? "..." : "Émettre contrat"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePolicyContractStatus("READY_FOR_SIGNATURE")}
            disabled={!policyContract || policyContractStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {policyContractStatusSaving === "READY_FOR_SIGNATURE" ? "..." : "Marquer prêt pour signature"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePolicyContractStatus("ISSUED_PENDING_PAYMENT")}
            disabled={!policyContract || policyContractStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {policyContractStatusSaving === "ISSUED_PENDING_PAYMENT" ? "..." : "Marquer émis en attente paiement"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePolicyContractStatus("SUSPENDED")}
            disabled={!policyContract || policyContractStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {policyContractStatusSaving === "SUSPENDED" ? "..." : "Suspendre"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdatePolicyContractStatus("CANCELLED")}
            disabled={!policyContract || policyContractStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {policyContractStatusSaving === "CANCELLED" ? "..." : "Annuler"}
          </button>
        </div>

        {policyContractPrerequisiteBlocked ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            Le contrat reste bloqué tant que l&apos;offre n&apos;est pas approuvée pour contrat.
          </p>
        ) : null}

        {policyContractFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              policyContractFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : policyContractFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {policyContractFeedback.message}
          </p>
        ) : null}
      </DcaSectionCard>

      <DcaSectionCard accent="cyan">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IBDO"
            title="IBDO — Evidence Bundle & intégrité des preuves"
            subtitle="IBDO consolide les preuves et calcule des empreintes d'intégrité. Aucun ancrage blockchain n'est déclenché automatiquement."
            accent="cyan"
          />
          <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] text-cyan-100">
            {formatEvidenceBundleStatusFr(evidenceBundle?.status)}
          </span>
        </div>

        {evidenceBundleLoading ? <p className="text-xs text-slate-400">Chargement du bundle de preuves...</p> : null}
        {evidenceBundleError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {evidenceBundleError}
          </p>
        ) : null}

        {evidenceBundle ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <DcaInfoTile label="Statut bundle" value={formatEvidenceBundleStatusFr(evidenceBundle.status)} />
              <DcaInfoTile label="Protocol version" value={evidenceBundle.protocolVersion || "—"} />
              <DcaInfoTile label="Bundle hash" value={evidenceBundle.bundleHash || "—"} mono />
              <DcaInfoTile label="Version" value={evidenceBundle.version} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InstitutionDecisionValueBlock title="Evidence index" value={evidenceBundle.evidenceIndex} />
              <InstitutionDecisionValueBlock title="Chain summary" value={evidenceBundle.chainSummary} />
              <InstitutionDecisionValueBlock title="Component hashes" value={evidenceBundle.componentHashes} />
              <InstitutionDecisionValueBlock title="Integrity checks" value={evidenceBundle.integrityChecks} />
              <InstitutionDecisionValueBlock title="Privacy redaction" value={evidenceBundle.privacyRedaction} />
              <InstitutionDecisionValueBlock title="Storage manifest" value={evidenceBundle.storageManifest} />
              <InstitutionDecisionValueBlock title="Anchoring readiness" value={evidenceBundle.anchoringReadiness} />
              <InstitutionDecisionValueBlock title="Limitations" value={evidenceBundle.limitations} />
              <InstitutionDecisionValueBlock title="Side effects" value={evidenceBundle.sideEffects} />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucun bundle de preuves généré pour ce dossier.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateEvidenceBundle()}
            disabled={evidenceBundleGenerating || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {evidenceBundleGenerating ? "..." : "Générer / Actualiser bundle"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateEvidenceBundleStatus("UNDER_EVIDENCE_REVIEW")}
            disabled={!evidenceBundle || evidenceBundleStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {evidenceBundleStatusSaving === "UNDER_EVIDENCE_REVIEW" ? "..." : "Démarrer revue preuves"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateEvidenceBundleStatus("READY_FOR_ANCHORING")}
            disabled={!evidenceBundle || evidenceBundleStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {evidenceBundleStatusSaving === "READY_FOR_ANCHORING" ? "..." : "Marquer prêt pour ancrage futur"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateEvidenceBundleStatus("NEEDS_EVIDENCE_COMPLETION")}
            disabled={!evidenceBundle || evidenceBundleStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {evidenceBundleStatusSaving === "NEEDS_EVIDENCE_COMPLETION" ? "..." : "Demander complément preuve"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateEvidenceBundleStatus("BLOCKED_INTEGRITY_ISSUE")}
            disabled={!evidenceBundle || evidenceBundleStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {evidenceBundleStatusSaving === "BLOCKED_INTEGRITY_ISSUE" ? "..." : "Bloquer problème intégrité"}
          </button>
        </div>

        {evidenceBundleFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              evidenceBundleFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : evidenceBundleFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {evidenceBundleFeedback.message}
          </p>
        ) : null}
      </DcaSectionCard>

      <DcaSectionCard accent="amber">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="Sinistres"
            title="Sinistres — Dossier claim"
            subtitle="Le dossier sinistre prépare la revue humaine. Aucun paiement, aucune indemnisation et aucune quittance ne sont créés automatiquement."
            accent="amber"
          />
        </div>

        {claimCasesLoading ? <p className="text-xs text-slate-400">Chargement des sinistres...</p> : null}
        {claimCasesError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {claimCasesError}
          </p>
        ) : null}

        {claimCases.length > 0 ? (
          <div className="space-y-3">
            {claimCases.map((claim) => (
              <div
                key={claim.id}
                className="space-y-3 rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-200">
                    {claim.claimReference} — {claim.claimType}
                  </p>
                  <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-100">
                    {formatClaimCaseStatusFr(claim.status)}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <InstitutionDecisionValueBlock title="Policy snapshot" value={claim.policySnapshot} />
                  <InstitutionDecisionValueBlock title="Loss assessment plan" value={claim.lossAssessmentPlan} />
                  <InstitutionDecisionValueBlock title="Evidence requirements" value={claim.evidenceRequirements} />
                  <InstitutionDecisionValueBlock title="Triage assessment" value={claim.triageAssessment} />
                  <InstitutionDecisionValueBlock title="Coverage context" value={claim.coverageContext} />
                  <InstitutionDecisionValueBlock title="Reserve estimate" value={claim.reserveEstimate} />
                  <InstitutionDecisionValueBlock title="Side effects" value={claim.sideEffects} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleUpdateClaimCaseStatus(claim.id, "UNDER_CLAIM_REVIEW")}
                    disabled={claimCaseStatusSaving !== null || !canOperateInstitutionFlow}
                    className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
                  >
                    {claimCaseStatusSaving === `${claim.id}:UNDER_CLAIM_REVIEW` ? "..." : "Démarrer revue sinistre"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdateClaimCaseStatus(claim.id, "NEEDS_MORE_EVIDENCE")}
                    disabled={claimCaseStatusSaving !== null || !canOperateInstitutionFlow}
                    className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
                  >
                    {claimCaseStatusSaving === `${claim.id}:NEEDS_MORE_EVIDENCE` ? "..." : "Demander preuves complémentaires"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdateClaimCaseStatus(claim.id, "READY_FOR_LOSS_ASSESSMENT")}
                    disabled={claimCaseStatusSaving !== null || !canOperateInstitutionFlow}
                    className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
                  >
                    {claimCaseStatusSaving === `${claim.id}:READY_FOR_LOSS_ASSESSMENT` ? "..." : "Prêt pour évaluation pertes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdateClaimCaseStatus(claim.id, "ACCEPTED_FOR_SETTLEMENT_REVIEW")}
                    disabled={claimCaseStatusSaving !== null || !canOperateInstitutionFlow}
                    className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
                  >
                    {claimCaseStatusSaving === `${claim.id}:ACCEPTED_FOR_SETTLEMENT_REVIEW` ? "..." : "Accepter pour revue règlement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdateClaimCaseStatus(claim.id, "CLOSED_NO_SETTLEMENT")}
                    disabled={claimCaseStatusSaving !== null || !canOperateInstitutionFlow}
                    className="rounded-full border border-slate-400/35 bg-slate-700/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
                  >
                    {claimCaseStatusSaving === `${claim.id}:CLOSED_NO_SETTLEMENT` ? "..." : "Clôturer sans règlement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdateClaimCaseStatus(claim.id, "CANCELLED")}
                    disabled={claimCaseStatusSaving !== null || !canOperateInstitutionFlow}
                    className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
                  >
                    {claimCaseStatusSaving === `${claim.id}:CANCELLED` ? "..." : "Annuler"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucun dossier sinistre pour ce dossier.
          </div>
        )}

        <div className="grid gap-3 rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 md:grid-cols-3">
          <input
            type="text"
            value={claimCaseForm.claimType}
            onChange={(event) => setClaimCaseForm((prev) => ({ ...prev, claimType: event.target.value }))}
            placeholder="Type de sinistre (ex. DROUGHT)"
            className="rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
          />
          <input
            type="date"
            value={claimCaseForm.eventDate}
            onChange={(event) => setClaimCaseForm((prev) => ({ ...prev, eventDate: event.target.value }))}
            className="rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-100"
          />
          <input
            type="text"
            value={claimCaseForm.notes}
            onChange={(event) => setClaimCaseForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Note / dommage déclaré"
            className="rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleCreateClaimCase()}
            disabled={claimCaseCreating || !canOperateInstitutionFlow || claimCasePrerequisiteBlocked}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {claimCaseCreating ? "..." : "Créer dossier sinistre"}
          </button>
        </div>

        {claimCasePrerequisiteBlocked ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            La déclaration de sinistre reste bloquée tant qu&apos;aucun contrat de police n&apos;est émis.
          </p>
        ) : null}

        {claimCaseFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              claimCaseFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : claimCaseFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {claimCaseFeedback.message}
          </p>
        ) : null}
      </DcaSectionCard>

      <DcaSectionCard accent="violet">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IDDO"
            title="IDDO — Surveillance post-contrat"
            subtitle="IDDO surveille les signaux post-contrat et recommande des actions humaines. Il ne modifie jamais automatiquement la police ou les sinistres."
            accent="violet"
          />
          <span className="rounded-full border border-violet-400/35 bg-violet-500/10 px-2.5 py-0.5 text-[11px] text-violet-100">
            {formatMonitoringSnapshotStatusFr(monitoringSnapshot?.status)}
          </span>
        </div>

        {monitoringSnapshotLoading ? <p className="text-xs text-slate-400">Chargement de la surveillance...</p> : null}
        {monitoringSnapshotError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {monitoringSnapshotError}
          </p>
        ) : null}

        {monitoringSnapshot ? (
          <div className="grid gap-3 md:grid-cols-2">
            <InstitutionDecisionValueBlock title="Policy surveillance" value={monitoringSnapshot.policySurveillance} />
            <InstitutionDecisionValueBlock title="Parcel surveillance" value={monitoringSnapshot.parcelSurveillance} />
            <InstitutionDecisionValueBlock title="Climate surveillance" value={monitoringSnapshot.climateSurveillance} />
            <InstitutionDecisionValueBlock title="Vegetation surveillance" value={monitoringSnapshot.vegetationSurveillance} />
            <InstitutionDecisionValueBlock title="Hydrology surveillance" value={monitoringSnapshot.hydrologySurveillance} />
            <InstitutionDecisionValueBlock title="Claims surveillance" value={monitoringSnapshot.claimsSurveillance} />
            <InstitutionDecisionValueBlock title="Compliance surveillance" value={monitoringSnapshot.complianceSurveillance} />
            <InstitutionDecisionValueBlock title="Data quality" value={monitoringSnapshot.dataQuality} />
            <InstitutionDecisionValueBlock title="Alerts" value={monitoringSnapshot.alerts} />
            <InstitutionDecisionValueBlock title="Recommended actions" value={monitoringSnapshot.recommendedActions} />
            <InstitutionDecisionValueBlock title="Side effects" value={monitoringSnapshot.sideEffects} />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucune surveillance générée pour ce dossier.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateMonitoringSnapshot()}
            disabled={monitoringSnapshotGenerating || !canOperateInstitutionFlow}
            className="rounded-full border border-violet-400/35 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-100 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {monitoringSnapshotGenerating ? "..." : "Générer / Actualiser surveillance"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateMonitoringSnapshotStatus("UNDER_MONITORING_REVIEW")}
            disabled={!monitoringSnapshot || monitoringSnapshotStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {monitoringSnapshotStatusSaving === "UNDER_MONITORING_REVIEW" ? "..." : "Démarrer revue monitoring"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateMonitoringSnapshotStatus("ALERTS_REQUIRING_ATTENTION")}
            disabled={!monitoringSnapshot || monitoringSnapshotStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {monitoringSnapshotStatusSaving === "ALERTS_REQUIRING_ATTENTION" ? "..." : "Marquer alertes à traiter"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateMonitoringSnapshotStatus("NO_ACTION_REQUIRED")}
            disabled={!monitoringSnapshot || monitoringSnapshotStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {monitoringSnapshotStatusSaving === "NO_ACTION_REQUIRED" ? "..." : "Aucune action requise"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateMonitoringSnapshotStatus("NEEDS_DATA_REFRESH")}
            disabled={!monitoringSnapshot || monitoringSnapshotStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-slate-400/35 bg-slate-700/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {monitoringSnapshotStatusSaving === "NEEDS_DATA_REFRESH" ? "..." : "Demander rafraîchissement données"}
          </button>
        </div>

        {monitoringSnapshotFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              monitoringSnapshotFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : monitoringSnapshotFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {monitoringSnapshotFeedback.message}
          </p>
        ) : null}
      </DcaSectionCard>

      <DcaSectionCard accent="violet">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="IFDO"
            title="IFDO — Fraude, forensic & anomalies"
            subtitle="IFDO détecte des signaux d'anomalie et prépare une revue humaine. Il ne déclare jamais une fraude automatiquement."
            accent="violet"
          />
          <span className="rounded-full border border-violet-400/35 bg-violet-500/10 px-2.5 py-0.5 text-[11px] text-violet-100">
            {formatFraudForensicReviewStatusFr(fraudForensicReview?.status)}
          </span>
        </div>

        {fraudForensicReviewLoading ? <p className="text-xs text-slate-400">Chargement de la revue IFDO...</p> : null}
        {fraudForensicReviewError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {fraudForensicReviewError}
          </p>
        ) : null}

        {fraudForensicReview ? (
          <div className="grid gap-3 md:grid-cols-2">
            <InstitutionDecisionValueBlock title="Protocol version" value={fraudForensicReview.protocolVersion} />
            <InstitutionDecisionValueBlock title="Anomaly signals" value={fraudForensicReview.anomalySignals} />
            <InstitutionDecisionValueBlock title="Forensic matrix" value={fraudForensicReview.forensicMatrix} />
            <InstitutionDecisionValueBlock title="Evidence consistency" value={fraudForensicReview.evidenceConsistency} />
            <InstitutionDecisionValueBlock
              title="Identity & consent review"
              value={fraudForensicReview.identityAndConsentReview}
            />
            <InstitutionDecisionValueBlock title="Geo-temporal review" value={fraudForensicReview.geoTemporalReview} />
            <InstitutionDecisionValueBlock title="Claim pattern review" value={fraudForensicReview.claimPatternReview} />
            <InstitutionDecisionValueBlock
              title="Document integrity review"
              value={fraudForensicReview.documentIntegrityReview}
            />
            <InstitutionDecisionValueBlock
              title="Risk & pricing consistency"
              value={fraudForensicReview.riskAndPricingConsistency}
            />
            <InstitutionDecisionValueBlock
              title="Recommended human actions"
              value={fraudForensicReview.recommendedHumanActions}
            />
            <InstitutionDecisionValueBlock title="Blockers" value={fraudForensicReview.blockers} />
            <InstitutionDecisionValueBlock title="Warnings" value={fraudForensicReview.warnings} />
            <InstitutionDecisionValueBlock title="Side effects" value={fraudForensicReview.sideEffects} />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucune revue IFDO générée pour ce dossier.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateFraudForensicReview()}
            disabled={fraudForensicReviewGenerating || !canOperateInstitutionFlow}
            className="rounded-full border border-violet-400/35 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-100 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {fraudForensicReviewGenerating ? "..." : "Générer / Actualiser revue IFDO"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateFraudForensicReviewStatus("UNDER_FORENSIC_REVIEW")}
            disabled={!fraudForensicReview || fraudForensicReviewStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {fraudForensicReviewStatusSaving === "UNDER_FORENSIC_REVIEW" ? "..." : "Démarrer revue forensic"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateFraudForensicReviewStatus("ANOMALY_REVIEW_REQUIRED")}
            disabled={!fraudForensicReview || fraudForensicReviewStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {fraudForensicReviewStatusSaving === "ANOMALY_REVIEW_REQUIRED" ? "..." : "Marquer revue anomalies requise"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateFraudForensicReviewStatus("NEEDS_ADDITIONAL_EVIDENCE")}
            disabled={!fraudForensicReview || fraudForensicReviewStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-slate-400/35 bg-slate-700/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {fraudForensicReviewStatusSaving === "NEEDS_ADDITIONAL_EVIDENCE" ? "..." : "Demander preuves complémentaires"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateFraudForensicReviewStatus("ESCALATED_TO_INSTITUTION_COMMITTEE")}
            disabled={!fraudForensicReview || fraudForensicReviewStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {fraudForensicReviewStatusSaving === "ESCALATED_TO_INSTITUTION_COMMITTEE"
              ? "..."
              : "Escalader au comité institution"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateFraudForensicReviewStatus("CLOSED_NO_ACTION")}
            disabled={!fraudForensicReview || fraudForensicReviewStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {fraudForensicReviewStatusSaving === "CLOSED_NO_ACTION" ? "..." : "Clôturer sans action"}
          </button>
        </div>

        {fraudForensicReviewFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              fraudForensicReviewFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : fraudForensicReviewFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {fraudForensicReviewFeedback.message}
          </p>
        ) : null}
      </DcaSectionCard>

      <DcaSectionCard accent="emerald">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="ICOO"
            title="ICOO — Cockpit opérations"
            subtitle="ICOO agrège les files de travail et les blocages opérationnels. Il ne modifie aucun statut métier automatiquement."
            accent="emerald"
          />
          <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-100">
            {formatOperationsCockpitStatusFr(operationsCockpit?.status)}
          </span>
        </div>

        {operationsCockpitLoading ? (
          <p className="text-xs text-slate-400">Chargement du cockpit opérations...</p>
        ) : null}
        {operationsCockpitError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {operationsCockpitError}
          </p>
        ) : null}

        {operationsCockpit ? (
          <div className="grid gap-3 md:grid-cols-2">
            <InstitutionDecisionValueBlock title="Pipeline overview" value={operationsCockpit.pipelineOverview} />
            <InstitutionDecisionValueBlock title="Workload queues" value={operationsCockpit.workloadQueues} />
            <InstitutionDecisionValueBlock title="SLA indicators" value={operationsCockpit.slaIndicators} />
            <InstitutionDecisionValueBlock title="Bottleneck analysis" value={operationsCockpit.bottleneckAnalysis} />
            <InstitutionDecisionValueBlock title="Exception list" value={operationsCockpit.exceptionList} />
            <InstitutionDecisionValueBlock title="Claims operations" value={operationsCockpit.claimsOperations} />
            <InstitutionDecisionValueBlock title="Monitoring operations" value={operationsCockpit.monitoringOperations} />
            <InstitutionDecisionValueBlock title="Evidence operations" value={operationsCockpit.evidenceOperations} />
            <InstitutionDecisionValueBlock title="Policy operations" value={operationsCockpit.policyOperations} />
            <InstitutionDecisionValueBlock title="Recommended actions" value={operationsCockpit.recommendedActions} />
            <InstitutionDecisionValueBlock title="Blockers" value={operationsCockpit.blockers} />
            <InstitutionDecisionValueBlock title="Warnings" value={operationsCockpit.warnings} />
            <InstitutionDecisionValueBlock title="Side effects" value={operationsCockpit.sideEffects} />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucun cockpit opérations généré pour ce dossier.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateOperationsCockpit()}
            disabled={operationsCockpitGenerating || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {operationsCockpitGenerating ? "..." : "Générer / Actualiser cockpit opérations"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateOperationsCockpitStatus("UNDER_OPERATIONS_REVIEW")}
            disabled={!operationsCockpit || operationsCockpitStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {operationsCockpitStatusSaving === "UNDER_OPERATIONS_REVIEW" ? "..." : "Démarrer revue opérations"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateOperationsCockpitStatus("ACTIONS_REQUIRED")}
            disabled={!operationsCockpit || operationsCockpitStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {operationsCockpitStatusSaving === "ACTIONS_REQUIRED" ? "..." : "Marquer actions requises"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateOperationsCockpitStatus("NO_OPERATIONAL_ACTION_REQUIRED")}
            disabled={!operationsCockpit || operationsCockpitStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {operationsCockpitStatusSaving === "NO_OPERATIONAL_ACTION_REQUIRED" ? "..." : "Aucune action opérationnelle"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateOperationsCockpitStatus("NEEDS_REFRESH")}
            disabled={!operationsCockpit || operationsCockpitStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-slate-400/35 bg-slate-700/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {operationsCockpitStatusSaving === "NEEDS_REFRESH" ? "..." : "Demander rafraîchissement"}
          </button>
        </div>

        {operationsCockpitFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              operationsCockpitFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : operationsCockpitFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {operationsCockpitFeedback.message}
          </p>
        ) : null}
      </DcaSectionCard>

      <DcaSectionCard accent="cyan">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DcaSectionHeader
            kicker="ICGO"
            title="ICGO — Gouvernance & conformité"
            subtitle="ICGO prépare la revue gouvernance/conformité. Il ne certifie pas juridiquement ou réglementairement."
            accent="cyan"
          />
          <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] text-cyan-100">
            {formatGovernanceComplianceStatusFr(governanceCompliance?.status)}
          </span>
        </div>

        {governanceComplianceLoading ? (
          <p className="text-xs text-slate-400">Chargement de la conformité ICGO...</p>
        ) : null}
        {governanceComplianceError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {governanceComplianceError}
          </p>
        ) : null}

        {governanceCompliance ? (
          <div className="grid gap-3 md:grid-cols-2">
            <InstitutionDecisionValueBlock title="Consent compliance" value={governanceCompliance.consentCompliance} />
            <InstitutionDecisionValueBlock
              title="Data protection review"
              value={governanceCompliance.dataProtectionReview}
            />
            <InstitutionDecisionValueBlock title="PII review" value={governanceCompliance.piiReview} />
            <InstitutionDecisionValueBlock title="Audit trail review" value={governanceCompliance.auditTrailReview} />
            <InstitutionDecisionValueBlock title="Evidence governance" value={governanceCompliance.evidenceGovernance} />
            <InstitutionDecisionValueBlock title="Tenant scope review" value={governanceCompliance.tenantScopeReview} />
            <InstitutionDecisionValueBlock title="Regulatory readiness" value={governanceCompliance.regulatoryReadiness} />
            <InstitutionDecisionValueBlock
              title="Security posture review"
              value={governanceCompliance.securityPostureReview}
            />
            <InstitutionDecisionValueBlock title="Compliance gaps" value={governanceCompliance.complianceGaps} />
            <InstitutionDecisionValueBlock title="Recommended actions" value={governanceCompliance.recommendedActions} />
            <InstitutionDecisionValueBlock title="Blockers" value={governanceCompliance.blockers} />
            <InstitutionDecisionValueBlock title="Warnings" value={governanceCompliance.warnings} />
            <InstitutionDecisionValueBlock title="Side effects" value={governanceCompliance.sideEffects} />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-400/15 bg-slate-900/30 px-3 py-3 text-xs text-slate-400">
            Aucune conformité ICGO générée pour ce dossier.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateGovernanceCompliance()}
            disabled={governanceComplianceGenerating || !canOperateInstitutionFlow}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {governanceComplianceGenerating ? "..." : "Générer / Actualiser conformité"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateGovernanceComplianceStatus("UNDER_COMPLIANCE_REVIEW")}
            disabled={!governanceCompliance || governanceComplianceStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-violet-400/35 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-100 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {governanceComplianceStatusSaving === "UNDER_COMPLIANCE_REVIEW" ? "..." : "Démarrer revue conformité"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateGovernanceComplianceStatus("GAPS_REQUIRING_ACTION")}
            disabled={!governanceCompliance || governanceComplianceStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {governanceComplianceStatusSaving === "GAPS_REQUIRING_ACTION" ? "..." : "Marquer écarts à traiter"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateGovernanceComplianceStatus("READY_FOR_AUDIT_REVIEW")}
            disabled={!governanceCompliance || governanceComplianceStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {governanceComplianceStatusSaving === "READY_FOR_AUDIT_REVIEW" ? "..." : "Prêt pour revue audit"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateGovernanceComplianceStatus("NO_COMPLIANCE_ACTION_REQUIRED")}
            disabled={!governanceCompliance || governanceComplianceStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-slate-400/35 bg-slate-700/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {governanceComplianceStatusSaving === "NO_COMPLIANCE_ACTION_REQUIRED" ? "..." : "Aucune action conformité"}
          </button>
          <button
            type="button"
            onClick={() => void handleUpdateGovernanceComplianceStatus("NEEDS_COMPLIANCE_REFRESH")}
            disabled={!governanceCompliance || governanceComplianceStatusSaving !== null || !canOperateInstitutionFlow}
            className="rounded-full border border-slate-400/35 bg-slate-700/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:border-slate-500/30 disabled:bg-slate-700/20 disabled:text-slate-400"
          >
            {governanceComplianceStatusSaving === "NEEDS_COMPLIANCE_REFRESH" ? "..." : "Demander rafraîchissement"}
          </button>
        </div>

        {governanceComplianceFeedback ? (
          <p
            className={`rounded-xl border px-3 py-2 text-xs ${
              governanceComplianceFeedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : governanceComplianceFeedback.type === "critical"
                  ? "border-rose-500/40 bg-rose-600/15 text-rose-200"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {governanceComplianceFeedback.message}
          </p>
        ) : null}
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
