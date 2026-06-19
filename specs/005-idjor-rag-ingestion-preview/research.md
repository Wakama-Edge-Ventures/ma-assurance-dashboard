# Research: PHASE 2D.2 - IDJOR RAG Ingestion Preview UI

## Backend Contract Confirmation

- The backend route already exists at
  `GET /v1/idjor/rag/documents/:id/ingestion-preview` in `wakama-backend`
  (`src/routes/idjor.ts`, handler built on
  `src/idjor/services/ragIngestionPreview.ts`).
- The route is protected (`verifyToken` + protected tenant context resolution)
  and uses the existing dashboard auth token flow.
- `ingestionReadiness` is computed as `document.ingestionStatus === 'DEGRADED'
  ? 'BLOCKED' : 'NOT_READY'`. `READY` is not a reachable value.
- `missingFields` is a list of `{ field, reason }` entries (for example
  `mimeType`, `externalReference`, `governedChunkingPolicy`,
  `governedEmbeddingProvider`).
- `allowedNextSteps` is a fixed list: `REQUEST_GOVERNANCE_REVIEW`,
  `DEFINE_CHUNKING_POLICY`, `DEFINE_EMBEDDING_PROVIDER`,
  `REQUEST_VECTOR_STORE_ACTIVATION`.
- `blockedReasons` always includes the platform-policy disablement sentences
  for chunking, embeddings, vector store, and LLM, plus document-specific
  reasons when `chunks` or `embeddings` counts are zero.
- `linkedAssetCounts` (`chunks`, `embeddings`, `citations`) is always zero for
  a metadata-only document with no chunk/embedding/citation rows.
- `securitySummary` mirrors the existing `IdjorRagSecuritySummary` shape
  already consumed on `/fr/idjor` (`ragEnabled`, `vectorStoreEnabled`,
  `embeddingsEnabled`, `llmEnabled`, `decisioningEnabled`, `sourceLabels`,
  `readOnly`), all hardcoded to the disabled/read-only state.
- The route response also adds `resolutionMode` and `readOnly: true` at the
  top level, matching the other `/v1/idjor/rag/*` GET responses already
  consumed by `getIdjorRagHealth`, `getIdjorRagDocuments`, etc.
- Error shapes: `400 { error: "documentId is required", metadataOnly: true }`,
  `404 { error: "RAG document not found", metadataOnly: true }` (also used for
  cross-tenant documents), `401`/`403` follow the same shape as the other
  protected IDJOR routes already handled by `apiFetch`/`ApiError`.

## UX Decisions

- Add a per-row "Prévisualiser préparation" action to the existing RAG
  documents table inside "Base documentaire RAG" instead of a new route or
  page, so the compact demo flow is preserved.
- Render the preview result as a dedicated read-only panel beneath the table,
  scoped to the currently selected document, so only one preview is visible at
  a time and the section stays bounded in compact mode.
- Reuse the existing `ExecutiveStatus` and `AppCard`-style primitives already
  used across the IDJOR panel for visual consistency.

## Validation Decisions

- Render `ingestionReadiness`, `missingFields`, `allowedNextSteps`, and
  `blockedReasons` verbatim from the backend without any frontend
  interpretation, scoring, or recommendation logic.
- Hardcode the panel's `llmEnabled`, `vectorStoreEnabled`, and
  `embeddingsEnabled` labels from `securitySummary` (always `false` per
  backend contract) and `chunks`/`citations` from `linkedAssetCounts` (always
  `0` for a metadata-only document).
- Preserve prohibited-word scans by avoiding any wording that implies active
  AI, upload, ingestion, indexing, or vector runtime, and by never rendering
  `READY` as a displayed or selectable state.
