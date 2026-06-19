"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BotOff,
  ChevronDown,
  ChevronUp,
  Eye,
  FileSearch,
  Flag,
  Layers3,
  Network,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Upload,
  Wrench,
} from "lucide-react";

import { useTenant } from "@/components/tenant/useTenant";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AppCard } from "@/components/ui/app-card";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { Button } from "@/components/ui/button";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { PageTitle } from "@/components/ui/page-title";
import { SourceBadge } from "@/components/ui/source-badge";
import {
  API_BASE_URL,
  ApiError,
  getIdjorFoundationHealth,
  getIdjorFoundationRegistry,
  getIdjorRagAuditEvents,
  getIdjorRagChunks,
  getIdjorRagCitations,
  getIdjorRagDocumentAuditEvents,
  getIdjorRagDocumentIngestionPreview,
  getIdjorRagDocuments,
  getIdjorRagDocumentUploads,
  getIdjorRagHealth,
  getIdjorRagUploadExtractions,
  registerIdjorRagDocumentMetadata,
  runIdjorRagUploadExtractionPreview,
  uploadIdjorRagDocumentIntake,
} from "@/lib/api";
import { withAlpha } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import type {
  IdjorFoundationHealth,
  IdjorFoundationRegistry,
  IdjorRagAuditEvent,
  IdjorRagAuditEventsPage,
  IdjorRagChunksSnapshot,
  IdjorRagCitationsSnapshot,
  IdjorRagDocumentAuditEventsPage,
  IdjorRagDocumentExtraction,
  IdjorRagDocumentExtractionsPage,
  IdjorRagDocumentRegistrationSource,
  IdjorRagDocumentsSnapshot,
  IdjorRagDocumentUploadsPage,
  IdjorRagExtractionPreviewResponse,
  IdjorRagHealth,
  IdjorRagIngestionPreview,
  IdjorRagMetadataRegistrationStatus,
  IdjorRagUploadIntakeResponse,
  IdjorRegisterRagDocumentMetadataResult,
} from "@/types";

type FoundationState =
  | {
      status: "loading";
      tenantKey: string | null;
    }
  | {
      status: "ready";
      tenantKey: string | null;
      health: IdjorFoundationHealth;
      registry: IdjorFoundationRegistry;
      ragHealth: IdjorRagHealth;
      ragDocuments: IdjorRagDocumentsSnapshot;
      ragChunks: IdjorRagChunksSnapshot;
      ragCitations: IdjorRagCitationsSnapshot;
      ragAuditEvents: IdjorRagAuditEventsPage;
    }
  | {
      status: "error";
      tenantKey: string | null;
      error: {
        statusCode: number | null;
        message: string;
      };
    };

type SectionKey =
  | "summary"
  | "agents"
  | "engines"
  | "tools"
  | "flags"
  | "providersModels"
  | "rag"
  | "ragAudit"
  | "security";

type SectionState = Record<SectionKey, boolean>;

const COMPACT_SECTION_STATE: SectionState = {
  summary: true,
  agents: false,
  engines: false,
  tools: false,
  flags: false,
  providersModels: false,
  rag: true,
  ragAudit: false,
  security: true,
};

const FULL_SECTION_STATE: SectionState = {
  summary: true,
  agents: true,
  engines: true,
  tools: true,
  flags: true,
  providersModels: true,
  rag: true,
  ragAudit: true,
  security: true,
};

const DEMO_COMPACT_SECTION_STATE: SectionState = {
  summary: true,
  agents: false,
  engines: false,
  tools: false,
  flags: false,
  providersModels: false,
  rag: true,
  ragAudit: true,
  security: false,
};

const DEMO_FULL_SECTION_STATE: SectionState = {
  summary: true,
  agents: false,
  engines: false,
  tools: false,
  flags: false,
  providersModels: false,
  rag: true,
  ragAudit: true,
  security: true,
};

interface SummaryMetricProps {
  label: string;
  value: string;
  hint: string;
}

interface ExecutiveStatusProps {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface SectionCardProps {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  countLabel?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

interface RagRegistrationFormState {
  documentKey: string;
  title: string;
  source: IdjorRagDocumentRegistrationSource;
  ingestionStatus: IdjorRagMetadataRegistrationStatus;
  externalReference: string;
  metadataJson: string;
}

type RagRegistrationState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: "success";
      result: IdjorRegisterRagDocumentMetadataResult;
    }
  | {
      status: "error";
      message: string;
    };

type RagIngestionPreviewState =
  | { status: "idle" }
  | { status: "loading"; documentId: string }
  | { status: "success"; documentId: string; preview: IdjorRagIngestionPreview }
  | { status: "error"; documentId: string; message: string };

type RagDocumentAuditState =
  | { status: "idle" }
  | { status: "loading"; documentId: string }
  | { status: "success"; documentId: string; page: IdjorRagDocumentAuditEventsPage }
  | { status: "error"; documentId: string; message: string };

type RagUploadIntakeState =
  | { status: "idle" }
  | { status: "uploading"; documentId: string }
  | { status: "success"; documentId: string; result: IdjorRagUploadIntakeResponse }
  | { status: "error"; documentId: string; message: string };

type RagUploadsListState =
  | { status: "idle" }
  | { status: "loading"; documentId: string }
  | { status: "success"; documentId: string; page: IdjorRagDocumentUploadsPage }
  | { status: "error"; documentId: string; message: string };

type RagExtractionPreviewState =
  | { status: "idle" }
  | { status: "loading"; uploadId: string }
  | { status: "success"; uploadId: string; response: IdjorRagExtractionPreviewResponse }
  | { status: "error"; uploadId: string; message: string };

type RagUploadExtractionsListState =
  | { status: "idle" }
  | { status: "loading"; uploadId: string }
  | { status: "success"; uploadId: string; page: IdjorRagDocumentExtractionsPage }
  | { status: "error"; uploadId: string; message: string };

const RAG_UPLOAD_INTAKE_MAX_BYTES = 10 * 1024 * 1024;

const RAG_UPLOAD_INTAKE_ALLOWED_MIME_TYPES = new Set<string>([
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function validateRagUploadIntakeFile(file: File): string | null {
  if (file.size <= 0) {
    return "Le fichier selectionne est vide.";
  }
  if (file.size > RAG_UPLOAD_INTAKE_MAX_BYTES) {
    return "Le fichier depasse la taille maximale autorisee de 10 Mo.";
  }
  if (!RAG_UPLOAD_INTAKE_ALLOWED_MIME_TYPES.has(file.type)) {
    return "Type de fichier non autorise. Formats acceptes: PDF, TXT, DOCX.";
  }
  return null;
}

const DEFAULT_RAG_REGISTRATION_FORM: RagRegistrationFormState = {
  documentKey: "",
  title: "",
  source: "SEED_DEMO",
  ingestionStatus: "REGISTERED",
  externalReference: "",
  metadataJson: "",
};

const METADATA_REGISTRATION_SOURCE_OPTIONS: IdjorRagDocumentRegistrationSource[] = [
  "SEED_DEMO",
  "MANUAL_ESTIMATE",
  "DEGRADED",
  "UNAVAILABLE",
];

function SummaryMetric({ label, value, hint }: SummaryMetricProps) {
  return (
    <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 bg-gradient-to-r from-cyan-300 via-emerald-200 to-cyan-400 bg-clip-text font-mono text-[28px] font-semibold text-transparent">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function buildRegistrationSourceOptions(sourceLabels: string[]) {
  const options = [...METADATA_REGISTRATION_SOURCE_OPTIONS];

  if (sourceLabels.includes("LIVE")) {
    options.push("LIVE");
  }

  return options;
}

function parseMetadataJsonInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      metadataJson: null,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        metadataJson: null,
        error: "Le JSON metadata doit etre un objet.",
      };
    }

    return {
      metadataJson: parsed as Record<string, unknown>,
      error: null,
    };
  } catch {
    return {
      metadataJson: null,
      error: "Le JSON metadata est invalide.",
    };
  }
}

