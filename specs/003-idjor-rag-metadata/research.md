# Research: PHASE 2C.3 - IDJOR RAG Metadata Dashboard

## Decision: Reuse the current `/fr/idjor` page instead of creating a new route

**Rationale**: The existing IDJOR page already communicates read-only
governance posture, compact demo mode, and tenant-scoped metadata. Extending it
with a dedicated RAG section keeps the story coherent and avoids route sprawl.

**Alternatives considered**:

- Create a separate `/fr/idjor/rag` route: rejected because it fragments the
  demo and adds navigation churn for a metadata-only phase.
- Replace foundation content with RAG content: rejected because the two read-only
  surfaces are complementary.

## Decision: Type the four backend RAG snapshots explicitly in the frontend

**Rationale**: The backend exposes distinct protected shapes for health,
documents, chunks, and citations. Matching them directly keeps the dashboard
truthful and avoids collapsing technical states into an ambiguous generic model.

**Alternatives considered**:

- Use loose `unknown` payloads inside the component: rejected because it makes
  the compact UI brittle and hides contract drift.
- Merge all RAG responses into one synthetic frontend object only: rejected
  because it obscures which backend surface failed.

## Decision: Show chunks and citations in bounded technical tables inside one compact section

**Rationale**: The user wants chunks, embeddings, and citations visible but not
dominant. Bounded sub-tables inside a single collapsible "Base documentaire RAG"
section keep detail accessible while preserving demo readability.

**Alternatives considered**:

- Hide chunks and citations entirely when counts are zero: rejected because the
  phase explicitly wants technical visibility, even when inactive.
- Add nested sub-routes or tabs: rejected because the current page already uses a
  compact section model and should stay single-page.

## Decision: Preserve explicit disabled wording for all RAG runtime toggles

**Rationale**: The backend contract and IDJOR doctrine require that the UI never
implies active AI. The RAG section therefore surfaces `ragEnabled=false`,
`llmEnabled=false`, `vectorStoreEnabled=false`, and `embeddingsEnabled=false`
verbatim as read-only status signals.

**Alternatives considered**:

- Omit some disabled controls to keep the UI shorter: rejected because the phase
  explicitly requires these fields.
- Rephrase as "coming soon" only: rejected because it weakens the truthfulness of
  the backend-reported posture.
