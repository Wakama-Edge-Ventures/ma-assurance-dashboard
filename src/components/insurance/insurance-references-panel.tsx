"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getInsuranceAlertThresholds,
  getInsuranceClaimCauses,
  getInsuranceClaimStatuses,
  getInsurancePricingParameters,
  getInsuranceRaxParameters,
  getInsuranceReferences,
  getInsuranceThreats,
  getInsuranceVulnerabilities,
  shouldUseInsuranceDemoFallback,
  type InsuranceApiResponse,
} from "@/lib/api/insuranceApi";
import { INSURANCE_REFERENCES_FALLBACK } from "@/lib/insurance-live-fallback";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { EmptyLiveDataCard } from "@/components/ui/empty-live-data-card";
import { SourceBadge } from "@/components/ui/source-badge";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { ReferenceTable } from "@/components/insurance/reference-table";

type Row = Record<string, unknown>;
type ListResponse = InsuranceApiResponse<Row[]>;
type ObjectResponse = InsuranceApiResponse<Record<string, unknown>>;

interface State {
  references: ObjectResponse;
  threats: ListResponse;
  vulnerabilities: ListResponse;
  raxParameters: ListResponse;
  claimCauses: ListResponse;
  claimStatuses: ListResponse;
  alertThresholds: ListResponse;
  pricingParameters: ListResponse;
}

interface InsuranceReferencesPanelProps {
  context: "settings" | "claims" | "pricing" | "rax";
}

const FALLBACK_ENABLED = shouldUseInsuranceDemoFallback();

function resolveRows(result: ListResponse, fallback: Row[]) {
  if (result.ok && result.data && result.data.length > 0) return result.data;
  if (!FALLBACK_ENABLED) return [];
  if (result.state === "AUTH_REQUIRED") return fallback;
  if (result.state === "NETWORK_ERROR" || result.state === "UNAVAILABLE") return fallback;
  if (result.ok && (!result.data || result.data.length === 0)) return fallback;
  return [];
}

function renderCatalogSnapshot(records: Record<string, unknown> | null) {
  if (!records) return null;

  const keys = [
    "threats",
    "vulnerabilities",
    "raxParameters",
    "claimCauses",
    "claimStatuses",
    "alertThresholds",
    "pricingParameters",
  ];

  const counts = keys
    .map((key) => {
      const value = records[key];
      return {
        key,
        count: Array.isArray(value) ? value.length : null,
      };
    })
    .filter((item) => item.count !== null);

  if (counts.length === 0) return null;

  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {counts.map((entry) => (
        <div
          key={entry.key}
          className="rounded-xl border border-slate-400/10 bg-[#0b1422]/70 px-3 py-2 text-xs text-slate-300"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
            {entry.key}
          </p>
          <p className="font-mono text-[12px] text-white">{entry.count} entrées</p>
        </div>
      ))}
    </div>
  );
}

