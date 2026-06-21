# Research: PHASE 2C.6 - IDJOR RAG Metadata Registration UI

## Backend Contract Confirmation

- The backend route already exists at `POST /v1/idjor/rag/documents/register`.
- The route is protected and uses the existing dashboard auth token flow.
- The allowed source labels are `LIVE`, `SEED_DEMO`, `MANUAL_ESTIMATE`, `DEGRADED`, and `UNAVAILABLE`.
- The allowed metadata-only statuses are `REGISTERED` and `DEGRADED`.
- The backend explicitly rejects `READY` for metadata-only registration.
- The backend enriches metadata with `metadataOnly: true` plus disabled chunking,
  embeddings, vector store, LLM, citations, content reading, and upload flags.

## UX Decisions

- Keep the form inside the existing `Base documentaire RAG` section to preserve
  the compact demo route and avoid any shell churn.
- Use a two-column layout in desktop compact mode: an explanatory card plus the
  internal form.
- Refresh only the RAG snapshots after success so the documents list updates
  without reworking unrelated foundation sections.

## Validation Decisions

- Parse `metadataJson` client-side and accept only JSON objects to keep the
  payload predictable for the metadata-only backend contract.
- Surface `LIVE` only when the backend-authorized source labels include it.
- Preserve prohibited-word scans by avoiding any wording that implies active AI,
  upload, indexing, or vector runtime.
