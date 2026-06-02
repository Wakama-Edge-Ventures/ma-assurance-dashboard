"use client";

import { use, useEffect, useMemo, useState } from "react";

import {
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
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";

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

function asMad(value?: number | null) {
  if (value === null || value === undefined) return "Non disponible";
  return `${value.toLocaleString("fr-FR")} MAD`;
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
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
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
      <Card className="space-y-3">
        <PageTitle
          title={`Détail DCA ${applicationId}`}
          description="Lecture seule du dossier assurance."
        />
        <p className="text-xs text-slate-500">Source du dossier: {formatSourceFr("UNAVAILABLE")}</p>
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card className="space-y-3">
        <PageTitle
          title={`Détail DCA ${applicationId}`}
          description="Lecture seule du dossier assurance."
        />
        <p className="text-xs text-slate-500">Source du dossier: {formatSourceFr("UNAVAILABLE")}</p>
        <p className="text-sm text-slate-300">
          Dossier introuvable. Aucune donnée DCA disponible pour cet identifiant.
        </p>
      </Card>
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

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Dossier DCA ${application.reference ?? application.dcaNumber ?? application.id}`}
        description="Lecture seule du détail d'une demande assurance farmer."
      />

      {result?.detailNote ? <p className="text-xs text-slate-400">{result.detailNote}</p> : null}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Référence DCA</p>
            <p className="text-lg font-semibold text-white">{referenceValue}</p>
            <p className="text-xs text-slate-400">ID technique: {application.id}</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="rounded-full border border-slate-400/20 bg-slate-800/70 px-3 py-1 text-[11px] text-slate-300">
              {formatDcaStatusFr(application.status)}
            </span>
            <p className="text-[11px] text-slate-500">Code interne statut: {application.status}</p>
            {application.backendStatus && application.backendStatus !== application.status ? (
              <p className="text-[11px] text-slate-500">
                Statut backend: {formatDcaStatusFr(application.backendStatus)} ({application.backendStatus})
              </p>
            ) : null}
            <p className="text-[11px] text-slate-400">Source du dossier: {formatSourceFr(application.source)}</p>
            <p className="text-[11px] text-slate-500">Code interne source: {application.source}</p>
          </div>
        </div>
        <div className="grid gap-3 text-[13px] text-slate-300 md:grid-cols-2">
          <p>Date de soumission: {formatDate(application.submittedAt ?? application.createdAt)}</p>
        </div>
        {waitingLine ? (
          <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
            Dossier reçu &mdash; en attente d&apos;analyse par l&apos;assureur.
          </p>
        ) : null}
        <p className="text-xs text-brand-textMuted">
          Wakama prépare, structure et documente le dossier. L&apos;assureur reste seul décisionnaire.
        </p>
        <div className="space-y-1 rounded-lg border border-slate-400/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
          <p className="font-medium text-slate-200">Dossier DCA persisté</p>
          <p>Source déclarative: {formatSourceFr(application.declarativeSource ?? application.source)}</p>
          <p>Table de vérité: {formatSourceOfTruthFr(application.sourceOfTruth)}</p>
          <p>
            Ancien fallback d&apos;audit:{" "}
            {application.legacyAuditFallbackUsed === false
              ? "non utilisé"
              : formatBooleanFr(application.legacyAuditFallbackUsed)}
          </p>
          <p className="text-slate-500">
            Codes internes: source {application.declarativeSource ?? application.source} | sourceOfTruth{" "}
            {application.sourceOfTruth ?? "UNAVAILABLE"}
          </p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">Farmer</h2>
        <div className="grid gap-2 text-[13px] text-slate-300 md:grid-cols-2">
          <p>
            Nom / prénom:{" "}
            {[application.farmer.firstName, application.farmer.lastName].filter(Boolean).join(" ") ||
              "Non disponible"}
          </p>
          <p>Téléphone masqué: {application.farmer.phoneMasked ?? "Non disponible"}</p>
          <p>CIN masquée: {application.farmer.cinMasked ?? "Non disponible"}</p>
          <p>Langue préférée: {application.farmer.preferredLanguage ?? "Non disponible"}</p>
          <p>Source: {formatSourceFr(application.farmer.source ?? "UNAVAILABLE")}</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">Parcelle / objet du risque</h2>
        <div className="grid gap-2 text-[13px] text-slate-300 md:grid-cols-2">
          <p>Nom parcelle: {application.parcelle.name ?? "Non disponible"}</p>
          <p>
            Culture:{" "}
            {application.parcelle.culture ?? application.crop ?? application.culture ?? "Non disponible"}
          </p>
          <p>
            Superficie déclarée:{" "}
            {declaredArea !== null && declaredArea !== undefined ? `${declaredArea} ha` : "Non disponible"}
          </p>
          <p>Latitude: {application.parcelle.lat ?? "Non disponible"}</p>
          <p>Longitude: {application.parcelle.lng ?? "Non disponible"}</p>
          <p>Source: {formatSourceFr(application.parcelle.source ?? "UNAVAILABLE")}</p>
        </div>
        {hasCountryMismatch ? (
          <p className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
            Attention : métadonnée pays parcelle incohérente avec la DCA Maroc. À vérifier côté backend plus tard.
          </p>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">Documents préparés</h2>
        {application.preparedDocuments.length === 0 ? (
          <p className="text-sm text-slate-300">Aucun document préparé disponible pour ce dossier.</p>
        ) : (
          <div className="space-y-3">
            {application.preparedDocuments.map((doc, index) => (
              <div
                key={`${doc.id ?? "doc"}-${index}`}
                className="rounded-xl border border-slate-400/10 bg-slate-900/35 p-3 text-sm text-slate-300"
              >
                <p>Type: {doc.type ?? "Non disponible"}</p>
                <p>Libellé/Fichier: {doc.label ?? doc.filename ?? doc.name ?? doc.type ?? "Non disponible"}</p>
                <p>Statut: {formatDocumentStatusFr(doc.status)}</p>
                {doc.status ? <p className="text-[11px] text-slate-500">Code interne statut: {doc.status}</p> : null}
                <p>Date: {formatDate(doc.createdAt)}</p>
                <p>Source: {formatSourceFr(doc.source)}</p>
                <p className="text-[11px] text-slate-500">Code interne source: {doc.source}</p>
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs text-cyan-300 underline-offset-2 hover:underline"
                  >
                    Ouvrir document
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">Historique sinistres farmer</h2>
        {application.claimHistory.length === 0 ? (
          <p className="text-sm text-slate-300">Aucun antécédent de sinistre déclaré ou disponible.</p>
        ) : (
          <div className="space-y-3">
            {application.claimHistory.map((item, index) => (
              <div
                key={`${item.id ?? "claim"}-${index}`}
                className="rounded-xl border border-slate-400/10 bg-slate-900/35 p-3 text-sm text-slate-300"
              >
                <p>Année: {item.year ?? "Non disponible"}</p>
                <p>Type / cause: {item.type ?? item.cause ?? "Non disponible"}</p>
                <p>Montant estimé: {asMad(item.estimatedAmount)}</p>
                <p>Note: {item.note ?? "Non disponible"}</p>
                <p>
                  Résumé:{" "}
                  {[item.year ?? "N/A", item.type ?? item.cause ?? "N/A", item.note ?? "N/A", asMad(item.estimatedAmount)].join(" - ")}
                </p>
                <p>Source: {formatSourceFr(item.source)}</p>
                <p className="text-[11px] text-slate-500">Code interne source: {item.source}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">Période déclarée: {application.periodYears ?? "Non disponible"} ans</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">Consentement CNDP</h2>
        <div className="grid gap-2 text-[13px] text-slate-300 md:grid-cols-2">
          <p>Consentement donné: {formatBooleanFr(application.consentCndp)}</p>
          <p>Date: {formatDate(application.consentCndpAt)}</p>
          <p>Source: {formatSourceFr(application.consentCndpSource ?? "UNAVAILABLE")}</p>
        </div>
        <p className="text-xs text-slate-400">
          Consentement CNDP utilisé uniquement pour la préparation et l&apos;analyse du dossier par l&apos;assureur.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">Effets secondaires backend</h2>
        <div className="grid gap-2 text-[13px] text-slate-300 md:grid-cols-2">
          <p>Mission: {application.sideEffects.missionCreated ? "Créée" : "Non créée"}</p>
          <p>Police: {application.sideEffects.policyCreated ? "Créée" : "Non créée"}</p>
          <p>Sinistre: {application.sideEffects.claimCreated ? "Créé" : "Non créé"}</p>
          <p>RAX: {application.sideEffects.raxCalculated ? "Calculé" : "Non calculé"}</p>
          <p>Tarification: {application.sideEffects.pricingCalculated ? "Calculée" : "Non calculée"}</p>
          <p>Ancrage blockchain: {application.sideEffects.blockchainAnchored ? "Ancré" : "Non ancré"}</p>
        </div>
        {application.sideEffects.missionCreated ||
        application.sideEffects.policyCreated ||
        application.sideEffects.claimCreated ||
        application.sideEffects.raxCalculated ||
        application.sideEffects.pricingCalculated ||
        application.sideEffects.blockchainAnchored ? (
          <p className="text-xs text-slate-400">État retourné par le backend &mdash; aucune action déclenchée par cet écran.</p>
        ) : null}
        {application.sideEffects.sideEffectsSource ? (
          <p className="text-xs text-slate-500">
            Source des effets secondaires:{" "}
            {formatSideEffectsSourceFr(application.sideEffects.sideEffectsSource)}
          </p>
        ) : null}
        {application.sideEffects.sourceNote ? (
          <p className="text-xs text-slate-500">Source des effets secondaires: fallback frontend</p>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-300">
          Revue back-office audit terrain
        </h2>

        {latestFieldAudit ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {latestFieldAudit.hashStatus === "SERVER_VALIDATED" ? (
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-100">
                  Hash validé
                </span>
              ) : latestFieldAudit.hashStatus === "SECURITY_HOLD" ? (
                <span className="rounded-full border border-rose-400/35 bg-rose-500/10 px-2.5 py-0.5 text-[11px] text-rose-200">
                  Blocage sécurité
                </span>
              ) : (
                <span className="rounded-full border border-slate-400/30 bg-slate-800/60 px-2.5 py-0.5 text-[11px] text-slate-300">
                  Hash: {latestFieldAudit.hashStatus}
                </span>
              )}
              {(latestFieldAudit.fieldAuditStatus === "FIELD_AUDIT_SECURITY_HOLD" ||
                latestFieldAudit.hashStatus === "SECURITY_HOLD") && (
                <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-200">
                  Attention requise
                </span>
              )}
            </div>

            {latestFieldAudit.hashStatus === "SECURITY_HOLD" && (
              <p className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                Blocage sécurité détecté — hash payload non validé par le serveur. Revue manuelle requise avant toute suite.
              </p>
            )}

            <div className="grid gap-2 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-[13px] text-slate-300 md:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">ID audit terrain</p>
                <p className="font-mono text-xs text-slate-200">{latestFieldAudit.id}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Statut audit</p>
                <p>{formatFieldAuditStatusFr(latestFieldAudit.fieldAuditStatus)}</p>
                <p className="text-[11px] text-slate-500">Code: {latestFieldAudit.fieldAuditStatus ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Statut hash</p>
                <p className={
                  latestFieldAudit.hashStatus === "SERVER_VALIDATED"
                    ? "text-emerald-200"
                    : latestFieldAudit.hashStatus === "SECURITY_HOLD"
                      ? "text-rose-200"
                      : "text-slate-300"
                }>
                  {formatHashStatusFr(latestFieldAudit.hashStatus)}
                </p>
                <p className="text-[11px] text-slate-500">Code: {latestFieldAudit.hashStatus}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Source</p>
                <p>{formatFieldAuditSourceFr(latestFieldAudit.source)}</p>
                <p className="text-[11px] text-slate-500">Code: {latestFieldAudit.source}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Agent</p>
                <p className="font-mono text-xs">{maskAgentUserId(latestFieldAudit.agentUserId)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Surface mesurée</p>
                <p>
                  {latestFieldAudit.measuredSurfaceHa !== null && latestFieldAudit.measuredSurfaceHa !== undefined
                    ? `${latestFieldAudit.measuredSurfaceHa.toLocaleString("fr-FR")} ha`
                    : "Non disponible"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Polygone mesuré</p>
                <p>{latestFieldAudit.measuredPolygonGeojson ? "Présent" : "Absent"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Synchronisé le</p>
                <p>{formatDate(latestFieldAudit.syncedAt)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Créé le</p>
                <p>{formatDate(latestFieldAudit.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-[11px] text-slate-300">
              <p className="font-medium text-slate-200">sideEffects — revue back-office</p>
              <p>fieldAuditCreated: <span className="text-emerald-300">true</span></p>
              <p>raxCalculated: false</p>
              <p>pricingCalculated: false</p>
              <p>policyCreated: false</p>
              <p>claimCreated: false</p>
              <p>evidenceBundleCreated: false</p>
              <p>blockchainAnchored: false</p>
            </div>

            <p className="rounded-xl border border-cyan-400/20 bg-cyan-500/8 px-3 py-2 text-xs text-cyan-100/90">
              Aucun RAX déclenché par cette revue. Aucune police, sinistre, evidence bundle ou ancrage blockchain depuis cet écran.
            </p>
          </>
        ) : (
          <>
            <p className="rounded-xl border border-slate-400/20 bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
              Audit terrain non disponible — aucun audit terrain soumis pour cette DCA.
            </p>

            <div className="space-y-1 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-[11px] text-slate-300">
              <p className="font-medium text-slate-200">sideEffects — revue back-office</p>
              <p>fieldAuditCreated: false</p>
              <p>raxCalculated: false</p>
              <p>pricingCalculated: false</p>
              <p>policyCreated: false</p>
              <p>claimCreated: false</p>
              <p>evidenceBundleCreated: false</p>
              <p>blockchainAnchored: false</p>
            </div>
          </>
        )}

        <p className="text-xs text-brand-textMuted">
          Wakama prépare et documente. L&apos;assureur reste décisionnaire.
        </p>
      </Card>

      {showMissionConfigSection ? (
        <Card className="space-y-4">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-300">
            Configuration mission contrôlée
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-100">
              Brouillon Direction des Risques
            </span>
            <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] text-cyan-100">
              Aucune mission terrain envoyée
            </span>
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

          <div className="space-y-2 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-[11px] text-slate-300">
            <p className="font-medium text-slate-200">sideEffects mission-config</p>
            <p>missionCreated: {String(missionConfigSideEffects.missionCreated)}</p>
            <p>missionSent: {String(missionConfigSideEffects.missionSent)}</p>
            <p>fieldAuditCreated: {String(missionConfigSideEffects.fieldAuditCreated)}</p>
            <p>raxCalculated: {String(missionConfigSideEffects.raxCalculated)}</p>
            <p>pricingCalculated: {String(missionConfigSideEffects.pricingCalculated)}</p>
            <p>policyCreated: {String(missionConfigSideEffects.policyCreated)}</p>
            <p>claimCreated: {String(missionConfigSideEffects.claimCreated)}</p>
            <p>evidenceBundleCreated: {String(missionConfigSideEffects.evidenceBundleCreated)}</p>
            <p>blockchainAnchored: {String(missionConfigSideEffects.blockchainAnchored)}</p>
          </div>

          <p className="text-xs text-slate-400">
            Aucun envoi mission, aucune assignation agent, aucun field audit, aucun RAX, aucun pricing, aucune police,
            aucun sinistre, aucune evidence et aucun ancrage blockchain depuis cet écran.
          </p>
          <p className="text-xs text-brand-textMuted">
            Wakama prépare et documente. L’assureur décide.
          </p>
        </Card>
      ) : null}

      {showMissionDispatchSection ? (
        <Card className="space-y-4">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-300">
            Préparation dispatch mission
          </h2>

          <p className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
            Préparation opérationnelle uniquement — mission non envoyée
          </p>

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
            <div className="space-y-2 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-[11px] text-slate-300">
              <p className="font-medium text-slate-200">sideEffects mission-dispatch-draft</p>
              {missionDispatchSideEffects.missionCreated !== undefined ? (
                <p>missionCreated: {String(missionDispatchSideEffects.missionCreated)}</p>
              ) : null}
              <p>missionSent: {String(missionDispatchSideEffects.missionSent)}</p>
              <p>fieldAuditCreated: {String(missionDispatchSideEffects.fieldAuditCreated)}</p>
              <p>raxCalculated: {String(missionDispatchSideEffects.raxCalculated)}</p>
              <p>pricingCalculated: {String(missionDispatchSideEffects.pricingCalculated)}</p>
              <p>policyCreated: {String(missionDispatchSideEffects.policyCreated)}</p>
              <p>claimCreated: {String(missionDispatchSideEffects.claimCreated)}</p>
              <p>evidenceBundleCreated: {String(missionDispatchSideEffects.evidenceBundleCreated)}</p>
              <p>blockchainAnchored: {String(missionDispatchSideEffects.blockchainAnchored)}</p>
            </div>
          ) : null}

          <p className="text-xs text-slate-400">
            La mission n&apos;est pas encore envoyée à un agent. Cette étape prépare uniquement l&apos;organisation opérationnelle.
            Aucun audit terrain n&apos;est lancé.
          </p>
          <p className="text-xs text-brand-textMuted">
            Wakama prépare et documente. L&apos;assureur décide.
          </p>
        </Card>
      ) : null}

      {showMissionDispatchSection && missionConfigId ? (
        <Card className="space-y-4">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-300">
            Assignation agent de terrain
          </h2>

          <p className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            Cette action rend la mission visible dans l&apos;Agent App. Elle ne lance pas l&apos;audit terrain.
          </p>

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

          <p className="text-xs text-brand-textMuted">
            Wakama prépare et documente. L&apos;assureur décide.
          </p>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-300">Revue Direction des Risques</h2>

        <div className="space-y-2 rounded-xl border border-slate-400/10 bg-slate-900/35 px-3 py-3 text-sm text-slate-300">
          <p>Statut courant de la DCA: {formatDcaStatusFr(application.status)}</p>
          <p className="text-xs text-slate-500">Code interne statut: {application.status}</p>
          {application.backendStatus && application.backendStatus !== application.status ? (
            <p className="text-xs text-slate-500">
              Statut backend: {formatDcaStatusFr(application.backendStatus)} ({application.backendStatus})
            </p>
          ) : null}
        </div>

        {canRunRiskReviewActions ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3">
            <p className="text-xs font-medium text-emerald-200">Actions de revue disponibles</p>
            <p className="mt-1 text-xs text-emerald-100/90">
              Wakama prépare et documente. L&apos;assureur reste décisionnaire.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-3">
            <p className="text-xs font-medium text-amber-200">Actions non actionnables dans ce statut</p>
            <p className="mt-1 text-xs text-amber-100/90">
              Ce statut ne peut pas être modifié dans cette phase. Wakama prépare et documente. L&apos;assureur reste décisionnaire.
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

        <p className="text-xs text-slate-400">
          Aucune mission, aucun RAX, aucun pricing, aucune police, aucun sinistre et aucun ancrage blockchain ne sont déclenchés depuis cette revue.
        </p>
        <p className="text-xs text-brand-textMuted">
          Wakama prépare et documente. L&apos;assureur reste décisionnaire.
        </p>
      </Card>
    </div>
  );
}