function ExecutiveStatus({
  label,
  value,
  tone = "neutral",
}: ExecutiveStatusProps) {
  const toneClass = {
    success: "border-emerald-400/28 bg-emerald-400/10 text-emerald-300",
    warning: "border-amber-400/28 bg-amber-400/10 text-amber-300",
    danger: "border-rose-400/28 bg-rose-400/10 text-rose-300",
    neutral: "border-slate-400/18 bg-slate-400/8 text-slate-200",
  }[tone];

  return (
    <div className={cn("rounded-2xl border px-3.5 py-3", toneClass)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-80">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  countLabel,
  open,
  onToggle,
  children,
}: SectionCardProps) {
  return (
    <AppCard className="overflow-hidden p-0" tone="soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {icon ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-400/16 bg-slate-400/8 text-slate-200">
                {icon}
              </span>
            ) : null}
            <h2 className="font-display text-[18px] font-semibold text-white">{title}</h2>
            {countLabel ? (
              <span className="rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
                {countLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <span className="mt-0.5 rounded-full border border-slate-400/16 bg-slate-400/8 p-2 text-slate-300">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open ? <div className="border-t border-slate-400/10 px-5 py-4">{children}</div> : null}
    </AppCard>
  );
}

function RegistryTable<T extends { id: string }>({
  rows,
  columns,
  emptyLabel,
  maxHeightClass,
}: {
  rows: T[];
  columns: Column<T>[];
  emptyLabel: string;
  maxHeightClass?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
        <p className="text-sm text-slate-400">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75">
      <div className={cn("overflow-auto", maxHeightClass)}>
        <table className="min-w-full divide-y divide-slate-400/10">
          <thead className="sticky top-0 z-10 bg-[#11192b]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-400/8 align-top">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 text-sm text-slate-200", column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatAuditEventSummary(event: IdjorRagAuditEvent): string {
  const parts: string[] = [];

  if (event.operation) {
    parts.push(event.operation);
  }

  if (event.documentKey) {
    parts.push(event.documentKey);
  }

  if (event.ingestionStatus) {
    parts.push(`ingestionStatus=${event.ingestionStatus}`);
  }

  return parts.length > 0 ? parts.join(" - ") : "Aucun resume supplementaire.";
}

function AuditEventList({
  events,
  emptyLabel,
  maxHeightClass,
}: {
  events: IdjorRagAuditEvent[];
  emptyLabel: string;
  maxHeightClass?: string;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
        <p className="text-sm text-slate-400">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2 overflow-auto rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-3",
        maxHeightClass,
      )}
    >
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-2xl border border-slate-400/10 bg-slate-400/5 px-3.5 py-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-400/24 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200">
              {event.eventType}
            </span>
            {event.documentKey ? (
              <span className="font-mono text-[11px] text-slate-400">{event.documentKey}</span>
            ) : null}
            <span className="ml-auto font-mono text-[10px] text-slate-500">
              {event.createdAt}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {formatAuditEventSummary(event)}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span>
              source: <span className="text-slate-300">{event.source}</span>
            </span>
            <span>
              actorRole: <span className="text-slate-300">{event.actorRole ?? "Systeme"}</span>
            </span>
            <span>
              actorUserId:{" "}
              <span className="text-slate-300">{event.actorUserId ?? "Systeme"}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExtractionResultBlock({ extraction }: { extraction: IdjorRagDocumentExtraction }) {
  return (
    <div className="rounded-2xl border border-slate-400/10 bg-slate-400/5 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-400/24 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200">
          {extraction.status}
        </span>
        <span className="font-mono text-[11px] text-slate-400">{extraction.mimeType}</span>
        <span className="ml-auto font-mono text-[10px] text-slate-500">
          {extraction.createdAt}
        </span>
      </div>

      {extraction.status === "EXTRACTED_PENDING_REVIEW" && extraction.previewText ? (
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-400/10 bg-[#0c1322]/80 p-3 text-xs leading-relaxed text-slate-200">
          {extraction.previewText}
        </pre>
      ) : null}

      {extraction.status === "UNSUPPORTED_PENDING_EXTRACTOR" ? (
        <p className="mt-2 text-xs leading-relaxed text-amber-300">
          Extracteur non active pour ce format. Aucun parsing n&apos;a ete effectue.
        </p>
      ) : null}

      {(extraction.status === "FILE_MISSING" || extraction.status === "FAILED") &&
      extraction.errorReason ? (
        <p className="mt-2 text-xs leading-relaxed text-rose-300">
          {extraction.errorReason}
        </p>
      ) : null}

      <p className="mt-2 text-[11px] text-slate-500">
        previewTextLength: {extraction.previewTextLength ?? 0}
      </p>
    </div>
  );
}

function buildSectionState(compactMode: boolean, demoSafeMode: boolean): SectionState {
  if (demoSafeMode) {
    return compactMode
      ? { ...DEMO_COMPACT_SECTION_STATE }
      : { ...DEMO_FULL_SECTION_STATE };
  }

  return compactMode ? { ...COMPACT_SECTION_STATE } : { ...FULL_SECTION_STATE };
}

function getTableHeightClass(compactMode: boolean) {
  return compactMode ? "max-h-[320px]" : "max-h-[520px]";
}

function getErrorCard(state: Extract<FoundationState, { status: "error" }>, tenantKey: string) {
  if (state.error.statusCode === 401) {
    return (
      <AuthRequiredCard
        title="Authentification backend requise pour IDJOR"
        description="La vue /fr/idjor consomme les routes protegees /v1/idjor/foundation/* et /v1/idjor/rag/*. Reconnectez-vous avec une session backend valide."
      />
    );
  }

  if (state.error.statusCode === 403) {
    return (
      <AccessDeniedCard
        title="Acces IDJOR refuse"
        description="Votre role ou votre scope actuel ne permet pas de lire ce registre IDJOR."
      />
    );
  }

  const tenantHint =
    state.error.statusCode === 400
      ? ` Si necessaire, ajoutez ?tenantKey=${tenantKey} a l'URL.`
      : "";

  return (
    <DegradedStateCard
      title="Socle IDJOR indisponible"
      description={`${state.error.message}.${tenantHint} Cette vue reste strictement read-only et n'active aucun moteur IA.`}
    />
  );
}

export function IdjorFoundationPanel() {
  const { tenant } = useTenant();
  const demoSafeMode = tenant.demoMode;
  const showTechnicalSections = !tenant.demoMode;
  const searchParams = useSearchParams();
  const explicitTenantKey = searchParams.get("tenantKey")?.trim() || null;
  const [compactMode, setCompactMode] = useState(true);
  const [sections, setSections] = useState<SectionState>(() => buildSectionState(true, demoSafeMode));
  const [ragRegistrationForm, setRagRegistrationForm] = useState<RagRegistrationFormState>(
    DEFAULT_RAG_REGISTRATION_FORM,
  );
  const [ragRegistrationState, setRagRegistrationState] = useState<RagRegistrationState>({
    status: "idle",
  });
  const [ragIngestionPreviewState, setRagIngestionPreviewState] =
    useState<RagIngestionPreviewState>({ status: "idle" });
  const [ragDocumentAuditState, setRagDocumentAuditState] = useState<RagDocumentAuditState>({
    status: "idle",
  });
  const [uploadPanelDocumentId, setUploadPanelDocumentId] = useState<string | null>(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadFileError, setUploadFileError] = useState<string | null>(null);
  const [ragUploadIntakeState, setRagUploadIntakeState] = useState<RagUploadIntakeState>({
    status: "idle",
  });
  const [ragUploadsListState, setRagUploadsListState] = useState<RagUploadsListState>({
    status: "idle",
  });
  const [extractionPanelUploadId, setExtractionPanelUploadId] = useState<string | null>(null);
  const [ragExtractionPreviewState, setRagExtractionPreviewState] =
    useState<RagExtractionPreviewState>({ status: "idle" });
  const [ragUploadExtractionsListState, setRagUploadExtractionsListState] =
    useState<RagUploadExtractionsListState>({ status: "idle" });
  const [state, setState] = useState<FoundationState>({
    status: "loading",
    tenantKey: explicitTenantKey,
  });

  useEffect(() => {
    let cancelled = false;

    async function refreshRagSnapshots(tenantKey: string | null) {
      const [ragHealth, ragDocuments, ragChunks, ragCitations, ragAuditEvents] =
        await Promise.all([
          getIdjorRagHealth({ tenantKey }),
          getIdjorRagDocuments({ tenantKey }),
          getIdjorRagChunks({ tenantKey }),
          getIdjorRagCitations({ tenantKey }),
          getIdjorRagAuditEvents({ tenantKey }),
        ]);

      return { ragHealth, ragDocuments, ragChunks, ragCitations, ragAuditEvents };
    }

    async function load() {
      setState({ status: "loading", tenantKey: explicitTenantKey });

      try {
        const [health, registry, ragSnapshots] = await Promise.all([
          getIdjorFoundationHealth({ tenantKey: explicitTenantKey }),
          getIdjorFoundationRegistry({ tenantKey: explicitTenantKey }),
          refreshRagSnapshots(explicitTenantKey),
        ]);

        if (cancelled) return;

        setState({
          status: "ready",
          tenantKey: explicitTenantKey,
          health,
          registry,
          ...ragSnapshots,
        });
      } catch (error) {
        if (cancelled) return;

        const statusCode = error instanceof ApiError ? error.status : null;
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Impossible de charger le socle IDJOR.";

        setState({
          status: "error",
          tenantKey: explicitTenantKey,
          error: { statusCode, message },
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [explicitTenantKey]);

  const displayTenantKey =
    state.status === "ready"
      ? state.registry.tenant.tenantKey
      : state.tenantKey ?? tenant.id;

  const resolutionMode =
    state.status === "ready"
      ? state.registry.resolutionMode ?? state.health.resolutionMode ?? "UNKNOWN"
      : null;

  const setMode = (nextCompactMode: boolean) => {
    setCompactMode(nextCompactMode);
    setSections(buildSectionState(nextCompactMode, demoSafeMode));
  };

  const toggleSection = (key: SectionKey) => {
    setSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const tableHeightClass = getTableHeightClass(compactMode);

  const foundationReady =
    state.status === "ready" &&
    state.health.readOnly &&
    state.health.allFeatureFlagsOff &&
    state.health.allProvidersDisabled &&
    state.health.allModelsDisabled &&
    state.health.allToolsReadOnly &&
    !state.health.securitySummary.llmEnabled &&
    !state.health.securitySummary.vectorStoreEnabled &&
    !state.health.securitySummary.decisioningEnabled;

  const registrationSourceOptions =
    state.status === "ready"
      ? buildRegistrationSourceOptions(state.ragHealth.securitySummary.sourceLabels)
      : METADATA_REGISTRATION_SOURCE_OPTIONS;

  const updateRagRegistrationField = <K extends keyof RagRegistrationFormState>(
    key: K,
    value: RagRegistrationFormState[K],
  ) => {
    setRagRegistrationForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const refreshRagSection = async (tenantKey: string | null) => {
    const [ragHealth, ragDocuments, ragChunks, ragCitations, ragAuditEvents] = await Promise.all([
      getIdjorRagHealth({ tenantKey }),
      getIdjorRagDocuments({ tenantKey }),
      getIdjorRagChunks({ tenantKey }),
      getIdjorRagCitations({ tenantKey }),
      getIdjorRagAuditEvents({ tenantKey }),
    ]);

    setState((current) => {
      if (current.status !== "ready") return current;

      return {
        ...current,
        ragHealth,
        ragDocuments,
        ragChunks,
        ragCitations,
        ragAuditEvents,
      };
    });
  };

  const handleRagRegistrationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (state.status !== "ready") {
      setRagRegistrationState({
        status: "error",
        message: "Le socle IDJOR doit etre charge avant tout enregistrement metadata-only.",
      });
      return;
    }

    const documentKey = ragRegistrationForm.documentKey.trim();
    const title = ragRegistrationForm.title.trim();

    if (!documentKey || !title) {
      setRagRegistrationState({
        status: "error",
        message: "Document key et titre sont requis.",
      });
      return;
    }

    const parsedMetadata = parseMetadataJsonInput(ragRegistrationForm.metadataJson);
    if (parsedMetadata.error) {
      setRagRegistrationState({
        status: "error",
        message: parsedMetadata.error,
      });
      return;
    }

    setRagRegistrationState({ status: "submitting" });

    try {
      const result = await registerIdjorRagDocumentMetadata({
        tenantKey: state.ragHealth.scope.tenantKey,
        tenantId: state.ragHealth.scope.tenantId,
        documentKey,
        title,
        source: ragRegistrationForm.source,
        ingestionStatus: ragRegistrationForm.ingestionStatus,
        externalReference: ragRegistrationForm.externalReference.trim() || null,
        metadataJson: parsedMetadata.metadataJson,
      });

      await refreshRagSection(state.ragHealth.scope.tenantKey);

      setRagRegistrationState({
        status: "success",
        result,
      });
      setRagRegistrationForm({
        ...DEFAULT_RAG_REGISTRATION_FORM,
        source: registrationSourceOptions.includes("SEED_DEMO") ? "SEED_DEMO" : registrationSourceOptions[0],
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'enregistrer la metadata documentaire.";

      setRagRegistrationState({
        status: "error",
        message,
      });
    }
  };

  const handlePreviewIngestion = async (documentId: string) => {
    setRagIngestionPreviewState({ status: "loading", documentId });

    try {
      const preview = await getIdjorRagDocumentIngestionPreview(documentId);
      setRagIngestionPreviewState({ status: "success", documentId, preview });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de charger la previsualisation de preparation.";

      setRagIngestionPreviewState({ status: "error", documentId, message });
    }
  };

  const handleViewDocumentAudit = async (documentId: string) => {
    setRagDocumentAuditState({ status: "loading", documentId });

    try {
      const page = await getIdjorRagDocumentAuditEvents(documentId);
      setRagDocumentAuditState({ status: "success", documentId, page });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de charger le journal d'audit RAG pour ce document.";

      setRagDocumentAuditState({ status: "error", documentId, message });
    }
  };

  const handleLoadDocumentUploads = async (documentId: string) => {
    setRagUploadsListState({ status: "loading", documentId });

    try {
      const page = await getIdjorRagDocumentUploads(documentId);
      setRagUploadsListState({ status: "success", documentId, page });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de charger les fichiers en quarantaine pour ce document.";

      setRagUploadsListState({ status: "error", documentId, message });
    }
  };

  const handleToggleUploadPanel = (documentId: string) => {
    const next = uploadPanelDocumentId === documentId ? null : documentId;
    setUploadPanelDocumentId(next);
    setSelectedUploadFile(null);
    setUploadFileError(null);
    setRagUploadIntakeState({ status: "idle" });
    setExtractionPanelUploadId(null);
    setRagExtractionPreviewState({ status: "idle" });
    setRagUploadExtractionsListState({ status: "idle" });

    if (next) {
      void handleLoadDocumentUploads(next);
    }
  };

  const handleUploadFileChange = (file: File | null) => {
    setSelectedUploadFile(file);
    setUploadFileError(file ? validateRagUploadIntakeFile(file) : null);
  };

  const handleSubmitUploadIntake = async (documentId: string) => {
    if (!selectedUploadFile) {
      setUploadFileError("Selectionnez un fichier a mettre en quarantaine.");
      return;
    }

    const validationError = validateRagUploadIntakeFile(selectedUploadFile);
    if (validationError) {
      setUploadFileError(validationError);
      return;
    }

    setRagUploadIntakeState({ status: "uploading", documentId });

    try {
      const result = await uploadIdjorRagDocumentIntake(documentId, selectedUploadFile);
      setRagUploadIntakeState({ status: "success", documentId, result });
      setSelectedUploadFile(null);
      setUploadFileError(null);

      await handleLoadDocumentUploads(documentId);

      if (state.status === "ready") {
        await refreshRagSection(state.ragHealth.scope.tenantKey);
      }
      if (
        ragDocumentAuditState.status !== "idle" &&
        ragDocumentAuditState.documentId === documentId
      ) {
        await handleViewDocumentAudit(documentId);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible d'envoyer le fichier en quarantaine.";

      setRagUploadIntakeState({ status: "error", documentId, message });
    }
  };

  const handleLoadUploadExtractions = async (uploadId: string) => {
    setRagUploadExtractionsListState({ status: "loading", uploadId });

    try {
      const page = await getIdjorRagUploadExtractions(uploadId);
      setRagUploadExtractionsListState({ status: "success", uploadId, page });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de charger les extractions pour ce fichier.";

      setRagUploadExtractionsListState({ status: "error", uploadId, message });
    }
  };

  const handleToggleExtractionPanel = (uploadId: string) => {
    const next = extractionPanelUploadId === uploadId ? null : uploadId;
    setExtractionPanelUploadId(next);
    setRagExtractionPreviewState({ status: "idle" });

    if (next) {
      void handleLoadUploadExtractions(next);
    }
  };

  const handleRunExtractionPreview = async (uploadId: string, documentId: string) => {
    setRagExtractionPreviewState({ status: "loading", uploadId });

    try {
      const response = await runIdjorRagUploadExtractionPreview(uploadId);
      setRagExtractionPreviewState({ status: "success", uploadId, response });

      await handleLoadUploadExtractions(uploadId);

      if (
        ragDocumentAuditState.status !== "idle" &&
        ragDocumentAuditState.documentId === documentId
      ) {
        await handleViewDocumentAudit(documentId);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de lancer la previsualisation d'extraction.";

      setRagExtractionPreviewState({ status: "error", uploadId, message });
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title={demoSafeMode ? tenant.terminology.idjorLabel : "Socle IDJOR"}
        description={
          demoSafeMode
            ? "Vue protegee des preuves, documents et journaux IDJOR. La page reste demonstrative, compacte et strictement read-only."
            : "Vue protegee du socle technique IDJOR. La page reste demonstrative, compacte et strictement read-only."
        }
      />

      <AppCard className="overflow-hidden p-0" tone="soft">
        <div
          className="space-y-5 p-5 md:p-6"
          style={{
            borderTop: `1px solid ${withAlpha(tenant.colors.primary, "33")}`,
            background:
              "radial-gradient(540px 190px at 0% 0%, rgba(34,211,238,0.11), transparent 60%), radial-gradient(420px 220px at 100% 0%, rgba(16,185,129,0.14), transparent 58%), linear-gradient(135deg, rgba(12,19,35,0.96), rgba(11,17,30,0.94))",
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{
                borderColor: withAlpha(tenant.colors.primary, "45"),
                backgroundColor: withAlpha(tenant.colors.primary, "12"),
                color: tenant.colors.primary,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {demoSafeMode ? "Preuves & audit" : "Resume executif"}
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-400/28 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-300">
              lecture seule
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
              tenant {displayTenantKey}
            </span>
            {resolutionMode ? (
              <span className="inline-flex items-center rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
                resolution {resolutionMode}
              </span>
            ) : null}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="space-y-3">
                <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-white">
                  {demoSafeMode
                    ? "Preuves, audit et lecture documentaire"
                    : "IDJOR est pret cote socle technique"}
                </h2>
                <p className="max-w-3xl text-[15px] leading-relaxed text-slate-300">
                  {demoSafeMode
                    ? "Cette vue met en avant les documents, le hash, les preuves et le journal d'audit. La demonstration reste strictement documentaire et l'institution conserve l'entiere responsabilite de la decision."
                    : "Cette vue montre un socle institutionnel en lecture seule, pret pour la demonstration et la gouvernance. Les capacites IA restent desactivees par defaut et l&apos;institution conserve l&apos;entiere responsabilite de la decision."}
                </p>
                <p className="max-w-3xl border-l-2 border-emerald-400/18 pl-3 text-sm leading-relaxed text-slate-400">
                  {demoSafeMode
                    ? "IDJOR prepare, structure et documente. Il ne decide pas et n'agit pas comme une IA autonome dans cette phase."
                    : "IDJOR prepare, structure et documente. Il ne decide pas, ne score pas et n&apos;active aucun provider IA dans cette phase."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {demoSafeMode ? (
                  <>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                      Documents visibles
                    </span>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                      Audit append-only
                    </span>
                  </>
                ) : (
                  <>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                      LLM OFF
                    </span>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                      Vector Store OFF
                    </span>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                      Decisioning OFF
                    </span>
                  </>
                )}
                <span className="rounded-full border border-slate-400/18 bg-slate-400/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
                  Institution decisionnaire
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode(true)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                    compactMode
                      ? "border-cyan-400/36 bg-cyan-400/10 text-cyan-200"
                      : "border-slate-400/16 bg-slate-400/8 text-slate-300 hover:text-white",
                  )}
                >
                  Mode compact demo
                </button>
                <button
                  type="button"
                  onClick={() => setMode(false)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                    !compactMode
                      ? "border-cyan-400/36 bg-cyan-400/10 text-cyan-200"
                      : "border-slate-400/16 bg-slate-400/8 text-slate-300 hover:text-white",
                  )}
                >
                  Vue detaillee
                </button>
                <span className="text-xs text-slate-400">
                  Base URL: <span className="font-mono text-slate-300">{API_BASE_URL}</span>
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ExecutiveStatus
                label="Socle technique"
                value={foundationReady ? "Pret" : "A verifier"}
                tone={foundationReady ? "success" : "warning"}
              />
              <ExecutiveStatus label="Registry" value="Read-only" tone="success" />
              <ExecutiveStatus label="LLM" value="OFF" tone="success" />
              <ExecutiveStatus label="Vector Store" value="OFF" tone="success" />
              <ExecutiveStatus label="Decisioning" value="OFF" tone="success" />
              <ExecutiveStatus label="Institution" value="Reste decisionnaire" tone="neutral" />
            </div>
          </div>
        </div>
      </AppCard>

      <DisclosureNote className="border-emerald-400/15 bg-emerald-400/5" />

      {state.status === "loading" ? (
        <AppCard className="space-y-3 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Chargement
          </p>
          <p className="text-sm text-slate-300">
            Construction de la synthese et lecture des snapshots proteges IDJOR et RAG en cours...
          </p>
        </AppCard>
      ) : null}

      {state.status === "error" ? getErrorCard(state, tenant.id) : null}

      {state.status === "ready" ? (
        <>
          <SectionCard
            icon={<Layers3 className="h-4 w-4" />}
            title="Synthese"
            subtitle="Vue courte pour la demo, avec les compteurs et le contexte tenant."
            countLabel={demoSafeMode ? `${state.ragHealth.counts.documents} documents · ${state.ragAuditEvents.events.length} evenements` : `${state.health.counts.agents} agents · ${state.health.counts.engines} moteurs`}
            open={sections.summary}
            onToggle={() => toggleSection("summary")}
          >
            <div className="space-y-4">
              {demoSafeMode ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <SummaryMetric
                    label="Documents"
                    value={String(state.ragHealth.counts.documents)}
                    hint="Base documentaire visible"
                  />
                  <SummaryMetric
                    label="Journaux"
                    value={String(state.ragAuditEvents.events.length)}
                    hint="Evenements append-only"
                  />
                  <SummaryMetric
                    label="Hash"
                    value={state.ragHealth.readOnly ? "Visible" : "A verifier"}
                    hint="Integrite documentaire lisible"
                  />
                  <SummaryMetric
                    label="Decision"
                    value="Institution"
                    hint="Aucune decision automatisee"
                  />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <SummaryMetric
                    label="Agents"
                    value={String(state.health.counts.agents)}
                    hint="Registre agents visible"
                  />
                  <SummaryMetric
                    label="Moteurs"
                    value={String(state.health.counts.engines)}
                    hint="Moteurs prepares, pas actifs"
                  />
                  <SummaryMetric
                    label="Tools"
                    value={String(state.health.counts.tools)}
                    hint="Outils visibles pour le role courant"
                  />
                  <SummaryMetric
                    label="Flags OFF"
                    value={String(state.registry.featureFlags.filter((flag) => !flag.enabled).length)}
                    hint="Feature flags desactives"
                  />
                  <SummaryMetric
                    label="Docs RAG"
                    value={String(state.ragHealth.counts.documents)}
                    hint="Base documentaire read-only"
                  />
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-white">Contexte tenant</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ExecutiveStatus label="Tenant key" value={state.registry.tenant.tenantKey} />
                    <ExecutiveStatus
                      label="Institution"
                      value={state.registry.tenant.institutionId ?? "N/A"}
                    />
                    <ExecutiveStatus label="Country" value={state.registry.tenant.country} />
                    <ExecutiveStatus label="Vertical" value={state.registry.tenant.vertical} />
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <h3 className="font-medium text-white">Etat de preparation</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ExecutiveStatus
                      label="Feature flags"
                      value={state.health.allFeatureFlagsOff ? "ALL OFF" : "A verifier"}
                      tone={state.health.allFeatureFlagsOff ? "success" : "warning"}
                    />
                    <ExecutiveStatus
                      label="Providers"
                      value={state.health.allProvidersDisabled ? "DISABLED" : "A verifier"}
                      tone={state.health.allProvidersDisabled ? "success" : "warning"}
                    />
                    <ExecutiveStatus
                      label="Models"
                      value={state.health.allModelsDisabled ? "DISABLED" : "A verifier"}
                      tone={state.health.allModelsDisabled ? "success" : "warning"}
                    />
                    <ExecutiveStatus
                      label="Tools"
                      value={state.health.allToolsReadOnly ? "READ_ONLY" : "A verifier"}
                      tone={state.health.allToolsReadOnly ? "success" : "warning"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<ScanSearch className="h-4 w-4" />}
            title={demoSafeMode ? "Base documentaire" : "Base documentaire RAG"}
            subtitle={demoSafeMode ? "Documents, hash et audit visibles en lecture seule pour la demonstration." : "Metadonnees documentaires en lecture seule, visibles sans ingestion, question, indexation ni calcul."}
            countLabel={demoSafeMode ? `${state.ragHealth.counts.documents} documents` : `${state.ragHealth.counts.documents} docs · ${state.ragHealth.counts.chunks} chunks · ${state.ragHealth.counts.citations} citations`}
            open={sections.rag}
            onToggle={() => toggleSection("rag")}
          >
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <ExecutiveStatus
                  label="RAG enabled"
                  value={state.ragHealth.securitySummary.ragEnabled ? "true" : "false"}
                  tone={state.ragHealth.securitySummary.ragEnabled ? "danger" : "success"}
                />
                <ExecutiveStatus
                  label="Embeddings"
                  value={state.ragHealth.securitySummary.embeddingsEnabled ? "true" : "false"}
                  tone={state.ragHealth.securitySummary.embeddingsEnabled ? "danger" : "success"}
                />
                <ExecutiveStatus
                  label="LLM"
                  value={state.ragHealth.securitySummary.llmEnabled ? "true" : "false"}
                  tone={state.ragHealth.securitySummary.llmEnabled ? "danger" : "success"}
                />
                <ExecutiveStatus
                  label="Vector store"
                  value={state.ragHealth.securitySummary.vectorStoreEnabled ? "true" : "false"}
                  tone={state.ragHealth.securitySummary.vectorStoreEnabled ? "danger" : "success"}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-white">Synthese RAG</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ExecutiveStatus label="Tenant" value={state.ragHealth.scope.tenantKey} />
                    <ExecutiveStatus
                      label="Role"
                      value={state.ragHealth.scope.role ?? "N/A"}
                    />
                    <ExecutiveStatus
                      label="Read only"
                      value={state.ragHealth.readOnly ? "true" : "false"}
                      tone={state.ragHealth.readOnly ? "success" : "danger"}
                    />
                    <ExecutiveStatus
                      label="Resolution"
                      value={state.ragHealth.resolutionMode ?? "UNKNOWN"}
                    />
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BotOff className="h-4 w-4 text-emerald-300" />
                    <h3 className="font-medium text-white">Message de demo</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    La base documentaire RAG est visible uniquement comme socle
                    metadata read-only. Aucun upload, aucun moteur de recherche,
                    aucun embedding actif et aucune question en langage naturel ne
                    sont actives dans cette phase.
                  </p>
                </div>
              </div>

              <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <h3 className="font-medium text-white">Source labels autorises</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.ragHealth.securitySummary.sourceLabels.length > 0 ? (
                    state.ragHealth.securitySummary.sourceLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300"
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 text-xs text-slate-400">
                      Aucun label source publie pour ce tenant
                    </span>
                  )}
                </div>
              </div>

              {!demoSafeMode ? (
              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[18px] border border-cyan-400/14 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-white">Ajout metadata-only</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-slate-300">
                      Enregistrement metadata-only. Aucun fichier n&apos;est lu, ingéré,
                      vectorisé ou analysé par IA.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ExecutiveStatus label="Tenant" value={state.ragHealth.scope.tenantKey} />
                      <ExecutiveStatus
                        label="Read only"
                        value={state.ragHealth.readOnly ? "true" : "false"}
                        tone={state.ragHealth.readOnly ? "success" : "warning"}
                      />
                      <ExecutiveStatus label="LLM" value="false" tone="success" />
                      <ExecutiveStatus label="Vector store" value="false" tone="success" />
                    </div>
                    <p className="rounded-2xl border border-slate-400/10 bg-slate-400/5 px-3 py-2 text-xs leading-relaxed text-slate-400">
                      Le backend enregistre uniquement une fiche documentaire et maintient
                      `REGISTERED` ou `DEGRADED`. Aucun READY, aucun upload et aucun calcul
                      metier ne sont exposes ici.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleRagRegistrationSubmit}
                  className="space-y-4 rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-white">Formulaire interne RAG</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Le formulaire reste borne a la metadata documentaire du tenant courant.
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
                      tenant {state.ragHealth.scope.tenantKey}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        documentKey
                      </span>
                      <input
                        value={ragRegistrationForm.documentKey}
                        onChange={(event) =>
                          updateRagRegistrationField("documentKey", event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-400/14 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/45 focus:bg-slate-950/70"
                        placeholder="proofs.demo.guide-portefeuille"
                        autoComplete="off"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        title
                      </span>
                      <input
                        value={ragRegistrationForm.title}
                        onChange={(event) => updateRagRegistrationField("title", event.target.value)}
                        className="w-full rounded-2xl border border-slate-400/14 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/45 focus:bg-slate-950/70"
                        placeholder="Guide portefeuille agricole"
                        autoComplete="off"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        source
                      </span>
                      <select
                        value={ragRegistrationForm.source}
                        onChange={(event) =>
                          updateRagRegistrationField(
                            "source",
                            event.target.value as IdjorRagDocumentRegistrationSource,
                          )
                        }
                        className="w-full rounded-2xl border border-slate-400/14 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/45 focus:bg-slate-950/70"
                      >
                        {registrationSourceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        ingestionStatus
                      </span>
                      <select
                        value={ragRegistrationForm.ingestionStatus}
                        onChange={(event) =>
                          updateRagRegistrationField(
                            "ingestionStatus",
                            event.target.value as IdjorRagMetadataRegistrationStatus,
                          )
                        }
                        className="w-full rounded-2xl border border-slate-400/14 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/45 focus:bg-slate-950/70"
                      >
                        <option value="REGISTERED">REGISTERED</option>
                        <option value="DEGRADED">DEGRADED</option>
                      </select>
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      externalReference
                    </span>
                    <input
                      value={ragRegistrationForm.externalReference}
                      onChange={(event) =>
                        updateRagRegistrationField("externalReference", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-400/14 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/45 focus:bg-slate-950/70"
                      placeholder="DOC-ASS-MA-2026-001"
                      autoComplete="off"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      metadataJson
                    </span>
                    <textarea
                      value={ragRegistrationForm.metadataJson}
                      onChange={(event) =>
                        updateRagRegistrationField("metadataJson", event.target.value)
                      }
                      className="min-h-[128px] w-full rounded-[20px] border border-slate-400/14 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/45 focus:bg-slate-950/70"
                      placeholder={'{"language":"fr","category":"guide","metadataOnly":true}'}
                      spellCheck={false}
                    />
                  </label>

                  {ragRegistrationState.status === "error" ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                      {ragRegistrationState.message}
                    </div>
                  ) : null}

                  {ragRegistrationState.status === "success" ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                      {ragRegistrationState.result.operation} pour{" "}
                      <span className="font-mono">
                        {ragRegistrationState.result.document.documentKey}
                      </span>
                      . Chunks {ragRegistrationState.result.linkedAssetCounts.chunks}, embeddings{" "}
                      {ragRegistrationState.result.linkedAssetCounts.embeddings}, citations{" "}
                      {ragRegistrationState.result.linkedAssetCounts.citations}.
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      Validation frontend: JSON objet uniquement, source autorisee, statut limite
                      a `REGISTERED` ou `DEGRADED`.
                    </p>
                    <Button
                      type="submit"
                      disabled={ragRegistrationState.status === "submitting"}
                      className="min-w-[168px]"
                    >
                      {ragRegistrationState.status === "submitting"
                        ? "Enregistrement..."
                        : "Enregistrer la metadata"}
                    </Button>
                  </div>
                </form>
              </div>
              ) : null}

              <RegistryTable
                rows={state.ragDocuments.documents}
                emptyLabel="Aucun document RAG visible pour ce tenant."
                maxHeightClass={tableHeightClass}
                columns={[
                  {
                    key: "document",
                    header: "Document",
                    render: (document) => (
                      <div className="space-y-1">
                        <p className="font-medium text-white">{document.title}</p>
                        <p className="font-mono text-[11px] text-slate-500">
                          {document.documentKey}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Etat",
                    render: (document) => (
                      <div className="space-y-1">
                        <p>{document.ingestionStatus}</p>
                        <p className="text-xs text-slate-500">
                          {document.mimeType ?? "mime inconnu"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "reference",
                    header: "Reference",
                    render: (document) => (
                      <p className="text-xs text-slate-400">
                        {document.externalReference ?? "Aucune reference externe"}
                      </p>
                    ),
                  },
                  ...(demoSafeMode
                    ? [
                        {
                          key: "hash",
                          header: "Hash",
                          render: (document: (typeof state.ragDocuments.documents)[number]) => (
                            <p className="max-w-[220px] break-all font-mono text-[11px] text-slate-400">
                              {document.contentHash}
                            </p>
                          ),
                        },
                      ]
                    : [
                        {
                          key: "source",
                          header: "Source",
                          render: (document: (typeof state.ragDocuments.documents)[number]) => (
                            <SourceBadge source={document.source} />
                          ),
                        },
                        {
                          key: "preview",
                          header: "Preparation",
                          render: (document: (typeof state.ragDocuments.documents)[number]) => (
                            <button
                              type="button"
                              onClick={() => handlePreviewIngestion(document.id)}
                              disabled={
                                ragIngestionPreviewState.status === "loading" &&
                                ragIngestionPreviewState.documentId === document.id
                              }
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-200 disabled:opacity-60"
                            >
                              <Eye className="h-3 w-3" />
                              {ragIngestionPreviewState.status === "loading" &&
                              ragIngestionPreviewState.documentId === document.id
                                ? "Chargement..."
                                : "Previsualiser preparation"}
                            </button>
                          ),
                        },
                      ]),
                  {
                    key: "upload",
                    header: "Quarantaine",
                    render: (document) => (
                      <button
                        type="button"
                        onClick={() => handleToggleUploadPanel(document.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-200"
                      >
                        <Upload className="h-3 w-3" />
                        {uploadPanelDocumentId === document.id
                          ? "Fermer"
                          : "Joindre fichier controle"}
                      </button>
                    ),
                  },
                  {
                    key: "audit",
                    header: "Audit",
                    render: (document) => (
                      <button
                        type="button"
                        onClick={() => handleViewDocumentAudit(document.id)}
                        disabled={
                          ragDocumentAuditState.status === "loading" &&
                          ragDocumentAuditState.documentId === document.id
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-200 disabled:opacity-60"
                      >
                        <ScrollText className="h-3 w-3" />
                        {ragDocumentAuditState.status === "loading" &&
                        ragDocumentAuditState.documentId === document.id
                          ? "Chargement..."
                          : "Voir audit"}
                      </button>
                    ),
                  },
                ]}
              />

              {uploadPanelDocumentId ? (
                <div className="space-y-4 rounded-[18px] border border-cyan-400/14 bg-[#0c1322]/75 p-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-white">Quarantaine documentaire</h3>
                  </div>

                  <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-200">
                    Quarantaine documentaire uniquement. Aucun contenu n&apos;est lu, extrait,
                    decoupe, vectorise ou analyse par IA.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) =>
                        handleUploadFileChange(event.target.files?.[0] ?? null)
                      }
                      className="text-xs text-slate-300"
                    />
                    <Button
                      type="button"
                      onClick={() => handleSubmitUploadIntake(uploadPanelDocumentId)}
                      disabled={
                        !selectedUploadFile ||
                        Boolean(uploadFileError) ||
                        (ragUploadIntakeState.status === "uploading" &&
                          ragUploadIntakeState.documentId === uploadPanelDocumentId)
                      }
                      className="min-w-[180px]"
                    >
                      {ragUploadIntakeState.status === "uploading" &&
                      ragUploadIntakeState.documentId === uploadPanelDocumentId
                        ? "Envoi..."
                        : "Envoyer en quarantaine"}
                    </Button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Taille maximale 10 Mo. Formats acceptes: PDF, TXT, DOCX.
                  </p>

                  {uploadFileError ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                      {uploadFileError}
                    </div>
                  ) : null}

                  {ragUploadIntakeState.status === "error" &&
                  ragUploadIntakeState.documentId === uploadPanelDocumentId ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                      {ragUploadIntakeState.message}
                    </div>
                  ) : null}

                  {ragUploadIntakeState.status === "success" &&
                  ragUploadIntakeState.documentId === uploadPanelDocumentId ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                      Fichier mis en quarantaine.{" "}
                      <span className="font-mono break-all">
                        {ragUploadIntakeState.result.upload.sha256Hash}
                      </span>
                    </div>
                  ) : null}

                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      Fichiers en quarantaine pour ce document
                    </p>

                    {ragUploadsListState.status === "loading" &&
                    ragUploadsListState.documentId === uploadPanelDocumentId ? (
                      <p className="text-sm text-slate-300">Chargement...</p>
                    ) : null}

                    {ragUploadsListState.status === "error" &&
                    ragUploadsListState.documentId === uploadPanelDocumentId ? (
                      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                        {ragUploadsListState.message}
                      </div>
                    ) : null}

                    {ragUploadsListState.status === "success" &&
                    ragUploadsListState.documentId === uploadPanelDocumentId ? (
                      <RegistryTable
                        rows={ragUploadsListState.page.uploads}
                        emptyLabel="Aucun fichier en quarantaine pour ce document."
                        maxHeightClass={tableHeightClass}
                        columns={[
                          {
                            key: "filename",
                            header: "Fichier",
                            render: (upload) => (
                              <div className="space-y-1">
                                <p className="font-medium text-white">
                                  {upload.originalFilename}
                                </p>
                                <p className="text-xs text-slate-500">{upload.mimeType}</p>
                              </div>
                            ),
                          },
                          {
                            key: "size",
                            header: "Taille",
                            render: (upload) => `${Math.ceil(upload.sizeBytes / 1024)} Ko`,
                          },
                          {
                            key: "hash",
                            header: "Hash sha256",
                            render: (upload) => (
                              <p className="max-w-[220px] break-all font-mono text-[11px] text-slate-400">
                                {upload.sha256Hash}
                              </p>
                            ),
                          },
                          {
                            key: "status",
                            header: "Statut",
                            render: (upload) => upload.quarantineStatus,
                          },
                          {
                            key: "createdAt",
                            header: "Recu le",
                            render: (upload) => upload.createdAt,
                          },
                          {
                            key: "extraction",
                            header: "Extraction",
                            render: (upload) => (
                              <button
                                type="button"
                                onClick={() => handleToggleExtractionPanel(upload.id)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-200"
                              >
                                <FileSearch className="h-3 w-3" />
                                {extractionPanelUploadId === upload.id
                                  ? "Fermer"
                                  : "Previsualiser extraction"}
                              </button>
                            ),
                          },
                        ]}
                      />
                    ) : null}
                  </div>

                  {extractionPanelUploadId ? (
                    <div className="space-y-4 rounded-[18px] border border-cyan-400/14 bg-[#0c1322]/75 p-4">
                      <div className="flex items-center gap-2">
                        <FileSearch className="h-4 w-4 text-cyan-300" />
                        <h3 className="font-medium text-white">Extraction controlee</h3>
                      </div>

                      <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-200">
                        Extraction controlee. Aucun chunk, embedding, vector store ou LLM
                        n&apos;est active.
                      </p>

                      <Button
                        type="button"
                        onClick={() =>
                          handleRunExtractionPreview(extractionPanelUploadId, uploadPanelDocumentId)
                        }
                        disabled={
                          ragExtractionPreviewState.status === "loading" &&
                          ragExtractionPreviewState.uploadId === extractionPanelUploadId
                        }
                        className="min-w-[200px]"
                      >
                        {ragExtractionPreviewState.status === "loading" &&
                        ragExtractionPreviewState.uploadId === extractionPanelUploadId
                          ? "Extraction en cours..."
                          : "Previsualiser extraction"}
                      </Button>

                      {ragExtractionPreviewState.status === "error" &&
                      ragExtractionPreviewState.uploadId === extractionPanelUploadId ? (
                        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                          {ragExtractionPreviewState.message}
                        </div>
                      ) : null}

                      {ragExtractionPreviewState.status === "success" &&
                      ragExtractionPreviewState.uploadId === extractionPanelUploadId ? (
                        <ExtractionResultBlock extraction={ragExtractionPreviewState.response.extraction} />
                      ) : null}

                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                          Extractions pour ce fichier
                        </p>

                        {ragUploadExtractionsListState.status === "loading" &&
                        ragUploadExtractionsListState.uploadId === extractionPanelUploadId ? (
                          <p className="text-sm text-slate-300">Chargement...</p>
                        ) : null}

                        {ragUploadExtractionsListState.status === "error" &&
                        ragUploadExtractionsListState.uploadId === extractionPanelUploadId ? (
                          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                            {ragUploadExtractionsListState.message}
                          </div>
                        ) : null}

                        {ragUploadExtractionsListState.status === "success" &&
                        ragUploadExtractionsListState.uploadId === extractionPanelUploadId ? (
                          ragUploadExtractionsListState.page.extractions.length > 0 ? (
                            <div
                              className={cn(
                                "space-y-3 overflow-auto rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-3",
                                tableHeightClass,
                              )}
                            >
                              {ragUploadExtractionsListState.page.extractions.map((extraction) => (
                                <ExtractionResultBlock key={extraction.id} extraction={extraction} />
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                              <p className="text-sm text-slate-400">
                                Aucune extraction enregistree pour ce fichier.
                              </p>
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!demoSafeMode && ragIngestionPreviewState.status !== "idle" ? (
                <div className="rounded-[18px] border border-cyan-400/14 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-white">Previsualisation de preparation</h3>
                  </div>

                  <p className="mb-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-200">
                    Previsualisation uniquement. Aucun fichier n&apos;est lu, traite,
                    decoupe, vectorise ou analyse par IA.
                  </p>

                  {ragIngestionPreviewState.status === "loading" ? (
                    <p className="text-sm text-slate-300">
                      Chargement de la previsualisation de preparation...
                    </p>
                  ) : null}

                  {ragIngestionPreviewState.status === "error" ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                      {ragIngestionPreviewState.message}
                    </div>
                  ) : null}

                  {ragIngestionPreviewState.status === "success" ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <ExecutiveStatus
                          label="documentId"
                          value={ragIngestionPreviewState.preview.documentId}
                        />
                        <ExecutiveStatus
                          label="Tenant"
                          value={ragIngestionPreviewState.preview.scope.tenantKey}
                        />
                        <ExecutiveStatus
                          label="ingestionReadiness"
                          value={ragIngestionPreviewState.preview.ingestionReadiness}
                          tone={
                            ragIngestionPreviewState.preview.ingestionReadiness === "BLOCKED"
                              ? "danger"
                              : "warning"
                          }
                        />
                        <ExecutiveStatus
                          label="ingestionStatus"
                          value={ragIngestionPreviewState.preview.ingestionStatus}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <ExecutiveStatus label="llmEnabled" value="false" tone="success" />
                        <ExecutiveStatus label="vectorStoreEnabled" value="false" tone="success" />
                        <ExecutiveStatus label="embeddingsEnabled" value="false" tone="success" />
                        <ExecutiveStatus
                          label="chunks"
                          value={String(
                            ragIngestionPreviewState.preview.linkedAssetCounts.chunks,
                          )}
                          tone="success"
                        />
                        <ExecutiveStatus
                          label="citations"
                          value={String(
                            ragIngestionPreviewState.preview.linkedAssetCounts.citations,
                          )}
                          tone="success"
                        />
                      </div>

                      <div className="grid gap-4 xl:grid-cols-3">
                        <div className="rounded-[18px] border border-slate-400/10 bg-slate-400/5 p-3">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                            missingFields
                          </p>
                          {ragIngestionPreviewState.preview.missingFields.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {ragIngestionPreviewState.preview.missingFields.map((item) => (
                                <li key={item.field}>
                                  <span className="font-mono text-slate-400">{item.field}</span>
                                  {" — "}
                                  {item.reason}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">Aucun champ manquant signale.</p>
                          )}
                        </div>

                        <div className="rounded-[18px] border border-slate-400/10 bg-slate-400/5 p-3">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                            allowedNextSteps
                          </p>
                          {ragIngestionPreviewState.preview.allowedNextSteps.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {ragIngestionPreviewState.preview.allowedNextSteps.map((step) => (
                                <li key={step} className="font-mono">
                                  {step}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">Aucune etape suivante exposee.</p>
                          )}
                        </div>

                        <div className="rounded-[18px] border border-slate-400/10 bg-slate-400/5 p-3">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                            blockedReasons
                          </p>
                          {ragIngestionPreviewState.preview.blockedReasons.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {ragIngestionPreviewState.preview.blockedReasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">Aucun motif de blocage signale.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {ragDocumentAuditState.status !== "idle" ? (
                <div className="rounded-[18px] border border-cyan-400/14 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-white">Audit du document</h3>
                  </div>

                  <p className="mb-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-200">
                    Journal append-only. Lecture seule. Aucun evenement n&apos;est modifie depuis
                    le dashboard.
                  </p>

                  {ragDocumentAuditState.status === "loading" ? (
                    <p className="text-sm text-slate-300">
                      Chargement du journal d&apos;audit du document...
                    </p>
                  ) : null}

                  {ragDocumentAuditState.status === "error" ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                      {ragDocumentAuditState.message}
                    </div>
                  ) : null}

                  {ragDocumentAuditState.status === "success" ? (
                    <AuditEventList
                      events={ragDocumentAuditState.page.events}
                      emptyLabel="Aucun evenement d'audit enregistre pour ce document."
                      maxHeightClass={tableHeightClass}
                    />
                  ) : null}
                </div>
              ) : null}

              {!demoSafeMode ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <RegistryTable
                  rows={state.ragChunks.chunks}
                  emptyLabel="0 chunk actif ou chunking non active pour ce tenant."
                  maxHeightClass={tableHeightClass}
                  columns={[
                    {
                      key: "chunk",
                      header: "Chunk",
                      render: (chunk) => (
                        <div className="space-y-1">
                          <p className="font-medium text-white">{chunk.documentTitle}</p>
                          <p className="font-mono text-[11px] text-slate-500">
                            {chunk.documentKey} · #{chunk.chunkIndex}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "excerpt",
                      header: "Extrait",
                      render: (chunk) => (
                        <p className="max-w-[420px] text-xs text-slate-400">
                          {chunk.contentText}
                        </p>
                      ),
                    },
                    {
                      key: "tokenCount",
                      header: "Tokens",
                      render: (chunk) => String(chunk.tokenCount ?? 0),
                    },
                  ]}
                />

                <RegistryTable
                  rows={state.ragCitations.citations}
                  emptyLabel="0 citation active ou retrieval non active pour ce tenant."
                  maxHeightClass={tableHeightClass}
                  columns={[
                    {
                      key: "citation",
                      header: "Citation",
                      render: (citation) => (
                        <div className="space-y-1">
                          <p className="font-medium text-white">{citation.citationLabel}</p>
                          <p className="font-mono text-[11px] text-slate-500">
                            {citation.documentKey}
                            {citation.chunkIndex !== null ? ` · #${citation.chunkIndex}` : ""}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "excerpt",
                      header: "Extrait",
                      render: (citation) => (
                        <p className="max-w-[420px] text-xs text-slate-400">
                          {citation.excerptText}
                        </p>
                      ),
                    },
                    {
                      key: "source",
                      header: "Source",
                      render: (citation) => <SourceBadge source={citation.source} />,
                    },
                  ]}
                />
              </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            icon={<ScrollText className="h-4 w-4" />}
            title={demoSafeMode ? "Journal d'audit" : "Journal d'audit RAG"}
            subtitle={demoSafeMode ? "Trace append-only des documents et preuves visibles pour la demonstration." : "Trace append-only des enregistrements metadata-only et des previsualisations de preparation."}
            countLabel={`${state.ragAuditEvents.events.length} evenements`}
            open={sections.ragAudit}
            onToggle={() => toggleSection("ragAudit")}
          >
            <div className="space-y-4">
              <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-200">
                Journal append-only. Lecture seule. Aucun evenement n&apos;est modifie depuis le
                dashboard.
              </p>

              <AuditEventList
                events={state.ragAuditEvents.events}
                emptyLabel="Aucun evenement d'audit RAG enregistre pour ce tenant."
                maxHeightClass={tableHeightClass}
              />
            </div>
          </SectionCard>

          {showTechnicalSections ? (
          <>
          <SectionCard
            icon={<BotOff className="h-4 w-4" />}
            title="Agents"
            subtitle="Catalogue des agents IDJOR deja poses dans le socle."
            countLabel={String(state.registry.agents.length)}
            open={sections.agents}
            onToggle={() => toggleSection("agents")}
          >
            <RegistryTable
              rows={state.registry.agents}
              emptyLabel="Aucun agent IDJOR disponible pour ce tenant."
              maxHeightClass={tableHeightClass}
              columns={[
                {
                  key: "agent",
                  header: "Agent",
                  render: (agent) => (
                    <div className="space-y-1">
                      <p className="font-medium text-white">{agent.displayName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{agent.agentKey}</p>
                    </div>
                  ),
                },
                { key: "layer", header: "Layer", render: (agent) => agent.layer },
                {
                  key: "state",
                  header: "Etat",
                  render: (agent) => (
                    <div className="space-y-1">
                      <p>{agent.registryStatus}</p>
                      <p className="text-xs text-slate-500">
                        {agent.isReadOnly ? "Read-only" : "Mutable"} ·{" "}
                        {agent.isEnabled ? "enabled" : "disabled"}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "source",
                  header: "Source",
                  render: (agent) => <SourceBadge source={agent.source} />,
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            icon={<Network className="h-4 w-4" />}
            title="Moteurs"
            subtitle="Moteurs poses dans le registre foundation, sans activation runtime."
            countLabel={String(state.registry.engines.length)}
            open={sections.engines}
            onToggle={() => toggleSection("engines")}
          >
            <RegistryTable
              rows={state.registry.engines}
              emptyLabel="Aucun moteur IDJOR disponible pour ce tenant."
              maxHeightClass={tableHeightClass}
              columns={[
                {
                  key: "engine",
                  header: "Moteur",
                  render: (engine) => (
                    <div className="space-y-1">
                      <p className="font-medium text-white">{engine.displayName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{engine.engineKey}</p>
                    </div>
                  ),
                },
                {
                  key: "state",
                  header: "Etat",
                  render: (engine) => (
                    <div className="space-y-1">
                      <p>{engine.registryStatus}</p>
                      <p className="text-xs text-slate-500">
                        {engine.isReadOnly ? "Read-only" : "Mutable"} ·{" "}
                        {engine.isEnabled ? "enabled" : "disabled"}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "source",
                  header: "Source",
                  render: (engine) => <SourceBadge source={engine.source} />,
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            icon={<Wrench className="h-4 w-4" />}
            title="Tools"
            subtitle="Outils lisibles selon le role, toujours en lecture seule."
            countLabel={String(state.registry.tools.length)}
            open={sections.tools}
            onToggle={() => toggleSection("tools")}
          >
            <RegistryTable
              rows={state.registry.tools}
              emptyLabel="Aucun outil visible pour ce role sur ce tenant."
              maxHeightClass={tableHeightClass}
              columns={[
                {
                  key: "tool",
                  header: "Tool",
                  render: (tool) => (
                    <div className="space-y-1">
                      <p className="font-medium text-white">{tool.displayName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{tool.toolKey}</p>
                    </div>
                  ),
                },
                { key: "access", header: "Access", render: (tool) => tool.accessMode },
                {
                  key: "roles",
                  header: "Roles",
                  render: (tool) =>
                    tool.allowedRoles.length > 0 ? (
                      <p className="text-xs text-slate-400">{tool.allowedRoles.join(", ")}</p>
                    ) : (
                      <p className="text-xs text-slate-500">Tous roles lisibles</p>
                    ),
                },
                {
                  key: "state",
                  header: "Etat",
                  render: (tool) => (
                    <div className="space-y-1">
                      <p>{tool.isReadOnly ? "READ_ONLY" : tool.accessMode}</p>
                      <p className="text-xs text-slate-500">
                        {tool.isEnabled ? "enabled" : "disabled"}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "source",
                  header: "Source",
                  render: (tool) => <SourceBadge source={tool.source} />,
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            icon={<Flag className="h-4 w-4" />}
            title="Flags"
            subtitle="Feature flags du socle, maintenus OFF par defaut."
            countLabel={`${state.registry.featureFlags.filter((flag) => !flag.enabled).length} OFF`}
            open={sections.flags}
            onToggle={() => toggleSection("flags")}
          >
            <RegistryTable
              rows={state.registry.featureFlags}
              emptyLabel="Aucun feature flag IDJOR disponible pour ce tenant."
              maxHeightClass={tableHeightClass}
              columns={[
                { key: "type", header: "Type", render: (flag) => flag.targetType },
                { key: "key", header: "Cible", render: (flag) => flag.targetKey },
                {
                  key: "rollout",
                  header: "Rollout",
                  render: (flag) => (
                    <div className="space-y-1">
                      <p>{flag.rolloutState}</p>
                      <p className="text-xs text-slate-500">{flag.enabled ? "enabled" : "OFF"}</p>
                    </div>
                  ),
                },
                {
                  key: "source",
                  header: "Source",
                  render: (flag) => <SourceBadge source={flag.source} />,
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            icon={<Sparkles className="h-4 w-4" />}
            title="Providers / Models"
            subtitle="Catalogues prepares pour plus tard, tous disables dans cette phase."
            countLabel={`${state.registry.providers.length} providers · ${state.registry.models.length} models`}
            open={sections.providersModels}
            onToggle={() => toggleSection("providersModels")}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <RegistryTable
                rows={state.registry.providers}
                emptyLabel="Aucun provider catalogue pour ce tenant."
                maxHeightClass={tableHeightClass}
                columns={[
                  {
                    key: "provider",
                    header: "Provider",
                    render: (provider) => (
                      <div className="space-y-1">
                        <p className="font-medium text-white">{provider.displayName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{provider.providerKey}</p>
                      </div>
                    ),
                  },
                  { key: "type", header: "Type", render: (provider) => provider.providerType },
                  {
                    key: "state",
                    header: "Etat",
                    render: (provider) => (
                      <div className="space-y-1">
                        <p>{provider.registryStatus}</p>
                        <p className="text-xs text-slate-500">
                          {provider.isEnabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "source",
                    header: "Source",
                    render: (provider) => <SourceBadge source={provider.source} />,
                  },
                ]}
              />

              <RegistryTable
                rows={state.registry.models}
                emptyLabel="Aucun modele catalogue pour ce tenant."
                maxHeightClass={tableHeightClass}
                columns={[
                  {
                    key: "model",
                    header: "Modele",
                    render: (model) => (
                      <div className="space-y-1">
                        <p className="font-medium text-white">{model.displayName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{model.modelKey}</p>
                      </div>
                    ),
                  },
                  { key: "family", header: "Famille", render: (model) => model.modelFamily },
                  {
                    key: "state",
                    header: "Etat",
                    render: (model) => (
                      <div className="space-y-1">
                        <p>{model.registryStatus}</p>
                        <p className="text-xs text-slate-500">
                          {model.isEnabled ? "Enabled" : "Disabled"}
                          {model.isDefault ? " · default" : ""}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "source",
                    header: "Source",
                    render: (model) => <SourceBadge source={model.source} />,
                  },
                ]}
              />
            </div>
          </SectionCard>

          </>
          ) : null}

          <SectionCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Securite"
            subtitle="Posture read-only, controles desactives et labels autorises."
            countLabel="Posture backend"
            open={sections.security}
            onToggle={() => toggleSection("security")}
          >
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <ExecutiveStatus
                  label="LLM enabled"
                  value={state.health.securitySummary.llmEnabled ? "true" : "false"}
                  tone={state.health.securitySummary.llmEnabled ? "danger" : "success"}
                />
                <ExecutiveStatus
                  label="Vector enabled"
                  value={state.health.securitySummary.vectorStoreEnabled ? "true" : "false"}
                  tone={state.health.securitySummary.vectorStoreEnabled ? "danger" : "success"}
                />
                <ExecutiveStatus
                  label="Decisioning"
                  value={state.health.securitySummary.decisioningEnabled ? "true" : "false"}
                  tone={state.health.securitySummary.decisioningEnabled ? "danger" : "success"}
                />
                <ExecutiveStatus
                  label="Read only"
                  value={state.health.readOnly ? "true" : "false"}
                  tone={state.health.readOnly ? "success" : "danger"}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ScanSearch className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-white">Source labels autorises</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.health.securitySummary.sourceLabels.length > 0 ? (
                      state.health.securitySummary.sourceLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 text-xs text-slate-400">
                        Aucun label source publie pour ce tenant
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-400/10 bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BotOff className="h-4 w-4 text-emerald-300" />
                    <h3 className="font-medium text-white">Message de demo</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Le socle technique IDJOR est visible, trace et gouverne en lecture seule.
                    Aucun LLM, aucun vector store et aucune decision automatisee ne sont
                    actives. L&apos;institution reste le seul decideur.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
