import type {
  IdjorFeatureFlag,
  IdjorFoundationHealth,
  IdjorFoundationRegistry,
  IdjorRagHealth,
  IdjorRegistryAgent,
  IdjorRegistryEngine,
  IdjorRegistryTool,
} from "@/types";

export type CockpitTone = "active" | "prepared" | "readonly" | "disabled" | "unavailable";

export const STATUS_META: Record<
  CockpitTone,
  { label: string; dot: string; text: string; badge: string; cockpitText: string; border: string }
> = {
  active: {
    label: "Actif",
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]",
    text: "text-wk-primaryInk",
    badge: "border border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    cockpitText: "text-emerald-200",
    border: "border-emerald-300/45",
  },
  prepared: {
    label: "Préparé",
    dot: "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.85)]",
    text: "text-wk-tealInk",
    badge: "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    cockpitText: "text-cyan-100",
    border: "border-cyan-300/45",
  },
  readonly: {
    label: "Lecture seule",
    dot: "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.85)]",
    text: "text-wk-amberInk",
    badge: "border border-amber-300/25 bg-amber-300/10 text-amber-100",
    cockpitText: "text-amber-100",
    border: "border-amber-300/45",
  },
  disabled: {
    label: "Désactivé par gouvernance",
    dot: "bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.8)]",
    text: "text-wk-violetInk",
    badge: "border border-violet-300/25 bg-violet-300/10 text-violet-100",
    cockpitText: "text-violet-100",
    border: "border-violet-300/45",
  },
  unavailable: {
    label: "Indisponible",
    dot: "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]",
    text: "text-wk-coralInk",
    badge: "border border-rose-300/25 bg-rose-400/10 text-rose-100",
    cockpitText: "text-rose-100",
    border: "border-rose-300/45",
  },
};

export function resolveTone(input: {
  source?: string;
  isEnabled?: boolean;
  isReadOnly?: boolean;
  registryStatus?: string | null;
}): CockpitTone {
  const status = input.registryStatus?.toUpperCase() ?? "";

  if (input.source === "UNAVAILABLE" || status.includes("UNAVAILABLE") || status.includes("ERROR")) {
    return "unavailable";
  }

  if (status.includes("READ_ONLY") || status.includes("LECTURE_SEULE") || status.includes("READ ONLY")) {
    return "readonly";
  }

  if (status.includes("LIVE") || status.includes("ACTIVE") || status.includes("RUNNING")) {
    return input.isEnabled ? "active" : "disabled";
  }

  if (status.includes("SOCLE") || status.includes("PREPARE") || status.includes("READY")) {
    return "prepared";
  }

  if (
    status.includes("BLOCK") ||
    status.includes("DISABLED") ||
    status.includes("OFF") ||
    status.includes("A_VENIR") ||
    status.includes("A VENIR") ||
    status.includes("COMING_SOON")
  ) {
    return "disabled";
  }

  if (input.isReadOnly) return "readonly";
  if (input.isEnabled) return "prepared";
  return "disabled";
}

export type CockpitGroupId = "fondation" | "dca" | "risque" | "terrain" | "claims" | "outils" | "autres";

export const CATALOG_GROUP_ORDER: CockpitGroupId[] = [
  "fondation",
  "dca",
  "risque",
  "terrain",
  "claims",
  "outils",
  "autres",
];

