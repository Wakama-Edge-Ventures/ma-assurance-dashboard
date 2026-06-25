import type { TenantConfig } from "@/config/tenants";
import type {
  IdjorFeatureFlag,
  IdjorFoundationRegistry,
  IdjorFoundationTenant,
  IdjorRegistryAgent,
  IdjorRegistryEngine,
  IdjorRegistryTool,
} from "@/types";

function buildTenantScope(tenant: TenantConfig): IdjorFoundationTenant {
  return {
    tenantKey: tenant.id,
    institutionId: null,
    country: tenant.country,
    vertical: tenant.vertical,
  };
}

function createAgent(
  id: string,
  agentKey: string,
  displayName: string,
  layer: string,
  description: string,
  registryStatus = "SOCLE",
): IdjorRegistryAgent {
  return {
    id,
    agentKey,
    displayName,
    layer,
    description,
    registryStatus,
    isEnabled: false,
    isReadOnly: true,
    source: "SEED_DEMO",
  };
}

function createEngine(
  id: string,
  engineKey: string,
  agentId: string | null,
  displayName: string,
  description: string,
  registryStatus = "SOCLE",
): IdjorRegistryEngine {
  return {
    id,
    engineKey,
    agentId,
    displayName,
    description,
    registryStatus,
    isEnabled: false,
    isReadOnly: true,
    source: "SEED_DEMO",
  };
}

function createTool(
  id: string,
  toolKey: string,
  engineId: string,
  displayName: string,
  description: string,
  allowedRoles: string[],
): IdjorRegistryTool {
  return {
    id,
    toolKey,
    engineId,
    displayName,
    description,
    accessMode: "READ_ONLY",
    isEnabled: false,
    isReadOnly: true,
    allowedRoles,
    source: "SEED_DEMO",
  };
}

function buildAgents(): IdjorRegistryAgent[] {
  return [
    createAgent(
      "idjor-agent-dca",
      "DCA",
      "Digital Contract Acquisition",
      "CONTROL_PLANE",
      "Acquisition, onboarding, document intake, and OCR preparation.",
    ),
    createAgent(
      "idjor-agent-ibdo",
      "IBDO",
      "Insurance Blockchain Document Officer",
      "PROOF",
      "Proof anchoring, audit trail preparation, and blockchain vault control.",
    ),
    createAgent(
      "idjor-agent-icgo",
      "ICGO",
      "Insurance Contract Governance Officer",
      "GOVERNANCE",
      "Governance and compliance cockpit for consent, PII, audit trail, evidence governance, and tenant scope.",
    ),
    createAgent(
      "idjor-agent-icoo",
      "ICOO",
      "Insurance Claims Optimization Officer",
      "POST_CONTRACT",
      "Operations cockpit across the chain without claim or payout side effects.",
    ),
    createAgent(
      "idjor-agent-iddo",
      "IDDO",
      "Insurance Deviation Detection Officer",
      "POST_CONTRACT",
      "Post-contract monitoring and deviation detection.",
      "COMING_SOON",
    ),
    createAgent(
      "idjor-agent-idjor",
      "IDJOR",
      "IDJOR Executive Governance",
      "EXECUTIVE",
      "Prepares executive explanations, documentation, and recommendations.",
    ),
    createAgent(
      "idjor-agent-ifdo",
      "IFDO",
      "Insurance Forensic & Due Diligence Officer",
      "GOVERNANCE",
      "Fraud, forensic, and anomaly review across the full chain.",
    ),
    createAgent(
      "idjor-agent-irax-d",
      "IRAX-D",
      "IRAX Deterministic Risk Calculation",
      "CONTROL_PLANE",
      "Deterministic CRDP risk calculation from IRAX3 outputs.",
    ),
    createAgent(
      "idjor-agent-irax-p",
      "IRAX-P",
      "IRAX Pre-Orchestration",
      "CONTROL_PLANE",
      "Prepares risk orchestration and investigation planning.",
    ),
    createAgent(
      "idjor-agent-irax1",
      "IRAX1",
      "IRAX Front Office Investigation",
      "CONTROL_PLANE",
      "Handles field evidence and first-line proof collection.",
    ),
    createAgent(
      "idjor-agent-irax2",
      "IRAX2",
      "IRAX Scientific Back Office",
      "CONTROL_PLANE",
      "Scientific and environmental evidence synthesis.",
    ),
    createAgent(
      "idjor-agent-irax3",
      "IRAX3",
      "IRAX Risk Consolidation",
      "CONTROL_PLANE",
      "Cross-engine consolidation, contradiction matrix, and IRAX-D preparation.",
    ),
    createAgent(
      "idjor-agent-iretex",
      "IRETEX",
      "Insurance RETEX & Strategic Intelligence Officer",
      "KNOWLEDGE",
      "Closure package and lessons learned synthesis across the full chain.",
    ),
  ];
}

