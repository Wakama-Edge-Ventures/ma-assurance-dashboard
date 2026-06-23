"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BotOff,
  Eye,
  FileSearch,
  Flag,
  Layers3,
  MessageCircle,
  Network,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Upload,
  Wrench,
} from "lucide-react";

import { useIdjorCompanion } from "@/components/idjor/idjor-companion-provider";
import { useTenant } from "@/components/tenant/useTenant";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AppAccordion } from "@/components/ui/app-accordion";
import { AppCard } from "@/components/ui/app-card";
import { AppTabs } from "@/components/ui/app-tabs";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { Button } from "@/components/ui/button";
import { DataPanel } from "@/components/ui/data-panel";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { PageTitle } from "@/components/ui/page-title";
import { SourceBadge } from "@/components/ui/source-badge";
import { StatusOverviewCard } from "@/components/ui/status-overview-card";
import {
  API_BASE_URL,
  ApiError,
  getIdjorFoundationHealth,
  getIdjorFoundationRegistry,
  getIdjorRagAuditEvents,
  getIdjorRagChunks,
  getIdjorRagCitations,
  getIdjorRagDocumentAuditEvents,
  getIdjorRagDocumentGovernanceCockpit,
  getIdjorRagDocumentIngestionPreview,
  getIdjorRagDocuments,
  getIdjorRagDocumentUploads,
  getIdjorRagEmbeddingReadiness,
  getIdjorRagExtractionGovernanceCockpit,
  getIdjorRagExtractionChunks,
  getIdjorRagHealth,
  getIdjorRagLlmReadiness,
  getIdjorRagRetrievalReadiness,
  getIdjorRagUploadExtractions,
  registerIdjorRagDocumentMetadata,
  requestIdjorRagEmbeddingPreview,
  requestIdjorRagLlmPreview,
  requestIdjorRagRetrievalPreview,
  runIdjorRagExtractionChunking,
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
  IdjorRagEmbeddingPreviewRequestResponse,
  IdjorRagEmbeddingReadinessResponse,
  IdjorRagExtractionChunk,
  IdjorRagExtractionChunkingResponse,
  IdjorRagExtractionChunksPage,
  IdjorRagExtractionPreviewResponse,
  IdjorRagGovernanceCockpitResponse,
  IdjorRagHealth,
  IdjorRagIngestionPreview,
  IdjorRagLlmPreviewRequestResponse,
  IdjorRagLlmReadinessResponse,
  IdjorRagMetadataRegistrationStatus,
  IdjorRagRetrievalPreviewRequestResponse,
  IdjorRagRetrievalReadinessResponse,
  IdjorRagSecuritySummary,
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

type RagExtractionChunkingState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagExtractionChunkingResponse }
  | { status: "error"; extractionId: string; message: string };

type RagExtractionChunksListState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; page: IdjorRagExtractionChunksPage }
  | { status: "error"; extractionId: string; message: string };

type RagEmbeddingReadinessState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagEmbeddingReadinessResponse }
  | { status: "error"; extractionId: string; message: string };

type RagEmbeddingPreviewRequestState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagEmbeddingPreviewRequestResponse }
  | { status: "error"; extractionId: string; message: string };

type RagRetrievalReadinessState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagRetrievalReadinessResponse }
  | { status: "error"; extractionId: string; message: string };

type RagRetrievalPreviewRequestState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagRetrievalPreviewRequestResponse }
  | { status: "error"; extractionId: string; message: string };

type RagLlmReadinessState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagLlmReadinessResponse }
  | { status: "error"; extractionId: string; message: string };

type RagLlmPreviewRequestState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagLlmPreviewRequestResponse }
  | { status: "error"; extractionId: string; message: string };

type IdjorPreviewResolutionState =
  | { status: "idle" }
  | { status: "loading"; documentId: string }
  | { status: "found"; documentId: string; extractionId: string; uploadId: string }
  | { status: "not-found"; documentId: string }
  | { status: "error"; documentId: string; message: string };

type RagDocumentGovernanceCockpitState =
  | { status: "idle" }
  | { status: "loading"; documentId: string }
  | { status: "success"; documentId: string; response: IdjorRagGovernanceCockpitResponse }
  | { status: "error"; documentId: string; message: string };

type RagExtractionGovernanceCockpitState =
  | { status: "idle" }
  | { status: "loading"; extractionId: string }
  | { status: "success"; extractionId: string; response: IdjorRagGovernanceCockpitResponse }
  | { status: "error"; extractionId: string; message: string };

const RAG_UPLOAD_INTAKE_MAX_BYTES = 10 * 1024 * 1024;

function validateRagUploadIntakeFile(file: File): string | null {
  if (file.size <= 0) {
    return "Le fichier selectionne est vide.";
  }
  if (file.size > RAG_UPLOAD_INTAKE_MAX_BYTES) {
    return "Le fichier depasse la taille maximale autorisee de 10 Mo.";
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
    <DataPanel>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-textMuted">
        {label}
      </p>
      <p className="mt-2 font-mono text-[28px] font-semibold text-slate-900 dark:bg-gradient-to-r dark:from-cyan-300 dark:via-emerald-200 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent">
        {value}
      </p>
      <p className="mt-1 text-xs text-brand-textMuted">{hint}</p>
    </DataPanel>
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
    success: "border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-400/28 dark:bg-emerald-400/10 dark:text-emerald-300",
    warning: "border-amber-300/60 bg-amber-50 text-amber-800 dark:border-amber-400/28 dark:bg-amber-400/10 dark:text-amber-300",
    danger: "border-rose-300/60 bg-rose-50 text-rose-800 dark:border-rose-400/28 dark:bg-rose-400/10 dark:text-rose-300",
    neutral: "border-brand-border/18 bg-brand-surfaceRaised/70 text-slate-700 dark:border-slate-400/18 dark:bg-slate-400/8 dark:text-slate-200",
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
    <AppAccordion
      icon={icon}
      title={title}
      subtitle={subtitle}
      countLabel={countLabel}
      open={open}
      onToggle={onToggle}
    >
      {children}
    </AppAccordion>
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
      <DataPanel>
        <p className="text-sm text-brand-textMuted">{emptyLabel}</p>
      </DataPanel>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-brand-border/10 bg-brand-surfaceRaised/72 dark:border-slate-400/10 dark:bg-[#0c1322]/75">
      <div className={cn("overflow-auto", maxHeightClass)}>
        <table className="min-w-full divide-y divide-brand-border/10 dark:divide-slate-400/10">
          <thead className="sticky top-0 z-10 bg-brand-surfaceRaised dark:bg-[#11192b]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-brand-textMuted",
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
              <tr key={row.id} className="border-t border-brand-border/8 align-top dark:border-slate-400/8">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 text-sm text-slate-700 dark:text-slate-200", column.className)}
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
      <DataPanel>
        <p className="text-sm text-brand-textMuted">{emptyLabel}</p>
      </DataPanel>
    );
  }

  return (
    <DataPanel className="space-y-2 p-3" maxHeightClass={maxHeightClass}>
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3.5 py-3 dark:border-slate-400/10 dark:bg-slate-400/5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/50 bg-cyan-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-800 dark:border-cyan-400/24 dark:bg-cyan-400/10 dark:text-cyan-200">
              {event.eventType}
            </span>
            {event.documentKey ? (
              <span className="font-mono text-[11px] text-brand-textMuted">{event.documentKey}</span>
            ) : null}
            <span className="ml-auto font-mono text-[10px] text-brand-textMuted">
              {event.createdAt}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {formatAuditEventSummary(event)}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-brand-textMuted">
            <span>
              source: <span className="text-slate-700 dark:text-slate-300">{event.source}</span>
            </span>
            <span>
              actorRole: <span className="text-slate-700 dark:text-slate-300">{event.actorRole ?? "Systeme"}</span>
            </span>
            <span>
              actorUserId:{" "}
              <span className="text-slate-700 dark:text-slate-300">{event.actorUserId ?? "Systeme"}</span>
            </span>
          </div>
        </div>
      ))}
    </DataPanel>
  );
}

function ExtractionChunkList({
  chunks,
  maxHeightClass,
}: {
  chunks: IdjorRagExtractionChunk[];
  maxHeightClass?: string;
}) {
  if (chunks.length === 0) {
    return (
      <DataPanel>
        <p className="text-sm text-brand-textMuted">Aucun chunk enregistre pour cette extraction.</p>
      </DataPanel>
    );
  }

  return (
    <DataPanel className="space-y-2 p-3" maxHeightClass={maxHeightClass}>
      {chunks.map((chunk) => (
        <div
          key={chunk.id}
          className="rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3.5 py-3 dark:border-slate-400/10 dark:bg-slate-400/5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/50 bg-cyan-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-800 dark:border-cyan-400/24 dark:bg-cyan-400/10 dark:text-cyan-200">
              chunk #{chunk.chunkIndex}
            </span>
            <span className="font-mono text-[11px] text-brand-textMuted">
              {chunk.contentText.length} caracteres
            </span>
            <span className="ml-auto font-mono text-[10px] text-brand-textMuted">
              {chunk.createdAt}
            </span>
          </div>
          <p className="mt-1.5 max-w-full break-all font-mono text-[11px] text-brand-textMuted">
            {chunk.contentHash}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {chunk.contentText.length > 160
              ? `${chunk.contentText.slice(0, 160)}…`
              : chunk.contentText}
          </p>
        </div>
      ))}
    </DataPanel>
  );
}

