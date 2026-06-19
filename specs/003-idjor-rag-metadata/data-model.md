# Data Model: PHASE 2C.3 - IDJOR RAG Metadata Dashboard

## Entities

### RAG Response Scope

- `tenantId`: backend tenant identifier
- `tenantKey`: tenant key used in dashboard and query resolution
- `institutionId`: linked institution identifier or `null`
- `country`: tenant country
- `vertical`: tenant vertical
- `role`: effective protected role or `null`

### RAG Security Summary

- `ragEnabled`: boolean, must remain `false`
- `vectorStoreEnabled`: boolean, must remain `false`
- `embeddingsEnabled`: boolean, must remain `false`
- `llmEnabled`: boolean, must remain `false`
- `decisioningEnabled`: boolean, must remain `false`
- `sourceLabels`: allowed source labels
- `readOnly`: boolean, expected `true`

### RAG Health Snapshot

- `scope`: `RAG Response Scope`
- `counts.documents`
- `counts.chunks`
- `counts.citations`
- `securitySummary`: `RAG Security Summary`
- `resolutionMode`: nullable string
- `readOnly`: boolean

### RAG Document

- `id`
- `tenantId`
- `institutionId`
- `country`
- `vertical`
- `documentKey`
- `title`
- `mimeType`
- `contentHash`
- `ingestionStatus`
- `source`
- `externalReference`
- `createdAt`
- `updatedAt`

### RAG Chunk

- `id`
- `tenantId`
- `institutionId`
- `country`
- `vertical`
- `documentId`
- `documentKey`
- `documentTitle`
- `chunkIndex`
- `contentText`
- `contentHash`
- `tokenCount`
- `source`
- `createdAt`
- `updatedAt`

### RAG Citation

- `id`
- `tenantId`
- `institutionId`
- `country`
- `vertical`
- `documentId`
- `documentKey`
- `documentTitle`
- `chunkId`
- `chunkIndex`
- `citationLabel`
- `excerptText`
- `source`
- `createdAt`

## Relationships

- One `RAG Health Snapshot` summarizes many `RAG Documents`, `RAG Chunks`, and
  `RAG Citations` for one protected tenant scope.
- One `RAG Document` may have zero or more `RAG Chunks`.
- One `RAG Citation` references one document and may optionally reference one
  chunk.

## UI State

- `compactMode`: preserves the existing demo mode behavior
- `sections.rag`: controls visibility of the new RAG section
- `FoundationState.ready`: now includes foundation and RAG snapshots loaded
  together

## Validation Rules

- The frontend must treat missing required scope identifiers as invalid payloads.
- All RAG booleans default to safe disabled values when absent.
- Zero documents, chunks, or citations must render as explicit read-only empty
  states rather than hidden sections.
