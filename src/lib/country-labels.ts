// Lightweight per-country labels for the DCA dashboard.
// Not a full i18n layer — only covers the few fields that differ between
// Maroc (MA) and Côte d'Ivoire (CI) dossiers.

export type DcaCountryCode = "MA" | "CI";

function normalizeCountry(country?: string | null): DcaCountryCode {
  return country === "CI" ? "CI" : "MA";
}

export function getCountryLabel(country?: string | null): string {
  return normalizeCountry(country) === "CI" ? "Côte d’Ivoire" : "Maroc";
}

export function getCurrencyCode(country?: string | null): "XOF" | "MAD" {
  return normalizeCountry(country) === "CI" ? "XOF" : "MAD";
}

export function formatAmountForCountry(value?: number | null, country?: string | null): string {
  if (value === null || value === undefined) return "Non disponible";
  const currency = getCurrencyCode(country);
  const label = currency === "XOF" ? "FCFA" : "MAD";
  return `${value.toLocaleString("fr-FR")} ${label}`;
}

export function getIdentityDocumentLabel(country?: string | null): string {
  return normalizeCountry(country) === "CI" ? "Pièce d’identité" : "CIN";
}

export function getPrivacyConsentLabel(country?: string | null): string {
  return normalizeCountry(country) === "CI"
    ? "Consentement données personnelles"
    : "Consentement CNDP";
}

export function getRegionLabel(country?: string | null): string {
  return normalizeCountry(country) === "CI" ? "Région" : "Province / Région";
}

export function getLocalityLabel(country?: string | null): string {
  return normalizeCountry(country) === "CI" ? "Localité" : "Commune / Village";
}
