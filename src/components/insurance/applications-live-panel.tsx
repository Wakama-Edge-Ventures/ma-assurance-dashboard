"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createLiveApplication,
  getLiveApplications,
  getMoroccoCommunes,
  getMoroccoCrops,
  getMoroccoProvinces,
  getMoroccoRegions,
  shouldUseInsuranceDemoFallback,
  type CreateApplicationPayload,
} from "@/lib/api/insuranceApi";
import { MOROCCO_REFERENCE_FALLBACK } from "@/lib/insurance-live-fallback";
import { normalizeSource } from "@/lib/data-source";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { EmptyLiveDataCard } from "@/components/ui/empty-live-data-card";
import { SourceBadge } from "@/components/ui/source-badge";

type Row = Record<string, unknown>;

const FALLBACK_ENABLED = shouldUseInsuranceDemoFallback();

function readString(value: unknown, fallback = "N/A") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return fallback;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function getOptionCode(row: Row) {
  return readString(row.code ?? row.cropCode ?? row.id, "");
}

function getOptionLabel(row: Row) {
  return readString(row.label ?? row.name ?? row.code, "N/A");
}

const DEFAULT_FORM = {
  cropCode: "BLE_DUR",
  lat: "34.9417",
  lng: "-5.8394",
  surfaceHa: "2",
  regionCode: "",
  provinceCode: "",
  communeCode: "",
  requestedCoverageAmount: "",
};