export function InsuranceReferencesPanel({ context }: InsuranceReferencesPanelProps) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<State | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const [
        references,
        threats,
        vulnerabilities,
        raxParameters,
        claimCauses,
        claimStatuses,
        alertThresholds,
        pricingParameters,
      ] = await Promise.all([
        getInsuranceReferences(),
        getInsuranceThreats(),
        getInsuranceVulnerabilities(),
        getInsuranceRaxParameters(),
        getInsuranceClaimCauses(),
        getInsuranceClaimStatuses(),
        getInsuranceAlertThresholds(),
        getInsurancePricingParameters(),
      ]);

      if (!mounted) return;
      setForbidden(
        [
          references,
          threats,
          vulnerabilities,
          raxParameters,
          claimCauses,
          claimStatuses,
          alertThresholds,
          pricingParameters,
        ].some((result) => result.state === "FORBIDDEN"),
      );
      setState({
        references,
        threats,
        vulnerabilities,
        raxParameters,
        claimCauses,
        claimStatuses,
        alertThresholds,
        pricingParameters,
      });
      setLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const authRequired = useMemo(() => {
    if (!state) return false;
    return Object.values(state).some((result) => result.state === "AUTH_REQUIRED");
  }, [state]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Chargement des référentiels assurance live...
      </div>
    );
  }

  if (!state) {
    return <DegradedStateCard description="Chargement des références assurance indisponible." />;
  }

  const degradedState =
    state.references.state === "DEGRADED" || state.references.state === "UNAVAILABLE";

  const threats = resolveRows(state.threats, INSURANCE_REFERENCES_FALLBACK.threats);
  const vulnerabilities = resolveRows(
    state.vulnerabilities,
    INSURANCE_REFERENCES_FALLBACK.vulnerabilities,
  );
  const raxParameters = resolveRows(
    state.raxParameters,
    INSURANCE_REFERENCES_FALLBACK.raxParameters,
  );
  const claimCauses = resolveRows(state.claimCauses, INSURANCE_REFERENCES_FALLBACK.claimCauses);
  const claimStatuses = resolveRows(
    state.claimStatuses,
    INSURANCE_REFERENCES_FALLBACK.claimStatuses,
  );
  const alertThresholds = resolveRows(
    state.alertThresholds,
    INSURANCE_REFERENCES_FALLBACK.alertThresholds,
  );
  const pricingParameters = resolveRows(
    state.pricingParameters,
    INSURANCE_REFERENCES_FALLBACK.pricingParameters,
  );

  const sections: Array<{ title: string; rows: Row[] }> = [];
  if (context === "settings") {
    sections.push(
      { title: "Menaces", rows: threats },
      { title: "Vulnérabilités", rows: vulnerabilities },
      { title: "Paramètres RAX", rows: raxParameters },
      { title: "Causes sinistre", rows: claimCauses },
      { title: "Statuts sinistre", rows: claimStatuses },
      { title: "Seuils alertes", rows: alertThresholds },
      { title: "Paramètres pricing", rows: pricingParameters },
    );
  }
  if (context === "rax") {
    sections.push(
      { title: "Paramètres RAX", rows: raxParameters },
      { title: "Menaces", rows: threats },
      { title: "Vulnérabilités", rows: vulnerabilities },
    );
  }
  if (context === "claims") {
    sections.push(
      { title: "Causes sinistre", rows: claimCauses },
      { title: "Statuts sinistre", rows: claimStatuses },
      { title: "Seuils alertes", rows: alertThresholds },
    );
  }
  if (context === "pricing") {
    sections.push(
      { title: "Paramètres pricing", rows: pricingParameters },
      { title: "Paramètres RAX", rows: raxParameters },
    );
  }

  const hasRows = sections.some((section) => section.rows.length > 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
            Références assurance live
          </h3>
          <SourceBadge source={authRequired ? "UNAVAILABLE" : "LIVE"} />
          {FALLBACK_ENABLED && <SourceBadge source="SEED_DEMO" />}
        </div>
        <p className="text-xs text-slate-300">
          Catalogues techniques utilisés pour la structuration du risque assurance.
        </p>
      </div>

      {authRequired && (
        <AuthRequiredCard description="Les routes /v1/insurance/references/* sont protégées. Sans token backend, le mode SEED_DEMO reste visible et explicite." />
      )}
      {forbidden && (
        <AccessDeniedCard description="Acces refuse sur les referentiels assurance (403). Verifiez le role du JWT." />
      )}
      {degradedState && (
        <DegradedStateCard description="Référentiel assurance en mode dégradé (DISABLED_SAFE). Les catalogues restent affichés de façon non bloquante." />
      )}
      {renderCatalogSnapshot((state.references.data ?? null) as Record<string, unknown> | null)}

      {!hasRows ? (
        <EmptyLiveDataCard description="Aucune référence live disponible pour cette section." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sections.map((section) => (
            <ReferenceTable key={section.title} title={section.title} rows={section.rows} />
          ))}
        </div>
      )}

      {context === "claims" && (
        <p className="rounded-xl border border-slate-400/10 bg-[#101726]/92 px-3 py-2 text-xs text-slate-300">
          Sinistres transactionnels: prochaine phase backend.
        </p>
      )}

      <DisclosureNote />
    </div>
  );
}
