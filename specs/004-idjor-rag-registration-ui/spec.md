# Feature Specification: IDJOR RAG Metadata Registration UI

**Feature Branch**: `004-idjor-rag-registration-ui`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "PHASE 2C.6 — Dashboard RAG metadata registration UI"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register metadata-only RAG documents from the protected dashboard (Priority: P1)

As an authenticated assurance user, I can submit a compact internal form on `/fr/idjor` to register a documentary metadata record for the current tenant so that the dashboard can demonstrate controlled write access without uploading or analyzing any file.

**Why this priority**: The phase only creates value if a user can add a metadata-only document entry from the existing protected IDJOR page while keeping the backend unchanged.

**Independent Test**: Sign in, open `/fr/idjor`, submit a valid metadata-only form, and confirm the backend accepts the registration and the documents list refreshes with the new or updated item.

**Acceptance Scenarios**:

1. **Given** an authenticated user with the required backend role, **When** they submit valid `documentKey`, `title`, `source`, and `ingestionStatus`, **Then** the dashboard calls `POST /v1/idjor/rag/documents/register` and shows a success state.
2. **Given** a successful metadata registration, **When** the request completes, **Then** the RAG documents list refreshes on the same page without adding any upload, chunking, embeddings, or question-answer control.

---

### User Story 2 - Keep the registration surface truthful and safe (Priority: P2)

As a demo audience member, I can read the metadata-only wording and constrained field options so that I understand the page is not activating AI, vectorization, ingestion, or business decisions.

**Why this priority**: The interface must remain professionally demoable while preserving the strict non-negotiable guardrails of the phase.

**Independent Test**: Inspect the form and confirm it only exposes metadata fields, restricts status to `REGISTERED` or `DEGRADED`, and clearly states that no file is read or analyzed by AI.

**Acceptance Scenarios**:

1. **Given** the registration form is visible, **When** the user reviews the options, **Then** no `READY` status, upload action, indexing action, vector action, or question prompt is present.
2. **Given** the backend authorizes `LIVE` as a source label, **When** the user opens the source selector, **Then** `LIVE` appears as an allowed source label without any `LIVE IA` wording.

---

### User Story 3 - Preserve compact demo mode and current assurance routes (Priority: P3)

As a dashboard user, I can use the new metadata-only form without degrading the premium shell or affecting `/fr/applications` and `/fr/applications/[id]`.

**Why this priority**: The phase adds a write action to a previously read-only surface, so compact UX and route safety must be preserved.

**Independent Test**: Build the app, open `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]`, and confirm the new UI remains isolated to the existing IDJOR page.

**Acceptance Scenarios**:

1. **Given** compact demo mode is enabled, **When** the registration form appears in the RAG section, **Then** the page remains sectioned and bounded instead of becoming an unstructured long form.
2. **Given** the phase is complete, **When** the user navigates to existing assurance pages, **Then** those pages remain unchanged and no decision or AI activation controls appear.

### Edge Cases

- What happens when the metadata JSON textarea contains invalid JSON or a non-object JSON value?
- How does the form behave when the backend rejects the user for missing auth, missing write permission, or invalid tenant scope?
- How should the source selector behave when the backend does not advertise `LIVE` in the authorized source labels?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a new Spec Kit feature package for Phase 2C.6 under `specs/004-idjor-rag-registration-ui/`.
- **FR-002**: The system MUST add frontend types for the metadata-only RAG document registration request and response.
- **FR-003**: The system MUST add a frontend API function `registerIdjorRagDocumentMetadata()` using the existing auth token and API base URL behavior.
- **FR-004**: The system MUST add a compact metadata-only registration form inside the existing `/fr/idjor` RAG section rather than creating a new route.
- **FR-005**: The form MUST include `documentKey`, `title`, `source`, `ingestionStatus`, optional `externalReference`, and optional `metadataJson`.
- **FR-006**: The form MUST limit `ingestionStatus` to `REGISTERED` or `DEGRADED` and MUST NOT expose `READY`.
- **FR-007**: The form MUST only expose `LIVE` as a source option when the backend-authorized source labels include it.
- **FR-008**: After a successful registration, the system MUST refresh the RAG document metadata shown on `/fr/idjor`.
- **FR-009**: The page MUST show clean loading, success, and error feedback for the metadata-only registration flow.
- **FR-010**: The page MUST state that the flow is metadata-only and that no file is read, ingested, vectorized, or analyzed by AI.
- **FR-011**: The system MUST NOT add backend changes, upload, file parsing, chunking, embeddings, vector store activation, LLM activation, question-answering, business calculation, or decision controls.
- **FR-012**: The system MUST NOT display `LIVE IA`, `Activer IA`, or any equivalent wording implying active AI.
- **FR-013**: The system MUST preserve the existing `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]` route behavior.
- **FR-014**: The system MUST run `npm run lint`, `npm run build`, and the required forbidden-text scan before reporting completion.

### Key Entities *(include if feature involves data)*

- **RAG Metadata Registration Input**: Tenant-scoped frontend payload containing documentary identity, allowed source, constrained registration status, and optional metadata JSON object.
- **RAG Metadata Registration Result**: Backend response describing whether the metadata record was created or updated plus linked asset counts that remain zero for chunks, embeddings, and citations.
- **RAG Registration Form State**: Local UI state that tracks input values, submission progress, validation errors, and success feedback without affecting other dashboard routes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated assurance user can submit one metadata-only RAG registration from `/fr/idjor` without navigating away from the page.
- **SC-002**: The form presents only allowed metadata fields and never exposes `READY`, upload, vector, embedding, or question controls.
- **SC-003**: After a successful registration, the tenant-scoped RAG documents list refreshes and reflects the backend result on the same page.
- **SC-004**: The dashboard continues to pass `npm run lint`, `npm run build`, and the forbidden-text scan with no prohibited wording or enabled AI booleans added.
- **SC-005**: `/fr/applications` and `/fr/applications/[id]` remain unaffected by the phase.

## Assumptions

- The local backend already exposes `POST /v1/idjor/rag/documents/register` with the existing protected auth model.
- The backend remains the source of truth for which source labels are authorized for the current tenant and role.
- Metadata JSON is only useful in this phase when it is an object payload, so client-side validation can reject arrays and primitive JSON values.
- The current compact RAG section has enough visual space to host a small internal form without needing any route or layout rewrite.
