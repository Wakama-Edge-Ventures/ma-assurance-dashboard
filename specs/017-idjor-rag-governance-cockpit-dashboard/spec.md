# Feature Specification: PHASE 2J.2 - IDJOR RAG Governance Cockpit Dashboard

**Feature Branch**: `017-idjor-rag-governance-cockpit-dashboard`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "PHASE 2J.2 - afficher retrieval readiness et governance cockpit dans /fr/idjor, sans IA active"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Check retrieval readiness for an extraction (Priority: P1)

As an authenticated back-office user on `/fr/idjor`, I can verify retrieval
readiness for a chosen extraction and see the blocked or not-ready state,
counts, disabled runtime components, and blocked reasons without any real
retrieval, vector store, citation, embedding runtime, or LLM being activated.

**Why this priority**: Retrieval readiness is the new governed action surfaced
to operators and must remain truthful about the inactive runtime.

**Independent Test**: Open an extraction with chunks, click "Verifier readiness
retrieval", and confirm the readiness snapshot displays counts, statuses, and
blocked reasons with the required disclosure.

### User Story 2 - Request a blocked retrieval preview (Priority: P1)

As the same user, after viewing retrieval readiness, I can request a retrieval
preview and see that the backend always returns `BLOCKED`, with no real
retrieval or citation creation, while the audit and cockpit views refresh if
they are already open.

**Why this priority**: This proves the governed-action path without suggesting
live AI retrieval.

**Independent Test**: Click "Demande preview retrieval" and confirm the UI
shows `BLOCKED`, `citationsCreated: false`, `retrievalExecuted: false`, and a
refreshed audit or cockpit if visible.

### User Story 3 - View the governance cockpit in the dashboard (Priority: P1)

As a reviewer following document preparation, I can open a RAG Governance
Cockpit block on `/fr/idjor` and see the compact pipeline, counts, allowed next
steps, and audit evidence for either the document or the extraction.

**Why this priority**: The cockpit is the dashboard proof surface for the new
backend governance summary.

**Independent Test**: Open the cockpit for a document or extraction and confirm
the pipeline shows Metadata, Upload, Extraction, Chunking, Embedding readiness,
Retrieval readiness, and Audit with truthful statuses.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST add the following types in `src/types/index.ts`:
  `IdjorRagRetrievalReadiness`,
  `IdjorRagRetrievalReadinessResponse`,
  `IdjorRagRetrievalPreviewRequestResponse`,
  `IdjorRagGovernanceCockpit`, and
  `IdjorRagGovernanceCockpitResponse`.
- **FR-002**: The frontend MUST add the following API client functions in
  `src/lib/api.ts`:
  `getIdjorRagRetrievalReadiness(extractionId)`,
  `requestIdjorRagRetrievalPreview(extractionId)`,
  `getIdjorRagDocumentGovernanceCockpit(documentId)`, and
  `getIdjorRagExtractionGovernanceCockpit(extractionId)`.
- **FR-003**: In the extraction or chunking area of `/fr/idjor`, the UI MUST
  add the actions "Verifier readiness retrieval" and "Demande preview
  retrieval".
- **FR-004**: The retrieval readiness UI MUST display
  `retrievalReadiness`, `chunksCount`, `embeddingsCount`, `citationsCount`,
  `vectorStoreStatus`, `retrievalStatus`, `llmStatus`, and `blockedReasons`.
- **FR-005**: The dashboard MUST display the exact disclosure:
  "Retrieval readiness uniquement. Aucun retrieval reel, vector store,
  citation, embedding reel ou LLM n'est active."
- **FR-006**: The dashboard MUST add a "RAG Governance Cockpit" block that
  shows the compact governed pipeline, counts, allowed next steps, and append-
  only audit evidence.
- **FR-007**: The dashboard MUST display the exact disclosure:
  "Governance cockpit : synthese de preuve et d'audit. Aucune decision
  automatique."
- **FR-008**: After each successful controlled action tied to extraction,
  chunking, embedding readiness, embedding preview, retrieval readiness, or
  retrieval preview, the dashboard MUST refresh the document audit if it is
  currently open and MUST refresh the cockpit if it is currently visible.
- **FR-009**: The dashboard MUST NOT show wording or controls that imply live
  AI, live retrieval, vectorization, embedding activation, or question-answering.
- **FR-010**: The dashboard MUST NOT modify backend behavior, auth, or business
  calculation logic.

## Out of Scope

- Backend changes from the dashboard repository.
- Auth changes.
- New business calculations.
- Any "poser une question", "activer retrieval", "activer embeddings", or
  "vectoriser" action.
- Any content implying active AI or autonomous decision-making.
