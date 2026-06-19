# Implementation Plan: PHASE 2C.3 - IDJOR RAG Metadata Dashboard

**Branch**: `003-idjor-rag-metadata` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-idjor-rag-metadata/spec.md`

## Summary

Extend the existing protected `/fr/idjor` page so it also exposes the backend's
read-only IDJOR RAG metadata foundation. The implementation stays frontend-only,
adds typed API readers for RAG health/documents/chunks/citations, presents a
compact documentary section in the current premium shell, and preserves the
read-only doctrine with all AI, vector, and embedding controls OFF.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: existing `apiFetch` helper, tenant context, protected
auth session, `AppCard`, `PageTitle`, `SourceBadge`, `lucide-react`

**Storage**: N/A on the frontend; consumes protected backend metadata only

**Testing**: `npm run lint`, `npm run build`, and text scans for forbidden
activation wording

**Target Platform**: Local protected dashboard frontend

**Project Type**: Single frontend web application

**Performance Goals**: Keep the IDJOR page compact while surfacing additional
RAG metadata without route churn or deceptive activation messaging

**Constraints**: No backend change, no route change, no UI control for
questioning/upload/indexing/vectorization/activation, no business calculation,
no `LIVE IA` wording, no regression on `/fr/applications` or
`/fr/applications/[id]`, no automatic commit

**Scale/Scope**: Frontend IDJOR page plus Spec Kit documentation for this
phase only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The RAG surface remains advisory and read-only.
- PASS: No score, pricing, eligibility, or decision behavior is added.
- PASS: All AI, vector, and embedding controls stay OFF or read-only.
- PASS: No provider runtime, no upload flow, and no retrieval runtime is added.
- PASS: The UI remains truthful and does not imply active AI.
- PASS: Existing assurance workflows stay isolated from this phase.

## Project Structure

### Documentation (this feature)

```text
specs/003-idjor-rag-metadata/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- idjor-rag-dashboard-surface.md
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

**Structure Decision**: Keep the route entry unchanged and extend the existing
`IdjorFoundationPanel` plus shared API/types to absorb the RAG metadata surface.

## Phase 0: Research

### Research Goals

- Confirm the backend RAG response shapes and disabled-control contract.
- Decide how to keep the RAG detail compact inside the existing demo layout.
- Decide how to present chunks and citations without implying active retrieval.

### Research Outputs

- [research.md](./research.md)

## Phase 1: Design & Contracts

### Design Goals

- Define the frontend RAG metadata entities and snapshot wrappers.
- Define the compact dashboard section surface for health, documents, chunks,
  and citations.
- Define validation proving the absence of AI activation wording and enabled
  RAG booleans.

### Design Outputs

- [data-model.md](./data-model.md)
- [contracts/idjor-rag-dashboard-surface.md](./contracts/idjor-rag-dashboard-surface.md)
- [quickstart.md](./quickstart.md)
- refreshed `AGENTS.md` managed plan pointer

## Post-Design Constitution Check

- PASS: The design stays read-only and presentational.
- PASS: The design adds no backend mutation, no provider runtime, and no new
  route.
- PASS: Technical metadata remains visible without enabling retrieval or
  question-answer behavior.
- PASS: The page stays compact by using bounded sections and existing demo mode.

## Complexity Tracking

No constitution violations or complexity exceptions are required for this plan.
