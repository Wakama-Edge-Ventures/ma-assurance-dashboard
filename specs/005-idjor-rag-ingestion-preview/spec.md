# Feature Specification: IDJOR RAG Ingestion Preview UI

**Feature Branch**: `005-idjor-rag-ingestion-preview`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "PHASE 2D.2 — Display IDJOR RAG ingestion preview in dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preview documentary ingestion readiness from the protected dashboard (Priority: P1)

As an authenticated assurance user, I can select a RAG document already visible
on `/fr/idjor` and preview its ingestion preparation state so that I understand
why a document is not yet ingested without triggering any upload, parsing, or
AI processing.

**Why this priority**: The phase only creates value if a user can read a
read-only ingestion preview for an existing document directly from the page
that already lists RAG documents.

**Independent Test**: Sign in, open `/fr/idjor`, click "Prévisualiser
préparation" on a listed RAG document, and confirm the panel renders
`documentId`, tenant/scope, `ingestionReadiness`, `missingFields`,
`allowedNextSteps`, and `blockedReasons` from
`GET /v1/idjor/rag/documents/:id/ingestion-preview`.

**Acceptance Scenarios**:

1. **Given** a RAG document listed in the "Base documentaire RAG" section,
   **When** the user clicks "Prévisualiser préparation", **Then** the dashboard
   calls `GET /v1/idjor/rag/documents/:id/ingestion-preview` and renders the
   read-only preview panel for that document.
2. **Given** a successful preview response, **When** the panel renders,
   **Then** it shows `ingestionReadiness` as `NOT_READY` or `BLOCKED` only,
   never `READY`.

---

### User Story 2 - Keep the preview surface truthful and safe (Priority: P2)

As a demo audience member, I can read the ingestion preview wording and
confirm it never implies that a file was read, chunked, embedded, or analyzed
by AI.

**Why this priority**: The interface must remain professionally demoable while
preserving the strict non-negotiable guardrails of the phase.

**Independent Test**: Inspect the preview panel and confirm it shows
`llmEnabled=false`, `vectorStoreEnabled=false`, `embeddingsEnabled=false`,
`chunks=0`, `citations=0`, and the disclosure sentence stating the preview
reads, processes, chunks, vectorizes, or analyzes nothing.

**Acceptance Scenarios**:

1. **Given** the preview panel is visible, **When** the user reviews it,
   **Then** no upload, ingest, index, vectorize, or question-answer control is
   present anywhere in the panel.
2. **Given** the backend returns `ingestionReadiness: "BLOCKED"`,
   **When** the panel renders, **Then** `blockedReasons` is shown verbatim
   without any added interpretation or recommendation.

---

### User Story 3 - Preserve compact demo mode and current assurance routes (Priority: P3)

As a dashboard user, I can use the new preview action without degrading the
premium shell or affecting `/fr/applications` and `/fr/applications/[id]`.

**Why this priority**: The phase adds a new read-only action to a previously
read-only surface, so compact UX and route safety must be preserved.

**Independent Test**: Build the app, open `/fr/idjor`, `/fr/applications`, and
`/fr/applications/[id]`, and confirm the new UI remains isolated to the
existing IDJOR page.

**Acceptance Scenarios**:

1. **Given** compact demo mode is enabled, **When** the preview panel appears
   in the RAG section, **Then** the page remains sectioned and bounded instead
   of becoming an unstructured long view.
2. **Given** the phase is complete, **When** the user navigates to existing
   assurance pages, **Then** those pages remain unchanged.

### Edge Cases

- What happens when the backend returns 404 because the document does not
  belong to the current tenant scope?
- How does the panel behave when the backend rejects the request for missing
  auth (401) or insufficient role (403)?
- How should the panel behave while the preview request is loading or if it is
  closed and reopened for a different document?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a new Spec Kit feature package for Phase
  2D.2 under `specs/005-idjor-rag-ingestion-preview/`.
- **FR-002**: The system MUST add frontend types mirroring the backend
  ingestion preview response.
- **FR-003**: The system MUST add a frontend API function
  `getIdjorRagDocumentIngestionPreview(documentId)` using the existing auth
  token and API base URL behavior.
- **FR-004**: The system MUST add a sober "Prévisualiser préparation" action
  per document inside the existing `/fr/idjor` "Base documentaire RAG" section
  rather than creating a new route.
- **FR-005**: The preview panel MUST show `documentId`, tenant/scope,
  `ingestionReadiness`, `missingFields`, `allowedNextSteps`, `blockedReasons`,
  `llmEnabled=false`, `vectorStoreEnabled=false`, `embeddingsEnabled=false`,
  `chunks=0`, and `citations=0`.
- **FR-006**: The panel MUST only ever render `ingestionReadiness` as
  `NOT_READY` or `BLOCKED` and MUST NOT display `READY` as a possible state.
- **FR-007**: The panel MUST show the wording: "Prévisualisation uniquement.
  Aucun fichier n'est lu, traité, découpé, vectorisé ou analysé par IA."
- **FR-008**: The system MUST NOT add any upload, file parsing, ingest button,
  index button, vectorize button, question-answer control, LLM, vector store,
  embedding, chunking, or business calculation.
- **FR-009**: The page MUST show clean loading, success, and error feedback for
  the preview flow.
- **FR-010**: The system MUST NOT modify the backend.
- **FR-011**: The system MUST preserve the existing `/fr/idjor`,
  `/fr/applications`, and `/fr/applications/[id]` route behavior.
- **FR-012**: The system MUST run `npm run lint`, `npm run build`, and a
  forbidden-text scan before reporting completion.

### Key Entities *(include if feature involves data)*

- **RAG Ingestion Preview**: Tenant-scoped, read-only snapshot describing why a
  given RAG document is not yet ingestible, including missing governance
  fields, allowed next governance steps, blocked reasons, and zeroed linked
  asset counts.
- **RAG Ingestion Preview UI State**: Local UI state tracking which document is
  selected, loading/success/error status, and the rendered preview payload.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated assurance user can preview ingestion readiness
  for any listed RAG document from `/fr/idjor` without navigating away.
- **SC-002**: The panel never exposes `READY`, upload, ingest, index, vector,
  embedding, or question controls.
- **SC-003**: The panel always shows `llmEnabled=false`,
  `vectorStoreEnabled=false`, `embeddingsEnabled=false`, `chunks=0`, and
  `citations=0`.
- **SC-004**: The dashboard continues to pass `npm run lint`, `npm run build`,
  and the forbidden-text scan with no prohibited wording or enabled AI
  booleans added.
- **SC-005**: `/fr/applications` and `/fr/applications/[id]` remain unaffected
  by the phase.

## Assumptions

- The local backend already exposes
  `GET /v1/idjor/rag/documents/:id/ingestion-preview` with the existing
  protected auth model and tenant scoping.
- The backend is the source of truth for `ingestionReadiness`,
  `missingFields`, `allowedNextSteps`, and `blockedReasons`; the frontend only
  renders these values verbatim.
- The existing RAG documents table already exposes a stable `id` per document
  that can be used to request the preview.
