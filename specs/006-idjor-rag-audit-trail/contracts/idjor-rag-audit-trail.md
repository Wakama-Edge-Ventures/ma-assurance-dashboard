# Contract: IDJOR RAG Audit Trail UI

## Backend Endpoints

- `GET /v1/idjor/rag/audit/events`
- `GET /v1/idjor/rag/documents/:id/audit/events`

## Request Rules

- Global endpoint accepts optional query params: `documentId`, `eventType`,
  `limit` (clamped server-side to 1-100, default 20), `cursor` (event id to
  page from).
- Per-document endpoint takes `:id` as the RAG document's `id` (not
  `documentKey`), taken from the already loaded RAG documents list for the
  current tenant; accepts the same optional `eventType`, `limit`, `cursor`.
- No request body. Auth token and tenant scoping follow the existing
  protected `apiFetch` flow used by the other `/v1/idjor/*` GET routes.

## Response Shape (global)

```json
{
  "scope": {
    "tenantId": "tenant-id",
    "tenantKey": "assurance-ma",
    "institutionId": "optional-institution-id",
    "country": "MA",
    "vertical": "ASSURANCE",
    "role": "INSURANCE_BACKOFFICE"
  },
  "events": [
    {
      "id": "audit-id",
      "tenantId": "tenant-id",
      "institutionId": "optional-institution-id",
      "country": "MA",
      "vertical": "ASSURANCE",
      "eventType": "RAG_INGESTION_PREVIEW_VIEWED",
      "documentId": "doc-id",
      "documentKey": "rag.assurance-ma.guide-souscription",
      "source": "SEED_DEMO",
      "ingestionStatus": "REGISTERED",
      "operation": "PREVIEW",
      "actorUserId": "user-id",
      "role": "INSURANCE_BACKOFFICE",
      "createdAt": "2026-06-19T10:00:00.000Z"
    }
  ],
  "nextCursor": "audit-id-or-null",
  "securitySummary": {
    "ragEnabled": false,
    "vectorStoreEnabled": false,
    "embeddingsEnabled": false,
    "llmEnabled": false,
    "decisioningEnabled": false,
    "sourceLabels": ["LIVE", "SEED_DEMO", "MANUAL_ESTIMATE", "DEGRADED", "UNAVAILABLE"],
    "readOnly": true
  },
  "resolutionMode": "EXPLICIT",
  "readOnly": true
}
```

## Response Shape (per document)

Same as above, plus a top-level `documentId` field echoing the requested
document id.

## Error Responses

- `400` (per-document only, missing id): `{ "error": "documentId is required", "readOnly": true }`
- `401`: handled by the shared `apiFetch`/`ApiError` session-expiry flow
- `403`: handled by the shared protected tenant context resolution
- `404` (per-document only, unknown or cross-tenant document):
  `{ "error": "RAG document not found", "readOnly": true }`

## UX Contract

- Render a "Journal d'audit RAG" section inside `/fr/idjor` that loads the
  global journal automatically and shows `eventType`, `documentKey`,
  `source`, `ingestionStatus`, `actorRole`, `actorUserId` (or "Système" when
  `null`), `createdAt`, and a minimal redacted summary line per event.
- Add a sober "Voir audit" action per row of the existing RAG documents table
  that narrows the journal to that document via
  `getIdjorRagDocumentAuditEvents(documentId)`.
- Show compact loading, success, empty, and error states for both the global
  and per-document audit requests.
- Always show the disclosure: "Journal append-only. Lecture seule. Aucun
  événement n'est modifié depuis le dashboard."
- Never expose a modify, delete, replay, or re-run control for an audit
  event, and never issue a POST/PUT/PATCH/DELETE request for audit data.
- Never expose upload, ingest, index, vectorize, or question-answer controls.
