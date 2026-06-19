# Feature Specification: IDJOR RAG Audit Trail UI

**Feature Branch**: `006-idjor-rag-audit-trail`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "PHASE 2D.5 — Display IDJOR RAG audit trail in dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the global RAG audit trail from the protected dashboard (Priority: P1)

As an authenticated assurance user, I can open a read-only "Journal d'audit
RAG" section on `/fr/idjor` and see the append-only audit events recorded for
RAG metadata registration and ingestion-preview activity for my tenant.

**Why this priority**: The phase only creates value if a user can read the
existing append-only audit trail without leaving the page that already shows
the RAG documentary base.

**Independent Test**: Sign in, open `/fr/idjor`, expand "Journal d'audit RAG",
and confirm the panel renders a list of events from
`GET /v1/idjor/rag/audit/events` with `eventType`, `documentKey`, `source`,
`ingestionStatus`, `actorRole`, `actorUserId` (when available), and
`createdAt`.

**Acceptance Scenarios**:

1. **Given** the IDJOR page has finished loading, **When** the user expands
   "Journal d'audit RAG", **Then** the dashboard calls
   `GET /v1/idjor/rag/audit/events` and renders the returned events read-only.
2. **Given** the backend returns zero events, **When** the panel renders,
   **Then** it shows a clear empty state instead of an error.

---

### User Story 2 - Inspect the audit trail for one RAG document (Priority: P2)

As an authenticated assurance user, I can click a sober "Voir audit" action
on a RAG document row and see only the audit events linked to that document,
read from `GET /v1/idjor/rag/documents/:id/audit/events`.

**Why this priority**: Document-scoped audit lookup is the natural drill-down
once the global journal is visible, and it reuses the same per-document
action pattern already used for the ingestion preview.

**Independent Test**: Click "Voir audit" on a document row and confirm the
panel narrows to that document's events only, using its `id` as `documentId`.

**Acceptance Scenarios**:

1. **Given** a RAG document listed in "Base documentaire RAG", **When** the
   user clicks "Voir audit", **Then** the dashboard calls
   `GET /v1/idjor/rag/documents/:id/audit/events` and renders only that
   document's events.
2. **Given** the backend returns 404 for a cross-tenant or unknown document
   id, **When** the panel renders, **Then** it shows a clean error state
   without retrying automatically.

---

### User Story 3 - Keep the audit surface read-only and truthful (Priority: P3)

As a demo audience member, I can read the audit panel and confirm it never
exposes a way to modify, delete, replay, or re-trigger an audited action, and
that it states plainly that the journal is append-only and read-only.

**Why this priority**: The audit trail is presented as institutional
evidence; any implied mutate action would break trust in the demo and violate
the append-only guarantee.

**Independent Test**: Inspect the panel and confirm no edit/delete/re-run
control exists anywhere, and that the disclosure sentence is present.

**Acceptance Scenarios**:

1. **Given** the audit panel is visible, **When** the user reviews it,
   **Then** no modify/delete/re-run audit control, upload control, or AI
   activation control is present anywhere in the panel.
2. **Given** an event has redactable payload fields, **When** the panel
   renders the event, **Then** only a minimal, already-redacted summary is
   shown (no raw prompt/response payload).

### Edge Cases

- What happens when the backend returns 401 (session expired) or 403
  (insufficient role) for either audit endpoint?
- How does the panel behave while the audit events request is loading, or
  when it is reopened for a different document?
- How should the panel behave when `actorUserId` or `actorRole` is `null`
  for a given event (system-originated event)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a new Spec Kit feature package for Phase
  2D.5 under `specs/006-idjor-rag-audit-trail/`.
- **FR-002**: The system MUST add frontend types mirroring the backend RAG
  audit event list response.
- **FR-003**: The system MUST add frontend API functions
  `getIdjorRagAuditEvents()` and `getIdjorRagDocumentAuditEvents(documentId)`
  using the existing auth token and API base URL behavior.
- **FR-004**: The system MUST add a "Journal d'audit RAG" section inside the
  existing `/fr/idjor` page rather than creating a new route.
- **FR-005**: The journal MUST display, per event: `eventType`,
  `documentKey`, `source`, `ingestionStatus`, `actorRole`, `actorUserId` (when
  available), `createdAt`, and a minimal redacted summary.
- **FR-006**: The system MUST add a sober "Voir audit" action per RAG
  document row that narrows the journal to that document's events via
  `getIdjorRagDocumentAuditEvents(documentId)`.
- **FR-007**: The panel MUST show the wording: "Journal append-only. Lecture
  seule. Aucun événement n'est modifié depuis le dashboard."
- **FR-008**: The system MUST NOT add any modify, delete, replay, or re-run
  control for audit events, and MUST NOT issue any POST/PUT/PATCH/DELETE
  request for audit data from the frontend.
- **FR-009**: The system MUST NOT add any upload, file parsing, ingest
  button, index button, vectorize button, question-answer control, LLM,
  vector store, embedding, chunking, or business calculation.
- **FR-010**: The page MUST show clean loading, success, empty, and error
  feedback for both the global and per-document audit flows.
- **FR-011**: The system MUST NOT modify the backend.
- **FR-012**: The system MUST preserve the existing `/fr/idjor`,
  `/fr/applications`, and `/fr/applications/[id]` route behavior.
- **FR-013**: The system MUST run `npm run lint`, `npm run build`, and a
  forbidden-text scan before reporting completion.

### Key Entities *(include if feature involves data)*

- **RAG Audit Event**: Tenant-scoped, append-only, read-only record of a RAG
  metadata-registration or ingestion-preview action, including `eventType`,
  optional `documentId`/`documentKey`, `source`, `ingestionStatus`,
  `operation`, optional actor identity (`actorUserId`, `role`), and
  `createdAt`.
- **RAG Audit Trail UI State**: Local UI state tracking the global journal
  load state and, independently, the selected document's audit load state
  (idle/loading/success/error), plus pagination cursor for "load more".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated assurance user can read the global RAG audit
  trail and any single document's RAG audit trail from `/fr/idjor` without
  navigating away.
- **SC-002**: The panel never exposes a modify/delete/re-run audit control,
  upload, ingest, index, vector, embedding, or question control.
- **SC-003**: The panel always shows the append-only/read-only disclosure
  sentence verbatim.
- **SC-004**: The dashboard continues to pass `npm run lint`, `npm run
  build`, and the forbidden-text scan with no prohibited wording or enabled
  AI booleans added.
- **SC-005**: `/fr/applications` and `/fr/applications/[id]` remain unaffected
  by the phase.

## Assumptions

- The local backend already exposes `GET /v1/idjor/rag/audit/events` and
  `GET /v1/idjor/rag/documents/:id/audit/events` with the existing protected
  auth model and tenant scoping (confirmed in
  `wakama-backend/src/routes/idjor.ts` and
  `wakama-backend/src/idjor/audit/ragAuditReadService.ts`).
- The backend is the source of truth for every audit field; the frontend only
  renders these values verbatim and never derives or recomputes them.
- Audit events are immutable once recorded; the frontend never offers any
  action that could imply otherwise.
