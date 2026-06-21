# Implementation Plan: PHASE 2D.5 - IDJOR RAG Audit Trail UI

**Branch**: `006-idjor-rag-audit-trail` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-idjor-rag-audit-trail/spec.md`

## Summary

Extend the protected `/fr/idjor` page with a read-only "Journal d'audit RAG"
section that reads the existing append-only backend endpoints
`GET /v1/idjor/rag/audit/events` and
`GET /v1/idjor/rag/documents/:id/audit/events`, plus a sober "Voir audit"
action per RAG document row. The implementation stays frontend-only, reuses
the current premium dark/glass shell, never adds a modify/delete/re-run audit
control, and documents the phase through Spec Kit artifacts.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: existing `apiFetch` helper, protected auth session,
tenant context, `IdjorFoundationPanel`, `AppCard`, `Button`

**Storage**: N/A on the frontend; reads a tenant-scoped, paginated audit
event list from the backend (`AiAuditTrail` rows filtered to RAG event types)

**Testing**: `npm run lint`, `npm run build`, and text scans for forbidden
mutate/activation wording

**Target Platform**: Local protected dashboard frontend

**Project Type**: Single frontend web application

**Performance Goals**: Keep the RAG section compact and responsive; load the
global journal once per page load and the per-document journal on demand

**Constraints**: No backend change, no upload, no file parsing, no ingestion
runtime, no chunking, no embeddings, no vector store, no LLM, no decisioning,
no `LIVE IA` wording, no audit modify/delete/replay control, no regression on
`/fr/applications` or `/fr/applications/[id]`, no automatic commit

**Scale/Scope**: Frontend types, frontend API client, IDJOR audit trail UX,
and Spec Kit documentation for this phase only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The feature remains documentary, read-only, and metadata-only.
- PASS: No provider runtime, no LLM, and no vector or embedding activation is added.
- PASS: The panel surfaces existing append-only audit records without scoring, pricing, or deciding anything.
- PASS: Existing assurance workflows and routes remain isolated from the phase.
- PASS: The UI stays truthful about the append-only nature of the journal and never offers a mutate control.

## Project Structure

### Documentation (this feature)

```text
specs/006-idjor-rag-audit-trail/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- idjor-rag-audit-trail.md
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
`IdjorFoundationPanel` plus shared API/types so the new audit trail UI remains
fully contained in the current protected IDJOR page.

## Phase 0: Research

### Research Goals

- Confirm the backend audit list GET contracts and the exact event shape
  (`eventType`, `documentId`, `documentKey`, `source`, `ingestionStatus`,
  `operation`, `actorUserId`, `role`, `createdAt`).
- Decide how to surface both the global journal and a per-document drill-down
  without adding a new route.
- Decide how to keep the panel sober and bounded in compact demo mode.

### Research Outputs

- [research.md](./research.md)

## Phase 1: Design & Contracts

### Design Goals

- Define the frontend response entities for the audit event list (global and
  per-document).
- Define the per-document "Voir audit" trigger, loading, success, empty, and
  error UI states.
- Define the validation proving the absence of any mutate/replay control and
  the presence of the append-only disclosure.

### Design Outputs

- [data-model.md](./data-model.md)
- [contracts/idjor-rag-audit-trail.md](./contracts/idjor-rag-audit-trail.md)
- [quickstart.md](./quickstart.md)
- refreshed `.specify/feature.json` and `AGENTS.md` managed plan pointer

## Post-Design Constitution Check

- PASS: The design only reads tenant-scoped, already-recorded audit events.
- PASS: The panel never exposes a modify/delete/re-run audit control.
- PASS: The per-document drill-down is on-demand and does not change other RAG snapshots.
- PASS: Compact demo mode and premium shell remain intact.

## Complexity Tracking

No constitution violations or complexity exceptions are required for this plan.
