"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import {
  createLiveMission,
  getLiveApplications,
  getLiveMissions,
  type CreateMissionPayload,
} from "@/lib/api/insuranceApi";
import { normalizeSource } from "@/lib/data-source";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { EmptyLiveDataCard } from "@/components/ui/empty-live-data-card";
import { SourceBadge } from "@/components/ui/source-badge";

type Row = Record<string, unknown>;

const DEFAULT_FORM: {
  applicationId: string;
  missionType: CreateMissionPayload["missionType"];
  agentUserId: string;
  scheduledAt: string;
  notes: string;
} = {
  applicationId: "",
  missionType: "FIELD_AUDIT",
  agentUserId: "",
  scheduledAt: "",
  notes: "",
};

function readString(value: unknown, fallback = "N/A") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

export function MissionsLivePanel() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missions, setMissions] = useState<Row[]>([]);
  const [applications, setApplications] = useState<Row[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [missionsRes, applicationsRes] = await Promise.all([
      getLiveMissions(),
      getLiveApplications(),
    ]);

    const requiresAuth =
      missionsRes.state === "AUTH_REQUIRED" || applicationsRes.state === "AUTH_REQUIRED";
    const hasForbidden =
      missionsRes.state === "FORBIDDEN" || applicationsRes.state === "FORBIDDEN";
    setAuthRequired(requiresAuth);
    setForbidden(hasForbidden);

    if (missionsRes.ok && missionsRes.data) {
      setMissions(missionsRes.data);
    } else {
      setMissions([]);
      if (!requiresAuth && missionsRes.errorMessage) setError(missionsRes.errorMessage);
    }

    if (applicationsRes.ok && applicationsRes.data) {
      const appRows = applicationsRes.data;
      setApplications(appRows);
      if (!form.applicationId && appRows[0]?.id) {
        setForm((prev) => ({ ...prev, applicationId: readString(appRows[0].id, "") }));
      }
    } else {
      setApplications([]);
    }

    setLoading(false);
  }, [form.applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.applicationId) return;

    setSubmitting(true);
    setError(null);

    const payload: CreateMissionPayload = {
      applicationId: form.applicationId,
      missionType: form.missionType,
    };
    if (form.agentUserId) payload.agentUserId = form.agentUserId;
    if (form.scheduledAt) payload.scheduledAt = form.scheduledAt;
    if (form.notes) payload.notes = form.notes;

    const res = await createLiveMission(payload);
    setSubmitting(false);

    if (!res.ok) {
      if (res.state === "AUTH_REQUIRED") {
        setAuthRequired(true);
      } else if (res.state === "FORBIDDEN") {
        setForbidden(true);
      } else {
        setError(res.errorMessage ?? "Création mission impossible");
      }
      return;
    }

    setForm((prev) => ({ ...DEFAULT_FORM, applicationId: prev.applicationId }));
    await load();
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Chargement des missions live...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          Missions live
        </h3>
        <SourceBadge source={authRequired ? "UNAVAILABLE" : "LIVE"} />
      </div>

      {authRequired && (
        <AuthRequiredCard description="GET /v1/insurance/missions et POST /v1/insurance/missions exigent un token backend." />
      )}
      {forbidden && (
        <AccessDeniedCard description="Acces refuse sur les routes missions (403). Verifiez le role du JWT." />
      )}

      {!authRequired && applications.length === 0 && (
        <EmptyLiveDataCard description="Aucune application live disponible. Créez d’abord un pré-dossier technique." />
      )}

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      {!authRequired && applications.length > 0 ? (
        <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 p-3 md:grid-cols-2">
          <p className="md:col-span-2 text-xs text-slate-300">
            Création mission live (sans mission fictive).
          </p>

          <label className="text-xs text-slate-300">
            applicationId
            <select
              value={form.applicationId}
              onChange={(event) => setForm((prev) => ({ ...prev, applicationId: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
              required
            >
              {applications.map((row) => {
                const id = readString(row.id, "");
                const ref = readString(row.reference, id);
                return (
                  <option key={id} value={id}>
                    {ref}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="text-xs text-slate-300">
            missionType
            <select
              value={form.missionType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  missionType: event.target.value as CreateMissionPayload["missionType"],
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            >
              <option value="FIELD_AUDIT">FIELD_AUDIT</option>
              <option value="CLAIM_INSPECTION">CLAIM_INSPECTION</option>
              <option value="PARCEL_VERIFICATION">PARCEL_VERIFICATION</option>
            </select>
          </label>

          <label className="text-xs text-slate-300">
            agentUserId (optional)
            <input
              value={form.agentUserId}
              onChange={(event) => setForm((prev) => ({ ...prev, agentUserId: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            />
          </label>

          <label className="text-xs text-slate-300">
            scheduledAt (optional)
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            />
          </label>

          <label className="text-xs text-slate-300 md:col-span-2">
            notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-xs"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer mission live"}
          </button>
        </form>
      ) : null}

      {!authRequired && missions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-400/10 text-slate-500">
                <th className="px-2 py-2">id</th>
                <th className="px-2 py-2">applicationId</th>
                <th className="px-2 py-2">missionType</th>
                <th className="px-2 py-2">scheduledAt</th>
                <th className="px-2 py-2">source</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((row, index) => (
                <tr key={`${readString(row.id, String(index))}-${index}`} className="border-b border-slate-400/6 last:border-0">
                  <td className="px-2 py-2">{readString(row.id)}</td>
                  <td className="px-2 py-2">{readString(row.applicationId)}</td>
                  <td className="px-2 py-2">{readString(row.missionType)}</td>
                  <td className="px-2 py-2">{readString(row.scheduledAt)}</td>
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
