# Data Model: PHASE 2C.6 - IDJOR RAG Metadata Registration UI

## Entities

### RAG Metadata Registration Input

- `tenantKey`: string | null
- `tenantId`: string | null
- `documentKey`: string
- `title`: string
- `source`: `LIVE` | `SEED_DEMO` | `MANUAL_ESTIMATE` | `DEGRADED` | `UNAVAILABLE`
- `ingestionStatus`: `REGISTERED` | `DEGRADED`
- `externalReference`: string | null
- `metadataJson`: object | null

### RAG Metadata Registration Result

- `scope`: tenant-scoped response context
- `operation`: `CREATED` | `UPDATED`
- `document`: registered documentary record with normalized metadata
- `linkedAssetCounts`:
  - `chunks`: number
  - `embeddings`: number
  - `citations`: number
- `metadataOnly`: boolean

### RAG Registration Form State

- `documentKey`: string
- `title`: string
- `source`: allowed source label
- `ingestionStatus`: `REGISTERED` | `DEGRADED`
- `externalReference`: string
- `metadataJson`: string textarea payload

### RAG Registration UI State

- `idle`
- `submitting`
- `success` with backend result
- `error` with user-facing message

## Rules

- The current tenant from the loaded RAG scope is the tenant submitted by the form.
- `READY` is never exposed in the UI.
- `LIVE` is only shown when the backend-authorized labels include it.
- `metadataJson` is optional but must be a JSON object when provided.
- Success triggers a refresh of RAG health, documents, chunks, and citations.