export const CATALOG_GROUP_LABELS: Record<CockpitGroupId, { title: string; blurb: string }> = {
  fondation: {
    title: "Fondation & gouvernance",
    blurb: "Socle IDJOR, conformité, périmètre institutionnel et arbitrage préparatoire.",
  },
  dca: {
    title: "DCA / Documents / Preuves",
    blurb: "Acquisition, lecture documentaire, preuves et conservation probante.",
  },
  risque: {
    title: "Risque & orchestration",
    blurb: "Pré-orchestration, consolidation et calcul déterministe IRAX.",
  },
  terrain: {
    title: "Terrain / forensic / back office",
    blurb: "Investigation terrain, revue scientifique et anomalies documentées.",
  },
  claims: {
    title: "Monitoring / Claims / RETEX",
    blurb: "Surveillance post-contrat, opérations, causalité et retour d'expérience.",
  },
  outils: {
    title: "Outils de périmètre",
    blurb: "Lectures gouvernées du périmètre, des preuves, règles et citations.",
  },
  autres: {
    title: "Autres éléments du registre",
    blurb: "Éléments présents dans le registre courant sans rattachement explicite.",
  },
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function matchesAny(haystack: string, patterns: string[]): boolean {
  return patterns.some((pattern) => haystack.includes(pattern));
}

export function resolveAgentGroup(agent: IdjorRegistryAgent): CockpitGroupId {
  const key = normalize(`${agent.agentKey} ${agent.displayName}`);
  if (matchesAny(key, ["icgo", "idjor"])) return "fondation";
  if (matchesAny(key, ["dca", "ibdo", "blockchain document"])) return "dca";
  if (matchesAny(key, ["irax-d", "irax deterministic", "irax-p", "irax pre", "irax3"])) return "risque";
  if (matchesAny(key, ["ifdo", "forensic", "irax1", "irax2"])) return "terrain";
  if (matchesAny(key, ["icoo", "iddo", "iretex", "claims", "retex"])) return "claims";
  return "autres";
}

export function resolveEngineGroup(engine: IdjorRegistryEngine): CockpitGroupId {
  const key = normalize(`${engine.engineKey} ${engine.displayName}`);
  if (matchesAny(key, ["cognitive-governance", "icgo", "idjor-executive"])) return "fondation";
  if (matchesAny(key, ["dca-intake", "ibdo-proof", "rag-engine"])) return "dca";
  if (matchesAny(key, ["irax3", "iraxd", "irax-d", "iraxp", "irax-p"])) return "risque";
  if (matchesAny(key, ["ifdo", "irax1", "irax2"])) return "terrain";
  if (matchesAny(key, ["icoo", "iddo", "iretex"])) return "claims";
  return "autres";
}

export interface CatalogEntry {
  id: string;
  name: string;
  type: "Agent" | "Moteur" | "Outil";
  tone: CockpitTone;
  blurb: string;
  keyLabel?: string;
  groupId: CockpitGroupId;
}

export interface CatalogSection {
  id: "agents" | "engines" | "tools";
  title: string;
  entries: CatalogEntry[];
}

export interface CatalogGroup {
  id: CockpitGroupId;
  title: string;
  blurb: string;
  entries: CatalogEntry[];
}

function roleForCatalogEntry(entry: { displayName: string; description: string | null }, type: CatalogEntry["type"]): string {
  const name = normalize(entry.displayName);

  if (name.includes("digital contract acquisition")) return "Acquisition client, dossier et intake documentaire.";
  if (name.includes("blockchain document")) return "Ancrage probant, coffre et conservation des preuves.";
  if (name.includes("contract governance")) return "Règles, conformité et périmètre contractuel.";
  if (name.includes("claims optimization")) return "Préparation claims, causalité et opérations.";
  if (name.includes("deviation detection")) return "Surveillance post-contrat et alertes documentées.";
  if (name.includes("executive governance")) return "Régulation exécutive, explication et documentation.";
  if (name.includes("forensic")) return "Investigation, anomalies et due diligence.";
  if (name.includes("deterministic risk")) return "Calcul déterministe du risque, sans décision.";
  if (name.includes("pre-orchestration")) return "Prépare l'enchaînement IRAX et les revues.";
  if (name.includes("front office")) return "Investigation terrain et collecte d'éléments.";
  if (name.includes("scientific")) return "Analyse scientifique et back office.";
  if (name.includes("risk consolidation")) return "Consolidation risque et contradictions.";
  if (name.includes("retex")) return "Capitalisation, synthèse et leçons apprises.";
  if (name.includes("cognitive governance")) return "Analyse gouvernée, sources et discipline documentaire.";
  if (name.includes("rag engine")) return "Recherche documentaire gouvernée avec citations.";
  if (name.includes("policy rules")) return "Lecture des règles et politiques applicables.";
  if (name.includes("institution scope")) return "Lecture du périmètre institutionnel.";
  if (name.includes("tenant scope")) return "Lecture du périmètre tenant.";
  if (name.includes("model catalog")) return "Lecture du catalogue gouverné.";
  if (name.includes("audit log")) return "Lecture des traces append-only.";
  if (name.includes("metadata")) return "Lecture des métadonnées documentaires.";
  if (name.includes("evidence")) return "Lecture des références de preuve.";
  if (name.includes("citation")) return "Lecture des citations gouvernées.";

  return type === "Agent"
    ? "Agent de registre visuel, non décisionnel."
    : type === "Moteur"
      ? "Moteur gouverné du registre IDJOR."
      : "Outil en lecture gouvernée.";
}

function agentToCatalogEntry(agent: IdjorRegistryAgent): CatalogEntry {
  const groupId = resolveAgentGroup(agent);
  return {
    id: agent.id,
    name: agent.displayName,
    type: "Agent",
    tone: resolveTone({
      source: agent.source,
      isEnabled: agent.isEnabled,
      isReadOnly: agent.isReadOnly,
      registryStatus: agent.registryStatus,
    }),
    blurb: roleForCatalogEntry(agent, "Agent"),
    keyLabel: agent.agentKey,
    groupId,
  };
}

function engineToCatalogEntry(engine: IdjorRegistryEngine): CatalogEntry {
  const groupId = resolveEngineGroup(engine);
  return {
    id: engine.id,
    name: engine.displayName,
    type: "Moteur",
    tone: resolveTone({
      source: engine.source,
      isEnabled: engine.isEnabled,
      isReadOnly: engine.isReadOnly,
      registryStatus: engine.registryStatus,
    }),
    blurb: roleForCatalogEntry(engine, "Moteur"),
    keyLabel: engine.engineKey,
    groupId,
  };
}

function toolToCatalogEntry(tool: IdjorRegistryTool): CatalogEntry {
  return {
    id: tool.id,
    name: tool.displayName,
    type: "Outil",
    tone: resolveTone({
      source: tool.source,
      isEnabled: tool.isEnabled,
      isReadOnly: tool.isReadOnly,
      registryStatus: tool.accessMode,
    }),
    blurb: roleForCatalogEntry(tool, "Outil"),
    keyLabel: tool.toolKey,
    groupId: "outils",
  };
}

export function buildCatalogSections(registry: IdjorFoundationRegistry): CatalogSection[] {
  return [
    { id: "agents", title: `Agents (${registry.agents.length})`, entries: registry.agents.map(agentToCatalogEntry) },
    { id: "engines", title: `Moteurs (${registry.engines.length})`, entries: registry.engines.map(engineToCatalogEntry) },
    { id: "tools", title: `Outils gouvernés (${registry.tools.length})`, entries: registry.tools.map(toolToCatalogEntry) },
  ];
}

export function buildCatalogGroups(registry: IdjorFoundationRegistry): CatalogGroup[] {
  const buckets = new Map<CockpitGroupId, CatalogEntry[]>();
  const entries = [
    ...registry.agents.map(agentToCatalogEntry),
    ...registry.engines.map(engineToCatalogEntry),
    ...registry.tools.map(toolToCatalogEntry),
  ];

  entries.forEach((entry) => {
    const bucket = buckets.get(entry.groupId) ?? [];
    bucket.push(entry);
    buckets.set(entry.groupId, bucket);
  });

  return CATALOG_GROUP_ORDER.filter((id) => (buckets.get(id)?.length ?? 0) > 0).map((id) => ({
    id,
    title: CATALOG_GROUP_LABELS[id].title,
    blurb: CATALOG_GROUP_LABELS[id].blurb,
    entries: buckets.get(id) ?? [],
  }));
}

export interface RegistryMapping {
  id: string;
  name: string;
  type: CatalogEntry["type"];
  tone: CockpitTone;
  found: boolean;
}

type MappingSpec =
  | { type: "Agent"; keywords: string[]; fallbackName: string }
  | { type: "Moteur"; keywords: string[]; fallbackName: string }
  | { type: "Outil"; keywords: string[]; fallbackName: string };

function findAgent(registry: IdjorFoundationRegistry, keywords: string[]): IdjorRegistryAgent | undefined {
  return registry.agents.find((agent) => {
    const haystack = normalize(`${agent.agentKey} ${agent.displayName}`);
    return keywords.some((keyword) => haystack.includes(keyword));
  });
}

function findEngine(registry: IdjorFoundationRegistry, keywords: string[]): IdjorRegistryEngine | undefined {
  return registry.engines.find((engine) => {
    const haystack = normalize(`${engine.engineKey} ${engine.displayName}`);
    return keywords.some((keyword) => haystack.includes(keyword));
  });
}

function findTool(registry: IdjorFoundationRegistry, keywords: string[]): IdjorRegistryTool | undefined {
  return registry.tools.find((tool) => {
    const haystack = normalize(`${tool.toolKey} ${tool.displayName}`);
    return keywords.some((keyword) => haystack.includes(keyword));
  });
}

function resolveMapping(registry: IdjorFoundationRegistry, spec: MappingSpec): RegistryMapping {
  if (spec.type === "Agent") {
    const found = findAgent(registry, spec.keywords);
    if (!found) return missingMapping(spec);
    return {
      id: found.id,
      name: found.displayName,
      type: "Agent",
      tone: resolveTone({
        source: found.source,
        isEnabled: found.isEnabled,
        isReadOnly: found.isReadOnly,
        registryStatus: found.registryStatus,
      }),
      found: true,
    };
  }

  if (spec.type === "Moteur") {
    const found = findEngine(registry, spec.keywords);
    if (!found) return missingMapping(spec);
    return {
      id: found.id,
      name: found.displayName,
      type: "Moteur",
      tone: resolveTone({
        source: found.source,
        isEnabled: found.isEnabled,
        isReadOnly: found.isReadOnly,
        registryStatus: found.registryStatus,
      }),
      found: true,
    };
  }

  const found = findTool(registry, spec.keywords);
  if (!found) return missingMapping(spec);
  return {
    id: found.id,
    name: found.displayName,
    type: "Outil",
    tone: resolveTone({
      source: found.source,
      isEnabled: found.isEnabled,
      isReadOnly: found.isReadOnly,
      registryStatus: found.accessMode,
    }),
    found: true,
  };
}

function missingMapping(spec: MappingSpec): RegistryMapping {
  return {
    id: `missing-${spec.type}-${spec.fallbackName}`,
    name: spec.fallbackName,
    type: spec.type,
    tone: "unavailable",
    found: false,
  };
}

export type OrganigramIconKey =
  | "scale"
  | "shield"
  | "fingerprint"
  | "network"
  | "clipboard"
  | "target"
  | "chart"
  | "activity"
  | "check"
  | "calculator"
  | "eye"
  | "umbrella"
  | "brain"
  | "vault";

export type OrganigramAccent = "emerald" | "cyan" | "violet" | "amber" | "coral";

export interface OrganigramNode {
  id: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  note?: string;
  tag?: string;
  icon: OrganigramIconKey;
  tone: CockpitTone;
  accent: OrganigramAccent;
  mappings: RegistryMapping[];
}

function nodeTone(mappings: RegistryMapping[], fallback: CockpitTone = "prepared"): CockpitTone {
  if (mappings.some((mapping) => mapping.tone === "active")) return "active";
  if (mappings.some((mapping) => mapping.tone === "prepared")) return "prepared";
  if (mappings.some((mapping) => mapping.tone === "readonly")) return "readonly";
  if (mappings.some((mapping) => mapping.tone === "disabled")) return "disabled";
  if (mappings.some((mapping) => mapping.tone === "unavailable")) return "unavailable";
  return fallback;
}

function buildNode(
  registry: IdjorFoundationRegistry,
  node: Omit<OrganigramNode, "mappings" | "tone"> & { tone?: CockpitTone; mappings: MappingSpec[] },
): OrganigramNode {
  const mappings = node.mappings.map((mapping) => resolveMapping(registry, mapping));
  return {
    ...node,
    mappings,
    tone: node.tone ?? nodeTone(mappings),
  };
}

export interface IdjorOrganigram {
  executive: OrganigramNode;
  operational: OrganigramNode[];
  irax: OrganigramNode[];
  monitoring: OrganigramNode[];
  knowledge: OrganigramNode[];
  proof: OrganigramNode;
  governanceScope: RegistryMapping[];
}

export function buildIdjorOrganigram(registry: IdjorFoundationRegistry): IdjorOrganigram {
  return {
    executive: buildNode(registry, {
      id: "idjor",
      title: "IDJOR®",
      subtitle: "Régulateur opérationnel des décisions assurantielles",
      eyebrow: "Executive Layer",
      note: "Priorise, régule et documente - ne décide pas automatiquement",
      icon: "scale",
      accent: "emerald",
      mappings: [
        { type: "Agent", keywords: ["idjor executive governance", "idjor"], fallbackName: "IDJOR Executive Governance" },
        {
          type: "Moteur",
          keywords: ["idjor-executive-cockpit", "full-chain"],
          fallbackName: "IDJOR Executive Cockpit Full Chain Engine",
        },
        {
          type: "Moteur",
          keywords: ["idjor-executive-arbitration", "arbitration"],
          fallbackName: "IDJOR Executive Arbitration Engine",
        },
      ],
    }),
    operational: [
      buildNode(registry, {
        id: "icgo",
        title: "ICGO®",
        subtitle: "Governance Contractuelle",
        icon: "shield",
        accent: "coral",
        mappings: [
          {
            type: "Agent",
            keywords: ["insurance contract governance", "icgo"],
            fallbackName: "Insurance Contract Governance Officer",
          },
          {
            type: "Moteur",
            keywords: ["icgo-governance-compliance", "governance compliance"],
            fallbackName: "ICGO Governance & Compliance Engine",
          },
        ],
      }),
      buildNode(registry, {
        id: "ifdo",
        title: "IFDO®",
        subtitle: "Forensic Intelligence",
        icon: "fingerprint",
        accent: "cyan",
        mappings: [
          {
            type: "Agent",
            keywords: ["insurance forensic", "due diligence", "ifdo"],
            fallbackName: "Insurance Forensic & Due Diligence Officer",
          },
          {
            type: "Moteur",
            keywords: ["ifdo-forensic", "anomaly-review"],
            fallbackName: "IFDO Forensic & Anomaly Review Engine",
          },
        ],
      }),
      buildNode(registry, {
        id: "iretex-ops",
        title: "IRETEX®",
        subtitle: "Collective Intelligence",
        icon: "network",
        accent: "violet",
        mappings: [
          {
            type: "Agent",
            keywords: ["insurance retex", "strategic intelligence", "iretex"],
            fallbackName: "Insurance RETEX & Strategic Intelligence Officer",
          },
        ],
      }),
    ],
    irax: [
      buildNode(registry, {
        id: "dca",
        title: "DCA®",
        subtitle: "Acquisition client / dossier",
        icon: "clipboard",
        accent: "emerald",
        mappings: [
          { type: "Agent", keywords: ["digital contract acquisition", "dca"], fallbackName: "Digital Contract Acquisition" },
          { type: "Moteur", keywords: ["dca-intake"], fallbackName: "DCA Intake Package Engine" },
        ],
      }),
      buildNode(registry, {
        id: "irax-p",
        title: "IRAX-P®",
        subtitle: "Pré-orchestration",
        icon: "target",
        accent: "violet",
        mappings: [
          { type: "Agent", keywords: ["irax pre-orchestration", "irax-p"], fallbackName: "IRAX Pre-Orchestration" },
          { type: "Moteur", keywords: ["iraxp", "irax-p", "pre-orchestration"], fallbackName: "IRAX-P Pre-Orchestration Engine" },
        ],
      }),
      buildNode(registry, {
        id: "irax1",
        title: "IRAX1®",
        subtitle: "Investigation terrain",
        icon: "chart",
        accent: "coral",
        mappings: [
          { type: "Agent", keywords: ["irax front office", "irax1"], fallbackName: "IRAX Front Office Investigation" },
          { type: "Moteur", keywords: ["irax1", "field-investigation"], fallbackName: "IRAX1 Field Investigation Engine" },
        ],
      }),
      buildNode(registry, {
        id: "irax2",
        title: "IRAX2®",
        subtitle: "Back office scientifique",
        icon: "activity",
        accent: "cyan",
        mappings: [
          { type: "Agent", keywords: ["irax scientific", "irax2"], fallbackName: "IRAX Scientific Back Office" },
          { type: "Moteur", keywords: ["irax2", "scientific-backoffice", "scientific back office"], fallbackName: "IRAX2 Scientific Back Office Engine" },
        ],
      }),
      buildNode(registry, {
        id: "irax3",
        title: "IRAX3®",
        subtitle: "Consolidation risque",
        icon: "check",
        accent: "amber",
        mappings: [
          { type: "Agent", keywords: ["irax risk consolidation", "irax3"], fallbackName: "IRAX Risk Consolidation" },
          { type: "Moteur", keywords: ["irax3", "risk-consolidation"], fallbackName: "IRAX3 Risk Consolidation Engine" },
        ],
      }),
      buildNode(registry, {
        id: "irax-d",
        title: "IRAX-D®",
        subtitle: "Calcul déterministe",
        icon: "calculator",
        accent: "emerald",
        mappings: [
          { type: "Agent", keywords: ["irax deterministic", "irax-d"], fallbackName: "IRAX Deterministic Risk Calculation" },
          {
            type: "Moteur",
            keywords: ["iraxd", "irax-d", "deterministic-risk"],
            fallbackName: "IRAX-D Deterministic Risk Calculation Engine",
          },
        ],
      }),
    ],
    monitoring: [
      buildNode(registry, {
        id: "iddo",
        title: "IDDO®",
        subtitle: "Surveillance Intelligence",
        icon: "eye",
        accent: "cyan",
        mappings: [
          {
            type: "Agent",
            keywords: ["insurance deviation detection", "iddo"],
            fallbackName: "Insurance Deviation Detection Officer",
          },
          {
            type: "Moteur",
            keywords: ["iddo-post-contract", "post-contract-monitoring"],
            fallbackName: "IDDO Post-Contract Monitoring Engine",
          },
        ],
      }),
      buildNode(registry, {
        id: "icoo",
        title: "ICOO®",
        subtitle: "Claims & Causality Intelligence",
        icon: "umbrella",
        accent: "emerald",
        mappings: [
          {
            type: "Agent",
            keywords: ["insurance claims optimization", "icoo"],
            fallbackName: "Insurance Claims Optimization Officer",
          },
          {
            type: "Moteur",
            keywords: ["icoo-operations-cockpit", "operations-cockpit"],
            fallbackName: "ICOO Operations Cockpit Engine",
          },
        ],
      }),
    ],
    knowledge: [
      buildNode(registry, {
        id: "iretex-knowledge",
        title: "IRETEX® Collective Intelligence",
        subtitle: "Capitaliser · Partager · Apprendre",
        icon: "network",
        accent: "violet",
        mappings: [
          {
            type: "Agent",
            keywords: ["insurance retex", "strategic intelligence", "iretex"],
            fallbackName: "Insurance RETEX & Strategic Intelligence Officer",
          },
          {
            type: "Moteur",
            keywords: ["iretex", "closure-lessons"],
            fallbackName: "IRETEX Closure & Lessons Learned Engine",
          },
        ],
      }),
      buildNode(registry, {
        id: "cognitive-knowledge",
        title: "Cognitive Knowledge Layer",
        subtitle: "Relier · Synthétiser · Analyser · Recommander",
        tag: "Service d'analyse gouverné",
        icon: "brain",
        accent: "cyan",
        mappings: [
          { type: "Moteur", keywords: ["cognitive-governance"], fallbackName: "Cognitive Governance Engine" },
          { type: "Moteur", keywords: ["rag-engine"], fallbackName: "RAG Engine" },
        ],
      }),
    ],
    proof: buildNode(registry, {
      id: "ibdo",
      title: "IBDO® Probative Knowledge & Blockchain Vault",
      subtitle: "Preuve · Audit · Conservation",
      icon: "vault",
      accent: "amber",
      mappings: [
        {
          type: "Agent",
          keywords: ["insurance blockchain document", "ibdo"],
          fallbackName: "Insurance Blockchain Document Officer",
        },
        { type: "Moteur", keywords: ["ibdo-proof"], fallbackName: "IBDO Proof Anchoring Engine" },
        { type: "Outil", keywords: ["audit-log"], fallbackName: "Audit Log Read" },
        { type: "Outil", keywords: ["evidence-read"], fallbackName: "Evidence Read" },
        { type: "Outil", keywords: ["document-metadata"], fallbackName: "Document Metadata Read" },
        { type: "Outil", keywords: ["rag-citation"], fallbackName: "RAG Citation Read" },
      ],
    }),
    governanceScope: [
      resolveMapping(registry, {
        type: "Agent",
        keywords: ["insurance contract governance", "icgo"],
        fallbackName: "Insurance Contract Governance Officer",
      }),
      resolveMapping(registry, {
        type: "Moteur",
        keywords: ["icgo-governance-compliance", "governance compliance"],
        fallbackName: "ICGO Governance & Compliance Engine",
      }),
      resolveMapping(registry, { type: "Outil", keywords: ["policy-rules"], fallbackName: "Policy Rules Read" }),
      resolveMapping(registry, { type: "Outil", keywords: ["institution-scope"], fallbackName: "Institution Scope Read" }),
      resolveMapping(registry, { type: "Outil", keywords: ["tenant-scope"], fallbackName: "Tenant Scope Read" }),
      resolveMapping(registry, { type: "Outil", keywords: ["model-catalog"], fallbackName: "Model Catalog Read" }),
    ],
  };
}

export interface GovernanceNode {
  id: string;
  title: string;
  subtitle: string;
  tone: CockpitTone;
  tag?: string;
}

export function buildGovernanceNodes(
  health: IdjorFoundationHealth | null,
  ragHealth: IdjorRagHealth | null,
  featureFlags: IdjorFeatureFlag[],
): GovernanceNode[] {
  const nodes: GovernanceNode[] = [
    {
      id: "audit-append-only",
      title: "Audit append-only",
      subtitle: "Trace immuable des actions, lectures et preuves visibles.",
      tone: "readonly",
      tag: "Non décisionnel",
    },
    {
      id: "auto-decision-ban",
      title: "Décision automatique interdite",
      subtitle: "Toute décision reste du ressort de l'institution.",
      tone: "disabled",
      tag: "Gouverné",
    },
    {
      id: "human-validation",
      title: "Validation humaine obligatoire",
      subtitle: "Revue humaine requise avant toute suite opérationnelle.",
      tone: "readonly",
      tag: "Validation requise",
    },
    {
      id: "traceability",
      title: "Traçabilité active",
      subtitle: "Les éléments visibles restent attachés au registre et aux preuves.",
      tone: "prepared",
      tag: "Audit",
    },
  ];

  if (health) {
    nodes.push({
      id: "registry-read-only",
      title: "Lecture du registre",
      subtitle: health.readOnly ? "Accès encadré et tracé" : "Disponibilité préparatoire",
      tone: health.readOnly ? "readonly" : "prepared",
      tag: health.readOnly ? "Lecture seule" : "Préparé",
    });
  }

  if (ragHealth) {
    nodes.push({
      id: "rag-health",
      title: "Documents & citations",
      subtitle: `${ragHealth.counts.documents} document(s), ${ragHealth.counts.citations} citation(s)`,
      tone: ragHealth.securitySummary.ragEnabled ? "prepared" : "disabled",
      tag: ragHealth.readOnly ? "Lecture seule" : undefined,
    });
  }

  featureFlags.forEach((flag) => {
    nodes.push({
      id: flag.id,
      title: flag.targetKey.replaceAll("_", " "),
      subtitle: flag.enabled ? "Disponible dans le registre" : "Bloqué par gouvernance",
      tone: flag.enabled ? "active" : "disabled",
      tag: flag.enabled ? "Actif" : "Gouverné",
    });
  });

  return nodes;
}

export interface BenchmarkRow {
  label: string;
  value: string;
}

export function buildBenchmarkRows(registry: IdjorFoundationRegistry): BenchmarkRow[] {
  const isPreparatory = registry.resolutionMode === "LOCAL_PREPARATORY_REGISTRY";
  return [
    { label: "Institution", value: registry.tenant.institutionId ?? "Non renseignée" },
    { label: "Région", value: registry.tenant.country },
    { label: "Vertical", value: registry.tenant.vertical },
    {
      label: "Risque sectoriel",
      value: isPreparatory ? "Aperçu préparatoire" : "Évalué par calcul déterministe",
    },
  ];
}