function EmbeddingReadinessPanel({
  readiness,
}: {
  readiness: IdjorRagEmbeddingReadinessResponse;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3.5 py-3 dark:border-slate-400/10 dark:bg-slate-400/5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:border-amber-400/28 dark:bg-amber-400/10 dark:text-amber-300">
          {readiness.embeddingReadiness}
        </span>
        <span className="font-mono text-[11px] text-brand-textMuted">
          chunks eligibles: {readiness.eligibleChunksCount}
        </span>
        <span className="font-mono text-[11px] text-brand-textMuted">
          embeddings reels: {readiness.linkedAssetCounts.embeddings}
        </span>
      </div>

      <p className="rounded-xl border border-slate-300/40 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-400/16 dark:bg-slate-400/5 dark:text-slate-300">
        Specification gouvernee prete — activation non demarree. Aucun moteur actif.
      </p>

      <DataPanel className="p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          flags activation embedding (gouvernance, tous desactives)
        </p>
        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <li className="font-mono">IDJOR_EMBEDDINGS_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_EMBEDDING_PROVIDER_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_VECTOR_STORE_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_EMBEDDING_WRITE_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_EMBEDDING_BACKFILL_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_RETRIEVAL_ENABLED — OFF</li>
        </ul>
      </DataPanel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ExecutiveStatus
          label="Provider"
          value={
            readiness.providerStatus.providerKey
              ? `${readiness.providerStatus.providerKey} (${readiness.providerStatus.isEnabled ? "enabled" : "disabled"})`
              : "Aucun provider catalogue"
          }
          tone={readiness.providerStatus.isEnabled ? "warning" : "success"}
        />
        <ExecutiveStatus
          label="Model"
          value={
            readiness.modelStatus.modelKey
              ? `${readiness.modelStatus.modelKey} (${readiness.modelStatus.isEnabled ? "enabled" : "disabled"})`
              : "Aucun modele catalogue"
          }
          tone={readiness.modelStatus.isEnabled ? "warning" : "success"}
        />
        <ExecutiveStatus
          label="Vector store"
          value={readiness.vectorStoreStatus.vectorStoreEnabled ? "true" : "false"}
          tone={readiness.vectorStoreStatus.vectorStoreEnabled ? "danger" : "success"}
        />
      </div>

      <DataPanel className="p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          blockedReasons
        </p>
        {readiness.blockedReasons.length > 0 ? (
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {readiness.blockedReasons.map((reason) => (
              <li key={reason} className="font-mono">
                {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-brand-textMuted">Aucun motif de blocage signale.</p>
        )}
      </DataPanel>

      <DataPanel className="p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          requiredFlags
        </p>
        {readiness.requiredFlags.length > 0 ? (
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {readiness.requiredFlags.map((flag) => (
              <li key={`${flag.targetType}-${flag.targetKey}`} className="font-mono">
                {flag.targetType}:{flag.targetKey} — {flag.enabled ? "enabled" : "OFF"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-brand-textMuted">Aucun flag requis signale.</p>
        )}
      </DataPanel>
    </div>
  );
}

function LlmReadinessGovernanceCard({
  securitySummary,
}: {
  securitySummary: IdjorRagSecuritySummary;
}) {
  return (
    <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-cyan-300" />
        <h3 className="font-medium text-slate-900 dark:text-white">
          Preparation gouvernance non vectorisee
        </h3>
      </div>

      <p className="rounded-xl border border-slate-300/40 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-400/16 dark:bg-slate-400/5 dark:text-slate-300">
        Idjor Preview disponible separement sur extraction compatible — voir le bloc &quot;Idjor
        Preview Phase 5R&quot; sous chaque document ci-dessous. Execution controlee uniquement
        sur demande, par extraction.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ExecutiveStatus
          label="Vector store"
          value={securitySummary.vectorStoreEnabled ? "ON" : "OFF"}
          tone={securitySummary.vectorStoreEnabled ? "danger" : "success"}
        />
        <ExecutiveStatus
          label="Decisioning"
          value={securitySummary.decisioningEnabled ? "ON" : "OFF"}
          tone={securitySummary.decisioningEnabled ? "danger" : "success"}
        />
        <ExecutiveStatus label="Decision automatique" value="Interdite" tone="success" />
      </div>

      <p className="mt-3 rounded-2xl border border-slate-400/10 bg-slate-400/5 px-3 py-2 text-xs leading-relaxed text-brand-textMuted">
        Aucune decision metier n&apos;est calculee automatiquement. Le vector store et le
        decisioning restent desactives a ce niveau de synthese ; l&apos;execution LLM reelle, si
        elle a lieu, se fait uniquement via le bloc Idjor Preview Phase 5R, par extraction et sur
        demande.
      </p>
    </div>
  );
}

function toneForStageStatus(status: string): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "DONE":
      return "success";
    case "BLOCKED":
      return "danger";
    case "NOT_READY":
      return "warning";
    default:
      return "neutral";
  }
}

function RetrievalReadinessPanel({
  readiness,
}: {
  readiness: IdjorRagRetrievalReadinessResponse;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3.5 py-3 dark:border-slate-400/10 dark:bg-slate-400/5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:border-amber-400/28 dark:bg-amber-400/10 dark:text-amber-300">
          {readiness.retrievalReadiness}
        </span>
        <span className="font-mono text-[11px] text-brand-textMuted">
          citations: {readiness.citationsCount}
        </span>
      </div>

      <p className="rounded-xl border border-slate-300/40 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-400/16 dark:bg-slate-400/5 dark:text-slate-300">
        Retrieval gouverne — activation non demarree. Aucun moteur actif.
      </p>

      <DataPanel className="p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          flags activation retrieval (gouvernance, tous desactives)
        </p>
        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <li className="font-mono">IDJOR_RETRIEVAL_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_RETRIEVAL_LLM_PROVIDER_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_RETRIEVAL_VECTOR_STORE_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_RETRIEVAL_CITATIONS_WRITE_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_RETRIEVAL_PREVIEW_ENABLED — OFF</li>
          <li className="font-mono">IDJOR_RETRIEVAL_BACKFILL_ENABLED — OFF</li>
        </ul>
      </DataPanel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatusOverviewCard
          label="Chunks"
          value={String(readiness.chunksCount)}
          hint="Chunks disponibles pour cette extraction"
          tone="neutral"
        />
        <StatusOverviewCard
          label="Embeddings"
          value={String(readiness.embeddingsCount)}
          hint="References deja presentes"
          tone={readiness.embeddingsCount > 0 ? "warning" : "neutral"}
        />
        <StatusOverviewCard
          label="Citations"
          value={String(readiness.citationsCount)}
          hint="Aucune citation ne doit etre creee dans cette phase"
          tone={readiness.citationsCount > 0 ? "warning" : "success"}
        />
        <StatusOverviewCard
          label="Vector Store"
          value={readiness.vectorStoreStatus}
          hint="Toujours desactive"
          tone={readiness.vectorStoreStatus === "DISABLED" ? "success" : "warning"}
        />
        <StatusOverviewCard
          label="Retrieval Runtime"
          value={readiness.retrievalStatus}
          hint="Aucun retrieval reel"
          tone={readiness.retrievalStatus === "BLOCKED" ? "warning" : "success"}
        />
        <StatusOverviewCard
          label="LLM"
          value={readiness.llmStatus}
          hint="Toujours desactive"
          tone={readiness.llmStatus === "DISABLED" ? "success" : "warning"}
        />
      </div>

      <DataPanel className="p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          blockedReasons
        </p>
        {readiness.blockedReasons.length > 0 ? (
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {readiness.blockedReasons.map((reason) => (
              <li key={reason} className="font-mono">
                {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-brand-textMuted">Aucun motif de blocage signale.</p>
        )}
      </DataPanel>
    </div>
  );
}

function LlmReadinessPanel({
  readiness,
}: {
  readiness: IdjorRagLlmReadinessResponse;
}) {
  const flagEntries = Object.entries(readiness.flagStates);
  const allFlagsOn = flagEntries.length > 0 && flagEntries.every(([, enabled]) => enabled);

  return (
    <div className="space-y-3 rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3.5 py-3 dark:border-slate-400/10 dark:bg-slate-400/5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:border-amber-400/28 dark:bg-amber-400/10 dark:text-amber-300">
          {readiness.llmReadiness}
        </span>
        <span className="font-mono text-[11px] text-brand-textMuted">
          embeddings: {readiness.embeddingsCount}
        </span>
        <span className="font-mono text-[11px] text-brand-textMuted">
          citations: {readiness.citationsCount}
        </span>
      </div>

      <p className="rounded-xl border border-slate-300/40 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-400/16 dark:bg-slate-400/5 dark:text-slate-300">
        {allFlagsOn
          ? "Idjor Preview disponible separement sur extraction compatible pour cette extraction. Le statut ci-dessus signale l'absence d'execution enregistree, pas une desactivation : lancez Idjor Preview ci-dessous (ou via le bloc Idjor Preview Phase 5R) pour obtenir une reponse reelle."
          : "Preparation gouvernance non vectorisee pour cette extraction. Execution controlee uniquement sur demande — certains prerequis de gouvernance restent a activer."}
      </p>

      <DataPanel className="p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          flags activation LLM ({allFlagsOn ? "gouvernance, actifs" : "gouvernance, OFF par defaut"})
        </p>
        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          {flagEntries.map(([key, enabled]) => (
            <li key={key} className="font-mono">
              {key} — {enabled ? "ON (gouverne)" : "OFF"}
            </li>
          ))}
        </ul>
      </DataPanel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatusOverviewCard
          label="Chunks"
          value={String(readiness.chunksCount)}
          hint="Chunks disponibles pour cette extraction"
          tone="neutral"
        />
        <StatusOverviewCard
          label="Embeddings"
          value={String(readiness.embeddingsCount)}
          hint="References deja presentes"
          tone={readiness.embeddingsCount > 0 ? "warning" : "neutral"}
        />
        <StatusOverviewCard
          label="Citations"
          value={String(readiness.citationsCount)}
          hint="Aucune citation reelle ne doit etre creee dans cette phase"
          tone={readiness.citationsCount > 0 ? "warning" : "success"}
        />
        <StatusOverviewCard
          label="Reponse reelle"
          value={readiness.llmExecuted ? "1" : "0"}
          hint={
            readiness.llmExecuted
              ? "Une execution Idjor Preview a deja ete enregistree pour cette extraction"
              : "Aucune execution enregistree pour le moment"
          }
          tone={readiness.llmExecuted ? "warning" : "neutral"}
        />
        <StatusOverviewCard
          label="Decision automatique"
          value="Interdite"
          hint="Lecture seule, gouvernance uniquement"
          tone="success"
        />
      </div>

      <DataPanel className="p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          blockedReasons
        </p>
        {readiness.blockedReasons.length > 0 ? (
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {readiness.blockedReasons.map((reason) => (
              <li key={reason} className="font-mono">
                {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-brand-textMuted">Aucun motif de blocage signale.</p>
        )}
      </DataPanel>
    </div>
  );
}

function LlmPreviewResultPanel({
  result,
}: {
  result: IdjorRagLlmPreviewRequestResponse;
}) {
  const toneByStatus = {
    EXECUTED: "success" as const,
    BLOCKED: "warning" as const,
    FAILED: "danger" as const,
  };

  return (
    <div className="space-y-3 rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3.5 py-3 dark:border-slate-400/10 dark:bg-slate-400/5">
      <div className="flex flex-wrap items-center gap-2">
        <ExecutiveStatus label="Statut Idjor Preview" value={result.status} tone={toneByStatus[result.status]} />
        <span className="font-mono text-[11px] text-brand-textMuted">
          citations: {result.citationsCount}
        </span>
      </div>

      {result.status === "EXECUTED" ? (
        <DataPanel className="p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
            Reponse Idjor (preview gouvernee, validation humaine requise)
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {result.answer ?? "Aucun contenu renvoye."}
          </p>
        </DataPanel>
      ) : (
        <p className="rounded-xl border border-slate-300/40 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-400/16 dark:bg-slate-400/5 dark:text-slate-300">
          {result.status === "BLOCKED"
            ? "Idjor n'a pas execute cette analyse : les prerequis de gouvernance ne sont pas reunis."
            : "Idjor n'a pas pu executer cette analyse : le fournisseur n'a pas repondu correctement."}
        </p>
      )}

      {result.citations.length > 0 ? (
        <DataPanel className="space-y-2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
            Sources citees
          </p>
          {result.citations.map((citation) => (
            <div
              key={citation.id}
              className="rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3 py-2 dark:border-slate-400/10 dark:bg-slate-400/5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-800 dark:text-cyan-200">
                {citation.citationLabel} — {citation.documentKey}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {citation.excerptText}
              </p>
            </div>
          ))}
        </DataPanel>
      ) : null}

      {result.blockedReasons.length > 0 ? (
        <DataPanel className="p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
            blockedReasons
          </p>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {result.blockedReasons.map((reason) => (
              <li key={reason} className="font-mono">
                {reason}
              </li>
            ))}
          </ul>
        </DataPanel>
      ) : null}

      <p className="text-[11px] text-brand-textMuted">
        Aucune decision metier n&apos;est calculee. Validation humaine obligatoire avant tout
        usage du contenu ci-dessus.
      </p>
    </div>
  );
}

function GovernanceCockpitPanel({
  title,
  cockpit,
  maxHeightClass,
}: {
  title: string;
  cockpit: IdjorRagGovernanceCockpitResponse;
  maxHeightClass?: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3.5 py-3 dark:border-slate-400/10 dark:bg-slate-400/5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-300/50 bg-cyan-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-800 dark:border-cyan-400/24 dark:bg-cyan-400/10 dark:text-cyan-200">
          {title}
        </span>
        <span className="font-mono text-[11px] text-brand-textMuted">
          {cockpit.viewMode} · audit {cockpit.counts.auditEvents}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cockpit.pipelineStages.map((stage) => (
          <StatusOverviewCard
            key={stage.stage}
            label={stage.stage.replaceAll("_", " ")}
            value={stage.status}
            tone={toneForStageStatus(stage.status)}
            hint="Pipeline gouverne"
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatusOverviewCard
          label="Uploads"
          value={String(cockpit.counts.uploads)}
          tone="neutral"
        />
        <StatusOverviewCard
          label="Extractions"
          value={String(cockpit.counts.extractions)}
          tone="neutral"
        />
        <StatusOverviewCard
          label="Chunks"
          value={String(cockpit.counts.chunks)}
          tone="neutral"
        />
        <StatusOverviewCard
          label="Embeddings"
          value={String(cockpit.counts.embeddings)}
          tone={cockpit.counts.embeddings > 0 ? "warning" : "neutral"}
        />
        <StatusOverviewCard
          label="Citations"
          value={String(cockpit.counts.citations)}
          tone={cockpit.counts.citations > 0 ? "warning" : "success"}
        />
        <StatusOverviewCard
          label="Audit Events"
          value={String(cockpit.counts.auditEvents)}
          tone="success"
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <DataPanel className="p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
            allowedNextSteps
          </p>
          {cockpit.allowedNextSteps.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {cockpit.allowedNextSteps.map((step) => (
                <li key={step} className="font-mono">
                  {step}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-textMuted">Aucune etape controlee supplementaire.</p>
          )}
        </DataPanel>

        <DataPanel className="p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
            blockedReasons
          </p>
          {cockpit.blockedReasons.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {cockpit.blockedReasons.map((reason) => (
                <li key={reason} className="font-mono">
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-textMuted">Aucun blocage signale.</p>
          )}
        </DataPanel>
      </div>

      <DataPanel className="space-y-2 p-3" maxHeightClass={maxHeightClass}>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
          pipelineEvents
        </p>
        {cockpit.pipelineEvents.length > 0 ? (
          cockpit.pipelineEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-brand-border/10 bg-brand-surface/60 px-3 py-2 dark:border-slate-400/10 dark:bg-slate-400/5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-800 dark:text-cyan-200">
                  {event.eventType}
                </span>
                {event.operation ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
                    {event.operation}
                  </span>
                ) : null}
                <span className="ml-auto font-mono text-[10px] text-brand-textMuted">
                  {event.createdAt ?? "n/a"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-brand-textMuted">Aucun evenement de pipeline charge.</p>
        )}
      </DataPanel>
    </div>
  );
}

function ExtractionResultBlock({
  extraction,
  chunkingPanelExtractionId,
  onToggleChunkingPanel,
  ragExtractionChunkingState,
  ragExtractionChunksListState,
  onRunChunking,
  ragEmbeddingReadinessState,
  ragEmbeddingPreviewRequestState,
  onCheckEmbeddingReadiness,
  onRequestEmbeddingPreview,
  ragRetrievalReadinessState,
  ragRetrievalPreviewRequestState,
  onCheckRetrievalReadiness,
  onRequestRetrievalPreview,
  ragLlmReadinessState,
  onCheckLlmReadiness,
  ragLlmPreviewRequestState,
  onRequestLlmPreview,
  ragDocumentGovernanceCockpitState,
  ragExtractionGovernanceCockpitState,
  onLoadDocumentGovernanceCockpit,
  onLoadExtractionGovernanceCockpit,
  maxHeightClass,
}: {
  extraction: IdjorRagDocumentExtraction;
  chunkingPanelExtractionId?: string | null;
  onToggleChunkingPanel?: (extractionId: string) => void;
  ragExtractionChunkingState?: RagExtractionChunkingState;
  ragExtractionChunksListState?: RagExtractionChunksListState;
  onRunChunking?: (extractionId: string, documentId: string) => void;
  ragEmbeddingReadinessState?: RagEmbeddingReadinessState;
  ragEmbeddingPreviewRequestState?: RagEmbeddingPreviewRequestState;
  onCheckEmbeddingReadiness?: (extractionId: string, documentId: string) => void;
  onRequestEmbeddingPreview?: (extractionId: string, documentId: string) => void;
  ragRetrievalReadinessState?: RagRetrievalReadinessState;
  ragRetrievalPreviewRequestState?: RagRetrievalPreviewRequestState;
  onCheckRetrievalReadiness?: (extractionId: string, documentId: string) => void;
  onRequestRetrievalPreview?: (extractionId: string, documentId: string) => void;
  ragLlmReadinessState?: RagLlmReadinessState;
  onCheckLlmReadiness?: (extractionId: string, documentId: string) => void;
  ragLlmPreviewRequestState?: RagLlmPreviewRequestState;
  onRequestLlmPreview?: (extractionId: string, documentId: string) => void;
  ragDocumentGovernanceCockpitState?: RagDocumentGovernanceCockpitState;
  ragExtractionGovernanceCockpitState?: RagExtractionGovernanceCockpitState;
  onLoadDocumentGovernanceCockpit?: (documentId: string) => void;
  onLoadExtractionGovernanceCockpit?: (extractionId: string) => void;
  maxHeightClass?: string;
}) {
  const { open: openIdjorCompanion } = useIdjorCompanion();
  const isChunkable =
    extraction.status === "EXTRACTED_PENDING_REVIEW" ||
    extraction.status === "EXTRACTED_PARTIAL_PENDING_REVIEW";
  const isChunkingPanelOpen = chunkingPanelExtractionId === extraction.id;
  const isChunkingLoading =
    ragExtractionChunkingState?.status === "loading" &&
    ragExtractionChunkingState.extractionId === extraction.id;
  const hasMatchingDocumentCockpit =
    ragDocumentGovernanceCockpitState?.status !== "idle" &&
    ragDocumentGovernanceCockpitState?.documentId === extraction.documentId;
  const hasMatchingExtractionCockpit =
    ragExtractionGovernanceCockpitState?.status !== "idle" &&
    ragExtractionGovernanceCockpitState?.extractionId === extraction.id;

  return (
    <div className="rounded-2xl border border-slate-400/10 bg-slate-400/5 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-400/24 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-800 dark:text-cyan-200">
          {extraction.status}
        </span>
        <span className="font-mono text-[11px] text-brand-textMuted">{extraction.mimeType}</span>
        <span className="ml-auto font-mono text-[10px] text-brand-textMuted">
          {extraction.createdAt}
        </span>
      </div>

      {(extraction.status === "EXTRACTED_PENDING_REVIEW" ||
        extraction.status === "EXTRACTED_PARTIAL_PENDING_REVIEW") &&
      extraction.previewText ? (
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-400/10 bg-brand-surfaceRaised/80 dark:bg-[#0c1322]/80 p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
          {extraction.previewText}
        </pre>
      ) : null}

      {(extraction.status === "UNSUPPORTED_PENDING_EXTRACTOR" ||
        extraction.status === "EXTRACTION_UNSUPPORTED_TYPE") ? (
        <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          Extracteur non active pour ce format. Aucun parsing n&apos;a ete effectue.
        </p>
      ) : null}

      {extraction.status === "EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY" ? (
        <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          Aucune couche texte exploitable detectee. OCR desactive, extraction bloquee.
        </p>
      ) : null}

      {(extraction.status === "FILE_MISSING" ||
        extraction.status === "FAILED" ||
        extraction.status === "EXTRACTION_FAILED") &&
      extraction.errorReason ? (
        <p className="mt-2 text-xs leading-relaxed text-rose-800 dark:text-rose-300">
          {extraction.errorReason}
        </p>
      ) : null}

      {extraction.status === "EXTRACTED_PARTIAL_PENDING_REVIEW" ? (
        <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          Texte natif partiel detecte. Le decoupage reste possible, mais certaines pages restent
          sans texte exploitable.
        </p>
      ) : null}

      <p className="mt-2 text-[11px] text-brand-textMuted">
        previewTextLength: {extraction.previewTextLength ?? 0}
      </p>

      {isChunkable && onToggleChunkingPanel && onRunChunking ? (
        <div className="mt-3 space-y-3 border-t border-slate-400/10 pt-3">
          <button
            type="button"
            onClick={() => onToggleChunkingPanel(extraction.id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200"
          >
            <Layers3 className="h-3 w-3" />
            {isChunkingPanelOpen ? "Fermer le decoupage" : "Decouper deterministiquement"}
          </button>

          {isChunkingPanelOpen ? (
            <div className="space-y-3 rounded-2xl border border-cyan-400/14 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-3">
              <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                Decoupage deterministe. Aucun embedding, vector store, retrieval ou LLM
                n&apos;est active.
              </p>

              <Button
                type="button"
                onClick={() => onRunChunking(extraction.id, extraction.documentId)}
                disabled={isChunkingLoading}
                className="min-w-[200px]"
              >
                {isChunkingLoading ? "Decoupage en cours..." : "Decouper deterministiquement"}
              </Button>

              {ragExtractionChunkingState?.status === "error" &&
              ragExtractionChunkingState.extractionId === extraction.id ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                  {ragExtractionChunkingState.message}
                </div>
              ) : null}

              {ragExtractionChunkingState?.status === "success" &&
              ragExtractionChunkingState.extractionId === extraction.id ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
                  {ragExtractionChunkingState.response.created
                    ? "Chunks crees"
                    : "Chunks deja existants"}{" "}
                  ({ragExtractionChunkingState.response.chunkCount}).
                </div>
              ) : null}

              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
                  Chunks pour cette extraction
                </p>

                {ragExtractionChunksListState?.status === "loading" &&
                ragExtractionChunksListState.extractionId === extraction.id ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300">Chargement...</p>
                ) : null}

                {ragExtractionChunksListState?.status === "error" &&
                ragExtractionChunksListState.extractionId === extraction.id ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                    {ragExtractionChunksListState.message}
                  </div>
                ) : null}

                {ragExtractionChunksListState?.status === "success" &&
                ragExtractionChunksListState.extractionId === extraction.id ? (
                  <ExtractionChunkList
                    chunks={ragExtractionChunksListState.page.chunks}
                    maxHeightClass={maxHeightClass}
                  />
                ) : null}
              </div>

              {onCheckEmbeddingReadiness && onRequestEmbeddingPreview ? (
                <div className="space-y-3 border-t border-slate-400/10 pt-3">
                  <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    Readiness embeddings uniquement. Aucun embedding reel, provider externe,
                    vector store, retrieval ou LLM n&apos;est active.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onCheckEmbeddingReadiness(extraction.id, extraction.documentId)}
                      disabled={
                        ragEmbeddingReadinessState?.status === "loading" &&
                        ragEmbeddingReadinessState.extractionId === extraction.id
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {ragEmbeddingReadinessState?.status === "loading" &&
                      ragEmbeddingReadinessState.extractionId === extraction.id
                        ? "Verification en cours..."
                        : "Verifier readiness embeddings"}
                    </button>

                    {ragEmbeddingReadinessState?.status === "success" &&
                    ragEmbeddingReadinessState.extractionId === extraction.id &&
                    (ragEmbeddingReadinessState.response.embeddingReadiness === "BLOCKED" ||
                      ragEmbeddingReadinessState.response.embeddingReadiness === "NOT_READY") ? (
                      <button
                        type="button"
                        onClick={() => onRequestEmbeddingPreview(extraction.id, extraction.documentId)}
                        disabled={
                          ragEmbeddingPreviewRequestState?.status === "loading" &&
                          ragEmbeddingPreviewRequestState.extractionId === extraction.id
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                      >
                        <ScanSearch className="h-3 w-3" />
                        {ragEmbeddingPreviewRequestState?.status === "loading" &&
                        ragEmbeddingPreviewRequestState.extractionId === extraction.id
                          ? "Demande en cours..."
                          : "Demande preview embedding"}
                      </button>
                    ) : null}
                  </div>

                  {ragEmbeddingReadinessState?.status === "error" &&
                  ragEmbeddingReadinessState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragEmbeddingReadinessState.message}
                    </div>
                  ) : null}

                  {ragEmbeddingReadinessState?.status === "success" &&
                  ragEmbeddingReadinessState.extractionId === extraction.id ? (
                    <EmbeddingReadinessPanel readiness={ragEmbeddingReadinessState.response} />
                  ) : null}

                  {ragEmbeddingPreviewRequestState?.status === "error" &&
                  ragEmbeddingPreviewRequestState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragEmbeddingPreviewRequestState.message}
                    </div>
                  ) : null}

                  {ragEmbeddingPreviewRequestState?.status === "success" &&
                  ragEmbeddingPreviewRequestState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-amber-400/24 bg-amber-400/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                      Demande de preview embedding: {ragEmbeddingPreviewRequestState.response.previewStatus}.
                      Readiness actuelle:{" "}
                      {ragEmbeddingPreviewRequestState.response.readiness.embeddingReadiness}. Aucun
                      job d&apos;embedding ni reference embedding n&apos;a ete cree.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {onCheckRetrievalReadiness && onRequestRetrievalPreview ? (
                <div className="space-y-3 border-t border-slate-400/10 pt-3">
                  <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    Retrieval readiness uniquement. Aucun retrieval reel, vector store,
                    citation, embedding reel ou LLM n&apos;est active.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onCheckRetrievalReadiness(extraction.id, extraction.documentId)}
                      disabled={
                        ragRetrievalReadinessState?.status === "loading" &&
                        ragRetrievalReadinessState.extractionId === extraction.id
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {ragRetrievalReadinessState?.status === "loading" &&
                      ragRetrievalReadinessState.extractionId === extraction.id
                        ? "Verification en cours..."
                        : "Verifier readiness retrieval"}
                    </button>

                    {ragRetrievalReadinessState?.status === "success" &&
                    ragRetrievalReadinessState.extractionId === extraction.id &&
                    (ragRetrievalReadinessState.response.retrievalReadiness === "BLOCKED" ||
                      ragRetrievalReadinessState.response.retrievalReadiness === "NOT_READY") ? (
                      <button
                        type="button"
                        onClick={() => onRequestRetrievalPreview(extraction.id, extraction.documentId)}
                        disabled={
                          ragRetrievalPreviewRequestState?.status === "loading" &&
                          ragRetrievalPreviewRequestState.extractionId === extraction.id
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                      >
                        <ScanSearch className="h-3 w-3" />
                        {ragRetrievalPreviewRequestState?.status === "loading" &&
                        ragRetrievalPreviewRequestState.extractionId === extraction.id
                          ? "Demande en cours..."
                          : "Demande preview retrieval"}
                      </button>
                    ) : null}
                  </div>

                  {ragRetrievalReadinessState?.status === "error" &&
                  ragRetrievalReadinessState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragRetrievalReadinessState.message}
                    </div>
                  ) : null}

                  {ragRetrievalReadinessState?.status === "success" &&
                  ragRetrievalReadinessState.extractionId === extraction.id ? (
                    <RetrievalReadinessPanel readiness={ragRetrievalReadinessState.response} />
                  ) : null}

                  {ragRetrievalPreviewRequestState?.status === "error" &&
                  ragRetrievalPreviewRequestState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragRetrievalPreviewRequestState.message}
                    </div>
                  ) : null}

                  {ragRetrievalPreviewRequestState?.status === "success" &&
                  ragRetrievalPreviewRequestState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-amber-400/24 bg-amber-400/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                      Demande de preview retrieval: {ragRetrievalPreviewRequestState.response.previewStatus}.
                      Readiness actuelle:{" "}
                      {ragRetrievalPreviewRequestState.response.readiness.retrievalReadiness}. Aucun
                      retrieval, citation ou LLM n&apos;a ete active.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {onCheckLlmReadiness ? (
                <div className="space-y-3 border-t border-slate-400/10 pt-3">
                  <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    LLM readiness uniquement. Aucun appel LLM, provider externe, vector store,
                    retrieval reel ou citation reelle n&apos;est active.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onCheckLlmReadiness(extraction.id, extraction.documentId)}
                      disabled={
                        ragLlmReadinessState?.status === "loading" &&
                        ragLlmReadinessState.extractionId === extraction.id
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                    >
                      <BotOff className="h-3 w-3" />
                      {ragLlmReadinessState?.status === "loading" &&
                      ragLlmReadinessState.extractionId === extraction.id
                        ? "Verification en cours..."
                        : "Verifier readiness LLM"}
                    </button>
                  </div>

                  {ragLlmReadinessState?.status === "error" &&
                  ragLlmReadinessState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragLlmReadinessState.message}
                    </div>
                  ) : null}

                  {ragLlmReadinessState?.status === "success" &&
                  ragLlmReadinessState.extractionId === extraction.id ? (
                    <LlmReadinessPanel readiness={ragLlmReadinessState.response} />
                  ) : null}
                </div>
              ) : null}

              {onRequestLlmPreview ? (
                <div className="space-y-3 border-t border-slate-400/10 pt-3">
                  <p className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-xs leading-relaxed text-cyan-800 dark:text-cyan-200">
                    Idjor Preview gouverne : execution reelle sur demande, par extraction.
                    Reflete exactement BLOCKED / FAILED / EXECUTED renvoye par le backend. Aucune
                    decision metier n&apos;est calculee.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onRequestLlmPreview(extraction.id, extraction.documentId)}
                      disabled={
                        ragLlmPreviewRequestState?.status === "loading" &&
                        ragLlmPreviewRequestState.extractionId === extraction.id
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                    >
                      <Sparkles className="h-3 w-3" />
                      {ragLlmPreviewRequestState?.status === "loading" &&
                      ragLlmPreviewRequestState.extractionId === extraction.id
                        ? "Analyse en cours..."
                        : "Lancer Idjor Preview"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openIdjorCompanion({
                          kind: "extraction",
                          extractionId: extraction.id,
                          documentId: extraction.documentId,
                          documentTitle: extraction.documentId,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Demander a Idjor
                    </button>
                  </div>

                  {ragLlmPreviewRequestState?.status === "error" &&
                  ragLlmPreviewRequestState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragLlmPreviewRequestState.message}
                    </div>
                  ) : null}

                  {ragLlmPreviewRequestState?.status === "success" &&
                  ragLlmPreviewRequestState.extractionId === extraction.id ? (
                    <LlmPreviewResultPanel result={ragLlmPreviewRequestState.response} />
                  ) : null}
                </div>
              ) : null}

              {onLoadDocumentGovernanceCockpit && onLoadExtractionGovernanceCockpit ? (
                <div className="space-y-3 border-t border-slate-400/10 pt-3">
                  <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    Governance cockpit : synthese de preuve et d&apos;audit. Aucune decision
                    automatique.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadExtractionGovernanceCockpit(extraction.id)}
                      disabled={
                        ragExtractionGovernanceCockpitState?.status === "loading" &&
                        ragExtractionGovernanceCockpitState.extractionId === extraction.id
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                    >
                      <ScrollText className="h-3 w-3" />
                      {ragExtractionGovernanceCockpitState?.status === "loading" &&
                      ragExtractionGovernanceCockpitState.extractionId === extraction.id
                        ? "Chargement..."
                        : "Voir cockpit extraction"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onLoadDocumentGovernanceCockpit(extraction.documentId)}
                      disabled={
                        ragDocumentGovernanceCockpitState?.status === "loading" &&
                        ragDocumentGovernanceCockpitState.documentId === extraction.documentId
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                    >
                      <ScrollText className="h-3 w-3" />
                      {ragDocumentGovernanceCockpitState?.status === "loading" &&
                      ragDocumentGovernanceCockpitState.documentId === extraction.documentId
                        ? "Chargement..."
                        : "Voir cockpit document"}
                    </button>
                  </div>

                  {ragExtractionGovernanceCockpitState?.status === "error" &&
                  ragExtractionGovernanceCockpitState.extractionId === extraction.id ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragExtractionGovernanceCockpitState.message}
                    </div>
                  ) : null}

                  {ragDocumentGovernanceCockpitState?.status === "error" &&
                  ragDocumentGovernanceCockpitState.documentId === extraction.documentId ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragDocumentGovernanceCockpitState.message}
                    </div>
                  ) : null}

                  {hasMatchingExtractionCockpit &&
                  ragExtractionGovernanceCockpitState.status === "success" ? (
                    <GovernanceCockpitPanel
                      title="Cockpit extraction"
                      cockpit={ragExtractionGovernanceCockpitState.response}
                      maxHeightClass={maxHeightClass}
                    />
                  ) : null}

                  {hasMatchingDocumentCockpit &&
                  ragDocumentGovernanceCockpitState.status === "success" ? (
                    <GovernanceCockpitPanel
                      title="Cockpit document"
                      cockpit={ragDocumentGovernanceCockpitState.response}
                      maxHeightClass={maxHeightClass}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {!isChunkable && onLoadDocumentGovernanceCockpit && onLoadExtractionGovernanceCockpit ? (
        <div className="mt-3 space-y-3 border-t border-slate-400/10 pt-3">
          <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
            Governance cockpit : synthese de preuve et d&apos;audit. Aucune decision
            automatique.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onLoadExtractionGovernanceCockpit(extraction.id)}
              disabled={
                ragExtractionGovernanceCockpitState?.status === "loading" &&
                ragExtractionGovernanceCockpitState.extractionId === extraction.id
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
            >
              <ScrollText className="h-3 w-3" />
              {ragExtractionGovernanceCockpitState?.status === "loading" &&
              ragExtractionGovernanceCockpitState.extractionId === extraction.id
                ? "Chargement..."
                : "Voir cockpit extraction"}
            </button>

            <button
              type="button"
              onClick={() => onLoadDocumentGovernanceCockpit(extraction.documentId)}
              disabled={
                ragDocumentGovernanceCockpitState?.status === "loading" &&
                ragDocumentGovernanceCockpitState.documentId === extraction.documentId
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
            >
              <ScrollText className="h-3 w-3" />
              {ragDocumentGovernanceCockpitState?.status === "loading" &&
              ragDocumentGovernanceCockpitState.documentId === extraction.documentId
                ? "Chargement..."
                : "Voir cockpit document"}
            </button>
          </div>

          {ragExtractionGovernanceCockpitState?.status === "error" &&
          ragExtractionGovernanceCockpitState.extractionId === extraction.id ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
              {ragExtractionGovernanceCockpitState.message}
            </div>
          ) : null}

          {ragDocumentGovernanceCockpitState?.status === "error" &&
          ragDocumentGovernanceCockpitState.documentId === extraction.documentId ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
              {ragDocumentGovernanceCockpitState.message}
            </div>
          ) : null}

          {hasMatchingExtractionCockpit &&
          ragExtractionGovernanceCockpitState.status === "success" ? (
            <GovernanceCockpitPanel
              title="Cockpit extraction"
              cockpit={ragExtractionGovernanceCockpitState.response}
              maxHeightClass={maxHeightClass}
            />
          ) : null}

          {hasMatchingDocumentCockpit &&
          ragDocumentGovernanceCockpitState.status === "success" ? (
            <GovernanceCockpitPanel
              title="Cockpit document"
              cockpit={ragDocumentGovernanceCockpitState.response}
              maxHeightClass={maxHeightClass}
            />
          ) : null}
        </div>
      ) : null}
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
      description={`${state.error.message}.${tenantHint} Cette vue reste un socle gouverne: lecture, tracabilite et actions controlees sans IA active.`}
    />
  );
}

export function IdjorFoundationPanel() {
  const { tenant } = useTenant();
  const { open: openIdjorCompanion } = useIdjorCompanion();
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
  const [idjorPreviewPanelDocumentId, setIdjorPreviewPanelDocumentId] = useState<string | null>(
    null,
  );
  const [idjorPreviewResolutionState, setIdjorPreviewResolutionState] =
    useState<IdjorPreviewResolutionState>({ status: "idle" });
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
  const [chunkingPanelExtractionId, setChunkingPanelExtractionId] = useState<string | null>(
    null,
  );
  const [ragExtractionChunkingState, setRagExtractionChunkingState] =
    useState<RagExtractionChunkingState>({ status: "idle" });
  const [ragExtractionChunksListState, setRagExtractionChunksListState] =
    useState<RagExtractionChunksListState>({ status: "idle" });
  const [ragEmbeddingReadinessState, setRagEmbeddingReadinessState] =
    useState<RagEmbeddingReadinessState>({ status: "idle" });
  const [ragEmbeddingPreviewRequestState, setRagEmbeddingPreviewRequestState] =
    useState<RagEmbeddingPreviewRequestState>({ status: "idle" });
  const [ragRetrievalReadinessState, setRagRetrievalReadinessState] =
    useState<RagRetrievalReadinessState>({ status: "idle" });
  const [ragRetrievalPreviewRequestState, setRagRetrievalPreviewRequestState] =
    useState<RagRetrievalPreviewRequestState>({ status: "idle" });
  const [ragLlmReadinessState, setRagLlmReadinessState] = useState<RagLlmReadinessState>({
    status: "idle",
  });
  const [ragLlmPreviewRequestState, setRagLlmPreviewRequestState] =
    useState<RagLlmPreviewRequestState>({ status: "idle" });
  const [ragDocumentGovernanceCockpitState, setRagDocumentGovernanceCockpitState] =
    useState<RagDocumentGovernanceCockpitState>({ status: "idle" });
  const [ragExtractionGovernanceCockpitState, setRagExtractionGovernanceCockpitState] =
    useState<RagExtractionGovernanceCockpitState>({ status: "idle" });
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

  const refreshDocumentAuditIfVisible = async (documentId: string) => {
    if (
      ragDocumentAuditState.status !== "idle" &&
      ragDocumentAuditState.documentId === documentId
    ) {
      await handleViewDocumentAudit(documentId);
    }
  };

  const handleLoadDocumentGovernanceCockpit = async (documentId: string) => {
    setRagDocumentGovernanceCockpitState({ status: "loading", documentId });

    try {
      const response = await getIdjorRagDocumentGovernanceCockpit(documentId);
      setRagDocumentGovernanceCockpitState({ status: "success", documentId, response });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de charger le governance cockpit pour ce document.";

      setRagDocumentGovernanceCockpitState({ status: "error", documentId, message });
    }
  };

  const handleLoadExtractionGovernanceCockpit = async (extractionId: string) => {
    setRagExtractionGovernanceCockpitState({ status: "loading", extractionId });

    try {
      const response = await getIdjorRagExtractionGovernanceCockpit(extractionId);
      setRagExtractionGovernanceCockpitState({ status: "success", extractionId, response });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de charger le governance cockpit pour cette extraction.";

      setRagExtractionGovernanceCockpitState({ status: "error", extractionId, message });
    }
  };

  const refreshGovernanceCockpitIfVisible = async ({
    documentId,
    extractionId,
  }: {
    documentId: string;
    extractionId?: string | null;
  }) => {
    if (
      ragDocumentGovernanceCockpitState.status !== "idle" &&
      ragDocumentGovernanceCockpitState.documentId === documentId
    ) {
      await handleLoadDocumentGovernanceCockpit(documentId);
    }

    if (
      extractionId &&
      ragExtractionGovernanceCockpitState.status !== "idle" &&
      ragExtractionGovernanceCockpitState.extractionId === extractionId
    ) {
      await handleLoadExtractionGovernanceCockpit(extractionId);
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
    setChunkingPanelExtractionId(null);
    setRagExtractionChunkingState({ status: "idle" });
    setRagExtractionChunksListState({ status: "idle" });
    setRagEmbeddingReadinessState({ status: "idle" });
    setRagEmbeddingPreviewRequestState({ status: "idle" });
    setRagRetrievalReadinessState({ status: "idle" });
    setRagRetrievalPreviewRequestState({ status: "idle" });
    setRagExtractionGovernanceCockpitState({ status: "idle" });

    if (next) {
      void handleLoadDocumentUploads(next);
    }
  };

  const handleToggleIdjorPreviewPanel = async (documentId: string) => {
    const next = idjorPreviewPanelDocumentId === documentId ? null : documentId;
    setIdjorPreviewPanelDocumentId(next);

    if (!next) {
      return;
    }

    setIdjorPreviewResolutionState({ status: "loading", documentId });

    try {
      const uploadsPage = await getIdjorRagDocumentUploads(documentId);
      let resolved: { extractionId: string; uploadId: string } | null = null;

      for (const upload of uploadsPage.uploads) {
        const extractionsPage = await getIdjorRagUploadExtractions(upload.id);
        const candidate =
          extractionsPage.extractions.find((extraction) => extraction.status.startsWith("EXTRACTED")) ??
          extractionsPage.extractions[0] ??
          null;

        if (candidate) {
          resolved = { extractionId: candidate.id, uploadId: upload.id };
          break;
        }
      }

      if (resolved) {
        setIdjorPreviewResolutionState({ status: "found", documentId, ...resolved });
      } else {
        setIdjorPreviewResolutionState({ status: "not-found", documentId });
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de resoudre une extraction compatible pour ce document.";

      setIdjorPreviewResolutionState({ status: "error", documentId, message });
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
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId });
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
    setChunkingPanelExtractionId(null);
    setRagExtractionChunkingState({ status: "idle" });
    setRagExtractionChunksListState({ status: "idle" });
    setRagEmbeddingReadinessState({ status: "idle" });
    setRagEmbeddingPreviewRequestState({ status: "idle" });
    setRagRetrievalReadinessState({ status: "idle" });
    setRagRetrievalPreviewRequestState({ status: "idle" });
    setRagExtractionGovernanceCockpitState({ status: "idle" });

    if (next) {
      void handleLoadUploadExtractions(next);
    }
  };

  const handleLoadExtractionChunks = async (extractionId: string) => {
    setRagExtractionChunksListState({ status: "loading", extractionId });

    try {
      const page = await getIdjorRagExtractionChunks(extractionId);
      setRagExtractionChunksListState({ status: "success", extractionId, page });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de charger les chunks pour cette extraction.";

      setRagExtractionChunksListState({ status: "error", extractionId, message });
    }
  };

  const handleToggleChunkingPanel = (extractionId: string) => {
    const next = chunkingPanelExtractionId === extractionId ? null : extractionId;
    setChunkingPanelExtractionId(next);
    setRagExtractionChunkingState({ status: "idle" });
    setRagExtractionChunksListState({ status: "idle" });
    setRagEmbeddingReadinessState({ status: "idle" });
    setRagEmbeddingPreviewRequestState({ status: "idle" });
    setRagRetrievalReadinessState({ status: "idle" });
    setRagRetrievalPreviewRequestState({ status: "idle" });
    setRagExtractionGovernanceCockpitState({ status: "idle" });

    if (next) {
      void handleLoadExtractionChunks(next);
    }
  };

  const handleRunExtractionChunking = async (extractionId: string, documentId: string) => {
    setRagExtractionChunkingState({ status: "loading", extractionId });

    try {
      const response = await runIdjorRagExtractionChunking(extractionId);
      setRagExtractionChunkingState({ status: "success", extractionId, response });

      await handleLoadExtractionChunks(extractionId);
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId, extractionId });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de lancer le decoupage deterministe.";

      setRagExtractionChunkingState({ status: "error", extractionId, message });
    }
  };

  const handleCheckEmbeddingReadiness = async (extractionId: string, documentId: string) => {
    setRagEmbeddingReadinessState({ status: "loading", extractionId });

    try {
      const response = await getIdjorRagEmbeddingReadiness(extractionId);
      setRagEmbeddingReadinessState({ status: "success", extractionId, response });
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId, extractionId });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de verifier la readiness embeddings pour cette extraction.";

      setRagEmbeddingReadinessState({ status: "error", extractionId, message });
    }
  };

  const handleRequestEmbeddingPreview = async (extractionId: string, documentId: string) => {
    setRagEmbeddingPreviewRequestState({ status: "loading", extractionId });

    try {
      const response = await requestIdjorRagEmbeddingPreview(extractionId);
      setRagEmbeddingPreviewRequestState({ status: "success", extractionId, response });
      const readiness = await getIdjorRagEmbeddingReadiness(extractionId);
      setRagEmbeddingReadinessState({ status: "success", extractionId, response: readiness });
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId, extractionId });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de demander la preview embedding pour cette extraction.";

      setRagEmbeddingPreviewRequestState({ status: "error", extractionId, message });
    }
  };

  const handleCheckRetrievalReadiness = async (extractionId: string, documentId: string) => {
    setRagRetrievalReadinessState({ status: "loading", extractionId });

    try {
      const response = await getIdjorRagRetrievalReadiness(extractionId);
      setRagRetrievalReadinessState({ status: "success", extractionId, response });
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId, extractionId });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de verifier la readiness retrieval pour cette extraction.";

      setRagRetrievalReadinessState({ status: "error", extractionId, message });
    }
  };

  const handleRequestRetrievalPreview = async (extractionId: string, documentId: string) => {
    setRagRetrievalPreviewRequestState({ status: "loading", extractionId });

    try {
      const response = await requestIdjorRagRetrievalPreview(extractionId);
      setRagRetrievalPreviewRequestState({ status: "success", extractionId, response });
      const readiness = await getIdjorRagRetrievalReadiness(extractionId);
      setRagRetrievalReadinessState({ status: "success", extractionId, response: readiness });
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId, extractionId });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de demander la preview retrieval pour cette extraction.";

      setRagRetrievalPreviewRequestState({ status: "error", extractionId, message });
    }
  };

  const handleCheckLlmReadiness = async (extractionId: string, documentId: string) => {
    setRagLlmReadinessState({ status: "loading", extractionId });

    try {
      const response = await getIdjorRagLlmReadiness(extractionId);
      setRagLlmReadinessState({ status: "success", extractionId, response });
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId, extractionId });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de verifier la readiness LLM pour cette extraction.";

      setRagLlmReadinessState({ status: "error", extractionId, message });
    }
  };

  const handleRequestLlmPreview = async (extractionId: string, documentId: string) => {
    setRagLlmPreviewRequestState({ status: "loading", extractionId });

    try {
      const response = await requestIdjorRagLlmPreview(extractionId);
      setRagLlmPreviewRequestState({ status: "success", extractionId, response });
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId, extractionId });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de lancer Idjor Preview pour cette extraction.";

      setRagLlmPreviewRequestState({ status: "error", extractionId, message });
    }
  };

  const handleRunExtractionPreview = async (uploadId: string, documentId: string) => {
    setRagExtractionPreviewState({ status: "loading", uploadId });

    try {
      const response = await runIdjorRagUploadExtractionPreview(uploadId);
      setRagExtractionPreviewState({ status: "success", uploadId, response });

      await handleLoadUploadExtractions(uploadId);
      await refreshDocumentAuditIfVisible(documentId);
      await refreshGovernanceCockpitIfVisible({ documentId });
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
            ? "Vue protegee des preuves, documents et journaux IDJOR. La page reste demonstrative, compacte et gouvernee: lecture, tracabilite et actions controlees sans IA active."
            : "Vue protegee du socle technique IDJOR. La page reste demonstrative, compacte et gouvernee: lecture, tracabilite et actions controlees sans IA active."
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
            <span className="inline-flex items-center rounded-full border border-amber-400/28 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
              socle gouverne
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
              tenant {displayTenantKey}
            </span>
            {resolutionMode ? (
              <span className="inline-flex items-center rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
                resolution {resolutionMode}
              </span>
            ) : null}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="space-y-3">
                <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
                  {demoSafeMode
                    ? "Preuves, audit et lecture documentaire"
                    : "IDJOR est pret cote socle technique"}
                </h2>
                <p className="max-w-3xl text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  {demoSafeMode
                    ? "Cette vue met en avant les documents, le hash, les preuves et le journal d'audit. Socle gouverne : lecture, tracabilite et actions controlees, sans IA active. L'institution conserve l'entiere responsabilite de la decision."
                    : "Cette vue montre un socle institutionnel gouverne : lecture, tracabilite et actions controlees (enregistrement, decoupage deterministe), sans IA active. L&apos;institution conserve l&apos;entiere responsabilite de la decision."}
                </p>
                <p className="max-w-3xl border-l-2 border-emerald-400/18 pl-3 text-sm leading-relaxed text-brand-textMuted">
                  {demoSafeMode
                    ? "IDJOR prepare, structure et documente. Il ne decide pas et n'agit pas comme une IA autonome dans cette phase."
                    : "IDJOR prepare, structure et documente. Il ne decide pas, ne score pas et n&apos;active aucun provider IA dans cette phase."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {demoSafeMode ? (
                  <>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
                      Documents visibles
                    </span>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
                      Audit append-only
                    </span>
                  </>
                ) : (
                  <>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
                      LLM OFF
                    </span>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
                      Vector Store OFF
                    </span>
                    <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">
                      Decisioning OFF
                    </span>
                  </>
                )}
                <span className="rounded-full border border-slate-400/18 bg-slate-400/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
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
                      ? "border-cyan-400/36 bg-cyan-400/10 text-cyan-800 dark:text-cyan-200"
                      : "border-slate-400/16 bg-slate-400/8 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
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
                      ? "border-cyan-400/36 bg-cyan-400/10 text-cyan-800 dark:text-cyan-200"
                      : "border-slate-400/16 bg-slate-400/8 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  Vue detaillee
                </button>
                <span className="text-xs text-brand-textMuted">
                  Base URL: <span className="font-mono text-slate-700 dark:text-slate-300">{API_BASE_URL}</span>
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ExecutiveStatus
                label="Socle technique"
                value={foundationReady ? "Pret" : "A verifier"}
                tone={foundationReady ? "success" : "warning"}
              />
              <ExecutiveStatus label="Registry" value="Lecture + actions controlees" tone="success" />
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
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-textMuted">
            Chargement
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
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
                <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Contexte tenant</h3>
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

                <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Etat de preparation</h3>
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

          <AppTabs
            tabs={[
              {
                key: "rag",
                label: "Documents & RAG",
                icon: <ScanSearch className="h-3.5 w-3.5" />,
                content: (
                  <div className="space-y-4">
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
                <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Synthese RAG</h3>
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

                <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BotOff className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Message de demo</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    La base documentaire RAG reste un socle gouverne. Le decoupage
                    deterministe, la previsualisation d&apos;extraction et l&apos;analyse Idjor
                    Preview sont disponibles comme actions controlees et tracees, sur demande et
                    par extraction. Aucune decision metier n&apos;est calculee automatiquement.
                  </p>
                </div>
              </div>

              <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                  <h3 className="font-medium text-slate-900 dark:text-white">Source labels autorises</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.ragHealth.securitySummary.sourceLabels.length > 0 ? (
                    state.ragHealth.securitySummary.sourceLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300"
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 text-xs text-brand-textMuted">
                      Aucun label source publie pour ce tenant
                    </span>
                  )}
                </div>
              </div>

              <LlmReadinessGovernanceCard securitySummary={state.ragHealth.securitySummary} />

              {!demoSafeMode ? (
              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[18px] border border-cyan-400/14 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Ajout metadata-only</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
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
                    <p className="rounded-2xl border border-slate-400/10 bg-slate-400/5 px-3 py-2 text-xs leading-relaxed text-brand-textMuted">
                      Le backend enregistre uniquement une fiche documentaire et maintient
                      `REGISTERED` ou `DEGRADED`. Aucun READY, aucun upload et aucun calcul
                      metier ne sont exposes ici.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleRagRegistrationSubmit}
                  className="space-y-4 rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Formulaire interne RAG</h3>
                      <p className="mt-1 text-xs text-brand-textMuted">
                        Le formulaire reste borne a la metadata documentaire du tenant courant.
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
                      tenant {state.ragHealth.scope.tenantKey}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
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
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
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
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
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
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
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
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
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
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
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
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragRegistrationState.message}
                    </div>
                  ) : null}

                  {ragRegistrationState.status === "success" ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
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
                    <p className="text-xs text-brand-textMuted">
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
                        <p className="font-medium text-slate-900 dark:text-white">{document.title}</p>
                        <p className="font-mono text-[11px] text-brand-textMuted">
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
                        <p className="text-xs text-brand-textMuted">
                          {document.mimeType ?? "mime inconnu"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "reference",
                    header: "Reference",
                    render: (document) => (
                      <p className="text-xs text-brand-textMuted">
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
                            <p className="max-w-[220px] break-all font-mono text-[11px] text-brand-textMuted">
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
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
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
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200"
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
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                      >
                        <ScrollText className="h-3 w-3" />
                        {ragDocumentAuditState.status === "loading" &&
                        ragDocumentAuditState.documentId === document.id
                          ? "Chargement..."
                          : "Voir audit"}
                      </button>
                    ),
                  },
                  {
                    key: "idjorPreview",
                    header: "Idjor Preview",
                    render: (document) => (
                      <button
                        type="button"
                        onClick={() => void handleToggleIdjorPreviewPanel(document.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-800 dark:text-cyan-200 transition-colors hover:border-cyan-300/50"
                      >
                        <Sparkles className="h-3 w-3" />
                        {idjorPreviewPanelDocumentId === document.id
                          ? "Fermer"
                          : "Idjor Preview Phase 5R"}
                      </button>
                    ),
                  },
                ]}
              />

              {idjorPreviewPanelDocumentId ? (
                <div className="space-y-4 rounded-[18px] border border-cyan-400/22 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Idjor Preview Phase 5R —{" "}
                      {state.status === "ready"
                        ? state.ragDocuments.documents.find(
                            (document) => document.id === idjorPreviewPanelDocumentId,
                          )?.title ?? idjorPreviewPanelDocumentId
                        : idjorPreviewPanelDocumentId}
                    </h3>
                  </div>

                  <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    Execution controlee uniquement sur demande, par extraction. Analyse non
                    decisionnelle — l&apos;institution decide.
                  </p>

                  {idjorPreviewResolutionState.status === "loading" &&
                  idjorPreviewResolutionState.documentId === idjorPreviewPanelDocumentId ? (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Resolution de l&apos;extraction compatible...
                    </p>
                  ) : null}

                  {idjorPreviewResolutionState.status === "error" &&
                  idjorPreviewResolutionState.documentId === idjorPreviewPanelDocumentId ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {idjorPreviewResolutionState.message}
                    </div>
                  ) : null}

                  {idjorPreviewResolutionState.status === "not-found" &&
                  idjorPreviewResolutionState.documentId === idjorPreviewPanelDocumentId ? (
                    <p className="rounded-xl border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:border-amber-400/24 dark:bg-amber-400/10 dark:text-amber-300">
                      Document pret, extraction compatible non trouvee pour l&apos;appel preview.
                      Gap : aucune extraction exploitable n&apos;est encore disponible pour ce
                      document — importez un fichier via la quarantaine ci-dessous, puis
                      previsualisez son extraction avant de relancer Idjor Preview.
                    </p>
                  ) : null}

                  {idjorPreviewResolutionState.status === "found" &&
                  idjorPreviewResolutionState.documentId === idjorPreviewPanelDocumentId ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleRequestLlmPreview(
                              idjorPreviewResolutionState.extractionId,
                              idjorPreviewPanelDocumentId,
                            )
                          }
                          disabled={
                            ragLlmPreviewRequestState.status === "loading" &&
                            ragLlmPreviewRequestState.extractionId ===
                              idjorPreviewResolutionState.extractionId
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200 disabled:opacity-60"
                        >
                          <Sparkles className="h-3 w-3" />
                          {ragLlmPreviewRequestState.status === "loading" &&
                          ragLlmPreviewRequestState.extractionId ===
                            idjorPreviewResolutionState.extractionId
                            ? "Analyse en cours..."
                            : "Lancer Idjor Preview"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openIdjorCompanion({
                              kind: "extraction",
                              extractionId: idjorPreviewResolutionState.extractionId,
                              documentId: idjorPreviewPanelDocumentId,
                              documentTitle:
                                (state.status === "ready"
                                  ? state.ragDocuments.documents.find(
                                      (document) => document.id === idjorPreviewPanelDocumentId,
                                    )?.title
                                  : null) ?? idjorPreviewPanelDocumentId,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Demander a Idjor
                        </button>
                      </div>

                      {ragLlmPreviewRequestState.status === "error" &&
                      ragLlmPreviewRequestState.extractionId ===
                        idjorPreviewResolutionState.extractionId ? (
                        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                          {ragLlmPreviewRequestState.message}
                        </div>
                      ) : null}

                      {ragLlmPreviewRequestState.status === "success" &&
                      ragLlmPreviewRequestState.extractionId ===
                        idjorPreviewResolutionState.extractionId ? (
                        <LlmPreviewResultPanel result={ragLlmPreviewRequestState.response} />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {uploadPanelDocumentId ? (
                <div className="space-y-4 rounded-[18px] border border-cyan-400/14 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Quarantaine documentaire</h3>
                  </div>

                  <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    Quarantaine documentaire uniquement. Aucun contenu n&apos;est lu, extrait,
                    decoupe, vectorise ou analyse par IA.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      onChange={(event) =>
                        handleUploadFileChange(event.target.files?.[0] ?? null)
                      }
                      className="text-xs text-slate-700 dark:text-slate-300"
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

                  <p className="text-xs text-brand-textMuted">
                    Taille maximale 10 Mo. PDF, TXT et DOCX sont extraits en texte natif. Les
                    autres formats restent en quarantaine et seront marques non supportes.
                  </p>

                  {uploadFileError ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {uploadFileError}
                    </div>
                  ) : null}

                  {ragUploadIntakeState.status === "error" &&
                  ragUploadIntakeState.documentId === uploadPanelDocumentId ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                      {ragUploadIntakeState.message}
                    </div>
                  ) : null}

                  {ragUploadIntakeState.status === "success" &&
                  ragUploadIntakeState.documentId === uploadPanelDocumentId ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
                      Fichier mis en quarantaine.{" "}
                      <span className="font-mono break-all">
                        {ragUploadIntakeState.result.upload.sha256Hash}
                      </span>
                    </div>
                  ) : null}

                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
                      Fichiers en quarantaine pour ce document
                    </p>

                    {ragUploadsListState.status === "loading" &&
                    ragUploadsListState.documentId === uploadPanelDocumentId ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300">Chargement...</p>
                    ) : null}

                    {ragUploadsListState.status === "error" &&
                    ragUploadsListState.documentId === uploadPanelDocumentId ? (
                      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
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
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {upload.originalFilename}
                                </p>
                                <p className="text-xs text-brand-textMuted">{upload.mimeType}</p>
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
                              <p className="max-w-[220px] break-all font-mono text-[11px] text-brand-textMuted">
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
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300 transition-colors hover:border-cyan-400/36 hover:text-cyan-800 dark:text-cyan-200"
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
                    <div className="space-y-4 rounded-[18px] border border-cyan-400/14 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                      <div className="flex items-center gap-2">
                        <FileSearch className="h-4 w-4 text-cyan-300" />
                        <h3 className="font-medium text-slate-900 dark:text-white">Extraction controlee</h3>
                      </div>

                      <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
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
                        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                          {ragExtractionPreviewState.message}
                        </div>
                      ) : null}

                      {ragExtractionPreviewState.status === "success" &&
                      ragExtractionPreviewState.uploadId === extractionPanelUploadId ? (
                        <ExtractionResultBlock
                          extraction={ragExtractionPreviewState.response.extraction}
                          chunkingPanelExtractionId={chunkingPanelExtractionId}
                          onToggleChunkingPanel={handleToggleChunkingPanel}
                          ragExtractionChunkingState={ragExtractionChunkingState}
                          ragExtractionChunksListState={ragExtractionChunksListState}
                          onRunChunking={handleRunExtractionChunking}
                          ragEmbeddingReadinessState={ragEmbeddingReadinessState}
                          ragEmbeddingPreviewRequestState={ragEmbeddingPreviewRequestState}
                          onCheckEmbeddingReadiness={handleCheckEmbeddingReadiness}
                          onRequestEmbeddingPreview={handleRequestEmbeddingPreview}
                          ragRetrievalReadinessState={ragRetrievalReadinessState}
                          ragRetrievalPreviewRequestState={ragRetrievalPreviewRequestState}
                          onCheckRetrievalReadiness={handleCheckRetrievalReadiness}
                          onRequestRetrievalPreview={handleRequestRetrievalPreview}
                          ragLlmReadinessState={ragLlmReadinessState}
                          onCheckLlmReadiness={handleCheckLlmReadiness}
                          ragLlmPreviewRequestState={ragLlmPreviewRequestState}
                          onRequestLlmPreview={handleRequestLlmPreview}
                          ragDocumentGovernanceCockpitState={ragDocumentGovernanceCockpitState}
                          ragExtractionGovernanceCockpitState={ragExtractionGovernanceCockpitState}
                          onLoadDocumentGovernanceCockpit={handleLoadDocumentGovernanceCockpit}
                          onLoadExtractionGovernanceCockpit={handleLoadExtractionGovernanceCockpit}
                          maxHeightClass={tableHeightClass}
                        />
                      ) : null}

                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
                          Extractions pour ce fichier
                        </p>

                        {ragUploadExtractionsListState.status === "loading" &&
                        ragUploadExtractionsListState.uploadId === extractionPanelUploadId ? (
                          <p className="text-sm text-slate-700 dark:text-slate-300">Chargement...</p>
                        ) : null}

                        {ragUploadExtractionsListState.status === "error" &&
                        ragUploadExtractionsListState.uploadId === extractionPanelUploadId ? (
                          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                            {ragUploadExtractionsListState.message}
                          </div>
                        ) : null}

                        {ragUploadExtractionsListState.status === "success" &&
                        ragUploadExtractionsListState.uploadId === extractionPanelUploadId ? (
                          (() => {
                            const currentResultExtractionId =
                              ragExtractionPreviewState.status === "success" &&
                              ragExtractionPreviewState.uploadId === extractionPanelUploadId
                                ? ragExtractionPreviewState.response.extraction.id
                                : null;
                            const remainingExtractions =
                              ragUploadExtractionsListState.page.extractions.filter(
                                (extraction) => extraction.id !== currentResultExtractionId,
                              );

                            return remainingExtractions.length > 0 ? (
                              <div
                                className={cn(
                                  "space-y-3 overflow-auto rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-3",
                                  tableHeightClass,
                                )}
                              >
                                {remainingExtractions.map((extraction) => (
                                  <ExtractionResultBlock
                                    key={extraction.id}
                                    extraction={extraction}
                                    chunkingPanelExtractionId={chunkingPanelExtractionId}
                                    onToggleChunkingPanel={handleToggleChunkingPanel}
                                    ragExtractionChunkingState={ragExtractionChunkingState}
                                    ragExtractionChunksListState={ragExtractionChunksListState}
                                    onRunChunking={handleRunExtractionChunking}
                                    ragEmbeddingReadinessState={ragEmbeddingReadinessState}
                                    ragEmbeddingPreviewRequestState={ragEmbeddingPreviewRequestState}
                                    onCheckEmbeddingReadiness={handleCheckEmbeddingReadiness}
                                    onRequestEmbeddingPreview={handleRequestEmbeddingPreview}
                                    ragRetrievalReadinessState={ragRetrievalReadinessState}
                                    ragRetrievalPreviewRequestState={ragRetrievalPreviewRequestState}
                                    onCheckRetrievalReadiness={handleCheckRetrievalReadiness}
                                    onRequestRetrievalPreview={handleRequestRetrievalPreview}
                                    ragLlmReadinessState={ragLlmReadinessState}
                                    onCheckLlmReadiness={handleCheckLlmReadiness}
                                    ragLlmPreviewRequestState={ragLlmPreviewRequestState}
                                    onRequestLlmPreview={handleRequestLlmPreview}
                                    ragDocumentGovernanceCockpitState={ragDocumentGovernanceCockpitState}
                                    ragExtractionGovernanceCockpitState={ragExtractionGovernanceCockpitState}
                                    onLoadDocumentGovernanceCockpit={handleLoadDocumentGovernanceCockpit}
                                    onLoadExtractionGovernanceCockpit={handleLoadExtractionGovernanceCockpit}
                                    maxHeightClass={tableHeightClass}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                                <p className="text-sm text-brand-textMuted">
                                  {currentResultExtractionId
                                    ? "Aucune autre extraction enregistree pour ce fichier."
                                    : "Aucune extraction enregistree pour ce fichier."}
                                </p>
                              </div>
                            );
                          })()
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!demoSafeMode && ragIngestionPreviewState.status !== "idle" ? (
                <div className="rounded-[18px] border border-cyan-400/14 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Previsualisation de preparation</h3>
                  </div>

                  <p className="mb-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    Previsualisation uniquement. Aucun fichier n&apos;est lu, traite,
                    decoupe, vectorise ou analyse par IA.
                  </p>

                  {ragIngestionPreviewState.status === "loading" ? (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Chargement de la previsualisation de preparation...
                    </p>
                  ) : null}

                  {ragIngestionPreviewState.status === "error" ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
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
                          label="Readiness gouvernance"
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
                          label="Chunks gouvernance (metadata-only)"
                          value={String(
                            ragIngestionPreviewState.preview.linkedAssetCounts.chunks,
                          )}
                          tone="success"
                        />
                        <ExecutiveStatus
                          label="Citations gouvernance (metadata-only)"
                          value={String(
                            ragIngestionPreviewState.preview.linkedAssetCounts.citations,
                          )}
                          tone="success"
                        />
                      </div>

                      <p className="text-xs leading-relaxed text-brand-textMuted">
                        Ces compteurs sont une gouvernance metadata-only distincte des chunks
                        techniques deterministes. Les chunks techniques crees via
                        &quot;Decouper deterministiquement&quot; restent visibles dans le
                        panneau d&apos;extraction de ce document, meme si la readiness
                        gouvernance reste {ragIngestionPreviewState.preview.ingestionReadiness}.
                      </p>

                      <div className="grid gap-4 xl:grid-cols-3">
                        <div className="rounded-[18px] border border-slate-400/10 bg-slate-400/5 p-3">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
                            missingFields
                          </p>
                          {ragIngestionPreviewState.preview.missingFields.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                              {ragIngestionPreviewState.preview.missingFields.map((item) => (
                                <li key={item.field}>
                                  <span className="font-mono text-brand-textMuted">{item.field}</span>
                                  {" — "}
                                  {item.reason}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-brand-textMuted">Aucun champ manquant signale.</p>
                          )}
                        </div>

                        <div className="rounded-[18px] border border-slate-400/10 bg-slate-400/5 p-3">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
                            allowedNextSteps
                          </p>
                          {ragIngestionPreviewState.preview.allowedNextSteps.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                              {ragIngestionPreviewState.preview.allowedNextSteps.map((step) => (
                                <li key={step} className="font-mono">
                                  {step}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-brand-textMuted">Aucune etape suivante exposee.</p>
                          )}
                        </div>

                        <div className="rounded-[18px] border border-slate-400/10 bg-slate-400/5 p-3">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-textMuted">
                            blockedReasons
                          </p>
                          {ragIngestionPreviewState.preview.blockedReasons.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                              {ragIngestionPreviewState.preview.blockedReasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-brand-textMuted">Aucun motif de blocage signale.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {ragDocumentAuditState.status !== "idle" ? (
                <div className="rounded-[18px] border border-cyan-400/14 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Audit du document</h3>
                  </div>

                  <p className="mb-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                    Journal append-only. Lecture seule. Aucun evenement n&apos;est modifie depuis
                    le dashboard.
                  </p>

                  {ragDocumentAuditState.status === "loading" ? (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Chargement du journal d&apos;audit du document...
                    </p>
                  ) : null}

                  {ragDocumentAuditState.status === "error" ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
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
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-brand-textMuted">
                  Chunks et citations ci-dessous sont des compteurs metadata-only de
                  gouvernance, distincts des chunks techniques deterministes crees via
                  l&apos;action &quot;Decouper deterministiquement&quot; (visibles dans le
                  panneau d&apos;extraction de chaque document).
                </p>
              <div className="grid gap-4 xl:grid-cols-2">
                <RegistryTable
                  rows={state.ragChunks.chunks}
                  emptyLabel="0 chunk metadata-only pour ce tenant (gouvernance, distinct des chunks techniques deterministes)."
                  maxHeightClass={tableHeightClass}
                  columns={[
                    {
                      key: "chunk",
                      header: "Chunk",
                      render: (chunk) => (
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900 dark:text-white">{chunk.documentTitle}</p>
                          <p className="font-mono text-[11px] text-brand-textMuted">
                            {chunk.documentKey} · #{chunk.chunkIndex}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: "excerpt",
                      header: "Extrait",
                      render: (chunk) => (
                        <p className="max-w-[420px] text-xs text-brand-textMuted">
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
                          <p className="font-medium text-slate-900 dark:text-white">{citation.citationLabel}</p>
                          <p className="font-mono text-[11px] text-brand-textMuted">
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
                        <p className="max-w-[420px] text-xs text-brand-textMuted">
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
              <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
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
                  </div>
                ),
              },
              ...(showTechnicalSections
                ? [
                    {
                      key: "config",
                      label: "Configuration & gouvernance",
                      icon: <Network className="h-3.5 w-3.5" />,
                      content: (
                        <div className="space-y-4">
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
                      <p className="font-medium text-slate-900 dark:text-white">{agent.displayName}</p>
                      <p className="font-mono text-[11px] text-brand-textMuted">{agent.agentKey}</p>
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
                      <p className="text-xs text-brand-textMuted">
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
                      <p className="font-medium text-slate-900 dark:text-white">{engine.displayName}</p>
                      <p className="font-mono text-[11px] text-brand-textMuted">{engine.engineKey}</p>
                    </div>
                  ),
                },
                {
                  key: "state",
                  header: "Etat",
                  render: (engine) => (
                    <div className="space-y-1">
                      <p>{engine.registryStatus}</p>
                      <p className="text-xs text-brand-textMuted">
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
                      <p className="font-medium text-slate-900 dark:text-white">{tool.displayName}</p>
                      <p className="font-mono text-[11px] text-brand-textMuted">{tool.toolKey}</p>
                    </div>
                  ),
                },
                { key: "access", header: "Access", render: (tool) => tool.accessMode },
                {
                  key: "roles",
                  header: "Roles",
                  render: (tool) =>
                    tool.allowedRoles.length > 0 ? (
                      <p className="text-xs text-brand-textMuted">{tool.allowedRoles.join(", ")}</p>
                    ) : (
                      <p className="text-xs text-brand-textMuted">Tous roles lisibles</p>
                    ),
                },
                {
                  key: "state",
                  header: "Etat",
                  render: (tool) => (
                    <div className="space-y-1">
                      <p>{tool.isReadOnly ? "READ_ONLY" : tool.accessMode}</p>
                      <p className="text-xs text-brand-textMuted">
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
                      <p className="text-xs text-brand-textMuted">{flag.enabled ? "enabled" : "OFF"}</p>
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
                        <p className="font-medium text-slate-900 dark:text-white">{provider.displayName}</p>
                        <p className="font-mono text-[11px] text-brand-textMuted">{provider.providerKey}</p>
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
                        <p className="text-xs text-brand-textMuted">
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
                        <p className="font-medium text-slate-900 dark:text-white">{model.displayName}</p>
                        <p className="font-mono text-[11px] text-brand-textMuted">{model.modelKey}</p>
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
                        <p className="text-xs text-brand-textMuted">
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
                        </div>
                      ),
                    },
                  ]
                : []),
              {
                key: "security",
                label: "Securite IA",
                icon: <ShieldCheck className="h-3.5 w-3.5" />,
                content: (
                  <div className="space-y-4">
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
                <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ScanSearch className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Source labels autorises</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.health.securitySummary.sourceLabels.length > 0 ? (
                      state.health.securitySummary.sourceLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-slate-400/16 bg-slate-400/8 px-2.5 py-1 text-xs text-brand-textMuted">
                        Aucun label source publie pour ce tenant
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-400/10 bg-brand-surfaceRaised/72 dark:bg-[#0c1322]/75 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BotOff className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Message de demo</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    Le socle technique IDJOR est visible, trace et gouverne en lecture seule.
                    Aucun LLM, aucun vector store et aucune decision automatisee ne sont
                    actives. L&apos;institution reste le seul decideur.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
                  </div>
                ),
              },
            ]}
          />
        </>
      ) : null}
    </div>
  );
}
