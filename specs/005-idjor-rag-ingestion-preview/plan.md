# Implementation Plan: PHASE 2D.2 - IDJOR RAG Ingestion Preview UI

**Branch**: `005-idjor-rag-ingestion-preview` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-idjor-rag-ingestion-preview/spec.md`

## Summary

Extend the protected `/fr/idjor` page so each listed RAG document exposes a
"Prévisualiser préparation" action that fetches the existing read-only backend
endpoint `GET /v1/idjor/rag/documents/:id/ingestion-preview` and renders the
result in a sober read-only panel. The implementation stays frontend-only,
reuses the current premium dark/glass shell, never displays `READY`, never
adds upload/ingest/index/vector/question controls, and documents the phase
through Spec Kit artifacts.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: existing `apiFetch` helper, protected auth session,
tenant context, `IdjorFoundationPanel`, `AppCard`, `Button`

**Storage**: N/A on the frontend; reads a tenant-scoped preview payload from
the backend

**Testing**: `npm run lint`, `npm run build`, and text scans for forbidden
activation wording and enabled AI booleans

**Target Platform**: Local protected dashboard frontend

**Project Type**: Single frontend web application

**Performance Goals**: Keep the RAG section compact and responsive while
loading one preview at a time, on demand, per selected document

**Constraints**: No backend change, no upload, no file parsing, no ingestion
runtime, no chunking, no embeddings, no vector store, no LLM, no decisioning,
no `LIVE IA` wording, no `READY` state, no regression on `/fr/applications` or
`/fr/applications/[id]`, no automatic commit

**Scale/Scope**: Frontend types, frontend API client, IDJOR RAG section UX, and
Spec Kit documentation for this phase only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The feature remains documentary, read-only, and metadata-only.
- PASS: No provider runtime, no LLM, and no vector or embedding activation is added.
- PASS: The panel previews readiness but does not score, price, decide, or analyze.
- PASS: Existing assurance workflows and routes remain isolated from the phase.
- PASS: The UI stays truthful about the absence of AI activation and never shows `READY`.

## Project Structure

### Documentation (this feature)

```text
specs/005-idjor-rag-ingestion-preview/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- idjor-rag-ingestion-preview.md
|-- checklists/
|   `-- requirements.md
|-- tasks.md
`-- validation-log.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   `-- fr/
|       `-- (protected)/
|           `-- idjor/
|               `-- page.tsx
|-- components/
|   `-- idjor/
|       `-- idjor-foundation-panel.tsx
|-- lib/
|   `-- api.ts
`-- types/
    `-- index.ts
```

**Structure Decision**: Keep the route entry stable and extend the existing
`IdjorFoundationPanel` plus shared API/types so the new preview UI remains
fully contained in the current protected IDJOR page.

## Phase 0: Research

### Research Goals

- Confirm the backend ingestion-preview GET contract and the exact
  `ingestionReadiness`, `missingFields`, `allowedNextSteps`, and
  `blockedReasons` shapes.
- Decide how to trigger a per-document preview from the existing RAG documents
  table without adding a new route.
- Decide how to keep the panel sober and bounded in compact demo mode.

### Research Outputs

- [research.md](./research.md)

## Phase 1: Design & Contracts

### Design Goals

- Define the frontend response entity for the ingestion preview.
- Define the per-document trigger, loading, success, and error UI states.
- Define the validation proving the absence of AI activation wording, enabled
  flags, or a `READY` state.

### Design Outputs

- [data-model.md](./data-model.md)
- [contracts/idjor-rag-ingestion-preview.md](./contracts/idjor-rag-ingestion-preview.md)
- [quickstart.md](./quickstart.md)
- refreshed `.specify/feature.json` and `AGENTS.md` managed plan pointer

## Post-Design Constitution Check

- PASS: The design only reads a tenant-scoped ingestion preview for the current document.
- PASS: The panel never exposes `READY`, file upload, vectorization, or question runtime.
- PASS: The preview is on-demand per document and does not change other RAG snapshots.
- PASS: Compact demo mode and premium shell remain intact.

## Complexity Tracking

No constitution violations or complexity exceptions are required for this plan.
