"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  calculateTechnicalRax,
  getLiveApplications,
  getMoroccoCrops,
  shouldUseInsuranceDemoFallback,
  type CalculateRaxPayload,
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

type Row = Record<string, unknown>;

const FALLBACK_ENABLED = shouldUseInsuranceDemoFallback();

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

function parseConfidence(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim().toUpperCase();
}

function shortText(value: unknown, fallback = "N/A") {
  const raw = str(value, fallback);
  if (raw.length <= 120) return raw;
  return `${raw.slice(0, 117)}...`;
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
  const [authRequired, setAuthRequired] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crops, setCrops] = useState<Row[]>([]);
  const [applications, setApplications] = useState<Row[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  async function load() {
    setLoading(true);
    setError(null);

    const [cropsRes, applicationsRes] = await Promise.all([
      getMoroccoCrops(),
      getLiveApplications(),
    ]);

    setAuthRequired(
      cropsRes.state === "AUTH_REQUIRED" || applicationsRes.state === "AUTH_REQUIRED",
    );
    setForbidden(cropsRes.state === "FORBIDDEN" || applicationsRes.state === "FORBIDDEN");

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

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const cropOptions = useMemo(() => {
    return crops.map((row) => {
      const code = str(row.code ?? row.cropCode ?? row.id, "");
      return { code, label: str(row.label ?? row.name ?? code, code) };
    });
  }, [crops]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const payload: CalculateRaxPayload = {
      country: "MA",
      cropCode: form.cropCode,
      lat: Number(form.lat),
      lng: Number(form.lng),
      useHydroRisk: form.useHydroRisk,
      useWeatherArchive: form.useWeatherArchive,
      useNdviHistory: form.useNdviHistory,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    const surface = num(form.surfaceHa);
    if (surface !== null) payload.surfaceHa = surface;
    const gravity = num(form.gravityScore);
    if (gravity !== null) payload.gravityScore = gravity;
    const frequency = num(form.frequencyScore);
    if (frequency !== null) payload.frequencyScore = frequency;
    const detection = num(form.detectionScore);
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
        setError(res.errorMessage ?? "Calcul RAX indisponible.");
      }
      return;
    }

    setResult(asRecord(res.data) ?? null);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Chargement du calcul RAX live...
      </div>
    );
  }

  const row = result ?? {};
  const warnings = Array.isArray(row.warnings) ? row.warnings.map((item) => toWarningViewModel(item)) : [];
  const factors = Array.isArray(row.explanationFactors)
    ? row.explanationFactors.map((item) => toFactorViewModel(item))
    : [];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          Calcul RAX technique live
        </h3>
        <SourceBadge source={authRequired ? "UNAVAILABLE" : "LIVE"} />
      </div>

      {authRequired && (
        <AuthRequiredCard description="POST /v1/insurance/rax/calculate est protégé et nécessite un token backend." />
      )}
      {forbidden && (
        <AccessDeniedCard description="Acces refuse sur le calcul RAX (403). Verifiez le role du JWT." />
      )}

      {error ? <DegradedStateCard description={error} /> : null}

      <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 md:grid-cols-3">
        <label className="text-xs text-slate-300">
          country
          <input value="MA" disabled className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
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
          applicationId (optional)
          <select
            value={form.applicationId}
            onChange={(event) => setForm((prev) => ({ ...prev, applicationId: event.target.value }))}
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
          surfaceHa (optional)
          <input
            value={form.surfaceHa}
            onChange={(event) => setForm((prev) => ({ ...prev, surfaceHa: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          gravityScore (optional)
          <input
            value={form.gravityScore}
            onChange={(event) => setForm((prev) => ({ ...prev, gravityScore: event.target.value }))}
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

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Calcul..." : "Calculer RAX technique"}
        </button>
      </form>

      {result ? (
        <div className="space-y-3 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 text-xs text-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-white">Niveau de risque technique</p>
            <SourceBadge source="LIVE" />
          </div>
          <div className="grid gap-1 md:grid-cols-2">
            <p>gravityScore: {str(row.gravityScore ?? row.gravity)}</p>
            <p>frequencyScore: {str(row.frequencyScore ?? row.frequency)}</p>
            <p>detectionScore: {str(row.detectionScore ?? row.detection)}</p>
            <p>raxBrut: {str(row.raxBrut ?? row.raxScore)}</p>
            <p>wrs: {str(row.wrs ?? row.wrsScore)}</p>
            <p>technicalRiskTier: {str(row.technicalRiskTier ?? row.riskTier)}</p>
            <p>algorithmVersion: {str(row.algorithmVersion)}</p>
            <p>sourceDisclosure: {str(row.sourceDisclosure ?? row.disclosure)}</p>
          </div>

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
        payload={result ?? undefined}
      />

      <DisclosureNote />
    </div>
  );
}
