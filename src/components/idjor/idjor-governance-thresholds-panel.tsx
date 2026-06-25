"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, SlidersHorizontal } from "lucide-react";

import {
  getIdjorGovernanceThresholds,
  updateIdjorGovernanceThresholds,
} from "@/lib/api/insuranceApi";

interface ThresholdField {
  key: string;
  labelFr: string;
  unit: string;
  description: string;
  governanceNote: string;
  min: number;
  max: number;
  defaultValue: number;
  value: number;
}

type PanelStatus = "loading" | "ready" | "unavailable";
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

const READ_ONLY_PREVIEW = [
  "Qualité documentaire",
  "Complétude dossier",
  "Déclenchement investigation terrain",
  "Revue humaine obligatoire",
  "Tolérance surface déclarée",
];

function asFieldArray(value: unknown): ThresholdField[] | null {
  if (!Array.isArray(value)) return null;
  const fields = value.filter(
    (item): item is ThresholdField =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as ThresholdField).key === "string" &&
      typeof (item as ThresholdField).value === "number",
  );
  return fields.length > 0 ? fields : null;
}

function DoctrineNote() {
  return (
    <p className="rounded border border-amber-300/20 bg-amber-300/10 px-2.5 py-1.5 text-[10px] font-semibold leading-snug text-amber-100">
      Ces seuils préparent la revue. Ils ne déclenchent aucune décision automatique.
    </p>
  );
}

export function IdjorGovernanceThresholdsPanel({ tenantKey }: { tenantKey: string }) {
  const [status, setStatus] = useState<PanelStatus>("loading");
  const [fields, setFields] = useState<ThresholdField[] | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [canWrite, setCanWrite] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setStatus("loading");
      const res = await getIdjorGovernanceThresholds(tenantKey);
      if (!mounted) return;

      const loadedFields = res.ok ? asFieldArray((res.data as Record<string, unknown>)?.fields) : null;

      if (!res.ok || !loadedFields) {
        setStatus("unavailable");
        setMessage(res.errorMessage ?? `Réponse inattendue (${res.state}).`);
        return;
      }

      setFields(loadedFields);
      setDraft(Object.fromEntries(loadedFields.map((field) => [field.key, field.value])));
      setCanWrite(Boolean((res.data as Record<string, unknown>)?.canWrite));
      setUpdatedAt(((res.data as Record<string, unknown>)?.updatedAt as string | null) ?? null);
      setSaveState("idle");
      setStatus("ready");
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [tenantKey]);

  const isDirty = useMemo(() => {
    if (!fields) return false;
    return fields.some((field) => draft[field.key] !== field.value);
  }, [fields, draft]);

  function onChange(key: string, value: number) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaveState("dirty");
  }

  function onReset() {
    if (!fields) return;
    setDraft(Object.fromEntries(fields.map((field) => [field.key, field.value])));
    setSaveState("idle");
    setMessage(null);
  }

  async function onSave() {
    if (!fields) return;
    const patch = Object.fromEntries(
      fields
        .filter((field) => draft[field.key] !== field.value)
        .map((field) => [field.key, draft[field.key]]),
    );

    if (Object.keys(patch).length === 0) return;

    setSaveState("saving");
    setMessage(null);
    const res = await updateIdjorGovernanceThresholds(tenantKey, patch);

    if (!res.ok) {
      setSaveState("error");
      setMessage(res.errorMessage ?? `Échec de l'enregistrement (${res.state}).`);
      return;
    }

    const savedFields = asFieldArray((res.data as Record<string, unknown>)?.fields);
    if (savedFields) {
      setFields(savedFields);
      setDraft(Object.fromEntries(savedFields.map((field) => [field.key, field.value])));
    }
    setUpdatedAt(((res.data as Record<string, unknown>)?.updatedAt as string | null) ?? null);
    setSaveState("saved");
  }

  return (
    <div className="space-y-2.5 rounded border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-100" />
        <h3 className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Seuils de gouvernance
        </h3>
      </div>

      {status === "loading" ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="h-8 animate-pulse rounded bg-slate-800/80" />
          ))}
        </div>
      ) : null}

      {status === "unavailable" ? (
        <div className="space-y-2">
          <div className="rounded border border-amber-300/25 bg-amber-300/10 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-100">
              <Lock className="h-3 w-3" />
              Configuration gouvernée à connecter
            </p>
            <p className="mt-1 text-[10px] leading-snug text-amber-100/80">
              Route de seuils non disponible pour ce tenant. {message}
            </p>
          </div>
          <div className="space-y-1.5">
            {READ_ONLY_PREVIEW.map((label) => (
              <div key={label} className="flex items-center justify-between gap-2 rounded border border-white/10 bg-slate-950/40 px-2 py-1.5">
                <span className="text-[10px] font-semibold text-slate-300">{label}</span>
                <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-slate-500">
                  Lecture seule
                </span>
              </div>
            ))}
          </div>
          <DoctrineNote />
        </div>
      ) : null}

      {status === "ready" && fields ? (
        <div className="space-y-3">
          {!canWrite ? (
            <p className="flex items-center gap-1.5 rounded border border-white/10 bg-slate-950/40 px-2.5 py-1.5 text-[10px] font-semibold text-slate-400">
              <Lock className="h-3 w-3" />
              Lecture seule - droits insuffisants pour modifier ces seuils.
            </p>
          ) : null}

          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-[10.5px] font-semibold text-slate-200">
                <span title={field.description}>{field.labelFr}</span>
                <span className="font-mono tabular-nums text-cyan-100">
                  {draft[field.key]}
                  {field.unit}
                </span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={draft[field.key] ?? field.value}
                disabled={!canWrite}
                onChange={(event) => onChange(field.key, Number(event.target.value))}
                aria-label={field.labelFr}
                className="h-1.5 w-full appearance-none rounded-full bg-slate-800 accent-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-[9.5px] leading-snug text-slate-500">{field.governanceNote}</p>
            </div>
          ))}

          <DoctrineNote />

          {canWrite ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void onSave()}
                disabled={!isDirty || saveState === "saving"}
                className="rounded bg-emerald-500 px-3 py-1.5 text-[10.5px] font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enregistrer les seuils
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={!isDirty || saveState === "saving"}
                className="rounded border border-white/10 bg-slate-950/40 px-3 py-1.5 text-[10.5px] font-bold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Réinitialiser
              </button>
              <span className="text-[10px] font-semibold text-slate-400">
                {saveState === "saving" ? "Enregistrement..." : null}
                {saveState === "saved" && updatedAt
                  ? `Enregistré le ${DATE_FORMAT.format(new Date(updatedAt))}`
                  : null}
                {saveState === "dirty" ? "Non enregistré" : null}
                {saveState === "idle" && updatedAt
                  ? `Dernière mise à jour: ${DATE_FORMAT.format(new Date(updatedAt))}`
                  : null}
              </span>
            </div>
          ) : null}

          {saveState === "error" && message ? (
            <p className="rounded border border-rose-300/25 bg-rose-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-rose-100">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
