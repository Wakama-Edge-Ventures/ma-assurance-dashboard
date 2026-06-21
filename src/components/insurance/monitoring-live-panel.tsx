"use client";

import { FormEvent, useState } from "react";

import {
  getHydroRisk,
  getNdviHistory,
  getWeatherArchive,
  type InsuranceApiResponse,
} from "@/lib/api/insuranceApi";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { SourceBadge } from "@/components/ui/source-badge";

type RecordData = Record<string, unknown>;

function str(value: unknown, fallback = "N/A") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

const now = new Date();
const endDate = now.toISOString().slice(0, 10);
const startDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)
  .toISOString()
  .slice(0, 10);

export function MonitoringLivePanel() {
  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState("34.9417");
  const [lng, setLng] = useState("-5.8394");
  const [radiusKm, setRadiusKm] = useState("25");
  const [cropCode, setCropCode] = useState("BLE_DUR");
  const [rangeStart, setRangeStart] = useState(startDate);
  const [rangeEnd, setRangeEnd] = useState(endDate);
  const [hydro, setHydro] = useState<InsuranceApiResponse<RecordData> | null>(null);
  const [weather, setWeather] = useState<InsuranceApiResponse<RecordData> | null>(null);
  const [ndvi, setNdvi] = useState<InsuranceApiResponse<RecordData> | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const [hydroRes, weatherRes, ndviRes] = await Promise.all([
      getHydroRisk({
        lat: Number(lat),
        lng: Number(lng),
        radiusKm: Number(radiusKm),
      }),
      getWeatherArchive({
        lat: Number(lat),
        lng: Number(lng),
        startDate: rangeStart,
        endDate: rangeEnd,
      }),
      getNdviHistory({
        lat: Number(lat),
        lng: Number(lng),
        startDate: rangeStart,
        endDate: rangeEnd,
      }),
    ]);

    setHydro(hydroRes);
    setWeather(weatherRes);
    setNdvi(ndviRes);

    const requiresAuth =
      hydroRes.state === "AUTH_REQUIRED" ||
      weatherRes.state === "AUTH_REQUIRED" ||
      ndviRes.state === "AUTH_REQUIRED";
    const hasForbidden =
      hydroRes.state === "FORBIDDEN" ||
      weatherRes.state === "FORBIDDEN" ||
      ndviRes.state === "FORBIDDEN";
    setAuthRequired(requiresAuth);
    setForbidden(hasForbidden);

    if (!requiresAuth) {
      const err =
        (!hydroRes.ok && hydroRes.errorMessage) ||
        (!weatherRes.ok && weatherRes.errorMessage) ||
        (!ndviRes.ok && ndviRes.errorMessage) ||
        null;
      setError(err);
    }

    setLoading(false);
  }

  const hydroRecord = asRecord(hydro?.data);
  const weatherRecord = asRecord(weather?.data);
  const ndviRecord = asRecord(ndvi?.data);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          Monitoring hydro / météo / NDVI live
        </h3>
        <SourceBadge source={authRequired ? "UNAVAILABLE" : "LIVE"} />
      </div>

      <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 md:grid-cols-3">
        <label className="text-xs text-slate-300">
          lat
          <input value={lat} onChange={(event) => setLat(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
        </label>
        <label className="text-xs text-slate-300">
          lng
          <input value={lng} onChange={(event) => setLng(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
        </label>
        <label className="text-xs text-slate-300">
          radiusKm
          <input value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
        </label>
        <label className="text-xs text-slate-300">
          startDate
          <input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
        </label>
        <label className="text-xs text-slate-300">
          endDate
          <input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
        </label>
        <label className="text-xs text-slate-300">
          crop pilote
          <input value={cropCode} onChange={(event) => setCropCode(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs" />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Charger signaux live"}
        </button>
      </form>

      {authRequired && (
        <AuthRequiredCard description="Les endpoints hydro/weather/ndvi live sont protégés. Ajoutez un token backend pour activer les données live." />
      )}
      {forbidden && (
        <AccessDeniedCard description="Acces refuse sur le monitoring live (403). Verifiez le role du JWT." />
      )}

      {error ? <DegradedStateCard description={error} /> : null}

      {hydro ? (
        <div className="rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 text-xs text-slate-200">
          <div className="mb-2 flex items-center gap-2">
            <p className="font-medium text-white">Hydro risk</p>
            <SourceBadge source={hydro.source} />
          </div>
          <p>confidence: {str(hydroRecord?.confidence ?? hydroRecord?.hydroConfidence ?? "LOW")}</p>
          <p>riskLevel: {str(hydroRecord?.riskLevel ?? hydroRecord?.technicalRiskTier)}</p>
          <p>details: {str(hydroRecord?.summary ?? hydroRecord?.message)}</p>
        </div>
      ) : null}

      {weather ? (
        weather.state === "DEGRADED" || weather.state === "UNAVAILABLE" ? (
          <DegradedStateCard description="Weather en mode DEGRADED/UNAVAILABLE. La visualisation reste non bloquante." />
        ) : (
          <div className="rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 text-xs text-slate-200">
            <div className="mb-2 flex items-center gap-2">
              <p className="font-medium text-white">Weather archive</p>
              <SourceBadge source={weather.source} />
            </div>
            <p>status: {weather.state}</p>
            <p>records: {str(weatherRecord?.count ?? weatherRecord?.records ?? "N/A")}</p>
          </div>
        )
      ) : null}

      {ndvi ? (
        ndvi.state === "UNAVAILABLE" || ndvi.state === "AUTH_REQUIRED" ? (
          <DegradedStateCard description="NDVI actuellement UNAVAILABLE. Aucun affichage ne prétend une disponibilité Copernicus live." />
        ) : (
          <div className="rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 text-xs text-slate-200">
            <div className="mb-2 flex items-center gap-2">
              <p className="font-medium text-white">NDVI history</p>
              <SourceBadge source={ndvi.source} />
            </div>
            <p>status: {ndvi.state}</p>
            <p>records: {str(ndviRecord?.count ?? ndviRecord?.records ?? "N/A")}</p>
          </div>
        )
      ) : null}

      <DisclosureNote />
    </div>
  );
}
