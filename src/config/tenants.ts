export type TenantId = "assurance-ma" | "bni-ci" | "bad-program" | "wakama";

export interface TenantConfig {
  id: TenantId;
  displayName: string;
  shortName: string;
  postLoginPath: string;
  country: string;
  countryLabel: string;
  currency: string;
  locale: string;
  institutionType: string;
  vertical: string;
  logoPath: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    surface?: string;
  };
  terminology: {
    applicationsLabel: string;
    applicationSingular: string;
    riskLabel: string;
    scoreLabel: string;
    committeeLabel: string;
    evidenceLabel: string;
    portfolioLabel: string;
    institutionLabel: string;
    policyLabel: string;
    claimLabel: string;
    idjorLabel: string;
    decisionDisclaimer: string;
  };
  featureFlags: {
    showInsuranceNavigation: boolean;
    showRaxNavigation: boolean;
    showClaimsNavigation: boolean;
    showPoliciesNavigation: boolean;
    showDemoBadge: boolean;
  };
  demoMode: boolean;
  disclaimerLabel: string;
}

export const TENANT_IDS = [
  "assurance-ma",
  "bni-ci",
  "bad-program",
  "wakama",
] as const satisfies readonly TenantId[];

export const TENANTS: Record<TenantId, TenantConfig> = {
  "assurance-ma": {
    id: "assurance-ma",
    displayName: "Assurance",
    shortName: "Assurance",
    postLoginPath: "/fr/applications",
    country: "MA",
    countryLabel: "",
    currency: "MAD",
    locale: "fr-MA",
    institutionType: "Assureur",
    vertical: "Assurance agricole",
    logoPath: "fallback:wakama",
    colors: {
      primary: "#22d3ee",
      secondary: "#34d399",
      accent: "#a855f7",
      surface: "#101726",
    },
    terminology: {
      applicationsLabel: "Demandes d'assurance",
      applicationSingular: "demande assurance",
      riskLabel: "Risque assurance",
      scoreLabel: "RAX / WRS",
      committeeLabel: "Arbitrage",
      evidenceLabel: "Preuves terrain",
      portfolioLabel: "Portefeuille assurance",
      institutionLabel: "institution",
      policyLabel: "police",
      claimLabel: "sinistre",
      idjorLabel: "Socle IDJOR",
      decisionDisclaimer:
        "Wakama fournit une structuration technique du risque. L'institution reste seule decisionnaire pour l'eligibilite, la tarification commerciale, l'emission de police et l'indemnisation.",
    },
    featureFlags: {
      showInsuranceNavigation: true,
      showRaxNavigation: true,
      showClaimsNavigation: true,
      showPoliciesNavigation: true,
      showDemoBadge: false,
    },
    demoMode: false,
    disclaimerLabel: "Parcours assurance",
  },
  "bni-ci": {
    id: "bni-ci",
    displayName: "BNI Cote d'Ivoire",
    shortName: "BNI CI",
    postLoginPath: "/fr/dashboard",
    country: "CI",
    countryLabel: "Cote d'Ivoire",
    currency: "XOF",
    locale: "fr-CI",
    institutionType: "Banque",
    vertical: "Credit agricole",
    logoPath: "/tenants/bni-ci/logo.png",
    colors: {
      primary: "#16a34a",
      secondary: "#f59e0b",
      accent: "#0f766e",
      surface: "#111827",
    },
    terminology: {
      applicationsLabel: "Dossiers agricoles",
      applicationSingular: "dossier agricole",
      riskLabel: "Risque portefeuille",
      scoreLabel: "Score risque",
      committeeLabel: "Comite risque",
      evidenceLabel: "Pieces de preuve",
      portfolioLabel: "Portefeuille agricole",
      institutionLabel: "institution",
      policyLabel: "accord",
      claimLabel: "incident",
      idjorLabel: "Preuves & audit",
      decisionDisclaimer:
        "Wakama prepare le dossier et la lecture du risque. La decision finale reste sous le controle exclusif de l'institution.",
    },
    featureFlags: {
      showInsuranceNavigation: false,
      showRaxNavigation: false,
      showClaimsNavigation: false,
      showPoliciesNavigation: false,
      showDemoBadge: true,
    },
    demoMode: true,
    disclaimerLabel: "Demo institutionnelle - banque",
  },
  "bad-program": {
    id: "bad-program",
    displayName: "BAD Programme Agricole",
    shortName: "BAD Programme",
    postLoginPath: "/fr/dashboard",
    country: "CI-PANAF",
    countryLabel: "Panafricain / Cote d'Ivoire",
    currency: "XOF",
    locale: "fr-CI",
    institutionType: "Programme de developpement",
    vertical: "Programme agricole",
    logoPath: "/tenants/bad-program/logo.png",
    colors: {
      primary: "#2563eb",
      secondary: "#14b8a6",
      accent: "#f59e0b",
      surface: "#0f172a",
    },
    terminology: {
      applicationsLabel: "Dossiers programme agricole",
      applicationSingular: "dossier programme",
      riskLabel: "Risque & impact",
      scoreLabel: "Score suivi",
      committeeLabel: "Comite programme",
      evidenceLabel: "Preuves & conformite",
      portfolioLabel: "Portefeuille agricole",
      institutionLabel: "institution",
      policyLabel: "accord",
      claimLabel: "incident",
      idjorLabel: "Preuves & audit",
      decisionDisclaimer:
        "Wakama prepare le dossier, les preuves et les indicateurs. Les decisions restent sous le controle exclusif de l'institution.",
    },
    featureFlags: {
      showInsuranceNavigation: false,
      showRaxNavigation: false,
      showClaimsNavigation: false,
      showPoliciesNavigation: false,
      showDemoBadge: true,
    },
    demoMode: true,
    disclaimerLabel: "Demo institutionnelle - programme",
  },
  wakama: {
    id: "wakama",
    displayName: "Wakama Demo Workspace",
    shortName: "Wakama",
    postLoginPath: "/fr/dashboard",
    country: "PANAF",
    countryLabel: "Panafricain",
    currency: "XOF",
    locale: "fr-CI",
    institutionType: "Plateforme",
    vertical: "Orchestration institutionnelle",
    logoPath: "fallback:wakama",
    colors: {
      primary: "#22d3ee",
      secondary: "#34d399",
      accent: "#f59e0b",
      surface: "#0f172a",
    },
    terminology: {
      applicationsLabel: "Dossiers institutionnels",
      applicationSingular: "dossier",
      riskLabel: "Risque",
      scoreLabel: "Score",
      committeeLabel: "Comite",
      evidenceLabel: "Preuves",
      portfolioLabel: "Plateforme Wakama",
      institutionLabel: "institution",
      policyLabel: "accord",
      claimLabel: "incident",
      idjorLabel: "Preuves & audit",
      decisionDisclaimer:
        "Wakama structure la lecture technique et les preuves. La decision finale reste entierement du ressort de l'institution.",
    },
    featureFlags: {
      showInsuranceNavigation: false,
      showRaxNavigation: false,
      showClaimsNavigation: false,
      showPoliciesNavigation: false,
      showDemoBadge: true,
    },
    demoMode: true,
    disclaimerLabel: "Demo Wakama neutre",
  },
};
