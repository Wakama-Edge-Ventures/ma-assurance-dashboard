# Feature Specification: IDJOR RAG Chunks Dashboard

**Feature Branch**: `012-idjor-rag-chunks-dashboard`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "PHASE 2G.2 — Dashboard deterministic RAG chunks preview. Display in /fr/idjor the deterministic chunks created from a controlled text/plain extraction, without modifying the backend, without embeddings, vector store, retrieval, or LLM."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run deterministic chunking on an extracted upload (Priority: P1)

As an institution back-office user on `/fr/idjor`, I can trigger deterministic chunking on an extraction that already has status `EXTRACTED_PENDING_REVIEW`, so that I can see the fixed-size text segments produced from the previewed text, without any embedding, vector store, retrieval, or LLM step being activated.

**Why this priority**: This is the only new write action requested for this phase; everything else is read-only display of the result.

**Independent Test**: Open `/fr/idjor`, open the extraction panel for an upload with an `EXTRACTED_PENDING_REVIEW` extraction, click "Decouper deterministiquement", and confirm the chunk list appears with loading/success/error states and the fixed disclosure text.

**Acceptance Scenarios**:

1. **Given** an extraction with `status: EXTRACTED_PENDING_REVIEW`, **When** the user clicks "Decouper deterministiquement", **Then** the backend creates (or returns already-existing) chunks for that extraction and the UI displays the chunk list.
2. **Given** an extraction not in `EXTRACTED_PENDING_REVIEW` status, **When** the extraction is rendered, **Then** no chunking action is offered for it.
3. **Given** a successful chunking call, **When** the panel refreshes, **Then** the chunk list for that extraction is refreshed, the RAG audit view (if open for the same document) is refreshed, and the source document does not transition to `READY`.

---

### User Story 2 - Review chunks already recorded for an extraction (Priority: P2)

As the same user, I can see a read-only list of chunks already recorded for a given extraction, including chunk index, content hash, size, and a short excerpt.

**Why this priority**: Without visibility into recorded chunks, the deterministic-chunking proof trail is not usable as evidence during a demo or audit.

**Independent Test**: Open the chunking panel for an extraction with at least one prior chunk and confirm the list renders chunkIndex, contentHash, size, and excerpt for each entry, ordered by chunkIndex.

**Acceptance Scenarios**:

1. **Given** an extraction with existing chunks, **When** its chunk list is loaded, **Then** it displays chunkIndex, contentHash, content length, and a bounded excerpt for each chunk, ordered by chunkIndex ascending.
2. **Given** an extraction with no chunks, **When** its chunk list is loaded, **Then** an explicit empty-state message is shown instead of an empty table.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST call only the two existing backend endpoints `POST /v1/idjor/rag/extractions/:extractionId/chunk` and `GET /v1/idjor/rag/extractions/:extractionId/chunks`. No backend route, auth flow, or business calculation is added or modified.
- **FR-002**: The UI MUST display the fixed disclosure: "Decoupage deterministe. Aucun embedding, vector store, retrieval ou LLM n'est active." wherever the chunking action or chunk list is shown.
- **FR-003**: The "Decouper deterministiquement" action MUST only be offered for extractions with `status: EXTRACTED_PENDING_REVIEW`.
- **FR-004**: For each chunk, the UI MUST render chunkIndex, contentHash, content size (character count), and a bounded excerpt. `startOffset`/`endOffset` are rendered only if present on the backend payload; the current backend contract does not expose them, so they are omitted.
- **FR-005**: After a successful chunking call, the frontend MUST refresh the chunk list for that extraction and the RAG audit snapshot (if currently open for the same document), and MUST NOT change the document's `ingestionStatus` to `READY`.
- **FR-006**: No button, label, or state may suggest ingestion, indexing, vectorization, embedding, retrieval, citation, OCR, or question-answering. The only action label is "Decouper deterministiquement".

## Out of Scope

- Any backend, auth, or routing change.
- Any LLM, vector store, embedding, retrieval, or citation behavior.
- Any OCR or PDF/DOCX parsing on the frontend.
- Changing a document's ingestion status to `READY` or any ingestion-pipeline state.
