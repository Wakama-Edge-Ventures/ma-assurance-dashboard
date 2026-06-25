"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Layers3, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { LayerGroup, Map as LeafletMap, Rectangle, TileLayer } from "leaflet";

import { cn } from "@/lib/utils";
import type { FieldMapCountryFocus } from "@/lib/field-map-country";
import type { DataSource } from "@/types";

import styles from "./leaflet-field-map.module.css";

type MapTheme = "light" | "dark";
type BaseLayerKey = "road" | "satellite" | "relief";
type OverlayKey = "missions" | "alerts" | "cooperatives" | "farmers" | "parcelles";
type PolygonCoordinate = [number, number];

export interface FieldMapParcelFeature {
  id: string;
  name: string;
  culture?: string;
  areaHa?: number;
  lat?: number;
  lng?: number;
  farmerName?: string;
  farmerId?: string;
  cooperativeName?: string;
  region?: string;
  locality?: string;
  status?: string;
  source: DataSource;
  polygon?: PolygonCoordinate[];
  polygonAvailable: boolean;
  ndvi?: number;
}

export interface FieldMapMarker {
  id: string;
  kind: Exclude<OverlayKey, "parcelles">;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  statusLabel?: string;
  source: DataSource;
}

interface LeafletFieldMapProps {
  dataModeLabel: string;
  countryFocus: FieldMapCountryFocus;
  parcels: FieldMapParcelFeature[];
  markers: FieldMapMarker[];
  selectedParcelId?: string | null;
  note?: string;
  onSelectParcel: (parcelId: string) => void;
  onOpenNdvi: (parcelId: string) => void;
}

const BASE_LAYER_LABELS: Record<BaseLayerKey, string> = {
  road: "Routes",
  satellite: "Satellite",
  relief: "Relief",
};

const OVERLAY_LABELS: Record<OverlayKey, string> = {
  missions: "Missions",
  alerts: "Alertes",
  cooperatives: "Cooperatives",
  farmers: "Agriculteurs",
  parcelles: "Parcelles",
};

const OVERLAY_COLORS: Record<OverlayKey, string> = {
  missions: "#138A5E",
  alerts: "#DC5547",
  cooperatives: "#0E97A6",
  farmers: "#6B53D8",
  parcelles: "#138A5E",
};

function getLayerConfig(theme: MapTheme, layer: BaseLayerKey) {
  if (layer === "road") {
    return theme === "dark"
      ? {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          className: undefined,
          maxZoom: 20,
        }
      : {
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: "&copy; OpenStreetMap contributors",
          className: undefined,
          maxZoom: 19,
        };
  }

  if (layer === "satellite") {
    return {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
      className: theme === "dark" ? styles.tileDark : undefined,
      maxZoom: 18,
    };
  }

  return {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap",
    className: theme === "dark" ? styles.tileDarkStrong : undefined,
    maxZoom: 17,
  };
}

function sourceLabel(source: DataSource) {
  if (source === "LIVE") return "Donnees reelles";
  if (source === "SEED_DEMO") return "Exemple / Demo";
  if (source === "DEGRADED") return "Service limite";
  return "Indisponible";
}

function formatArea(areaHa?: number) {
  if (typeof areaHa !== "number" || !Number.isFinite(areaHa)) return "Surface non renseignee";
  return `${areaHa.toFixed(areaHa < 10 ? 1 : 0)} ha`;
}

function buildParcelPopupContent(
  parcel: FieldMapParcelFeature,
  onOpenNdvi: (parcelId: string) => void,
) {
  const container = document.createElement("div");
  container.className = styles.popupContent;

  const title = document.createElement("div");
  title.className = styles.popupTitle;
  title.textContent = parcel.name;
  container.appendChild(title);

  const lines = [
    parcel.farmerName ? `Agriculteur: ${parcel.farmerName}` : "Agriculteur: non disponible",
    `Culture: ${parcel.culture ?? "Non renseignee"}`,
    `Surface: ${formatArea(parcel.areaHa)}`,
    parcel.cooperativeName ? `Cooperative: ${parcel.cooperativeName}` : null,
    parcel.region ? `Region / localite: ${parcel.region}${parcel.locality ? ` / ${parcel.locality}` : ""}` : null,
    parcel.status ? `Statut: ${parcel.status}` : null,
    typeof parcel.ndvi === "number" ? `NDVI actuel: ${parcel.ndvi.toFixed(3)}` : null,
  ].filter(Boolean) as string[];

  lines.forEach((line) => {
    const text = document.createElement("div");
    text.className = styles.popupText;
    text.textContent = line;
    container.appendChild(text);
  });

  const badge = document.createElement("div");
  badge.className = styles.popupBadge;
  badge.textContent = sourceLabel(parcel.source);
  container.appendChild(badge);

  const polygonNote = document.createElement("div");
  polygonNote.className = styles.popupHint;
  polygonNote.textContent = parcel.polygonAvailable
    ? "Polygone GPS disponible."
    : "Polygone GPS non disponible pour cette parcelle.";
  container.appendChild(polygonNote);

  const button = document.createElement("button");
  button.type = "button";
  button.className = styles.popupButton;
  button.textContent = "Afficher le NDVI";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenNdvi(parcel.id);
  });
  container.appendChild(button);

  return container;
}

