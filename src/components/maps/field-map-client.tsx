"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, MapPinned, Trees, Users2, Waves } from "lucide-react";

import {
  LeafletFieldMap,
  type FieldMapMarker,
  type FieldMapParcelFeature,
} from "@/components/maps/leaflet-field-map";
import { AppCard } from "@/components/ui/app-card";
import { getNdviSnapshotByParcelleId } from "@/lib/insurance-service";
import { getFieldMapSnapshot, type FieldMapSnapshot } from "@/lib/field-map-data";
import {
  isInsideBounds,
  normalizeCountryKey,
  resolveFieldMapCountryFocus,
  type FieldMapCountryKey,
} from "@/lib/field-map-country";
import type { DataSource, NdviSnapshot } from "@/types";

interface FieldMapClientProps {
  initialSnapshot: FieldMapSnapshot;
  tenantLabel: string;
  tenantCountry: string;
}

interface NdviState {
  snapshot: NdviSnapshot | null;
  status: "idle" | "loading" | "ready" | "unavailable";
}

/**
 * A point/polygon matches the active tenant's country focus if its explicit country field
 * agrees, or (when no explicit country is provided) if it falls inside that country's bounds.
 * An explicit mismatch always excludes the item so a tenant never sees another tenant's
 * live data mislabeled as its own.
 */
function matchesCountryFocus(
  explicitCountry: string | undefined,
  points: Array<[number | undefined, number | undefined]>,
  countryKey: FieldMapCountryKey,
  bounds: ReturnType<typeof resolveFieldMapCountryFocus>["bounds"],
): boolean {
  if (countryKey === "PANAF") return true;

  const normalizedExplicit = normalizeCountryKey(explicitCountry);
  if (normalizedExplicit) return normalizedExplicit === countryKey;

  return points.some(([lat, lng]) => isInsideBounds(lat, lng, bounds));
}

function sourceLabel(source: DataSource) {
  if (source === "LIVE") return "Donnees reelles";
  if (source === "SEED_DEMO") return "Exemple / Demo";
  if (source === "DEGRADED") return "Service limite";
  return "Indisponible";
}

interface GeoJsonLike {
  type?: string;
  coordinates?: unknown;
  geometry?: GeoJsonLike;
}

function extractCoordinateRing(value: unknown): number[][] | undefined {
  if (!Array.isArray(value) || value.length < 4) return undefined;

  const ring = value
    .map((point) =>
      Array.isArray(point) && point.length >= 2 && typeof point[0] === "number" && typeof point[1] === "number"
        ? [point[0], point[1]]
        : null,
    )
    .filter((point): point is number[] => point !== null);

  return ring.length >= 4 ? ring : undefined;
}

function parsePolygonCoordinates(raw?: string) {
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as GeoJsonLike | number[][] | number[][][] | number[][][][];

    // Bare coordinate array (no GeoJSON envelope): either a single ring, or a polygon's
    // array-of-rings, or a multipolygon's array-of-polygons.
    if (Array.isArray(parsed)) {
      const asRing = extractCoordinateRing(parsed);
      if (asRing) return toLatLngRing(asRing);

      const first = parsed[0];
      if (Array.isArray(first)) {
        const nestedRing = extractCoordinateRing(first);
        if (nestedRing) return toLatLngRing(nestedRing);

        const deepFirst = (first as unknown[])[0];
        const deepRing = extractCoordinateRing(deepFirst);
        if (deepRing) return toLatLngRing(deepRing);
      }
      return undefined;
    }

    const geometry: GeoJsonLike | undefined =
      parsed.type === "Feature" ? parsed.geometry : parsed;
    if (!geometry || !geometry.type || !geometry.coordinates) return undefined;

    const coordinates = geometry.coordinates as number[][][] | number[][][][];
    const ring =
      geometry.type === "Polygon"
        ? coordinates[0]
        : geometry.type === "MultiPolygon"
          ? (coordinates as number[][][][])[0]?.[0]
          : null;

    const normalizedRing = extractCoordinateRing(ring);
    return normalizedRing ? toLatLngRing(normalizedRing) : undefined;
  } catch {
    return undefined;
  }
}