export function ApplicationsLivePanel() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applications, setApplications] = useState<Row[]>([]);
  const [crops, setCrops] = useState<Row[]>([]);
  const [regions, setRegions] = useState<Row[]>([]);
  const [provinces, setProvinces] = useState<Row[]>([]);
  const [communes, setCommunes] = useState<Row[]>([]);
  const [authRequired, setAuthRequired] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  async function load() {
    setLoading(true);
    setError(null);

    const [
      applicationsRes,
      cropsRes,
      regionsRes,
      provincesRes,
      communesRes,
    ] = await Promise.all([
      getLiveApplications(),
      getMoroccoCrops(),
      getMoroccoRegions(),
      getMoroccoProvinces(),
      getMoroccoCommunes(),
    ]);

    const requiresAuth =
      applicationsRes.state === "AUTH_REQUIRED" ||
      cropsRes.state === "AUTH_REQUIRED" ||
      regionsRes.state === "AUTH_REQUIRED" ||
      provincesRes.state === "AUTH_REQUIRED" ||
      communesRes.state === "AUTH_REQUIRED";
    const hasForbidden =
      applicationsRes.state === "FORBIDDEN" ||
      cropsRes.state === "FORBIDDEN" ||
      regionsRes.state === "FORBIDDEN" ||
      provincesRes.state === "FORBIDDEN" ||
      communesRes.state === "FORBIDDEN";

    setAuthRequired(requiresAuth);
    setForbidden(hasForbidden);

    if (applicationsRes.ok && applicationsRes.data) {
      setApplications(applicationsRes.data);
    } else {
      setApplications([]);
      if (!requiresAuth && applicationsRes.errorMessage) {
        setError(applicationsRes.errorMessage);
      }
    }

    if (cropsRes.ok && cropsRes.data && cropsRes.data.length > 0) {
      setCrops(cropsRes.data);
    } else if (FALLBACK_ENABLED) {
      setCrops(MOROCCO_REFERENCE_FALLBACK.crops);
    } else {
      setCrops([]);
    }

    if (regionsRes.ok && regionsRes.data && regionsRes.data.length > 0) {
      setRegions(regionsRes.data);
    } else if (FALLBACK_ENABLED) {
      setRegions(MOROCCO_REFERENCE_FALLBACK.regions);
    } else {
      setRegions([]);
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
    return crops.map((row) => ({ code: getOptionCode(row), label: getOptionLabel(row) }));
  }, [crops]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CreateApplicationPayload = {
      country: "MA",
      cropCode: form.cropCode,
      lat: Number(form.lat),
      lng: Number(form.lng),
      surfaceHa: Number(form.surfaceHa),
      source: "MANUAL_ENTRY",
    };

    if (form.regionCode) payload.regionCode = form.regionCode;
    if (form.provinceCode) payload.provinceCode = form.provinceCode;
    if (form.communeCode) payload.communeCode = form.communeCode;
    const coverage = readNumber(form.requestedCoverageAmount);
    if (coverage !== null) payload.requestedCoverageAmount = coverage;

    const res = await createLiveApplication(payload);
    setSubmitting(false);

    if (!res.ok) {
      if (res.state === "AUTH_REQUIRED") {
        setAuthRequired(true);
      } else if (res.state === "FORBIDDEN") {
        setForbidden(true);
      } else {
        setError(res.errorMessage ?? "Création impossible");
      }
      return;
    }

    setForm(DEFAULT_FORM);
    await load();
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Chargement des dossiers assurance live...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          Dossiers assurance live
        </h3>
        <SourceBadge source={authRequired ? "UNAVAILABLE" : "LIVE"} />
      </div>

      {authRequired ? (
        <AuthRequiredCard description="GET /v1/insurance/applications est protégé. Aucun faux dossier live n’est affiché sans token backend." />
      ) : null}
      {forbidden ? (
        <AccessDeniedCard description="Acces refuse sur les routes applications (403). Verifiez le role du JWT." />
      ) : null}

      {!authRequired && applications.length === 0 ? (
        <EmptyLiveDataCard description="Les dossiers assurance live ne sont pas encore créés. Le socle backend Maroc est prêt." />
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 md:grid-cols-2">
        <p className="md:col-span-2 text-xs text-slate-300">
          Créer pré-dossier technique (source MANUAL_ENTRY, sans création automatique d’agriculteur).
        </p>

        <label className="text-xs text-slate-300">
          Country
          <input value="MA" disabled className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
        </label>

        <label className="text-xs text-slate-300">
          cropCode
          <select
            value={form.cropCode}
            onChange={(event) => setForm((prev) => ({ ...prev, cropCode: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            required
          >
            {cropOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code} - {option.label}
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
            required
          />
        </label>
        <label className="text-xs text-slate-300">
          requestedCoverageAmount (optional)
          <input
            value={form.requestedCoverageAmount}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, requestedCoverageAmount: event.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          />
        </label>

        <label className="text-xs text-slate-300">
          regionCode (optional)
          <select
            value={form.regionCode}
            onChange={(event) => setForm((prev) => ({ ...prev, regionCode: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          >
            <option value="">--</option>
            {regions.map((row) => (
              <option key={getOptionCode(row)} value={getOptionCode(row)}>
                {getOptionCode(row)} - {getOptionLabel(row)}
              </option>
            ))}
          </select>
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
            {provinces.map((row) => (
              <option key={getOptionCode(row)} value={getOptionCode(row)}>
                {getOptionCode(row)} - {getOptionLabel(row)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-slate-300">
          communeCode (optional)
          <select
            value={form.communeCode}
            onChange={(event) => setForm((prev) => ({ ...prev, communeCode: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
          >
            <option value="">--</option>
            {communes.map((row) => (
              <option key={getOptionCode(row)} value={getOptionCode(row)}>
                {getOptionCode(row)} - {getOptionLabel(row)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Création..." : "Créer pré-dossier technique"}
        </button>
      </form>

      {!authRequired && applications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-400/10 text-slate-500">
                <th className="px-2 py-2">id</th>
                <th className="px-2 py-2">cropCode</th>
                <th className="px-2 py-2">lat</th>
                <th className="px-2 py-2">lng</th>
                <th className="px-2 py-2">surfaceHa</th>
                <th className="px-2 py-2">source</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((row, index) => (
                <tr key={`${readString(row.id, String(index))}-${index}`} className="border-b border-slate-400/6 last:border-0">
                  <td className="px-2 py-2">{readString(row.id ?? row.reference)}</td>
                  <td className="px-2 py-2">{readString(row.cropCode ?? row.cropType)}</td>
                  <td className="px-2 py-2">{readString(row.lat)}</td>
                  <td className="px-2 py-2">{readString(row.lng)}</td>
                  <td className="px-2 py-2">{readString(row.surfaceHa ?? row.areaHa)}</td>
                  <td className="px-2 py-2">
                    <SourceBadge source={normalizeSource(row.source, "LIVE")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <DisclosureNote />
    </div>
  );
}