function buildEngines(): IdjorRegistryEngine[] {
  return [
    createEngine(
      "idjor-engine-cognitive-governance",
      "cognitive-governance-engine",
      null,
      "Cognitive Governance Engine",
      "Cross-cutting control for prompts, source discipline, and access boundaries.",
    ),
    createEngine(
      "idjor-engine-dca-intake-package",
      "dca-intake-package-engine",
      "idjor-agent-dca",
      "DCA Intake Package Engine",
      "Prepares dossier intake, OCR routing, and declarative package assembly.",
    ),
    createEngine(
      "idjor-engine-ibdo-proof-anchoring",
      "ibdo-proof-anchoring-engine",
      "idjor-agent-ibdo",
      "IBDO Proof Anchoring Engine",
      "Prepares hash, timestamp, and proof chain anchoring.",
    ),
    createEngine(
      "idjor-engine-icgo-governance-compliance",
      "icgo-governance-compliance-engine",
      "idjor-agent-icgo",
      "ICGO Governance & Compliance Engine",
      "Deterministic governance and compliance snapshot without automatic certification.",
    ),
    createEngine(
      "idjor-engine-icoo-operations-cockpit",
      "icoo-operations-cockpit-engine",
      "idjor-agent-icoo",
      "ICOO Operations Cockpit Engine",
      "Deterministic pipeline overview, workload queues, SLA indicators, and bottlenecks.",
    ),
    createEngine(
      "idjor-engine-iddo-post-contract-monitoring",
      "iddo-post-contract-monitoring-engine",
      "idjor-agent-iddo",
      "IDDO Post-Contract Monitoring Engine",
      "Prepares post-contract monitoring and deviation alerts.",
      "COMING_SOON",
    ),
    createEngine(
      "idjor-engine-idjor-executive-arbitration",
      "idjor-executive-arbitration-engine",
      "idjor-agent-idjor",
      "IDJOR Executive Arbitration Engine",
      "Prepares non-decision executive dossiers and recommendations.",
      "COMING_SOON",
    ),
    createEngine(
      "idjor-engine-idjor-executive-cockpit",
      "idjor-executive-cockpit-full-chain-engine",
      "idjor-agent-idjor",
      "IDJOR Executive Cockpit Full Chain Engine",
      "Deterministic executive overview and full-chain synthesis.",
    ),
    createEngine(
      "idjor-engine-ifdo-forensic-anomaly-review",
      "ifdo-forensic-anomaly-review-engine",
      "idjor-agent-ifdo",
      "IFDO Forensic & Anomaly Review Engine",
      "Deterministic anomaly, evidence, identity, geo-temporal, and consistency review.",
    ),
    createEngine(
      "idjor-engine-irax1-field-investigation",
      "irax1-field-investigation-engine",
      "idjor-agent-irax1",
      "IRAX1 Field Investigation Engine",
      "Prepares mission evidence intake from field investigators.",
    ),
    createEngine(
      "idjor-engine-irax2-scientific-backoffice",
      "irax2-scientific-backoffice-engine",
      "idjor-agent-irax2",
      "IRAX2 Scientific Back Office Engine",
      "Deterministic scientific and environmental evidence synthesis.",
    ),
    createEngine(
      "idjor-engine-irax3-risk-consolidation",
      "irax3-risk-consolidation-engine",
      "idjor-agent-irax3",
      "IRAX3 Risk Consolidation Engine",
      "Deterministic cross-engine consolidation and IRAX-D preparation.",
    ),
    createEngine(
      "idjor-engine-iraxd-deterministic-risk-calculation",
      "iraxd-deterministic-risk-calculation-engine",
      "idjor-agent-irax-d",
      "IRAX-D Deterministic Risk Calculation Engine",
      "Deterministic risk-tier calculation from the IRAX3 CRIP.",
    ),
    createEngine(
      "idjor-engine-iraxp-pre-orchestration",
      "iraxp-pre-orchestration-engine",
      "idjor-agent-irax-p",
      "IRAX-P Pre-Orchestration Engine",
      "Prepares sequencing across field, back-office, and governance lanes.",
    ),
    createEngine(
      "idjor-engine-iretex-closure-lessons",
      "iretex-closure-lessons-engine",
      "idjor-agent-iretex",
      "IRETEX Closure & Lessons Learned Engine",
      "Deterministic closure package and lessons learned synthesis.",
    ),
    createEngine(
      "idjor-engine-rag",
      "rag-engine",
      null,
      "RAG Engine",
      "Cross-cutting read-only retrieval pipeline placeholder with citations.",
    ),
  ];
}

