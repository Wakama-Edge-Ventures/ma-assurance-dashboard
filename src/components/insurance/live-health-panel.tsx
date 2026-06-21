"use client";

import { useEffect, useState } from "react";

import {
  getApiHealth,
  getEvidenceHealth,
  type InsuranceApiResponse,
} from "@/lib/api/insuranceApi";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { SourceBadge } from "@/components/ui/source-badge";

type HealthRecord = Record<string, unknown>;

interface HealthState {
  api: InsuranceApiResponse<HealthRecord>;
  evidence: InsuranceApiResponse<HealthRecord>;
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

function renderStatus(value: boolean | null) {
  if (value === null) return "N/A";
  return value ? "ENABLED" : "DISABLED";
}

export function LiveHealthPanel() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<HealthState | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const [api, evidence] = await Promise.all([getApiHealth(), getEvidenceHealth()]);
      if (!mounted) return;
      setState({ api, evidence });
      setLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Vérification de la santé API en cours...
      </div>
    );
  }

  if (!state) {
    return (
      <DegradedStateCard description="Impossible de charger les statuts /health et /v1/insurance/evidence/health." />
    );
  }

  const evidencePayload = asRecord(state.evidence.data);
  const pinataPayload = asRecord(evidencePayload?.pinata);
  const solanaPayload = asRecord(evidencePayload?.solana);
  const pinataEnabled =
    asBool(evidencePayload?.pinataEnabled) ?? asBool(pinataPayload?.enabled);
  const solanaEnabled =
    asBool(evidencePayload?.solanaEnabled) ?? asBool(solanaPayload?.enabled);
  const cluster = asString(evidencePayload?.cluster) ?? asString(evidencePayload?.solanaCluster);
  const mode =
    asString(evidencePayload?.mode) ??
    asString(evidencePayload?.status) ??
    (state.evidence.state === "DEGRADED" ? "DISABLED_SAFE" : "READY");

  return (
    <div className="space-y-3 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          Santé intégrations live
        </h3>
        <SourceBadge source={state.api.source} />
        <SourceBadge source={state.evidence.source} />
      </div>
      <div className="grid gap-2 text-xs text-slate-300 md:grid-cols-2">
        <p>API status: {state.api.ok ? "UP" : state.api.state}</p>
        <p>Evidence API status: {state.evidence.ok ? "UP" : state.evidence.state}</p>
        <p>Pinata upload: {renderStatus(pinataEnabled)}</p>
        <p>Solana anchoring: {renderStatus(solanaEnabled)}</p>
        <p>Cluster: {cluster ?? "N/A"}</p>
        <p>Mode: {mode}</p>
      </div>
      {(state.api.state === "DEGRADED" || state.evidence.state === "DEGRADED") && (
        <DegradedStateCard description="Le backend répond en mode dégradé (DISABLED_SAFE), l’UI reste non bloquante." />
      )}
      <DisclosureNote variant="blockchain" />
    </div>
  );
}
