# Data Model: PHASE 2D.5 - IDJOR RAG Audit Trail UI

## Entities

### RAG Audit Event

- `id`: string
- `tenantId`: string
- `institutionId`: string | null
- `country`: string
- `vertical`: string
- `eventType`: string (one of `RAG_DOCUMENT_METADATA_REGISTERED`,
  `RAG_DOCUMENT_METADATA_DEGRADED_REGISTERED`,
  `RAG_INGESTION_PREVIEW_VIEWED`, `RAG_INGESTION_PREVIEW_BLOCKED`)
- `documentId`: string | null
- `documentKey`: string | null
- `source`: `DataSource`
- `ingestionStatus`: string | null
- `operation`: string | null
- `actorUserId`: string | null
- `actorRole`: string | null (mapped from the backend's `role` field)
- `createdAt`: string (ISO timestamp)

### RAG Audit Events Page

- `scope`: tenant-scoped response context (`tenantId`, `tenantKey`,
  `institutionId`, `country`, `vertical`, `role`)
- `events`: `RAG Audit Event[]`
- `nextCursor`: string | null
- `securitySummary`: `IdjorRagSecuritySummary` (always disabled/read-only)
- `resolutionMode`: string | null
- `readOnly`: boolean (always `true`)

### RAG Document Audit Events Page

Same shape as `RAG Audit Events Page`, plus:

- `documentId`: string (the requested document's id, echoed by the backend)

### RAG Audit Trail UI State

- Global journal: `idle | loading | success (events, nextCursor) | error`
- Per-document journal: `idle | loading (documentId) | success (documentId,
  events, nextCursor) | error (documentId, message)`
- Selecting "Voir audit" on a document replaces the per-document state rather
  than stacking multiple panels, mirroring the existing ingestion-preview
  panel behavior.

## Rules

- Every field is rendered exactly as received from the backend; the frontend
  never derives, recomputes, or infers an audit field.
- No raw prompt/response payload is requested or rendered; only the
  already-redacted fields exposed by the backend read contract.
- The journal is strictly append-only from the UI's perspective: no action in
  the panel issues a POST/PUT/PATCH/DELETE request for audit data.
- `actorUserId`/`actorRole` of `null` is labeled "Système" for readability
  only; the raw `null` value from the backend is never replaced with an
  invented identity.
- The disclosure sentence "Journal append-only. Lecture seule. Aucun
  événement n'est modifié depuis le dashboard." is always shown alongside the
  journal, in both the global and per-document views.
