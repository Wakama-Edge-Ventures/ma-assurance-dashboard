# Feature Specification: IDJOR RAG Upload Intake Dashboard

**Feature Branch**: `010-idjor-rag-upload-intake-dashboard`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "PHASE 2E.2 — Dashboard controlled RAG upload intake. Branch the dashboard onto the existing backend upload intake routes without modifying the backend and without enabling intelligent RAG."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Attach a controlled file to a RAG document (Priority: P1)

As an institution back-office user on `/fr/idjor`, I can select a RAG document and send one controlled file (PDF, TXT, or DOCX, max 10 MB) into documentary quarantine so that a documentary proof trail exists without any content being read, parsed, or analyzed.

**Why this priority**: This is the only new capability requested for this phase; everything else is read-only display.

**Independent Test**: Open `/fr/idjor`, open the "Joindre fichier controle" action for a document row, select a small `.txt` file, submit, and confirm a success message with a sha256 hash appears.

**Acceptance Scenarios**:

1. **Given** a RAG document row, **When** the user opens its quarantine panel and submits an allowed file under 10 MB, **Then** the backend accepts it and the panel shows the returned sha256 hash and quarantine status.
2. **Given** a file over 10 MB or with a disallowed MIME type, **When** the user selects it, **Then** the frontend blocks submission with a clear validation message before any network call is made.
3. **Given** a successful upload, **When** the panel refreshes, **Then** the document's `ingestionStatus` is unchanged and the RAG audit/health counters reflect only quarantine bookkeeping (chunks/embeddings/citations stay at the same value as before the upload).

---

### User Story 2 - Review previously quarantined files for a document (Priority: P2)

As the same user, I can see a read-only list of files already sent to quarantine for the selected document, including filename, MIME type, size, hash, status, and received date.

**Why this priority**: Without visibility into prior uploads, the proof trail is not usable as evidence during a demo or audit.

**Independent Test**: Open the quarantine panel for a document with at least one prior upload and confirm the list renders with all required columns and no error state.

**Acceptance Scenarios**:

1. **Given** a document with existing uploads, **When** its quarantine panel opens, **Then** the uploads list loads automatically and displays filename, mimeType, sizeBytes, sha256 hash, status, and createdAt for each entry.
2. **Given** a document with no uploads, **When** its quarantine panel opens, **Then** an explicit empty-state message is shown instead of an empty table.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST call only the two existing backend endpoints `POST /v1/idjor/rag/documents/:id/upload-intake` and `GET /v1/idjor/rag/documents/:id/uploads`. No backend route, auth flow, or business calculation is added or modified.
- **FR-002**: Client-side validation MUST reject files over 10 MB and files whose MIME type is not one of `application/pdf`, `text/plain`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, before any request is sent.
- **FR-003**: The UI MUST display a fixed disclosure: "Quarantaine documentaire uniquement. Aucun contenu n'est lu, extrait, decoupe, vectorise ou analyse par IA."
- **FR-004**: After a successful upload, the frontend MUST refresh the document's uploads list and the RAG audit/health snapshot, and MUST NOT change the document's `ingestionStatus`.
- **FR-005**: No button, label, or state may suggest ingestion, indexing, vectorization, embedding, chunking, parsing, OCR, or question-answering. The only action labels are "Joindre fichier controle" and "Envoyer en quarantaine".

## Out of Scope

- Any backend, auth, or routing change.
- Any LLM, vector store, embedding, chunking, parsing, or OCR behavior.
- Changing a document's ingestion status to `READY` or any ingestion-pipeline state.
