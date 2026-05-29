"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  calculateTechnicalRax,
  createLiveApplication,
  getLiveApplications,
  getMoroccoCommunes,
  getMoroccoCrops,
  getMoroccoProvinces,
  shouldUseInsuranceDemoFallback,
  type CalculateRaxPayload,
  type CreateApplicationPayload,
} from "@/lib/api/insuranceApi";
import { normalizeSource } from "@/lib/data-source";
import { MOROCCO_REFERENCE_FALLBACK } from "@/lib/insurance-live-fallback";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { SourceBadge } from "@/components/ui/source-badge";
import { EvidenceBundlePanel } from "@/components/insurance/evidence-bundle-panel";
import { DataSource } from "@/types";

type Row = Record<string, unknown>;
type PreDossierSource = "MANUAL_ENTRY" | "MANUAL_ESTIMATE";

const FALLBACK_ENABLED = shouldUseInsuranceDemoFallback();
const DEBUG_API_SHAPES = process.env.NEXT_PUBLIC_DEBUG_API_SHAPES === "true";

function str(value: unknown, fallback = "N/A") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return null;
}

function parseConfidence(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim().toUpperCase();
}

function shortText(value: unknown, fallback = "N/A") {
  const raw = str(value, fallback);
  if (raw.length <= 120) return raw;
  return `${raw.slice(0, 117)}...`;
}

function getOptionCode(row: Row) {
  return str(row.code ?? row.cropCode ?? row.id, "");
}

function getOptionLabel(row: Row) {
  return str(row.label ?? row.name ?? row.code, "N/A");
}

interface TechnicalPreDossierState {
  id: string | null;
  persisted: boolean | null;
  status: string | null;
  mode: string | null;
  notes: string | null;
  source: DataSource;
  sourceDisclosure: string | null;
}

function resolveTechnicalPreDossierState(
  payload: unknown,
  fallbackSource: DataSource,
): TechnicalPreDossierState | null {
  const root = asRecord(payload);
  if (!root) return null;
  const data = asRecord(root.data);
  const application = asRecord(root.application) ?? asRecord(data?.application);

  const id = asString(
    application?.id ??
      application?.applicationId ??
      root.id ??
      root.applicationId ??
      root.reference ??
      data?.id ??
      data?.applicationId ??
      data?.reference,
  );

  const persisted = asBoolean(application?.persisted ?? root.persisted ?? data?.persisted);
  const status = asString(application?.status ?? root.status ?? data?.status);
  const mode = asString(application?.mode ?? root.mode ?? data?.mode);
  const notes = asString(
    application?.notes ??
      application?.note ??
      root.notes ??
      root.note ??
      root.message ??
      data?.notes ??
      data?.note,
  );
  const sourceDisclosure = asString(
    application?.sourceDisclosure ??
      root.sourceDisclosure ??
      data?.sourceDisclosure ??
      application?.disclosure ??
      root.disclosure,
  );
  const source = normalizeSource(
    application?.source ??
      application?.dataSource ??
      root.source ??
      data?.source,
    fallbackSource,
  );

  if (!id && persisted === null && !status && !mode && !notes && !sourceDisclosure) {
    return null;
  }

  return { id, persisted, status, mode, notes, source, sourceDisclosure };
}

interface NormalizedRaxResult {
  gravityScore: number | null;
  frequencyScore: number | null;
  detectionScore: number | null;
  raxBrut: number | null;
  wrs: number | null;
  technicalRiskTier: string | null;
  algorithmVersion: string | null;
  sourceDisclosure: string | null;
  note: string | null;
  source: DataSource;
  savedEvaluation: {
    id: string | null;
    status: string | null;
    source: DataSource;
  } | null;
  integrationStatus: Array<{
    key: "hydroRisk" | "weatherArchive" | "ndviHistory";
    status: string | null;
    source: DataSource;
    note: string | null;
    confidence: string | null;
  }>;
  explanationFactors: unknown[];
  warnings: unknown[];
  hasCoreMetrics: boolean;
}

