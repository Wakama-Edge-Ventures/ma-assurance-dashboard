"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiError, getInsuranceApplications as getInsuranceApplicationsReadOnly } from "@/lib/api";
import {
  extractArrayFromApiResponse,
  formatSourceFr,
  mapInsuranceDcaApplication,
} from "@/lib/dto-mappers";
import { applications as seedApplications, farmers as seedFarmers } from "@/lib/demo-data";
import { InsuranceDcaApplication } from "@/types";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { useTenant } from "@/components/tenant/useTenant";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { EmptyLiveDataCard } from "@/components/ui/empty-live-data-card";

import { ApplicationsTable } from "./applications-table";

const SOURCE_ORDER = [
  "LIVE",
  "SEED_DEMO",
  "MANUAL_ESTIMATE",
  "DEGRADED",
  "UNAVAILABLE",
] as const;

type KnownSource = (typeof SOURCE_ORDER)[number];

function getDisplayedSource(rows: InsuranceDcaApplication[]): KnownSource {
  if (rows.length === 0) return "UNAVAILABLE";
  const unique = new Set(rows.map((row) => row.source));
  if (unique.size === 1) {
    const only = rows[0]?.source;
    if (SOURCE_ORDER.includes(only as KnownSource)) {
      return only as KnownSource;
    }
  }
  return "UNAVAILABLE";
}

function toRiskReviewStatusFromSeed(status: string): InsuranceDcaApplication["status"] {
  const normalized = status.trim().toUpperCase();
  if (normalized === "UNDER_REVIEW" || normalized === "BACK_OFFICE_REVIEW") {
    return "UNDER_RISK_REVIEW";
  }
  if (normalized === "REQUIRES_FIELD_AUDIT") {
    return "MORE_INFO_REQUIRED";
  }
  if (normalized === "PRICED") {
    return "READY_FOR_MISSION_CONFIG";
  }
  return "UNAVAILABLE";
}

function buildSeedFallbackRows(): InsuranceDcaApplication[] {
  const farmerById = new Map(seedFarmers.map((farmer) => [farmer.id, farmer]));

  return seedApplications.map((application) => {
    const farmer = farmerById.get(application.farmerId);
    const fullName = farmer?.fullName?.trim() ?? "";
    const [firstName, ...lastNameParts] = fullName ? fullName.split(/\s+/) : [];

    return {
      id: application.id,
      reference: application.reference,
      dcaNumber: application.reference,
      status: toRiskReviewStatusFromSeed(application.status),
      backendStatus: application.status,
      source: "SEED_DEMO",
      declarativeSource: "SEED_DEMO",
      sourceOfTruth: "LEGACY_AUDIT_FALLBACK",
      legacyAuditFallbackUsed: true,
      submittedAt: application.createdAt,
      createdAt: application.createdAt,
      periodYears: null,
      noClaimsDeclared: null,
      applicationCountry: "MA",
      farmerCountry: null,
      parcelleCountry: null,
      farmer: {
        id: farmer?.id ?? application.farmerId,
        firstName: firstName ?? null,
        lastName: lastNameParts.length > 0 ? lastNameParts.join(" ") : null,
        phoneMasked: farmer?.phone ?? null,
        cinMasked: farmer?.nationalIdMasked ?? null,
        preferredLanguage: null,
        source: "SEED_DEMO",
      },
      parcelle: {
        id: null,
        name: null,
        culture: application.cropType,
        superficie: application.areaHa,
        declaredArea: application.areaHa,
        lat: null,
        lng: null,
        country: "MA",
        source: "SEED_DEMO",
      },
      crop: application.cropType,
      culture: application.cropType,
      declaredArea: application.areaHa,
      consentCndp: null,
      consentCndpAt: null,
      consentCndpSource: "SEED_DEMO",
      preparedDocuments: [],
      claimHistory: [],
      sideEffects: {
        missionCreated: false,
        policyCreated: false,
        claimCreated: false,
        raxCalculated: false,
        pricingCalculated: false,
        blockchainAnchored: false,
        sideEffectsSource: "FRONTEND_FALLBACK",
        sourceNote: "SEED_DEMO fallback",
      },
    };
  });
}

type CountryFilter = "ALL" | "CI" | "MA";

