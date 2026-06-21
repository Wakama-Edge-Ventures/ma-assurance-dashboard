"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createApplicationEvidenceBundle,
  createEvidenceBundle,
  getEvidenceHealth,
} from "@/lib/api/insuranceApi";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { SourceBadge } from "@/components/ui/source-badge";

interface EvidenceBundlePanelProps {
  title?: string;
  applicationId?: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function EvidenceBundlePanel({
  title = "Evidence bundle",
  applicationId,
  entityType = "TECHNICAL_RECORD",
  entityId,
  payload,
}: EvidenceBundlePanelProps) {
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabledReason = useMemo(() => {
    if (applicationId || entityId || payload) return null;
    return "Aucune entite liee. Creez ou selectionnez un dossier pour generer un bundle.";
  }, [applicationId, entityId, payload]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingHealth(true);
      const res = await getEvidenceHealth();
      if (!mounted) return;
      setHealth(asRecord(res.data));
      setLoadingHealth(false);
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function onCreateGenericBundle() {
    setBusy(true);
    setError(null);
    const res = await createEvidenceBundle({
      entityType,
      entityId: entityId ?? applicationId ?? "UNDEFINED_ENTITY",
      metadata: payload ?? {},
    });
    setBusy(false);

    if (!res.ok || !res.data) {
      if (res.state === "AUTH_REQUIRED") {
        setError("Authentification backend requise pour generer un bundle.");
        return;
      }
      if (res.state === "FORBIDDEN") {
        setError("Acces refuse pour la generation de bundle (403).");
        return;
      }
      setError(res.errorMessage ?? "Erreur de generation de bundle.");
      return;
    }
    setResult(asRecord(res.data));
  }

  async function onCreateApplicationBundle() {
    if (!applicationId) return;
    setBusy(true);
    setError(null);
    const res = await createApplicationEvidenceBundle(applicationId);
    setBusy(false);

    if (!res.ok || !res.data) {
      if (res.state === "AUTH_REQUIRED") {
        setError("Authentification backend requise pour generer le bundle applicatif.");
        return;
      }
      if (res.state === "FORBIDDEN") {
        setError("Acces refuse pour le bundle applicatif (403).");
        return;
      }
      setError(res.errorMessage ?? "Erreur de generation de bundle applicatif.");
      return;
    }
    setResult(asRecord(res.data));
  }

  if (error?.includes("Authentification backend requise")) {
    return <AuthRequiredCard description={error} />;
  }
  if (error?.includes("Acces refuse")) {
    return <AccessDeniedCard description={error} />;
  }

  const pinataEnabled = asBool(health?.pinataEnabled) ?? asBool(asRecord(health?.pinata)?.enabled);
  const solanaEnabled = asBool(health?.solanaEnabled) ?? asBool(asRecord(health?.solana)?.enabled);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">{title}</h3>
        <SourceBadge source="LIVE" />
      </div>

      <div className="grid gap-1 text-xs text-slate-300 md:grid-cols-2">
        <p>Pinata health: {loadingHealth ? "..." : pinataEnabled ? "ENABLED" : "DISABLED"}</p>
        <p>Solana health: {loadingHealth ? "..." : solanaEnabled ? "ENABLED" : "DISABLED"}</p>
      </div>

      {disabledReason ? (
        <p className="rounded-xl border border-slate-400/10 bg-[#0b1422]/70 px-3 py-2 text-xs text-slate-300">
          {disabledReason}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onCreateGenericBundle()}
            disabled={busy}
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generer bundle generique
          </button>
          <button
            type="button"
            onClick={() => void onCreateApplicationBundle()}
            disabled={busy || !applicationId}
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generer bundle application
          </button>
        </div>
      )}

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="grid gap-1 rounded-xl border border-slate-400/10 bg-[#0b1422]/70 px-3 py-2 text-xs text-slate-200">
          <p>bundleId: {asString(result.bundleId) ?? asString(result.id) ?? "N/A"}</p>
          <p>bundleHash: {asString(result.bundleHash) ?? asString(result.hash) ?? "N/A"}</p>
          <p>
            anchorStatus: {" "}
            {asString(result.anchorStatus) ?? asString(result.status) ?? "PENDING"}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-slate-400">
        Generation non bloquante: le dossier continue son flux meme si l&apos;ancrage est differe.
      </p>
      <DisclosureNote variant="blockchain" />
    </div>
  );
}
