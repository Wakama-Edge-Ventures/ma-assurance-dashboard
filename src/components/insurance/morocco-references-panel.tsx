"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getMoroccoAgroClimaticZones,
  getMoroccoCities,
  getMoroccoCommunes,
  getMoroccoCropSeasons,
  getMoroccoCrops,
  getMoroccoDams,
  getMoroccoFloodRiskZones,
  getMoroccoProvinces,
  getMoroccoRegions,
  getMoroccoRiskZones,
  getMoroccoRiverSegments,
  shouldUseInsuranceDemoFallback,
  type InsuranceApiResponse,
} from "@/lib/api/insuranceApi";
import { MOROCCO_REFERENCE_FALLBACK } from "@/lib/insurance-live-fallback";
import { normalizeSource } from "@/lib/data-source";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { EmptyLiveDataCard } from "@/components/ui/empty-live-data-card";
import { SourceBadge } from "@/components/ui/source-badge";
import { ReferenceTable } from "@/components/insurance/reference-table";

type Row = Record<string, unknown>;
type Response = InsuranceApiResponse<Row[]>;

interface State {
  regions: Response;
  provinces: Response;
  communes: Response;
  cities: Response;
  crops: Response;
  cropSeasons: Response;
  agroClimaticZones: Response;
  riskZones: Response;
  dams: Response;
  riverSegments: Response;
  floodRiskZones: Response;
}

const FALLBACK_ENABLED = shouldUseInsuranceDemoFallback();

function resolveRows(result: Response, fallback: Row[]): Row[] {
  if (result.ok && result.data && result.data.length > 0) return result.data;
  if (!FALLBACK_ENABLED) return [];
  if (result.state === "AUTH_REQUIRED") return fallback;
  if (result.state === "NETWORK_ERROR" || result.state === "UNAVAILABLE") return fallback;
  if (result.ok && (!result.data || result.data.length === 0)) return fallback;
  return [];
}

export function MoroccoReferencesPanel() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<State | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const [
        regions,
        provinces,
        communes,
        cities,
        crops,
        cropSeasons,
        agroClimaticZones,
        riskZones,
        dams,
        riverSegments,
        floodRiskZones,
      ] = await Promise.all([
        getMoroccoRegions(),
        getMoroccoProvinces(),
        getMoroccoCommunes(),
        getMoroccoCities(),
        getMoroccoCrops(),
        getMoroccoCropSeasons(),
        getMoroccoAgroClimaticZones(),
        getMoroccoRiskZones(),
        getMoroccoDams(),
        getMoroccoRiverSegments(),
        getMoroccoFloodRiskZones(),
      ]);

      if (!mounted) return;
      setForbidden(
        [
          regions,
          provinces,
          communes,
          cities,
          crops,
          cropSeasons,
          agroClimaticZones,
          riskZones,
          dams,
          riverSegments,
          floodRiskZones,
        ].some((result) => result.state === "FORBIDDEN"),
      );
      setState({
        regions,
        provinces,
        communes,
        cities,
        crops,
        cropSeasons,
        agroClimaticZones,
        riskZones,
        dams,
        riverSegments,
        floodRiskZones,
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
        Chargement des référentiels Maroc live...
      </div>
    );
  }

  if (!state) {
    return (
      <DegradedStateCard description="Impossible de charger les référentiels géographiques et hydrographiques Maroc." />
    );
  }

  const rows = {
    regions: resolveRows(state.regions, MOROCCO_REFERENCE_FALLBACK.regions),
    provinces: resolveRows(state.provinces, MOROCCO_REFERENCE_FALLBACK.provinces),
    communes: resolveRows(state.communes, MOROCCO_REFERENCE_FALLBACK.communes),
    cities: resolveRows(state.cities, MOROCCO_REFERENCE_FALLBACK.cities),
    crops: resolveRows(state.crops, MOROCCO_REFERENCE_FALLBACK.crops),
    cropSeasons: resolveRows(state.cropSeasons, MOROCCO_REFERENCE_FALLBACK.cropSeasons),
    agroClimaticZones: resolveRows(
      state.agroClimaticZones,
      MOROCCO_REFERENCE_FALLBACK.agroClimaticZones,
    ),
    riskZones: resolveRows(state.riskZones, MOROCCO_REFERENCE_FALLBACK.riskZones),
    dams: resolveRows(state.dams, MOROCCO_REFERENCE_FALLBACK.dams),
    riverSegments: resolveRows(state.riverSegments, MOROCCO_REFERENCE_FALLBACK.riverSegments),
    floodRiskZones: resolveRows(
      state.floodRiskZones,
      MOROCCO_REFERENCE_FALLBACK.floodRiskZones,
    ),
  };

  const allRows = Object.values(rows).flat();
  const ouedElMakhazine = rows.dams.find((dam) => {
    const label = String(dam.label ?? dam.name ?? "").toLowerCase();
    return label.includes("oued el makhazine");
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
            Référentiels Maroc live
          </h3>
          <SourceBadge source={authRequired ? "UNAVAILABLE" : "LIVE"} />
          {FALLBACK_ENABLED && <SourceBadge source="SEED_DEMO" />}
        </div>
        <p className="text-xs text-slate-300">
          Géographie, cultures, zones de risque et références hydro pour les dossiers techniques.
        </p>
      </div>

      {authRequired && (
        <AuthRequiredCard description="Les routes /v1/morocco/* sont protégées. Sans token backend, l’interface affiche un mode de repli SEED_DEMO clairement étiqueté." />
      )}
      {forbidden && (
        <AccessDeniedCard description="Acces refuse sur les referentiels Maroc (403). Verifiez le role du JWT." />
      )}

      {allRows.length === 0 && (
        <EmptyLiveDataCard description="Aucune donnée Morocco live disponible actuellement." />
      )}

      {ouedElMakhazine ? (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4 text-xs text-slate-200">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="font-medium text-white">Oued El Makhazine</p>
            <SourceBadge source={normalizeSource(ouedElMakhazine.source, "EXCEL_IMPORT")} />
          </div>
          <div className="grid gap-1 md:grid-cols-2">
            <p>lat: {String(ouedElMakhazine.lat ?? "34.9417")}</p>
            <p>lng: {String(ouedElMakhazine.lng ?? "-5.8394")}</p>
            <p>capacity: {String(ouedElMakhazine.capacity ?? "807")}</p>
            <p>confidence: {String(ouedElMakhazine.confidence ?? "MEDIUM")}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <ReferenceTable title="Régions" rows={rows.regions} />
        <ReferenceTable title="Provinces" rows={rows.provinces} />
        <ReferenceTable title="Communes" rows={rows.communes} />
        <ReferenceTable title="Villes" rows={rows.cities} />
        <ReferenceTable title="Cultures" rows={rows.crops} />
        <ReferenceTable title="Saisons culturales" rows={rows.cropSeasons} />
        <ReferenceTable title="Zones agro-climatiques" rows={rows.agroClimaticZones} />
        <ReferenceTable title="Zones de risque" rows={rows.riskZones} />
        <ReferenceTable title="Barrages" rows={rows.dams} />
        <ReferenceTable title="Segments de rivière" rows={rows.riverSegments} />
        <ReferenceTable title="Zones inondables" rows={rows.floodRiskZones} />
      </div>

      <DisclosureNote />
    </div>
  );
}
