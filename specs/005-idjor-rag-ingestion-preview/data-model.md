# Data Model: PHASE 2D.2 - IDJOR RAG Ingestion Preview UI

## Entities

### RAG Ingestion Missing Field

- `field`: string
- `reason`: string

### RAG Ingestion Preview

- `scope`: tenant-scoped response context (`tenantId`, `tenantKey`,
  `institutionId`, `country`, `vertical`, `role`)
- `documentId`: string
- `documentKey`: string
- `ingestionStatus`: string (`REGISTERED` | `DEGRADED` as registered upstream)
- `ingestionReadiness`: `NOT_READY` | `BLOCKED` (never `READY`)
- `missingFields`: `RAG Ingestion Missing Field[]`
- `allowedNextSteps`: string[]
- `blockedReasons`: string[]
- `linkedAssetCounts`:
  - `chunks`: number (always `0` for metadata-only documents)
  - `embeddings`: number (always `0` for metadata-only documents)
  - `citations`: number (always `0` for metadata-only documents)
- `securitySummary`:
  - `ragEnabled`: boolean (always `false`)
  - `vectorStoreEnabled`: boolean (always `false`)
  - `embeddingsEnabled`: boolean (always `false`)
  - `llmEnabled`: boolean (always `false`)
  - `decisioningEnabled`: boolean (always `false`)
  - `sourceLabels`: string[]
  - `readOnly`: boolean (always `true`)
- `metadataOnly`: boolean (always `true`)
- `resolutionMode`: string | null
- `readOnly`: boolean (always `true`)

### RAG Ingestion Preview UI State

- `idle`
- `loading` with the selected `documentId`
- `success` with the selected `documentId` and the backend preview payload
- `error` with the selected `documentId` and a user-facing message

## Rules

- `ingestionReadiness` is rendered exactly as received and is never mapped to
  or replaced by `READY`.
- `missingFields`, `allowedNextSteps`, and `blockedReasons` are rendered
  verbatim, with no added frontend interpretation or recommendation.
- The preview is requested on demand per document via
  `getIdjorRagDocumentIngestionPreview(documentId)` and is not part of the
  page's initial load.
- Selecting a new document while a preview is open replaces the rendered
  preview rather than stacking multiple panels.
- The panel always displays `llmEnabled`, `vectorStoreEnabled`,
  `embeddingsEnabled` from `securitySummary`, and `chunks`/`citations` from
  `linkedAssetCounts`, alongside the fixed disclosure sentence.
