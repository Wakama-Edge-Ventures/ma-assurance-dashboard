# Feature Specification: IDJOR RAG Extraction Preview Dashboard

**Feature Branch**: `011-idjor-rag-extraction-preview-dashboard`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "PHASE 2F.2 — Dashboard controlled extraction preview for quarantined RAG uploads. Display the controlled extraction preview for files already sent to RAG quarantine, without modifying the backend, without LLM, embeddings, vector store or chunking."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a controlled extraction preview on a quarantined upload (Priority: P1)

As an institution back-office user on `/fr/idjor`, I can trigger a controlled extraction preview on a file already sent to RAG quarantine, so that I can see whether its text is readable as documentary proof, without any chunking, embedding, vector store, or LLM step being activated.

**Why this priority**: This is the only new write action requested for this phase; everything else is read-only display of the result.

**Independent Test**: Open `/fr/idjor`, open the quarantine panel for a document with at least one `text/plain` upload, click "Previsualiser extraction", and confirm the previewText appears with loading/success states and the fixed disclosure text.

**Acceptance Scenarios**:

1. **Given** a quarantined `text/plain` upload, **When** the user clicks "Previsualiser extraction", **Then** the backend returns an extraction with `status: EXTRACTED_PENDING_REVIEW` and the UI displays the bounded `previewText`.
2. **Given** a quarantined PDF or DOCX upload, **When** the user clicks "Previsualiser extraction", **Then** the UI clearly states "Extracteur non active pour ce format" without implying any parsing occurred.
3. **Given** a successful extraction, **When** the panel refreshes, **Then** the extractions list for that upload is refreshed, the RAG audit view (if open for the same document) is refreshed, and the document's `ingestionStatus` is unchanged.

---

### User Story 2 - Review prior extraction attempts for a quarantined upload (Priority: P2)

As the same user, I can see a read-only list of extraction attempts already recorded for a given upload, including status, mimeType, previewText (when available), error reason (when unsupported or failed), and creation date.

**Why this priority**: Without visibility into prior attempts, the proof trail is not usable as evidence during a demo or audit.

**Independent Test**: Open the quarantine panel for an upload with at least one prior extraction and confirm the list renders with all required fields and no error state.

**Acceptance Scenarios**:

1. **Given** an upload with existing extractions, **When** its extraction list is loaded, **Then** it displays status, mimeType, previewText (if present), errorReason (if present), and createdAt for each entry, most recent first.
2. **Given** an upload with no extractions, **When** its extraction list is loaded, **Then** an explicit empty-state message is shown instead of an empty table.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST call only the two existing backend endpoints `POST /v1/idjor/rag/uploads/:uploadId/extract-preview` and `GET /v1/idjor/rag/uploads/:uploadId/extractions`. No backend route, auth flow, or business calculation is added or modified.
- **FR-002**: The UI MUST display the fixed disclosure: "Extraction controlee. Aucun chunk, embedding, vector store ou LLM n'est active." wherever the extraction preview or extractions list is shown.
- **FR-003**: For `text/plain` uploads with a successful extraction, the UI MUST render the bounded `previewText` in a readable block.
- **FR-004**: For unsupported mime types (anything other than `text/plain`), the UI MUST clearly state "Extracteur non active pour ce format" and MUST NOT imply that parsing occurred.
- **FR-005**: For `FILE_MISSING` or `FAILED` extraction status, the UI MUST surface the `errorReason`/`errorCode` returned by the backend.
- **FR-006**: After a successful extraction preview call, the frontend MUST refresh the upload's extractions list and the RAG audit snapshot (if currently open for the same document), and MUST NOT change the document's `ingestionStatus`.
- **FR-007**: No button, label, or state may suggest ingestion, indexing, vectorization, embedding, chunking, OCR, or question-answering. The only action label is "Previsualiser extraction".

## Out of Scope

- Any backend, auth, or routing change.
- Any LLM, vector store, embedding, chunking, or OCR behavior.
- Any PDF/DOCX parsing on the frontend.
- Changing a document's ingestion status to `READY` or any ingestion-pipeline state.