function collectRecordCandidates(root: Record<string, unknown> | null): Record<string, unknown>[] {
  if (!root) return [];

  const technicalRisk = asRecord(root.technicalRisk);
  const savedEvaluation = asRecord(root.savedEvaluation);
  const data = asRecord(root.data);
  const result = asRecord(root.result);
  const evaluation = asRecord(root.evaluation);
  const dataTechnicalRisk = asRecord(data?.technicalRisk);
  const resultTechnicalRisk = asRecord(result?.technicalRisk);
  const evaluationTechnicalRisk = asRecord(evaluation?.technicalRisk);
  const savedEvaluationTechnicalRisk = asRecord(savedEvaluation?.technicalRisk);
  const dataResult = asRecord(data?.result);
  const dataEvaluation = asRecord(data?.evaluation);
  const resultData = asRecord(result?.data);
  const evaluationData = asRecord(evaluation?.data);

  return [
    technicalRisk,
    savedEvaluation,
    root,
    dataTechnicalRisk,
    resultTechnicalRisk,
    evaluationTechnicalRisk,
    savedEvaluationTechnicalRisk,
    data,
    result,
    evaluation,
    dataResult,
    dataEvaluation,
    resultData,
    evaluationData,
  ].filter((item): item is Record<string, unknown> => Boolean(item));
}

function pickFirst(candidates: Record<string, unknown>[], keys: string[]): unknown {
  for (const key of keys) {
    for (const candidate of candidates) {
      if (candidate[key] !== undefined && candidate[key] !== null) {
        return candidate[key];
      }
    }
  }
  return undefined;
}

function normalizeProviderStatus(
  key: "hydroRisk" | "weatherArchive" | "ndviHistory",
  root: Record<string, unknown> | null,
): NormalizedRaxResult["integrationStatus"][number] | null {
  const record = asRecord(root?.[key]);
  if (!record) return null;

  const status = asString(
    record.status ??
      record.mode ??
      record.providerStatus ??
      record.state ??
      record.availability,
  );
  const source = normalizeSource(record.source ?? record.dataSource, "LIVE");
  const note = asString(record.note ?? record.message ?? record.disclosure);
  const confidence = asString(record.confidence ?? record.hydroConfidence)?.toUpperCase() ?? null;

  return { key, status, source, note, confidence };
}

function normalizeSavedEvaluation(
  root: Record<string, unknown> | null,
): NormalizedRaxResult["savedEvaluation"] {
  const record = asRecord(root?.savedEvaluation);
  if (!record) return null;

  return {
    id: asString(record.id ?? record.evaluationId),
    status: asString(record.status ?? record.state ?? record.mode),
    source: normalizeSource(record.source ?? record.dataSource, "LIVE"),
  };
}

function normalizeRaxResult(root: Record<string, unknown> | null): NormalizedRaxResult | null {
  if (!root) return null;
  const candidates = collectRecordCandidates(root);

  const gravityScore = num(
    pickFirst(candidates, [
      "gravityScore",
      "gravity",
      "gScore",
      "gravity_score",
      "gravityIndex",
      "gravityLevel",
    ]),
  );
  const frequencyScore = num(
    pickFirst(candidates, [
      "frequencyScore",
      "frequency",
      "fScore",
      "frequency_score",
      "frequencyIndex",
      "frequencyLevel",
    ]),
  );
  const detectionScore = num(
    pickFirst(candidates, [
      "detectionScore",
      "detection",
      "dScore",
      "detection_score",
      "detectabilityScore",
      "detectionIndex",
    ]),
  );
  const raxBrut = num(
    pickFirst(candidates, [
      "raxBrut",
      "rawRax",
      "raxRaw",
      "raxScore",
      "rax_brut",
      "technicalRax",
      "raxValue",
    ]),
  );
  const wrs = num(
    pickFirst(candidates, [
      "wrs",
      "wakamaRiskScore",
      "wrsScore",
      "riskScore",
      "wrs_score",
      "technicalWrs",
      "riskIndex",
    ]),
  );
  const technicalRiskTier = asString(
    pickFirst(candidates, [
      "technicalRiskTier",
      "riskTier",
      "tier",
      "technical_tier",
      "risk_level",
    ]),
  );
  const algorithmVersion = asString(
    pickFirst(candidates, [
      "algorithmVersion",
      "algorithm",
      "version",
      "engineVersion",
      "algorithm_version",
    ]),
  );
  const sourceDisclosure = asString(
    pickFirst(candidates, ["sourceDisclosure", "disclosure", "note", "message"]),
  );
  const note = asString(pickFirst(candidates, ["note", "message", "info"]));
  const source = normalizeSource(
    pickFirst(candidates, ["source", "dataSource", "providerStatusSource"]),
    "LIVE",
  );
  const explanationFactors = asArray(
    pickFirst(candidates, ["explanationFactors", "factors", "factorBreakdown"]),
  );
  const warnings = asArray(pickFirst(candidates, ["warnings", "alerts", "issues"]));
  const savedEvaluation = normalizeSavedEvaluation(root);
  const integrationStatus = [
    normalizeProviderStatus("hydroRisk", root),
    normalizeProviderStatus("weatherArchive", root),
    normalizeProviderStatus("ndviHistory", root),
  ].filter(
    (
      item,
    ): item is {
      key: "hydroRisk" | "weatherArchive" | "ndviHistory";
      status: string | null;
      source: DataSource;
      note: string | null;
      confidence: string | null;
    } => Boolean(item),
  );

  return {
    gravityScore,
    frequencyScore,
    detectionScore,
    raxBrut,
    wrs,
    technicalRiskTier,
    algorithmVersion,
    sourceDisclosure,
    note,
    source,
    savedEvaluation,
    integrationStatus,
    explanationFactors,
    warnings,
    hasCoreMetrics:
      raxBrut !== null && wrs !== null && Boolean(technicalRiskTier),
  };
}

