# Feature Specification: IDJOR RAG Embedding Readiness Dashboard

**Feature Branch**: `014-idjor-rag-embedding-readiness-dashboard`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "PHASE 2H.2 — Dashboard governed embedding readiness. Display in /fr/idjor the embedding readiness for an existing extraction/chunks, in controlled read-only mode, without activating real embeddings, without external provider, without vector store and without retrieval."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Check embedding readiness for an extraction (Priority: P1)

As an institution back-office user on `/fr/idjor`, inside the chunking panel for an extraction, I can click "Verifier readiness embeddings" to see whether that extraction's chunks are eligible for embedding, and exactly why embeddings are currently blocked or not ready, without any real embedding, provider, model, or vector store being activated.

**Why this priority**: This is the only new read action requested for this phase; it surfaces governance state that already exists on the backend.

**Independent Test**: Open `/fr/idjor`, open the chunking panel for an extraction with existing chunks, click "Verifier readiness embeddings", and confirm the readiness state (`NOT_READY` or `BLOCKED`), eligible chunk count, blocked reasons, required flags, and provider/model/vector-store status all render with the fixed disclosure text.

**Acceptance Scenarios**:

1. **Given** an extraction with chunks, **When** the user clicks "Verifier readiness embeddings", **Then** the backend's embedding-readiness snapshot is fetched and displayed, including `embeddingReadiness`, `eligibleChunksCount`, `blockedReasons`, `requiredFlags`, `providerStatus`, `modelStatus`, and `vectorStoreStatus`.
2. **Given** the readiness call fails, **When** the panel renders, **Then** an explicit error state is shown instead of a silent failure.
3. **Given** a successful readiness check, **When** the result is `BLOCKED` or `NOT_READY`, **Then** the UI never represents this as an active or "ready to use" embedding state.

---

### User Story 2 - Request an embedding preview while it stays blocked (Priority: P2)

As the same user, after checking readiness, I can click "Demande preview embedding" to ask the backend for a preview of what an embedding job would look like, and see that the backend always returns `BLOCKED` in this phase — no embedding job or embedding reference is ever created.

**Why this priority**: This proves the controlled-action trail (request without execution) without introducing any actual embedding capability.

**Independent Test**: After a readiness check, click "Demande preview embedding" and confirm the response shows `previewStatus: BLOCKED`, `embeddingJobCreated: false`, `embeddingReferenceCreated: false`, and that the readiness panel and document audit (if open) refresh afterward.

**Acceptance Scenarios**:

1. **Given** the readiness panel is visible for an extraction, **When** the user clicks "Demande preview embedding", **Then** the backend's preview-request endpoint is called and the response is displayed, clearly labeled as blocked.
2. **Given** a successful preview request, **When** the panel refreshes, **Then** the embedding readiness snapshot for the same extraction is re-fetched, and the document audit view (if currently open for the same document) is refreshed.
3. **Given** any readiness or preview state, **When** rendered, **Then** no label, button, or status implies that embeddings, a provider, a vector store, or retrieval are actually active.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST call only the two existing backend endpoints `GET /v1/idjor/rag/extractions/:extractionId/embedding-readiness` and `POST /v1/idjor/rag/extractions/:extractionId/embedding-preview-request`. No backend route, auth flow, or business calculation is added or modified.
- **FR-002**: The UI MUST display the fixed disclosure: "Readiness embeddings uniquement. Aucun embedding reel, provider externe, vector store, retrieval ou LLM n'est active." wherever the readiness action, readiness result, or preview-request action is shown.
- **FR-003**: The "Verifier readiness embeddings" action is available for any extraction (no extraction-status gate, matching the backend, which keys readiness off of `extractionId` alone).
- **FR-004**: The "Demande preview embedding" action MUST only be offered after a readiness check has resolved to `BLOCKED` or `NOT_READY` for that extraction (the only two states the backend contract supports).
- **FR-005**: The readiness panel MUST render `embeddingReadiness`, `eligibleChunksCount`, `blockedReasons`, `requiredFlags`, `providerStatus`, `modelStatus`, and `vectorStoreStatus` from the backend response.
- **FR-006**: After a successful preview-request call, the frontend MUST refresh the embedding-readiness snapshot for that extraction, and MUST refresh the document audit view if currently open for the same document.
- **FR-007**: No button, label, or state may suggest that embeddings, a provider, a model, a vector store, or retrieval are actively enabled. `READY` is never rendered as an achievable or displayed state, since the backend contract only returns `NOT_READY` or `BLOCKED`.
- **FR-008**: No button, label, or state may suggest ingestion, indexing, vectorization, real embedding activation, retrieval, citation, OCR, or question-answering.

## Out of Scope

- Any backend, auth, or routing change.
- Any new backend endpoint.
- Any new business calculation.
- Any LLM, external provider activation, real embedding computation, vector store, retrieval, or citation behavior.
- Any OCR or PDF/DOCX parsing on the frontend.
- A button to "activer embeddings", "vectoriser", or "poser une question".
- Changes to `src/components/insurance/evidence-bundle-panel.tsx` or `.claude/settings*.json`.