export function ApplicationsLivePanel() {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<InsuranceDcaApplication[]>([]);
  const [usingSeedFallback, setUsingSeedFallback] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("ALL");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setAuthRequired(false);
      setForbidden(false);
      setUsingSeedFallback(false);
      setError(null);

      try {
        const payload = await getInsuranceApplicationsReadOnly();
        const rawItems = extractArrayFromApiResponse(payload, ["applications", "items", "data"]);
        const mapped = rawItems
          .map((item) => mapInsuranceDcaApplication(item))
          .filter((item): item is InsuranceDcaApplication => item !== null);

        if (!mounted) return;
        setRows(mapped);
      } catch (loadError) {
        if (!mounted) return;
        setRows([]);
        setUsingSeedFallback(false);

        if (loadError instanceof ApiError) {
          if (loadError.status === 401) {
            setAuthRequired(true);
            setError("Authentification backend requise pour lire les dossiers DCA.");
          } else if (loadError.status === 403) {
            setForbidden(true);
            setError("Acces refuse (403) sur la lecture des dossiers DCA.");
          } else if (loadError.status === 400) {
            setError("Requete invalide sur GET /v1/insurance/applications.");
          } else if (loadError.status >= 500) {
            setRows(buildSeedFallbackRows());
            setUsingSeedFallback(true);
            setError(
              "API DCA live indisponible (5xx). Fallback SEED_DEMO affiché temporairement.",
            );
          } else {
            setError(loadError.message || "Erreur API lors de la lecture des DCA.");
          }
        } else {
          setRows(buildSeedFallbackRows());
          setUsingSeedFallback(true);
          setError("Service indisponible. Fallback SEED_DEMO affiché temporairement.");
        }
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
  }, []);

  const filteredRows = useMemo(() => {
    if (countryFilter === "ALL") return rows;
    return rows.filter(
      (row) => (row.applicationCountry ?? row.farmerCountry ?? row.parcelleCountry ?? null) === countryFilter,
    );
  }, [rows, countryFilter]);

  const displayedSource = useMemo(() => getDisplayedSource(filteredRows), [filteredRows]);
  const sourceDistribution = useMemo(() => {
    const distribution = new Map<string, number>();
    for (const row of filteredRows) {
      distribution.set(row.source, (distribution.get(row.source) ?? 0) + 1);
    }
    return SOURCE_ORDER.filter((source) => distribution.has(source)).map((source) => ({
      source,
      count: distribution.get(source) ?? 0,
    }));
  }, [filteredRows]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4 text-xs text-slate-400">
        Chargement en lecture seule des dossiers DCA...
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          DCA - lecture seule
        </h3>
        <span className="rounded-full border border-slate-400/18 bg-slate-900/50 px-2.5 py-1 font-mono text-[10.5px] text-slate-300">
          Source principale: {formatSourceFr(displayedSource)}
        </span>
        {tenant.demoMode ? (
          <span className="rounded-full border border-slate-400/18 bg-slate-900/50 px-2.5 py-1 font-mono text-[10.5px] text-slate-300">
            Vue institutionnelle
          </span>
        ) : null}
      </div>

      <p className="text-xs text-slate-400">
        Vue lecture seule. Cette page n&apos;exécute aucune action métier: aucun POST, PATCH ou
        DELETE.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-slate-500">Pays:</span>
        {([
          { value: "ALL", label: "Tous" },
          { value: "CI", label: "Côte d’Ivoire" },
          { value: "MA", label: "Maroc" },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setCountryFilter(option.value)}
            className={
              countryFilter === option.value
                ? "rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] text-cyan-100"
                : "rounded-full border border-slate-400/18 bg-slate-900/50 px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200"
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {sourceDistribution.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sourceDistribution.map((item) => (
            <span
              key={item.source}
              className="rounded-full border border-slate-400/14 bg-slate-900/50 px-2.5 py-1 font-mono text-[11px] text-slate-300"
            >
              {formatSourceFr(item.source)}: {item.count}
            </span>
          ))}
        </div>
      ) : null}

      {usingSeedFallback ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
          Mode fallback SEED_DEMO actif: aucune DCA live affichable pour le moment.
        </p>
      ) : null}

      {authRequired ? (
        <AuthRequiredCard description="GET /v1/insurance/applications est protege et necessite un JWT institutionnel." />
      ) : null}

      {forbidden ? (
        <AccessDeniedCard description="Accès refusé (403) sur la lecture des DCA. Vérifiez le rôle du JWT." />
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      {!authRequired && !forbidden && !error && filteredRows.length === 0 ? (
        <EmptyLiveDataCard description="Aucune DCA retournée par GET /v1/insurance/applications." />
      ) : null}

      {!authRequired && !forbidden && filteredRows.length > 0 ? (
        <ApplicationsTable rows={filteredRows} />
      ) : null}

      <DisclosureNote />
    </section>
  );
}
