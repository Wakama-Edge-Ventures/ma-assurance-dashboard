// reporting.ts — Report template definitions and CSV export utilities for Wakama Assurance

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  recipient: string;
  sections: string[];
  formats: ("PDF" | "CSV" | "JSON")[];
  sourceLabel: "LIVE" | "SEED_DEMO" | "MIXED";
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "risk-direction",
    title: "Rapport Direction des Risques",
    description:
      "Synthèse technique pour la direction risques : portfolio, scoring WRS, alertes critiques.",
    recipient: "Direction des Risques",
    sections: [
      "Synthèse exécutive",
      "Distribution risque WRS",
      "Top alertes critiques",
      "Missions terrain",
      "RAX/WRS intelligence",
    ],
    formats: ["PDF", "CSV", "JSON"],
    sourceLabel: "MIXED",
  },
  {
    id: "reinsurer",
    title: "Rapport Réassureur",
    description:
      "Pack données portefeuille pour le réassureur : exposition, sinistralité, qualité données.",
    recipient: "Réassureur",
    sections: [
      "Exposition portefeuille",
      "Sinistralité",
      "Qualité données",
      "Alertes NDVI/Météo",
    ],
    formats: ["PDF", "JSON"],
    sourceLabel: "SEED_DEMO",
  },
  {
    id: "portfolio-agricole",
    title: "Rapport Portefeuille Agricole",
    description:
      "Analyse des agriculteurs, parcelles, coopératives et scores NDVI.",
    recipient: "Équipe Risque",
    sections: [
      "Portefeuille agriculteurs",
      "Parcelles & NDVI",
      "Coopératives",
      "Alertes Wakama",
    ],
    formats: ["PDF", "CSV", "JSON"],
    sourceLabel: "LIVE",
  },
  {
    id: "missions-terrain",
    title: "Rapport Missions Terrain",
    description:
      "Suivi des missions : status, délais, anomalies, audits complétés.",
    recipient: "Coordinateur Terrain",
    sections: [
      "Statuts missions",
      "Anomalies",
      "Surface delta",
      "Photos & signatures",
    ],
    formats: ["PDF", "CSV"],
    sourceLabel: "SEED_DEMO",
  },
  {
    id: "alertes-sinistres",
    title: "Rapport Alertes & Sinistres",
    description:
      "Alertes actives, sinistres déclarés et suivi indemnisation.",
    recipient: "Gestionnaire Sinistres",
    sections: [
      "Alertes critiques",
      "Sinistres ouverts",
      "Sinistres clôturés",
      "Estimation pertes",
    ],
    formats: ["PDF", "CSV"],
    sourceLabel: "MIXED",
  },
  {
    id: "acaps-readiness",
    title: "Rapport ACAPS/CNDP Readiness",
    description:
      "Éléments de conformité technique : traçabilité, preuves d'intégrité, gouvernance données.",
    recipient: "Compliance & Direction",
    sections: [
      "Données collectées",
      "Preuve d'intégrité horodatée",
      "Traçabilité décisions",
      "Note de positionnement Wakama",
    ],
    formats: ["PDF", "JSON"],
    sourceLabel: "MIXED",
  },
  {
    id: "audit-trail",
    title: "Rapport Audit Trail & Paramètres",
    description:
      "Historique des configurations et trail d'audit des actions opérateurs.",
    recipient: "Auditeur Interne",
    sections: [
      "Versions configuration",
      "Actions opérateurs",
      "Changements de seuils",
      "Simulations RAX/WRS",
    ],
    formats: ["PDF", "JSON"],
    sourceLabel: "SEED_DEMO",
  },
  {
    id: "cooperatives-zones",
    title: "Rapport Coopératives & Zones",
    description:
      "Analyse par coopérative et zone géographique.",
    recipient: "Chargé de Portefeuille",
    sections: [
      "Coopératives actives",
      "Zones à risque",
      "Concentration portefeuille",
    ],
    formats: ["PDF", "CSV"],
    sourceLabel: "MIXED",
  },
];

/**
 * Build a CSV string from column headers and data rows.
 * All values are RFC-4180 double-quote escaped.
 */
export function buildCsvFromRows(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\n");
}
