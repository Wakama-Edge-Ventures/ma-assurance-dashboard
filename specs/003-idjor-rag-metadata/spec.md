# Feature Specification: IDJOR RAG Metadata Dashboard

**Feature Branch**: `003-idjor-rag-metadata`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "PHASE 2C.3 — Display IDJOR RAG metadata in dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View read-only RAG metadata in the protected dashboard (Priority: P1)

As an authenticated assurance user, I can open `/fr/idjor` and see the tenant-scoped RAG metadata foundation so that I can verify the documentary base exists without mistaking it for active AI.

**Why this priority**: The new backend read-only surface only creates value if the dashboard exposes it clearly inside the existing protected IDJOR view.

**Independent Test**: Sign in with an existing assurance account, open `/fr/idjor`, and confirm the page shows the read-only RAG health summary plus the tenant-scoped documents returned by the backend.

**Acceptance Scenarios**:

1. **Given** an authenticated user with access to the assurance tenant, **When** `/fr/idjor` loads, **Then** the page shows a compact "Base documentaire RAG" section with tenant, read-only posture, and disabled RAG controls.
2. **Given** the backend returns RAG documents for the tenant, **When** the section renders, **Then** the page shows their registered state, source, and documentary identity without adding any upload or search control.

---

### User Story 2 - Inspect technical RAG detail safely (Priority: P2)

As an authenticated assurance user, I can inspect chunks, citations, and inactive embedding posture so that I can validate the technical metadata without activating ingestion, vectorization, or LLM behavior.

**Why this priority**: The phase must keep technical detail available for demos and audits while preserving the compact mode and the read-only doctrine.

**Independent Test**: Open `/fr/idjor`, expand the RAG section, and verify chunks and citations are visible in bounded technical tables or shown as inactive/zero states with no activation control.

**Acceptance Scenarios**:

1. **Given** the backend reports chunk or citation metadata, **When** the user expands the RAG section, **Then** those technical details are visible in bounded read-only tables.
2. **Given** the backend reports disabled RAG controls, **When** the section renders, **Then** the page presents `ragEnabled`, `llmEnabled`, `vectorStoreEnabled`, and `embeddingsEnabled` as `false` and does not imply any active retrieval runtime.

---

### User Story 3 - Preserve the compact demo shell and existing assurance routes (Priority: P3)

As a dashboard user, I can view the new RAG metadata inside the existing IDJOR page without degrading the premium shell or the current assurance journeys.

**Why this priority**: This phase adds more information to the page, so it must stay compact and must not break `/fr/applications` or `/fr/applications/[id]`.

**Independent Test**: Navigate between `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]`, and confirm the routes keep working while the IDJOR page stays compact and truthful.

**Acceptance Scenarios**:

1. **Given** the user is in compact demo mode, **When** the RAG metadata loads, **Then** the page remains sectioned and bounded rather than becoming an unstructured long page.
2. **Given** the user returns to existing assurance routes, **When** those routes load after this phase, **Then** no new AI activation or business-decision controls appear there.

### Edge Cases

- What happens when the RAG health endpoint succeeds but documents, chunks, or citations are empty for the tenant?
- How does the page behave when the user can read foundation metadata but a protected RAG endpoint returns an auth, scope, or tenant-resolution error?
- How should the page present degraded or registered documentary states without implying ingestion, indexing, or active retrieval?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a new Spec Kit feature package for Phase 2C.3 under `specs/003-idjor-rag-metadata/`.
- **FR-002**: The system MUST add frontend read-only types for the protected IDJOR RAG health, documents, chunks, and citations responses.
- **FR-003**: The system MUST add frontend API functions `getIdjorRagHealth()`, `getIdjorRagDocuments()`, `getIdjorRagChunks()`, and `getIdjorRagCitations()` using the existing dashboard authentication and backend base URL behavior.
- **FR-004**: The system MUST extend `/fr/idjor` with a compact "Base documentaire RAG" section inside the current protected page rather than adding a new route.
- **FR-005**: The RAG section MUST display tenant-scoped read-only metadata including tenant identity or scope, document counts, source, document state, and disabled runtime posture.
- **FR-006**: The RAG section MUST display `ragEnabled=false`, `readOnly=true`, `llmEnabled=false`, `vectorStoreEnabled=false`, `embeddingsEnabled=false`, and keep decisioning disabled by presentation.
- **FR-007**: The system MUST keep chunks, embeddings, and citations visible as technical metadata, bounded tables, or explicit inactive/zero states without implying activation.
- **FR-008**: The system MUST preserve compact demo mode and premium dark/glass presentation on `/fr/idjor`.
- **FR-009**: The system MUST NOT add any LLM provider wiring, vector store runtime, embedding computation, upload control, ingestion control, indexing control, search control, question prompt, or business calculation.
- **FR-010**: The system MUST NOT display `LIVE IA` or equivalent wording for the RAG metadata surface.
- **FR-011**: The system MUST NOT modify backend code, frontend routes, or the behavior of `/fr/applications` and `/fr/applications/[id]`.
- **FR-012**: The system MUST run `npm run lint`, `npm run build`, and text scans proving the absence of forbidden activation wording or enabled RAG/AI booleans in the frontend source.

### Key Entities *(include if feature involves data)*

- **RAG Health Snapshot**: Tenant-scoped read-only summary containing counts for documents, chunks, and citations plus disabled RAG security flags.
- **RAG Documents Snapshot**: Tenant-scoped list of registered or degraded documentary metadata including source and ingestion status.
- **RAG Technical Metadata Snapshot**: Tenant-scoped chunk and citation metadata exposed in read-only bounded technical sections.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated assurance user can open `/fr/idjor` and see the RAG metadata summary within the existing protected IDJOR page in one navigation flow.
- **SC-002**: The RAG section displays explicit disabled or read-only state for RAG, LLM, vector store, and embeddings in 100% of successful backend responses.
- **SC-003**: Chunks and citations remain reachable on the same page in bounded sections or explicit zero-state messages without any activation control.
- **SC-004**: `/fr/applications` and `/fr/applications/[id]` continue to build and load successfully after the phase.
- **SC-005**: Repository validation completes with `npm run lint`, `npm run build`, and the requested forbidden-text scans passing before the phase is reported complete.

## Assumptions

- The local backend already exposes the protected read-only RAG endpoints under `/v1/idjor/rag/*`.
- The existing dashboard authentication and tenant-resolution behavior remain the source of truth for protected API access.
- The current `/fr/idjor` page can absorb the RAG metadata as another compact section without requiring a separate route.
- This phase remains strictly documentary and read-only on the RAG surface, with no retrieval, vectorization, ingestion, or LLM runtime activation.