function buildTools(): IdjorRegistryTool[] {
  return [
    createTool(
      "idjor-tool-audit-log-read",
      "audit-log-read",
      "idjor-engine-cognitive-governance",
      "Audit Log Read",
      "Read append-only AI and audit traces without modification.",
      ["SUPERADMIN", "INSTITUTION_ADMIN"],
    ),
    createTool(
      "idjor-tool-document-metadata-read",
      "document-metadata-read",
      "idjor-engine-dca-intake-package",
      "Document Metadata Read",
      "Read document metadata without altering files or uploads.",
      ["SUPERADMIN", "INSTITUTION_ADMIN", "ADMIN", "ANALYST", "FIELD_AGENT"],
    ),
    createTool(
      "idjor-tool-evidence-read",
      "evidence-read",
      "idjor-engine-ibdo-proof-anchoring",
      "Evidence Read",
      "Read evidence references and proof metadata only.",
      ["SUPERADMIN", "INSTITUTION_ADMIN", "ADMIN", "ANALYST", "FIELD_AGENT"],
    ),
    createTool(
      "idjor-tool-institution-scope-read",
      "institution-scope-read",
      "idjor-engine-idjor-executive-arbitration",
      "Institution Scope Read",
      "Read institution-scoped control-plane metadata.",
      ["SUPERADMIN", "INSTITUTION_ADMIN", "ADMIN"],
    ),
    createTool(
      "idjor-tool-model-catalog-read",
      "model-catalog-read",
      "idjor-engine-cognitive-governance",
      "Model Catalog Read",
      "Read governed model catalog metadata without activation.",
      ["SUPERADMIN", "INSTITUTION_ADMIN"],
    ),
    createTool(
      "idjor-tool-policy-rules-read",
      "policy-rules-read",
      "idjor-engine-icgo-governance-compliance",
      "Policy Rules Read",
      "Read policy and governance rules in read-only mode.",
      ["SUPERADMIN", "INSTITUTION_ADMIN", "ADMIN", "ANALYST"],
    ),
    createTool(
      "idjor-tool-rag-citation-read",
      "rag-citation-read",
      "idjor-engine-rag",
      "RAG Citation Read",
      "Read citation metadata from governed retrieval outputs.",
      ["SUPERADMIN", "INSTITUTION_ADMIN", "ADMIN", "ANALYST"],
    ),
    createTool(
      "idjor-tool-tenant-scope-read",
      "tenant-scope-read",
      "idjor-engine-cognitive-governance",
      "Tenant Scope Read",
      "Read tenant-scoped governance metadata without mutation.",
      ["SUPERADMIN", "INSTITUTION_ADMIN", "ADMIN"],
    ),
  ];
}

function buildFeatureFlags(): IdjorFeatureFlag[] {
  return [
    {
      id: "idjor-flag-human-validation",
      targetType: "GOVERNANCE",
      targetKey: "validation_humaine",
      enabled: false,
      rolloutState: "OFF",
      source: "SEED_DEMO",
      notes: "Validation humaine obligatoire.",
    },
    {
      id: "idjor-flag-auto-decision",
      targetType: "GOVERNANCE",
      targetKey: "decision_automatique",
      enabled: false,
      rolloutState: "OFF",
      source: "SEED_DEMO",
      notes: "Decision automatique interdite.",
    },
  ];
}

export function hasRenderableIdjorRegistry(registry: IdjorFoundationRegistry | null): boolean {
  if (!registry) return false;
  return registry.agents.length > 0 || registry.engines.length > 0 || registry.tools.length > 0;
}

export function buildLocalPreparatoryIdjorRegistry(
  tenant: TenantConfig,
): IdjorFoundationRegistry {
  return {
    tenant: buildTenantScope(tenant),
    agents: buildAgents(),
    engines: buildEngines(),
    tools: buildTools(),
    featureFlags: buildFeatureFlags(),
    providers: [],
    models: [],
    securitySummary: {
      llmEnabled: false,
      vectorStoreEnabled: false,
      decisioningEnabled: false,
      sourceLabels: ["SEED_DEMO"],
      readOnly: true,
    },
    resolutionMode: "LOCAL_PREPARATORY_REGISTRY",
    readOnly: true,
  };
}
