import { DataSource } from "@/types";

export interface FallbackReferenceRecord {
  code: string;
  label: string;
  source: DataSource;
  confidence?: "LOW" | "MEDIUM" | "HIGH";
  [key: string]: unknown;
}

export const MOROCCO_REFERENCE_FALLBACK = {
  regions: [
    { code: "MA-01", label: "Tanger-Tetouan-Al Hoceima", source: "SEED_DEMO" as DataSource },
    { code: "MA-03", label: "Fes-Meknes", source: "SEED_DEMO" as DataSource },
  ],
  provinces: [
    { code: "LAR", label: "Larache", regionCode: "MA-01", source: "SEED_DEMO" as DataSource },
    { code: "MEK", label: "Meknes", regionCode: "MA-03", source: "SEED_DEMO" as DataSource },
  ],
  communes: [
    {
      code: "KSR-01",
      label: "Ksar El Kebir",
      provinceCode: "LAR",
      source: "SEED_DEMO" as DataSource,
    },
  ],
  cities: [{ code: "KSR", label: "Ksar El Kebir", source: "SEED_DEMO" as DataSource }],
  crops: [
    { code: "BLE_DUR", label: "Ble dur", source: "SEED_DEMO" as DataSource },
    { code: "BLE_TENDRE", label: "Ble tendre", source: "SEED_DEMO" as DataSource },
  ],
  cropSeasons: [
    { code: "2026-RAB", label: "Rabi 2026", source: "SEED_DEMO" as DataSource },
  ],
  agroClimaticZones: [
    { code: "ATL_N", label: "Atlantique nord", source: "SEED_DEMO" as DataSource },
  ],
  riskZones: [
    { code: "RZ-MED", label: "Risque agro-climatique moyen", source: "SEED_DEMO" as DataSource },
  ],
  dams: [
    {
      code: "DAM_OUED_EL_MAKHAZINE",
      label: "Oued El Makhazine",
      lat: 34.9417,
      lng: -5.8394,
      capacity: 807,
      source: "EXCEL_IMPORT" as DataSource,
      confidence: "MEDIUM",
    },
  ],
  riverSegments: [
    {
      code: "RIV_LKS_01",
      label: "Loukkos segment aval",
      source: "SEED_DEMO" as DataSource,
      confidence: "LOW",
    },
  ],
  floodRiskZones: [
    {
      code: "FLD_LKS_01",
      label: "Zone inondable Loukkos",
      source: "SEED_DEMO" as DataSource,
      confidence: "LOW",
    },
  ],
};

export const INSURANCE_REFERENCES_FALLBACK = {
  threats: [
    { code: "DROUGHT", label: "Secheresse", source: "SEED_DEMO" as DataSource },
    { code: "FLOOD", label: "Inondation", source: "SEED_DEMO" as DataSource },
  ],
  vulnerabilities: [
    { code: "IRRIGATION_LOW", label: "Irrigation limitee", source: "SEED_DEMO" as DataSource },
  ],
  raxParameters: [
    {
      code: "RAX_BASE_2026",
      label: "Calibration RAX base 2026",
      source: "SEED_DEMO" as DataSource,
    },
  ],
  claimCauses: [
    { code: "DROUGHT", label: "Secheresse", source: "SEED_DEMO" as DataSource },
    { code: "HAIL", label: "Grele", source: "SEED_DEMO" as DataSource },
  ],
  claimStatuses: [
    { code: "DECLARED", label: "Declare", source: "SEED_DEMO" as DataSource },
    { code: "UNDER_REVIEW", label: "En revue", source: "SEED_DEMO" as DataSource },
  ],
  alertThresholds: [
    { code: "NDVI_LOW", label: "NDVI faible", source: "SEED_DEMO" as DataSource },
  ],
  pricingParameters: [
    { code: "BASE_RATE", label: "Taux de base", source: "SEED_DEMO" as DataSource },
  ],
};
