// demo-scenario.ts — Guided demo scenario definition for Wakama Assurance Risk Oracle
// Pure data module — no client imports, no localStorage, SSR-safe.

export const DEMO_SCENARIO_ID = "parcours-cereales-maroc-001";

export type DemoStepStatus = "completed" | "active" | "pending";

export interface DemoStep {
  id: string;
  stepNumber: number;
  label: string;
  route: string;
  entityId: string;
  entityType: "application" | "mission" | "audit" | "rax" | "pricing" | "policy" | "monitoring" | "claim";
  status: DemoStepStatus;
  description: string;
  evidenceSummary: string;
  nextActionLabel: string;
  complianceNote: string;
}

export interface DemoScenario {
  scenarioId: string;
  title: string;
  subtitle: string;
  source: "SEED_DEMO";
  disclosureText: string;
  relatedEntityIds: {
    farmerId: string;
    farmerName: string;
    cooperativeId: string;
    cooperativeName: string;
    parcelleId: string;
    parcelleName: string;
    culture: string;
    applicationId: string;
    missionId: string;
    auditId: string;
    raxId: string;
    offerId: string;
    policyId: string;
    monitoringAlertId: string;
    claimId: string;
  };
  steps: DemoStep[];
}

export const DEMO_SCENARIO: DemoScenario = {
  scenarioId: DEMO_SCENARIO_ID,
  title: "Parcours assurance agricole — Dossier céréales Maroc",
  subtitle: "Dossier complet de bout en bout · Blé tendre Meknès · Youssef El Amrani",
  source: "SEED_DEMO",
  disclosureText:
    "Ce parcours est une simulation interface SEED_DEMO. Aucune mutation backend. La décision finale reste réservée à l'assureur.",
  relatedEntityIds: {
    farmerId: "far_001",
    farmerName: "Youssef El Amrani",
    cooperativeId: "coop_001",
    cooperativeName: "Coop Atlas Vert",
    parcelleId: "par_001",
    parcelleName: "Parcelle Atlas Nord",
    culture: "Blé tendre",
    applicationId: "app_001",
    missionId: "mis_001",
    auditId: "aud_001",
    raxId: "rax_001",
    offerId: "off_001",
    policyId: "pol_001",
    monitoringAlertId: "alr_001",
    claimId: "clm_001",
  },
  steps: [
    {
      id: "step-application",
      stepNumber: 1,
      label: "Demande",
      route: "/fr/applications/app_001",
      entityId: "app_001",
      entityType: "application",
      status: "completed",
      description:
        "Demande APP-MA-0001 créée pour Youssef El Amrani, 15 ha blé tendre, Meknès. Capital demandé : 250 000 MAD. Dossier KYC initial soumis.",
      evidenceSummary: "APP-MA-0001 · UNDER_REVIEW · 250 000 MAD demandés",
      nextActionLabel: "Voir la mission terrain →",
      complianceNote:
        "Recommandation non décisionnelle — décision finale réservée à l'assureur.",
    },
    {
      id: "step-mission",
      stepNumber: 2,
      label: "Mission",
      route: "/fr/missions/mis_001",
      entityId: "mis_001",
      entityType: "mission",
      status: "completed",
      description:
        "Mission de revue satellite configurée et complétée. Équipe Télédétection, région Meknès. Rapport de mission disponible.",
      evidenceSummary: "mis_001 · DONE · SATELLITE_REVIEW · Équipe Télédétection",
      nextActionLabel: "Voir l'audit terrain →",
      complianceNote:
        "La mission produit des preuves vérifiables ; l'arbitrage final reste réservé à l'assureur.",
    },
    {
      id: "step-audit",
      stepNumber: 3,
      label: "Audit terrain",
      route: "/fr/arbitrage/aud_001",
      entityId: "aud_001",
      entityType: "audit",
      status: "completed",
      description:
        "Audit de surface complété : écart -2% (dans les seuils). 4 actifs approuvés, 0 rejetés. Hash d'intégrité horodaté généré.",
      evidenceSummary: "aud_001 · -2% delta · 4 actifs ✓ · sha256:aud001-integrity",
      nextActionLabel: "Voir l'arbitrage →",
      complianceNote:
        "Revue technique non décisionnelle — validation finale réservée à l'assureur.",
    },
    {
      id: "step-arbitrage",
      stepNumber: 4,
      label: "Arbitrage",
      route: "/fr/arbitrage/aud_001",
      entityId: "aud_001",
      entityType: "audit",
      status: "completed",
      description:
        "Revue back-office complétée. Écart de surface -2% dans les seuils acceptables. Aucune anomalie. Dossier transmis pour scoring RAX/WRS.",
      evidenceSummary: "Écart surface : -2% · Actifs 4/0 · Anomalie : Non · Audit trail horodaté",
      nextActionLabel: "Voir RAX/WRS →",
      complianceNote:
        "Audit trail horodaté produit par Wakama ; décision de souscription réservée à l'assureur.",
    },
    {
      id: "step-rax",
      stepNumber: 5,
      label: "RAX / WRS",
      route: "/fr/rax/rax_001",
      entityId: "rax_001",
      entityType: "rax",
      status: "completed",
      description:
        "Score RAX/WRS calculé : WRS 46.4, tier MEDIUM_RISK. G=3.4, F=3.8, D=0.9. Framework v1 non décisionnel à calibrer.",
      evidenceSummary: "rax_001 · WRS 46.4 · MEDIUM_RISK · G3.4 F3.8 D0.9",
      nextActionLabel: "Voir la tarification →",
      complianceNote:
        "Score technique non décisionnel — calibration sinistralité réservée à l'assureur.",
    },
    {
      id: "step-pricing",
      stepNumber: 6,
      label: "Tarification",
      route: "/fr/pricing/off_001",
      entityId: "off_001",
      entityType: "pricing",
      status: "active",
      description:
        "Offre technique préparée : prime TTC 22 330 MAD, capital assuré 250 000 MAD. En attente décision farmer / validation assureur.",
      evidenceSummary: "off_001 · 22 330 MAD TTC · Capital 250 000 MAD · PENDING_FARMER",
      nextActionLabel: "Voir la police →",
      complianceNote:
        "Offre technique non contractuelle — émission et conditions finales réservées à l'assureur.",
    },
    {
      id: "step-policy",
      stepNumber: 7,
      label: "Police",
      route: "/fr/policies/pol_001",
      entityId: "pol_001",
      entityType: "policy",
      status: "pending",
      description:
        "Police de référence : POL-A-2026-00089, statut ACTIVE (démo). En attente de validation assureur pour le dossier APP-MA-0001.",
      evidenceSummary: "pol_001 · POL-A-2026-00089 · ACTIVE · Capital 180 000 MAD (démo)",
      nextActionLabel: "Voir le monitoring →",
      complianceNote:
        "Émission et responsabilité contractuelle réservées à l'assureur. Wakama suit et documente.",
    },
    {
      id: "step-monitoring",
      stepNumber: 8,
      label: "Monitoring",
      route: "/fr/monitoring/alr_001",
      entityId: "alr_001",
      entityType: "monitoring",
      status: "pending",
      description:
        "Monitoring 360° actif : signaux NDVI, météo, IoT. Alerte WARNING détectée : stress hydrique au-dessus du seuil hebdomadaire.",
      evidenceSummary: "alr_001 · NDVI WARNING · Stress hydrique détecté > seuil hebdomadaire",
      nextActionLabel: "Voir le sinistre →",
      complianceNote:
        "Signaux de monitoring non décisionnels — analyse et décision sinistre réservées à l'assureur.",
    },
    {
      id: "step-claim",
      stepNumber: 9,
      label: "Sinistre",
      route: "/fr/claims/clm_001",
      entityId: "clm_001",
      entityType: "claim",
      status: "pending",
      description:
        "Dossier sinistre ouvert : CLM-2026-0041, type DROUGHT, estimation 42 000 MAD. Sous revue assureur. Audit trail complet.",
      evidenceSummary: "clm_001 · CLM-2026-0041 · UNDER_REVIEW · 42 000 MAD · Drought",
      nextActionLabel: "Rapport parcours démo →",
      complianceNote:
        "Décision d'indemnisation réservée à l'assureur. Wakama fournit l'audit trail horodaté.",
    },
  ],
};

export function getDemoStepByEntityId(entityId: string): DemoStep | undefined {
  return DEMO_SCENARIO.steps.find((s) => s.entityId === entityId);
}

export function getDemoStepById(stepId: string): DemoStep | undefined {
  return DEMO_SCENARIO.steps.find((s) => s.id === stepId);
}

export function isScenarioEntityId(entityId: string): boolean {
  const ids = DEMO_SCENARIO.relatedEntityIds;
  return Object.values(ids).includes(entityId);
}
