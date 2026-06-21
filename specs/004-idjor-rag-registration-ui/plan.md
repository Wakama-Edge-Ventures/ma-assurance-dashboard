# Implementation Plan: PHASE 2C.6 - IDJOR RAG Metadata Registration UI

**Branch**: `004-idjor-rag-registration-ui` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-idjor-rag-registration-ui/spec.md`

## Summary

Extend the protected `/fr/idjor` page with a compact internal form that
registers RAG documentary metadata through the existing backend endpoint
`POST /v1/idjor/rag/documents/register`. The implementation stays frontend-only,
reuses the current premium dark/glass shell, keeps all AI and vector controls
disabled, refreshes RAG metadata after success, and documents the phase through
Spec Kit artifacts.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: existing `apiFetch` helper, protected auth session,
tenant context, `IdjorFoundationPanel`, `Button`, `AppCard`, `PageTitle`

**Storage**: N/A on the frontend; submits metadata-only payloads to the backend

**Testing**: `npm run lint`, `npm run build`, and text scans for forbidden
activation wording and enabled AI booleans

**Target Platform**: Local protected dashboard frontend

**Project Type**: Single frontend web application

**Performance Goals**: Keep the RAG section compact and responsive while
refreshing the affected metadata after a successful POST

**Constraints**: No backend change, no upload, no file parsing, no ingestion
runtime, no chunking, no embeddings, no vector store, no LLM, no decisioning,
no `LIVE IA` wording, no regression on `/fr/applications` or
`/fr/applications/[id]`, no automatic commit

**Scale/Scope**: Frontend types, frontend API client, IDJOR RAG section UX, and
Spec Kit documentation for this phase only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The feature remains documentary and metadata-only.
- PASS: No provider runtime, no LLM, and no vector or embedding activation is added.
- PASS: The form registers metadata but does not score, price, decide, or analyze.
- PASS: Existing assurance workflows and routes remain isolated from the phase.
- PASS: The UI stays truthful about the absence of AI activation.

## Project Structure

### Documentation (this feature)

```text
specs/004-idjor-rag-registration-ui/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- idjor-rag-registration-ui.md
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
`IdjorFoundationPanel` plus shared API/types so the new registration UI remains
fully contained in the current protected IDJOR page.

## Phase 0: Research

### Research Goals

- Confirm the backend metadata-only POST contract and the allowed source/status values.
- Decide how to fit a write-capable form into the existing compact RAG section.
- Decide how to refresh only the relevant RAG snapshots after success.

### Research Outputs

- [research.md](./research.md)

## Phase 1: Design & Contracts

### Design Goals

- Define the frontend request/response entities for metadata-only registration.
- Define the compact form behavior, validation, and feedback states.
- Define the validation proving the absence of AI activation wording or enabled flags.

### Design Outputs

- [data-model.md](./data-model.md)
- [contracts/idjor-rag-registration-ui.md](./contracts/idjor-rag-registration-ui.md)
- [quickstart.md](./quickstart.md)
- refreshed `AGENTS.md` managed plan pointer

## Post-Design Constitution Check

- PASS: The design submits only documentary metadata for the current tenant.
- PASS: The form never exposes `READY`, file upload, vectorization, or question runtime.
- PASS: Success handling refreshes metadata visibility without changing routes or backend code.
- PASS: Compact demo mode and premium shell remain intact.

## Complexity Tracking

No constitution violations or complexity exceptions are required for this plan.