function buildMarkerPopupContent(marker: FieldMapMarker) {
  const container = document.createElement("div");
  container.className = styles.popupContent;

  const title = document.createElement("div");
  title.className = styles.popupTitle;
  title.textContent = marker.title;
  container.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.className = styles.popupText;
  subtitle.textContent = marker.subtitle;
  container.appendChild(subtitle);

  if (marker.statusLabel) {
    const status = document.createElement("div");
    status.className = styles.popupText;
    status.textContent = marker.statusLabel;
    container.appendChild(status);
  }

  const badge = document.createElement("div");
  badge.className = styles.popupBadge;
  badge.textContent = sourceLabel(marker.source);
  container.appendChild(badge);

  return container;
}

function getPolygonCenter(polygon: PolygonCoordinate[]) {
  if (polygon.length === 0) return null;
  const sum = polygon.reduce(
    (acc, [lat, lng]) => {
      acc.lat += lat;
      acc.lng += lng;
      return acc;
    },
    { lat: 0, lng: 0 },
  );

  return [sum.lat / polygon.length, sum.lng / polygon.length] as [number, number];
}

export function LeafletFieldMap({
  dataModeLabel,
  countryFocus,
  parcels,
  markers,
  selectedParcelId,
  note,
  onSelectParcel,
  onOpenNdvi,
}: LeafletFieldMapProps) {
  const { resolvedTheme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const pendingLayerRef = useRef<TileLayer | null>(null);
  const themeSeededRef = useRef(false);
  const overlayGroupsRef = useRef<Record<OverlayKey, LayerGroup> | null>(null);
  const countryLayerRef = useRef<Rectangle | null>(null);
  const countryFocusRef = useRef(countryFocus);
  countryFocusRef.current = countryFocus;

  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapTheme, setMapTheme] = useState<MapTheme>("light");
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerKey>("road");
  const [visibleOverlays, setVisibleOverlays] = useState<Record<OverlayKey, boolean>>({
    missions: true,
    alerts: true,
    cooperatives: false,
    farmers: false,
    parcelles: true,
  });
  const [layerNotice, setLayerNotice] = useState<string | null>(null);

  const visibleMarkers = useMemo(
    () => markers.filter((marker) => visibleOverlays[marker.kind]),
    [markers, visibleOverlays],
  );

  const visibleParcels = useMemo(
    () => (visibleOverlays.parcelles ? parcels : []),
    [parcels, visibleOverlays.parcelles],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Seed the map's own Clair/Sombre toggle from the app theme exactly once on mount.
    // Re-running this on every app theme change would silently override the user's
    // explicit map theme choice and retrigger the tile layer effect mid-interaction.
    if (!mounted || themeSeededRef.current) return;
    themeSeededRef.current = true;
    setMapTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [mounted, resolvedTheme]);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return;

    let disposed = false;

    async function setup() {
      const L = await import("leaflet");
      if (disposed || !mapContainerRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        minZoom: 4,
        maxZoom: 18,
      }).setView(countryFocusRef.current.center, 6);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      countryLayerRef.current = L.rectangle(countryFocusRef.current.bounds, {
        color: "#138A5E",
        weight: 1.4,
        fillColor: "#138A5E",
        fillOpacity: 0.04,
      }).addTo(map);

      overlayGroupsRef.current = {
        missions: L.layerGroup().addTo(map),
        alerts: L.layerGroup().addTo(map),
        cooperatives: L.layerGroup().addTo(map),
        farmers: L.layerGroup().addTo(map),
        parcelles: L.layerGroup().addTo(map),
      };

      mapRef.current = map;
      map.invalidateSize(false);
      setMapReady(true);
    }

    void setup();

    return () => {
      disposed = true;
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted]);

  useEffect(() => {
    // The sidebar can collapse/expand and the layout is responsive, which resizes the map
    // container without the window itself resizing. Leaflet only recalculates tile/marker
    // positions when told to, so without this the map renders at a stale size (tiles and
    // controls appear misplaced/overflowing) until a manual page refresh.
    if (!mapReady || !mapRef.current || !mapContainerRef.current) return;

    const map = mapRef.current;
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize(false);
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapRef.current) return;

    const L = leafletRef.current;
    const map = mapRef.current;
    let cancelled = false;
    const timeoutIds: number[] = [];

    // Cross-fade pattern: the previous tile layer is kept on the map (so the user never
    // sees a blank background) until the new one either finishes loading or is replaced
    // by an OSM fallback after too many tile errors / a stall timeout.
    function activate(layer: TileLayer, isFallback: boolean) {
      if (cancelled) {
        map.removeLayer(layer);
        return;
      }

      const previous = baseLayerRef.current;
      pendingLayerRef.current = layer;
      layer.addTo(map);

      let settled = false;
      let errorCount = 0;

      const settle = () => {
        if (settled || cancelled) return;
        settled = true;
        if (previous && previous !== layer) {
          map.removeLayer(previous);
        }
        baseLayerRef.current = layer;
        pendingLayerRef.current = null;
        setLayerNotice(
          isFallback ? "Couche cartographique indisponible : repli sur Routes (OSM)." : null,
        );
        map.invalidateSize(false);
        timeoutIds.push(window.setTimeout(() => map.invalidateSize(false), 150));
        timeoutIds.push(window.setTimeout(() => map.invalidateSize(false), 350));
      };

      layer.on("load", settle);

      layer.on("tileerror", () => {
        errorCount += 1;
        if (settled || isFallback || errorCount < 4) return;
        // The requested provider is unreachable: drop it and fall back to a known-good
        // OSM road layer instead of leaving the map blank until a manual refresh.
        map.removeLayer(layer);
        pendingLayerRef.current = null;
        const fallbackConfig = getLayerConfig("light", "road");
        const fallbackLayer = L.tileLayer(fallbackConfig.url, {
          attribution: fallbackConfig.attribution,
          maxZoom: fallbackConfig.maxZoom,
          detectRetina: true,
        });
        activate(fallbackLayer, true);
      });

      // Safety net for providers that never fire "load" (e.g. partial tile coverage at
      // the current zoom) so the cross-fade always resolves instead of stalling forever.
      timeoutIds.push(window.setTimeout(settle, 6000));
    }

    const config = getLayerConfig(mapTheme, activeBaseLayer);
    const layer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      detectRetina: true,
      className: config.className,
    });

    activate(layer, false);

    return () => {
      cancelled = true;
      timeoutIds.forEach((id) => window.clearTimeout(id));
      if (pendingLayerRef.current && pendingLayerRef.current !== baseLayerRef.current) {
        map.removeLayer(pendingLayerRef.current);
        pendingLayerRef.current = null;
      }
    };
  }, [activeBaseLayer, mapReady, mapTheme]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapRef.current || !overlayGroupsRef.current) return;

    const L = leafletRef.current;
    const map = mapRef.current;

    countryLayerRef.current?.setBounds(countryFocus.bounds);

    (Object.keys(overlayGroupsRef.current) as OverlayKey[]).forEach((key) => {
      overlayGroupsRef.current?.[key].clearLayers();
    });

    const fitTargets: Array<[number, number]> = [];

    visibleParcels.forEach((parcel) => {
      const popupContent = buildParcelPopupContent(parcel, onOpenNdvi);
      const polygonColor = OVERLAY_COLORS.parcelles;
      const markerLatLng =
        typeof parcel.lat === "number" && typeof parcel.lng === "number"
          ? ([parcel.lat, parcel.lng] as [number, number])
          : parcel.polygon
            ? getPolygonCenter(parcel.polygon)
            : null;

      if (parcel.polygon && parcel.polygon.length > 2) {
        const polygon = L.polygon(parcel.polygon, {
          color: polygonColor,
          weight: selectedParcelId === parcel.id ? 3.2 : 2,
          fillColor: polygonColor,
          fillOpacity: selectedParcelId === parcel.id ? 0.24 : 0.12,
          opacity: selectedParcelId === parcel.id ? 1 : 0.85,
        });
        polygon.on("click", () => onSelectParcel(parcel.id));
        polygon.bindPopup(buildParcelPopupContent(parcel, onOpenNdvi));
        overlayGroupsRef.current?.parcelles.addLayer(polygon);
        parcel.polygon.forEach((point) => fitTargets.push(point));
      }

      if (markerLatLng) {
        const marker = L.circleMarker(markerLatLng, {
          radius: selectedParcelId === parcel.id ? 8 : 6.5,
          color: "#ffffff",
          weight: 2,
          fillColor: polygonColor,
          fillOpacity: 0.95,
        });

        marker.on("click", () => onSelectParcel(parcel.id));
        marker.bindPopup(popupContent);
        overlayGroupsRef.current?.parcelles.addLayer(marker);
        fitTargets.push(markerLatLng);
      }
    });

    visibleMarkers.forEach((marker) => {
      const markerInstance = L.circleMarker([marker.lat, marker.lng], {
        radius: marker.kind === "alerts" ? 7 : 6,
        color: "#ffffff",
        weight: 2,
        fillColor: OVERLAY_COLORS[marker.kind],
        fillOpacity: 0.92,
      });

      markerInstance.bindPopup(buildMarkerPopupContent(marker));
      overlayGroupsRef.current?.[marker.kind].addLayer(markerInstance);
      fitTargets.push([marker.lat, marker.lng]);
    });

    if (fitTargets.length > 0) {
      const bounds = L.latLngBounds(fitTargets);
      map.fitBounds(bounds.pad(0.18), {
        animate: false,
        maxZoom: fitTargets.length === 1 ? 14 : 12,
      });
    } else {
      map.fitBounds(countryFocus.bounds, { animate: false, padding: [24, 24] });
    }

    map.invalidateSize(false);
  }, [countryFocus, mapReady, onOpenNdvi, onSelectParcel, selectedParcelId, visibleMarkers, visibleParcels]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-wk-surface2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-wk-faint">
            <Layers3 className="h-3.5 w-3.5" />
            Fonds cartographiques
          </span>
          <div className="inline-flex items-center gap-1 rounded-full border border-wk-border bg-wk-surface2 p-1">
            {(Object.keys(BASE_LAYER_LABELS) as BaseLayerKey[]).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setActiveBaseLayer(layer)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  activeBaseLayer === layer
                    ? "bg-wk-surface text-wk-text shadow-wk-sm"
                    : "text-wk-muted hover:text-wk-text",
                )}
              >
                {BASE_LAYER_LABELS[layer]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-wk-primarySoft px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-wk-primaryInk">
            {dataModeLabel}
          </span>
          <div className="inline-flex items-center gap-1 rounded-full border border-wk-border bg-wk-surface2 p-1">
            <button
              type="button"
              onClick={() => setMapTheme("light")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                mapTheme === "light"
                  ? "bg-wk-surface text-wk-text shadow-wk-sm"
                  : "text-wk-muted hover:text-wk-text",
              )}
            >
              <Sun className="h-3.5 w-3.5" />
              Clair
            </button>
            <button
              type="button"
              onClick={() => setMapTheme("dark")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                mapTheme === "dark"
                  ? "bg-wk-surface text-wk-text shadow-wk-sm"
                  : "text-wk-muted hover:text-wk-text",
              )}
            >
              <Moon className="h-3.5 w-3.5" />
              Sombre
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(OVERLAY_LABELS) as OverlayKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              setVisibleOverlays((current) => ({
                ...current,
                [key]: !current[key],
              }))
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
              visibleOverlays[key]
                ? "border-wk-border bg-wk-surface2 text-wk-text"
                : "border-wk-border bg-wk-surface text-wk-faint",
            )}
          >
            <span className={styles.legendSwatch} style={{ backgroundColor: OVERLAY_COLORS[key] }} />
            {OVERLAY_LABELS[key]}
          </button>
        ))}
      </div>

      <div className={styles.mapShell}>
        <div
          ref={mapContainerRef}
          className={cn(styles.mapCanvas, mapTheme === "dark" && styles.mapCanvasDark)}
        />

        {layerNotice ? (
          <div className={cn(styles.noteOverlay, mapTheme === "dark" && styles.noteOverlayDark)} style={{ top: "1rem", left: "1rem", right: "auto" }}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-wk-faint">
              Fond cartographique
            </p>
            <p className="mt-1 text-[12px] font-medium leading-relaxed text-inherit">{layerNotice}</p>
          </div>
        ) : null}

        {note ? (
          <div className={cn(styles.noteOverlay, mapTheme === "dark" && styles.noteOverlayDark)}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-wk-faint">
              Lecture terrain
            </p>
            <p className="mt-1 text-[12px] font-medium leading-relaxed text-inherit">{note}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
