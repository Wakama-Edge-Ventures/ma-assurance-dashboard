export type FieldMapCountryKey = "MA" | "CI" | "PANAF";

export interface FieldMapCountryFocus {
  key: FieldMapCountryKey;
  label: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
}

const MOROCCO_FOCUS: FieldMapCountryFocus = {
  key: "MA",
  label: "Maroc",
  center: [31.7, -7.1],
  bounds: [
    [27.6, -13.2],
    [35.92, -1.0],
  ],
};

const COTE_DIVOIRE_FOCUS: FieldMapCountryFocus = {
  key: "CI",
  label: "Cote d'Ivoire",
  center: [7.54, -5.5471],
  bounds: [
    [4.2, -8.75],
    [10.75, -2.45],
  ],
};

const PANAFRICAN_FOCUS: FieldMapCountryFocus = {
  key: "PANAF",
  label: "Panafricain",
  center: [9.5, -4.5],
  bounds: [
    [4.0, -18.0],
    [36.0, 12.0],
  ],
};

const COMBINING_DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(COMBINING_DIACRITICS_PATTERN, "");
}

/** Maps a tenant country code (TENANTS[id].country) to the map's country focus. */
export function resolveFieldMapCountryFocus(tenantCountry?: string | null): FieldMapCountryFocus {
  const normalized = tenantCountry?.trim().toUpperCase() ?? "";
  if (normalized === "MA") return MOROCCO_FOCUS;
  if (normalized === "CI" || normalized === "CI-PANAF") return COTE_DIVOIRE_FOCUS;
  return PANAFRICAN_FOCUS;
}

/** Normalizes a free-form country value coming from backend payloads to a known key, or null if unrecognized. */
export function normalizeCountryKey(raw?: string | null): FieldMapCountryKey | null {
  if (!raw) return null;
  const normalized = stripDiacritics(raw.trim().toUpperCase());
  if (["MA", "MAR", "MAROC", "MOROCCO"].includes(normalized)) return "MA";
  if (["CI", "CIV", "COTE D'IVOIRE", "COTE D IVOIRE", "IVORY COAST"].includes(normalized)) return "CI";
  return null;
}

export function isInsideBounds(
  lat: number | undefined,
  lng: number | undefined,
  bounds: FieldMapCountryFocus["bounds"],
): boolean {
  if (typeof lat !== "number" || !Number.isFinite(lat)) return false;
  if (typeof lng !== "number" || !Number.isFinite(lng)) return false;
  const [[latMin, lngMin], [latMax, lngMax]] = bounds;
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}
