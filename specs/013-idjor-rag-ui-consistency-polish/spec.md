# Feature Specification: IDJOR RAG UI Consistency Polish

**Feature Branch**: `013-idjor-rag-ui-consistency-polish`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "PHASE 2G.3 — IDJOR RAG UI consistency polish after upload/extraction/chunking. Correct visual and wording inconsistencies in /fr/idjor left over from the strict read-only phase, now that controlled upload quarantine, controlled extraction preview, and deterministic chunking exist. No heavy new feature."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate page-level wording (Priority: P1)

As an institution back-office user on `/fr/idjor`, when I read the page title, the error states, and the "Message de demo" blocks, I see wording that matches what the page actually does today (controlled upload, controlled extraction preview, deterministic chunking — all human-triggered, none of it AI), instead of leftover text claiming the page is "strictly read-only" or that "no upload" exists.

**Why this priority**: Stale wording is actively misleading in front of an auditor or a demo audience; it is the most visible inconsistency.

**Independent Test**: Open `/fr/idjor`, read the page description, the "Base documentaire RAG" demo message, and (by forcing an error) the degraded-state card; confirm none of them say "aucun upload" or "strictement read-only".

**Acceptance Scenarios**:

1. **Given** the page loads successfully, **When** the user reads the page header description, **Then** it describes the page as a governed foundation (read, traceability, controlled actions, no active AI) rather than "strictly read-only".
2. **Given** the RAG document base section is open, **When** the user reads the "Message de demo" block, **Then** it no longer claims "no upload" and instead states that no AI analysis, vectorization, or automatic extraction is active.
3. **Given** the backend is unreachable and a degraded-state card is shown, **When** the user reads its description, **Then** it uses the same governed-foundation wording instead of "strictement read-only".

---

### User Story 2 - No false "chunks 0" contradiction (Priority: P1)

As the same user, after I run deterministic chunking on an extraction and see chunks appear in the extraction panel, I do not see another part of the same page flatly stating "0 chunk" or "chunking not active" as if it contradicted what I just did.

**Why this priority**: This is the concrete contradiction called out in the brief; it undermines trust in the page during a demo.

**Independent Test**: Upload a `.txt` file, run extraction preview, run deterministic chunking, confirm chunks appear in the extraction panel; then open the ingestion-preview and the technical RAG chunks/citations tables for the same document and confirm their labels are scoped as governance/metadata-only counters and do not read as a blanket "no chunking happened" statement.

**Acceptance Scenarios**:

1. **Given** an extraction has chunks created via "Decouper deterministiquement", **When** the user opens "Previsualiser preparation" (ingestion-preview) for the same document, **Then** the readiness counters are labeled as governance/metadata-only counters, with a note that technical deterministic chunks are visible in the extraction panel.
2. **Given** the technical "Chunks" / "Citations" tables in the detailed view, **When** they are empty, **Then** their empty-state labels say "metadata-only" governance counters rather than implying chunking itself is inactive.

---

### User Story 3 - No duplicated extraction display (Priority: P2)

As the same user, after running "Previsualiser extraction", I see the result once, not twice (once as "the result of my last click" and again as the first row of "Extractions pour ce fichier").

**Why this priority**: Visual duplication of the same record reads as a bug during a demo even though it is harmless.

**Independent Test**: Upload a `.txt` file, run extraction preview once, confirm the extraction appears exactly once across the "result" block and the "Extractions pour ce fichier" list.

**Acceptance Scenarios**:

1. **Given** a successful extraction preview, **When** the extractions list refreshes, **Then** the extraction shown as "current result" is not repeated in the list below it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST NOT call any new backend endpoint and MUST NOT modify any existing call signature; this phase is wording/presentation only.
- **FR-002**: Replace "strictement read-only" wording on `/fr/idjor` (page header description, degraded-state error description) with governed-foundation wording: read, traceability, and controlled actions, without active AI.
- **FR-003**: Replace the "Aucun upload..." sentence in the RAG "Message de demo" block with wording that reflects the existing controlled upload/extraction/chunking actions while still stating no AI analysis, vectorization, or automatic extraction is active.
- **FR-004**: The fixed disclosure strings mandated by specs 010/011/012 (`Quarantaine documentaire uniquement...`, `Extraction controlee...`, `Decoupage deterministe...`) MUST remain unchanged, since they are scoped to a single controlled action and remain accurate.
- **FR-005**: The ingestion-preview panel and the technical RAG chunks/citations tables MUST label their counters as governance/metadata-only counters and MUST NOT be presented as a global statement that chunking is inactive when deterministic chunks exist for the same document's extractions.
- **FR-006**: The extraction panel MUST NOT render the same extraction twice (once as the "current result" of an action, once again in the extractions list) in the same view.
- **FR-007**: No button, label, or state may suggest ingestion, indexing, vectorization, embedding, retrieval, citation, OCR, or question-answering. No new action labels are introduced.

## Out of Scope

- Any backend, auth, or routing change.
- Any new endpoint or business calculation.
- Any LLM, vector store, embedding, retrieval, or citation behavior.
- Any change to `src/components/insurance/evidence-bundle-panel.tsx` or `.claude/settings*.json`.
- Merging or reconciling the governance metadata-only chunk/citation counters with the technical deterministic chunk counters (they remain two distinct backend concepts; this phase only clarifies the wording).