interface FactorViewModel {
  label: string;
  code: string;
  category: string;
  weight: string;
  source: string;
  confidence: string | null;
  disclosure: string | null;
}

function toFactorViewModel(value: unknown): FactorViewModel {
  const record = asRecord(value);
  if (!record) {
    return {
      label: str(value),
      code: "N/A",
      category: "N/A",
      weight: "N/A",
      source: "LIVE",
      confidence: null,
      disclosure: null,
    };
  }

  return {
    label: str(record.labelFr ?? record.label ?? record.name ?? record.factor ?? record.title),
    code: str(record.code ?? record.factorCode ?? record.id),
    category: str(record.category ?? record.type ?? record.group),
    weight: str(record.weight ?? record.score ?? record.value ?? record.contribution),
    source: normalizeSource(record.source, "LIVE"),
    confidence: parseConfidence(record.confidence ?? record.scoreConfidence),
    disclosure: shortText(record.disclosure ?? record.note ?? record.description, ""),
  };
}

interface WarningViewModel {
  text: string;
  source: string;
  confidence: string | null;
}

function toWarningViewModel(value: unknown): WarningViewModel {
  const record = asRecord(value);
  if (!record) {
    return {
      text: str(value),
      source: "DEGRADED",
      confidence: null,
    };
  }

  return {
    text: shortText(record.message ?? record.label ?? record.warning ?? record.note),
    source: normalizeSource(record.source, "DEGRADED"),
    confidence: parseConfidence(record.confidence),
  };
}

const now = new Date();
const defaultEndDate = now.toISOString().slice(0, 10);
const defaultStartDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)
  .toISOString()
  .slice(0, 10);

const DEFAULT_FORM = {
  country: "MA" as const,
  cropCode: "BLE_DUR",
  lat: "34.9417",
  lng: "-5.8394",
  surfaceHa: "2",
  provinceCode: "",
  communeCode: "",
  preDossierSource: "MANUAL_ENTRY" as PreDossierSource,
  preDossierNote:
    "Pre-dossier technique non decisionnel. Aucun farmer, cooperative ou parcelle n'est cree automatiquement.",
  gravityScore: "",
  frequencyScore: "",
  detectionScore: "",
  useHydroRisk: true,
  useWeatherArchive: true,
  useNdviHistory: false,
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  applicationId: "",
};