function toLatLngRing(ring: number[][]): [number, number][] {
  // GeoJSON rings are [lng, lat]; Leaflet expects [lat, lng].
  return ring.map(([lng, lat]) => [lat, lng]);
}

function formatArea(areaHa?: number) {
  if (typeof areaHa !== "number" || !Number.isFinite(areaHa)) return "Surface non renseignee";
  return `${areaHa.toFixed(areaHa < 10 ? 1 : 0)} ha`;
}

export function FieldMapClient({ initialSnapshot, tenantLabel, tenantCountry }: FieldMapClientProps) {
  const countryFocus = useMemo(() => resolveFieldMapCountryFocus(tenantCountry), [tenantCountry]);
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [openNdviParcelId, setOpenNdviParcelId] = useState<string | null>(null);
  const [ndviByParcel, setNdviByParcel] = useState<Record<string, NdviState>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);

  const refreshSnapshot = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const next = await getFieldMapSnapshot(countryFocus.key);
      setSnapshot(next);
      setLastRefreshAt(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  }, [countryFocus.key]);

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshSnapshot]);

  useEffect(() => {
    function handleFocus() {
      void refreshSnapshot();
    }

    window.addEventListener("focus", handleFocus);
    const intervalId = window.setInterval(() => {
      void refreshSnapshot();
    }, 45000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(intervalId);
    };
  }, [refreshSnapshot]);

  const lookup = useMemo(
    () => ({
      farmers: new Map(snapshot.farmers.map((item) => [item.id, item])),
      cooperatives: new Map(snapshot.cooperatives.map((item) => [item.id, item])),
      parcelles: new Map(snapshot.parcelles.map((item) => [item.id, item])),
    }),
    [snapshot],
  );

  const parcelFeatures = useMemo(() => {
    return snapshot.parcelles
      .map((parcel): FieldMapParcelFeature | null => {
        const polygon = parsePolygonCoordinates(parcel.polygone);
        const farmer = parcel.farmerId ? lookup.farmers.get(parcel.farmerId) : null;
        const cooperative =
          (parcel.cooperativeId ? lookup.cooperatives.get(parcel.cooperativeId) : null) ??
          (farmer?.cooperativeId ? lookup.cooperatives.get(farmer.cooperativeId) : null);

        const matches = matchesCountryFocus(
          parcel.country,
          [[parcel.lat, parcel.lng], ...(polygon ?? [])],
          countryFocus.key,
          countryFocus.bounds,
        );

        if (!matches) return null;

        const hasPoint = typeof parcel.lat === "number" && typeof parcel.lng === "number";

        return {
          id: parcel.id,
          name: parcel.name,
          culture: parcel.culture,
          areaHa: parcel.areaHa ?? parcel.superficie,
          lat: hasPoint ? parcel.lat : polygon?.[0]?.[0],
          lng: hasPoint ? parcel.lng : polygon?.[0]?.[1],
          farmerName: farmer?.fullName,
          farmerId: parcel.farmerId,
          cooperativeName: cooperative?.name ?? farmer?.cooperativeName,
          region: farmer?.region ?? parcel.regionCode ?? parcel.province ?? undefined,
          locality: parcel.commune,
          status: parcel.status,
          source: parcel.source,
          polygon,
          polygonAvailable: Boolean(polygon && polygon.length > 0),
          ndvi: typeof parcel.ndvi === "number" ? parcel.ndvi : undefined,
        };
      })
      .filter((item): item is FieldMapParcelFeature => item !== null);
  }, [countryFocus.bounds, countryFocus.key, lookup.cooperatives, lookup.farmers, snapshot.parcelles]);

  const markerFeatures = useMemo(() => {
    const alerts = snapshot.alerts
      .map((alert): FieldMapMarker | null => {
        const parcel = alert.parcelleId ? lookup.parcelles.get(alert.parcelleId) : null;
        const farmer = alert.farmerId ? lookup.farmers.get(alert.farmerId) : null;
        const lat = parcel?.lat ?? farmer?.lat;
        const lng = parcel?.lng ?? farmer?.lng;

        const matches = matchesCountryFocus(
          parcel?.country,
          [[lat, lng]],
          countryFocus.key,
          countryFocus.bounds,
        );
        if (!matches || typeof lat !== "number" || typeof lng !== "number") return null;

        return {
          id: `alert-${alert.id}`,
          kind: "alerts" as const,
          lat,
          lng,
          title: alert.title ?? alert.message,
          subtitle: parcel?.name ?? farmer?.fullName ?? alert.message,
          statusLabel: alert.severity,
          source: alert.source,
        };
      })
      .filter((item): item is FieldMapMarker => item !== null);

    const farmers = snapshot.farmers
      .filter((farmer) =>
        matchesCountryFocus(undefined, [[farmer.lat, farmer.lng]], countryFocus.key, countryFocus.bounds),
      )
      .filter((farmer) => typeof farmer.lat === "number" && typeof farmer.lng === "number")
      .map((farmer) => ({
        id: `farmer-${farmer.id}`,
        kind: "farmers" as const,
        lat: farmer.lat!,
        lng: farmer.lng!,
        title: farmer.fullName,
        subtitle: `${farmer.region} · ${farmer.primaryCrop}`,
        statusLabel: farmer.kycStatus,
        source: farmer.source,
      }));

    const cooperatives = snapshot.cooperatives
      .filter((cooperative) =>
        matchesCountryFocus(
          undefined,
          [[cooperative.lat, cooperative.lng]],
          countryFocus.key,
          countryFocus.bounds,
        ),
      )
      .filter((cooperative) => typeof cooperative.lat === "number" && typeof cooperative.lng === "number")
      .map((cooperative) => ({
        id: `coop-${cooperative.id}`,
        kind: "cooperatives" as const,
        lat: cooperative.lat!,
        lng: cooperative.lng!,
        title: cooperative.name,
        subtitle: `${cooperative.region} · ${cooperative.filiere ?? "Filiere non renseignee"}`,
        statusLabel: `${cooperative.memberCount} membre(s)`,
        source: cooperative.source,
      }));

    return [...alerts, ...farmers, ...cooperatives];
  }, [
    countryFocus.bounds,
    countryFocus.key,
    lookup.farmers,
    lookup.parcelles,
    snapshot.alerts,
    snapshot.cooperatives,
    snapshot.farmers,
  ]);

  const visibleParcelCount = parcelFeatures.length;
  const parcelsWithPolygon = parcelFeatures.filter((item) => item.polygonAvailable).length;
  const parcelsWithoutPolygon = visibleParcelCount - parcelsWithPolygon;
  const ndviAvailableCount = parcelFeatures.filter((item) => typeof item.ndvi === "number").length;
  const selectedParcel =
    parcelFeatures.find((item) => item.id === selectedParcelId) ??
    (parcelFeatures.length > 0 ? parcelFeatures[0] : null);

  useEffect(() => {
    if (!selectedParcelId && parcelFeatures.length > 0) {
      setSelectedParcelId(parcelFeatures[0].id);
    }
  }, [parcelFeatures, selectedParcelId]);

  useEffect(() => {
    if (!openNdviParcelId) return;
    const selected = parcelFeatures.find((item) => item.id === openNdviParcelId);
    if (!selected) return;

    if (typeof selected.ndvi === "number") {
      const ndviValue = selected.ndvi;
      setNdviByParcel((current) => ({
        ...current,
        [selected.id]: {
          snapshot: {
            parcelleId: selected.id,
            ndvi: ndviValue,
            source: selected.source,
          },
          status: "ready",
        },
      }));
      return;
    }

    let cancelled = false;

    setNdviByParcel((current) => ({
      ...current,
      [selected.id]: {
        snapshot: null,
        status: "loading",
      },
    }));

    void getNdviSnapshotByParcelleId(selected.id).then((snapshotResult) => {
      if (cancelled) return;
      setNdviByParcel((current) => ({
        ...current,
        [selected.id]: {
          snapshot: snapshotResult,
          status: snapshotResult ? "ready" : "unavailable",
        },
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [openNdviParcelId, parcelFeatures]);

  const selectedNdviState =
    (selectedParcel ? ndviByParcel[selectedParcel.id] : null) ?? {
      snapshot: null,
      status: "idle",
    };

  const dataModeLabel = useMemo(() => {
    const sources = [
      ...parcelFeatures.map((item) => item.source),
      ...markerFeatures.map((item) => item.source),
    ];

    if (sources.some((source) => source === "LIVE")) return "Donnees reelles";
    if (sources.some((source) => source === "SEED_DEMO")) return "Exemple / Demo";
    if (sources.some((source) => source === "DEGRADED")) return "Service limite";
    return "Indisponible";
  }, [markerFeatures, parcelFeatures]);

  const note =
    visibleParcelCount > 0
      ? undefined
      : `Aucune parcelle exploitable pour ${countryFocus.label} n'est disponible pour ce tenant ou cette session. La carte reste centree sur le pays sans inventer de polygones ni de NDVI.`;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <LeafletFieldMap
        dataModeLabel={dataModeLabel}
        countryFocus={countryFocus}
        parcels={parcelFeatures}
        markers={markerFeatures}
        selectedParcelId={selectedParcel?.id ?? null}
        note={note}
        onSelectParcel={(parcelId) => setSelectedParcelId(parcelId)}
        onOpenNdvi={(parcelId) => {
          setSelectedParcelId(parcelId);
          setOpenNdviParcelId(parcelId);
        }}
      />

      <div className="space-y-4">
        <AppCard className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-wk-primaryInk">
            <MapPinned className="h-4 w-4" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
              Synthese carte
            </h2>
          </div>
          <div className="grid gap-2 text-[12px] font-medium text-wk-muted">
            <div className="flex items-center justify-between rounded-[14px] border border-wk-border bg-wk-surface2 px-3 py-2">
              <span>Total parcelles affichees</span>
              <span className="font-bold text-wk-text">{visibleParcelCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-[14px] border border-wk-border bg-wk-surface2 px-3 py-2">
              <span>Parcelles avec polygone</span>
              <span className="font-bold text-wk-text">{parcelsWithPolygon}</span>
            </div>
            <div className="flex items-center justify-between rounded-[14px] border border-wk-border bg-wk-surface2 px-3 py-2">
              <span>Parcelles sans polygone</span>
              <span className="font-bold text-wk-text">{parcelsWithoutPolygon}</span>
            </div>
            <div className="flex items-center justify-between rounded-[14px] border border-wk-border bg-wk-surface2 px-3 py-2">
              <span>NDVI disponible</span>
              <span className="font-bold text-wk-text">{ndviAvailableCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-[14px] border border-wk-border bg-wk-surface2 px-3 py-2">
              <span>Tenant</span>
              <span className="font-bold text-wk-text">{tenantLabel}</span>
            </div>
            <div className="flex items-center justify-between rounded-[14px] border border-wk-border bg-wk-surface2 px-3 py-2">
              <span>Pays / focus carte</span>
              <span className="font-bold text-wk-text">{countryFocus.label}</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-wk-faint">
            Revalidation automatique au chargement, au retour du focus navigateur et toutes les 45 secondes.
            {lastRefreshAt ? ` Derniere synchro: ${new Date(lastRefreshAt).toLocaleTimeString("fr-FR")}.` : ""}
            {isRefreshing ? " Actualisation en cours..." : ""}
          </p>
        </AppCard>

        <AppCard className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-wk-coralInk">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
              Vigilance
            </h2>
          </div>
          <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
            Cette vue n&apos;invente ni polygone, ni NDVI, ni identite agriculteur. Quand un endpoint live
            repond vide, la carte conserve ce vide honnete au lieu de le maquiller en faux LIVE.
          </p>
        </AppCard>

        <AppCard className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-wk-primaryInk">
            <Users2 className="h-4 w-4" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
              Parcelle selectionnee
            </h2>
          </div>
          {selectedParcel ? (
            <div className="space-y-3 text-[12px] font-medium text-wk-muted">
              <div className="rounded-[16px] border border-wk-border bg-wk-surface2 px-4 py-3">
                <p className="text-[13px] font-bold text-wk-text">{selectedParcel.name}</p>
                <p className="mt-1">Agriculteur: {selectedParcel.farmerName ?? "Non disponible"}</p>
                <p>Culture: {selectedParcel.culture ?? "Non renseignee"}</p>
                <p>Surface: {formatArea(selectedParcel.areaHa)}</p>
                <p>Cooperative: {selectedParcel.cooperativeName ?? "Non renseignee"}</p>
                <p>
                  Region / localite: {selectedParcel.region ?? "Non renseignee"}
                  {selectedParcel.locality ? ` / ${selectedParcel.locality}` : ""}
                </p>
                <p>Source: {sourceLabel(selectedParcel.source)}</p>
                <p>
                  Polygone: {selectedParcel.polygonAvailable ? "Disponible" : "Non disponible"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenNdviParcelId(selectedParcel.id)}
                className="inline-flex items-center gap-2 rounded-full border border-wk-border bg-wk-surface2 px-4 py-2 text-[12px] font-bold text-wk-text transition hover:bg-wk-surface"
              >
                <Trees className="h-4 w-4" />
                Afficher le NDVI
              </button>
            </div>
          ) : (
            <p className="text-[12px] font-medium text-wk-muted">
              Selectionnez une parcelle pour afficher son detail terrain.
            </p>
          )}
        </AppCard>

        <AppCard className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-wk-primaryInk">
            <Waves className="h-4 w-4" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
              NDVI
            </h2>
          </div>
          {!selectedParcel ? (
            <p className="text-[12px] font-medium text-wk-muted">
              Selectionnez d&apos;abord une parcelle.
            </p>
          ) : selectedNdviState.status === "loading" ? (
            <p className="text-[12px] font-medium text-wk-muted">
              Chargement NDVI en cours...
            </p>
          ) : selectedNdviState.status === "ready" && selectedNdviState.snapshot ? (
            <div className="rounded-[16px] border border-wk-border bg-wk-surface2 px-4 py-3 text-[12px] font-medium text-wk-muted">
              <p className="text-[13px] font-bold text-wk-text">{selectedParcel.name}</p>
              <p className="mt-1">Culture: {selectedParcel.culture ?? "Non renseignee"}</p>
              <p>NDVI: {selectedNdviState.snapshot.ndvi.toFixed(3)}</p>
              <p>Source: {sourceLabel(selectedNdviState.snapshot.source)}</p>
              <p>
                Mise a jour: {selectedNdviState.snapshot.capturedAt ?? "Date non fournie"}
              </p>
              {selectedNdviState.snapshot.provider ? (
                <p>Fournisseur: {selectedNdviState.snapshot.provider}</p>
              ) : null}
            </div>
          ) : openNdviParcelId === selectedParcel.id ? (
            <p className="text-[12px] font-medium text-wk-muted">
              NDVI non disponible pour cette parcelle.
            </p>
          ) : (
            <p className="text-[12px] font-medium text-wk-muted">
              Cliquez sur <span className="font-bold text-wk-text">Afficher le NDVI</span> pour charger l&apos;etat vegetatif
              si la donnee existe.
            </p>
          )}
        </AppCard>

        <AppCard className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-wk-primaryInk">
            <Clock3 className="h-4 w-4" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
              Legende terrain
            </h2>
          </div>
          <div className="space-y-2 text-[12px] font-medium text-wk-muted">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#138A5E]" />
              <span>Parcelles et polygones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#DC5547]" />
              <span>Alertes agricoles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0E97A6]" />
              <span>Cooperatives</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6B53D8]" />
              <span>Agriculteurs</span>
            </div>
            <p className="pt-2 text-[11px] text-wk-faint">
              Les missions n&apos;ont pas encore de geolocalisation exploitable dans le modele front courant.
            </p>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
