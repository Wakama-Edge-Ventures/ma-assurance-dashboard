# UI Contract: IDJOR RAG Dashboard Surface

## Route

- Protected route: `/fr/idjor`

## New Section

- Title: `Base documentaire RAG`
- Placement: within the current compact IDJOR page, after the summary and before
  the detailed technical registry sections
- Default visibility:
  - compact mode: open
  - detailed mode: open

## Required Visible Signals

- `ragEnabled=false`
- `readOnly=true`
- `llmEnabled=false`
- `vectorStoreEnabled=false`
- `embeddingsEnabled=false`
- tenant or scope identity
- source labels
- document, chunk, and citation counts

## Detail Surface

- Documents:
  - show title
  - show `documentKey`
  - show ingestion or registration state
  - show external reference when present
  - show source
- Chunks:
  - show document linkage
  - show chunk index
  - show excerpt text
  - show token count or `0`
- Citations:
  - show citation label
  - show document linkage
  - show excerpt text
  - show source

## Forbidden Surface

- no upload button
- no ingestion button
- no indexing button
- no vectorization button
- no "poser une question" button
- no "Activer IA" button
- no `LIVE IA` wording
- no business scoring, pricing, eligibility, policy, or claims action