export function RaxLivePanel() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistInfo, setPersistInfo] = useState<string | null>(null);
  const [technicalPreDossier, setTechnicalPreDossier] = useState<TechnicalPreDossierState | null>(
    null,
  );
  const [incompleteWarning, setIncompleteWarning] = useState<string | null>(null);
  const [manualScoresRequired, setManualScoresRequired] = useState(false);
  const [crops, setCrops] = useState<Row[]>([]);
  const [provinces, setProvinces] = useState<Row[]>([]);
  const [communes, setCommunes] = useState<Row[]>([]);
  const [applications, setApplications] = useState<Row[]>([]);
  const [result, setResult] = useState<NormalizedRaxResult | null>(null);
  const [rawResultPayload, setRawResultPayload] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  async function load() {
    setLoading(true);
    setError(null);

    const [cropsRes, applicationsRes, provincesRes, communesRes] = await Promise.all([
      getMoroccoCrops(),
      getLiveApplications(),
      getMoroccoProvinces(),
      getMoroccoCommunes(),
    ]);

    setAuthRequired(
      cropsRes.state === "AUTH_REQUIRED" ||
        applicationsRes.state === "AUTH_REQUIRED" ||
        provincesRes.state === "AUTH_REQUIRED" ||
        communesRes.state === "AUTH_REQUIRED",
    );
    setForbidden(
      cropsRes.state === "FORBIDDEN" ||
        applicationsRes.state === "FORBIDDEN" ||
        provincesRes.state === "FORBIDDEN" ||
        communesRes.state === "FORBIDDEN",
    );

    if (cropsRes.ok && cropsRes.data && cropsRes.data.length > 0) {
      setCrops(cropsRes.data);
    } else if (FALLBACK_ENABLED) {
      setCrops(MOROCCO_REFERENCE_FALLBACK.crops);
    } else {
      setCrops([]);
    }

    if (applicationsRes.ok && applicationsRes.data) {
      setApplications(applicationsRes.data);
    } else {
      setApplications([]);
    }

    if (provincesRes.ok && provincesRes.data && provincesRes.data.length > 0) {
      setProvinces(provincesRes.data);
    } else if (FALLBACK_ENABLED) {
      setProvinces(MOROCCO_REFERENCE_FALLBACK.provinces);
    } else {
      setProvinces([]);
    }

    if (communesRes.ok && communesRes.data && communesRes.data.length > 0) {
      setCommunes(communesRes.data);
    } else if (FALLBACK_ENABLED) {
      setCommunes(MOROCCO_REFERENCE_FALLBACK.communes);
    } else {
      setCommunes([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const cropOptions = useMemo(() => {
    return crops
      .map((row) => ({ code: getOptionCode(row), label: getOptionLabel(row) }))
      .filter((row) => Boolean(row.code));
  }, [crops]);

  const provinceOptions = useMemo(() => {
    return provinces
      .map((row) => ({ code: getOptionCode(row), label: getOptionLabel(row) }))
      .filter((row) => Boolean(row.code));
  }, [provinces]);

  const communeOptions = useMemo(() => {
    return communes
      .map((row) => ({ code: getOptionCode(row), label: getOptionLabel(row) }))
      .filter((row) => Boolean(row.code));
  }, [communes]);

  async function onPersistPreDossier() {
    setPersisting(true);
    setPersistInfo(null);
    setError(null);
    setTechnicalPreDossier(null);

    const lat = num(form.lat);
    const lng = num(form.lng);
    const surface = num(form.surfaceHa);

    if (lat === null || lng === null || surface === null) {
      setPersisting(false);
      setError("lat, lng et surfaceHa sont requis pour creer un pre-dossier technique.");
      return;
    }

    const payload: CreateApplicationPayload = {
      country: "MA",
      cropCode: form.cropCode,
      lat,
      lng,
      surfaceHa: surface,
      source: form.preDossierSource,
    };

    if (form.provinceCode) payload.provinceCode = form.provinceCode;
    if (form.communeCode) payload.communeCode = form.communeCode;

    const res = await createLiveApplication(payload);
    setPersisting(false);

    if (!res.ok) {
      if (res.state === "AUTH_REQUIRED") {
        setAuthRequired(true);
        return;
      }
      if (res.state === "FORBIDDEN") {
        setForbidden(true);
        return;
      }
      setError(res.errorMessage ?? "Creation du pre-dossier technique impossible.");
      return;
    }

    const nextTechnicalState = resolveTechnicalPreDossierState(res.data, res.source);
    setTechnicalPreDossier(nextTechnicalState);

    if (nextTechnicalState?.id) {
      setForm((prev) => ({ ...prev, applicationId: nextTechnicalState.id ?? "" }));
    }

    if (nextTechnicalState?.id && nextTechnicalState.persisted === false) {
      setPersistInfo("Pré-dossier technique accepté.");
    } else {
      setPersistInfo("Pré-dossier technique préparé.");
    }
    await load();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setPersistInfo(null);
    setIncompleteWarning(null);
    setResult(null);
    setRawResultPayload(null);

    const gravity = num(form.gravityScore);
    const frequency = num(form.frequencyScore);
    const detection = num(form.detectionScore);
    const lat = num(form.lat);
    const lng = num(form.lng);

    if (lat === null || lng === null) {
      setSubmitting(false);
      setError("lat et lng doivent etre renseignes pour le calcul technique.");
      return;
    }

    if (
      manualScoresRequired &&
      (gravity === null || frequency === null || detection === null)
    ) {
      setSubmitting(false);
      setError(
        "Les scores gravityScore, frequencyScore et detectionScore sont requis pour ce mode technique pré-dossier.",
      );
      return;
    }

    const payload: CalculateRaxPayload = {
      country: "MA",
      cropCode: form.cropCode,
      lat,
      lng,
      useHydroRisk: form.useHydroRisk,
      useWeatherArchive: form.useWeatherArchive,
      useNdviHistory: form.useNdviHistory,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    const surface = num(form.surfaceHa);
    if (surface !== null) payload.surfaceHa = surface;
    if (gravity !== null) payload.gravityScore = gravity;
    if (frequency !== null) payload.frequencyScore = frequency;
    if (detection !== null) payload.detectionScore = detection;
    if (form.applicationId) payload.applicationId = form.applicationId;

    const res = await calculateTechnicalRax(payload);
    setSubmitting(false);

    if (!res.ok || !res.data) {
      if (res.state === "AUTH_REQUIRED") {
        setAuthRequired(true);
      } else if (res.state === "FORBIDDEN") {
        setForbidden(true);
      } else {
        const backendMessage = res.errorMessage ?? "Calcul RAX indisponible.";
        if (
          /required|obligatoire/i.test(backendMessage) &&
          /(gravity|frequency|detection)/i.test(backendMessage)
        ) {
          setManualScoresRequired(true);
        }
        setError(backendMessage);
      }
      return;
    }

    const rawPayload = asRecord(res.data);
    if (DEBUG_API_SHAPES) {
      const rootKeys = rawPayload ? Object.keys(rawPayload) : [];
      const dataKeys = Object.keys(asRecord(rawPayload?.data) ?? {});
      const resultKeys = Object.keys(asRecord(rawPayload?.result) ?? {});
      const evaluationKeys = Object.keys(asRecord(rawPayload?.evaluation) ?? {});
      const technicalRiskKeys = Object.keys(asRecord(rawPayload?.technicalRisk) ?? {});
      const savedEvaluationKeys = Object.keys(asRecord(rawPayload?.savedEvaluation) ?? {});
      console.info("[RAX live payload shape]", {
        rootKeys,
        dataKeys,
        resultKeys,
        evaluationKeys,
        technicalRiskKeys,
        savedEvaluationKeys,
      });
    }

    const normalized = normalizeRaxResult(rawPayload);
    setRawResultPayload(rawPayload);
    setResult(normalized);

    if (!normalized || !normalized.hasCoreMetrics) {
      setIncompleteWarning("Calcul technique indisponible ou incomplet");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Chargement du calcul RAX live...
      </div>
    );
  }

  const warnings = result?.warnings
    ? result.warnings.map((item) => toWarningViewModel(item))
    : [];
  const factors = result?.explanationFactors
    ? result.explanationFactors.map((item) => toFactorViewModel(item))
    : [];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          Calcul RAX technique live
        </h3>
        <SourceBadge source={authRequired ? "UNAVAILABLE" : "LIVE"} />
      </div>
      <p className="text-xs text-slate-300">
        Pre-dossier technique Maroc (phase 28/29): ce parcours prepare un score technique RAX/WRS.
        Ce n&apos;est pas un onboarding farmer/cooperative/parcelle ni une decision assureur.
      </p>

      {authRequired && (
        <AuthRequiredCard description="POST /v1/insurance/rax/calculate est protege et necessite un token backend." />
      )}
      {forbidden && (
        <AccessDeniedCard description="Acces refuse sur le calcul RAX (403). Verifiez le role du JWT." />
      )}

      {error ? <DegradedStateCard description={error} /> : null}
      {incompleteWarning ? <DegradedStateCard description={incompleteWarning} /> : null}
      {manualScoresRequired ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Le backend exige les scores manuels `gravityScore`, `frequencyScore` et
          `detectionScore` pour ce mode technique pre-dossier. Completez-les avant de relancer le
          calcul.
        </div>
      ) : null}
      {persistInfo ? (
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
          {persistInfo}
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-2 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 md:grid-cols-3"
      >
        <div className="md:col-span-3 rounded-lg border border-cyan-400/20 bg-cyan-400/6 px-3 py-2 text-xs text-slate-200">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-cyan-200">
              Pre-dossier technique Maroc
            </p>
            <SourceBadge source={form.preDossierSource} />
            {technicalPreDossier ? (
              <SourceBadge source={technicalPreDossier.source} />
            ) : form.applicationId ? (
              <SourceBadge source="LIVE" />
            ) : (
              <SourceBadge source="MANUAL_ESTIMATE" />
            )}
          </div>
          <p>{form.preDossierNote}</p>
          {technicalPreDossier?.id && technicalPreDossier.persisted === false ? (
            <div className="mt-1 space-y-1 text-slate-300">
              <p>Etat actuel: Pré-dossier technique accepté</p>
              <p>ID technique: {technicalPreDossier.id}</p>
              <p>Persisté en base: Non</p>
              <p>Mode: {str(technicalPreDossier.mode)}</p>
              <p>Statut: {str(technicalPreDossier.status, "DRAFT")}</p>
              {technicalPreDossier.notes ? <p>Notes backend: {technicalPreDossier.notes}</p> : null}
              {technicalPreDossier.sourceDisclosure ? (
                <p>Disclosure source: {technicalPreDossier.sourceDisclosure}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-slate-300">
              {form.applicationId
                ? `Etat actuel: pre-dossier lie a l'applicationId ${form.applicationId}.`
                : "Etat actuel: pre-dossier technique non persiste."}
            </p>
          )}
        </div>

        <label className="text-xs text-slate-300">
          country
          <input
            value="MA"
            disabled
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          cropCode
          <select
            value={form.cropCode}
            onChange={(event) => setForm((prev) => ({ ...prev, cropCode: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          >
            {cropOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code} - {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-slate-300">
          source
          <select
            value={form.preDossierSource}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                preDossierSource: event.target.value as PreDossierSource,
              }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          >
            <option value="MANUAL_ENTRY">MANUAL_ENTRY</option>
            <option value="MANUAL_ESTIMATE">MANUAL_ESTIMATE</option>
          </select>
        </label>

        <label className="text-xs text-slate-300 md:col-span-2">
          note technique
          <textarea
            value={form.preDossierNote}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, preDossierNote: event.target.value }))
            }
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          applicationId (optional)
          <select
            value={form.applicationId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, applicationId: event.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          >
            <option value="">--</option>
            {applications.map((app) => (
              <option key={str(app.id, "")} value={str(app.id, "")}>
                {str(app.reference ?? app.id)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-slate-300">
          lat
          <input
            value={form.lat}
            onChange={(event) => setForm((prev) => ({ ...prev, lat: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            required
          />
        </label>

        <label className="text-xs text-slate-300">
          lng
          <input
            value={form.lng}
            onChange={(event) => setForm((prev) => ({ ...prev, lng: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            required
          />
        </label>

        <label className="text-xs text-slate-300">
          surfaceHa
          <input
            value={form.surfaceHa}
            onChange={(event) => setForm((prev) => ({ ...prev, surfaceHa: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          provinceCode (optional)
          <select
            value={form.provinceCode}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, provinceCode: event.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          >
            <option value="">--</option>
            {provinceOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code} - {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-slate-300">
          communeCode (optional)
          <select
            value={form.communeCode}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, communeCode: event.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          >
            <option value="">--</option>
            {communeOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code} - {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-slate-300">
          gravityScore (optional)
          <input
            value={form.gravityScore}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, gravityScore: event.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          frequencyScore (optional)
          <input
            value={form.frequencyScore}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, frequencyScore: event.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          detectionScore (optional)
          <input
            value={form.detectionScore}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, detectionScore: event.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          startDate
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          endDate
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={form.useHydroRisk}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, useHydroRisk: event.target.checked }))
              }
            />
            useHydroRisk
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={form.useWeatherArchive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, useWeatherArchive: event.target.checked }))
              }
            />
            useWeatherArchive
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={form.useNdviHistory}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, useNdviHistory: event.target.checked }))
              }
            />
            useNdviHistory
          </label>
        </div>

        <div className="md:col-span-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void onPersistPreDossier();
            }}
            disabled={persisting || authRequired}
            className="rounded-full border border-slate-400/20 bg-slate-500/10 px-3 py-2 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {persisting
              ? "Enregistrement..."
              : "Préparer pre-dossier technique (/v1/insurance/applications)"}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Calcul..." : "Calculer RAX/WRS technique"}
          </button>
        </div>
      </form>

      {result ? (
        <div className="space-y-3 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 text-xs text-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-white">Niveau de risque technique</p>
            <SourceBadge source={result.source} />
          </div>
          {result.hasCoreMetrics ? (
            <div className="grid gap-1 md:grid-cols-2">
              <p>gravityScore: {str(result.gravityScore)}</p>
              <p>frequencyScore: {str(result.frequencyScore)}</p>
              <p>detectionScore: {str(result.detectionScore)}</p>
              <p>raxBrut: {str(result.raxBrut)}</p>
              <p>wrs: {str(result.wrs)}</p>
              <p>technicalRiskTier: {str(result.technicalRiskTier)}</p>
              <p>algorithmVersion: {str(result.algorithmVersion)}</p>
              <p>sourceDisclosure: {str(result.sourceDisclosure)}</p>
            </div>
          ) : null}

          {result.note ? (
            <p className="rounded-lg border border-cyan-400/20 bg-cyan-400/8 px-2 py-1.5 text-slate-200">
              Note: {result.note}
            </p>
          ) : null}

          {result.savedEvaluation ? (
            <div className="rounded-lg border border-slate-400/12 bg-slate-900/30 px-2 py-2">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-300">
                  savedEvaluation
                </p>
                <SourceBadge source={result.savedEvaluation.source} />
              </div>
              <div className="grid gap-1 md:grid-cols-2">
                <p>id: {str(result.savedEvaluation.id)}</p>
                <p>status: {str(result.savedEvaluation.status)}</p>
              </div>
            </div>
          ) : null}

          {result.integrationStatus.length > 0 ? (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">
                Provider status
              </p>
              <ul className="space-y-1">
                {result.integrationStatus.map((item) => (
                  <li
                    key={item.key}
                    className="rounded-lg border border-slate-400/10 bg-slate-900/20 px-2 py-2"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{item.key}</p>
                      <SourceBadge source={item.source} />
                      <ConfidenceBadge confidence={item.confidence} />
                    </div>
                    <p>status: {str(item.status)}</p>
                    {item.note ? <p className="mt-1 text-slate-400">note: {item.note}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {factors.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">
                explanationFactors
              </p>
              <ul className="space-y-1">
                {factors.map((factor, index) => (
                  <li key={`factor-${index}`} className="rounded-lg border border-slate-400/10 px-2 py-2">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{factor.label}</p>
                      <SourceBadge source={normalizeSource(factor.source, "LIVE")} />
                      <ConfidenceBadge confidence={factor.confidence} />
                    </div>
                    <div className="grid gap-1 md:grid-cols-3">
                      <p>code: {factor.code}</p>
                      <p>category: {factor.category}</p>
                      <p>weight: {factor.weight}</p>
                    </div>
                    {factor.disclosure ? (
                      <details className="mt-1 text-slate-400">
                        <summary className="cursor-pointer text-slate-300">Note</summary>
                        <p className="mt-1 leading-relaxed">{factor.disclosure}</p>
                      </details>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-orange-300">
                warnings
              </p>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li
                    key={`warn-${index}`}
                    className="rounded-lg border border-orange-400/20 bg-orange-400/10 px-2 py-2 text-orange-200"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <SourceBadge source={normalizeSource(warning.source, "DEGRADED")} />
                      <ConfidenceBadge confidence={warning.confidence} />
                    </div>
                    <p>{warning.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      <EvidenceBundlePanel
        title="Evidence bundle (résultat RAX)"
        applicationId={form.applicationId || undefined}
        entityType="RAX_RESULT"
        entityId={form.applicationId || `geo:${form.lat},${form.lng}`}
        payload={rawResultPayload ?? undefined}
      />

      <DisclosureNote />
    </div>
  );
}
