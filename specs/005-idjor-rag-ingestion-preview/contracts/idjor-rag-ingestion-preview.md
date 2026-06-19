# Contract: IDJOR RAG Ingestion Preview UI

## Backend Endpoint

- `GET /v1/idjor/rag/documents/:id/ingestion-preview`

## Request Rules

- `:id` is the RAG document's `id` (not `documentKey`), taken from the already
  loaded RAG documents list for the current tenant.
- No request body. Auth token and tenant scoping follow the existing protected
  `apiFetch` flow used by the other `/v1/idjor/*` GET routes.

## Response Shape

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
  "documentId": "doc-id",
  "documentKey": "rag.assurance-ma.guide-souscription",
  "ingestionStatus": "REGISTERED",
  "ingestionReadiness": "NOT_READY",
  "missingFields": [
    {
      "field": "mimeType",
      "reason": "mimeType is not recorded for this document metadata row."
    },
    {
      "field": "governedChunkingPolicy",
      "reason": "No governed chunking policy is configured for this phase."
    }
  ],
  "allowedNextSteps": [
    "REQUEST_GOVERNANCE_REVIEW",
    "DEFINE_CHUNKING_POLICY",
    "DEFINE_EMBEDDING_PROVIDER",
    "REQUEST_VECTOR_STORE_ACTIVATION"
  ],
  "blockedReasons": [
    "Chunking is not governed yet for this phase and remains disabled.",
    "Embedding computation is not governed yet for this phase and remains disabled.",
    "Vector store activation is disabled by platform policy.",
    "LLM execution is disabled by platform policy.",
    "No RagChunk rows exist for this document.",
    "No RagEmbeddingReference rows exist for this document."
  ],
  "linkedAssetCounts": {
    "chunks": 0,
    "embeddings": 0,
    "citations": 0
  },
  "securitySummary": {
    "ragEnabled": false,
    "vectorStoreEnabled": false,
    "embeddingsEnabled": false,
    "llmEnabled": false,
    "decisioningEnabled": false,
    "sourceLabels": ["LIVE", "SEED_DEMO", "MANUAL_ESTIMATE", "DEGRADED", "UNAVAILABLE"],
    "readOnly": true
  },
  "metadataOnly": true,
  "resolutionMode": "EXPLICIT",
  "readOnly": true
}
```

`ingestionReadiness` is `BLOCKED` only when the document's `ingestionStatus`
is `DEGRADED`; otherwise it is `NOT_READY`. `READY` is never returned.

## Error Responses

- `400`: `{ "error": "documentId is required", "metadataOnly": true }`
- `401`: handled by the shared `apiFetch`/`ApiError` session-expiry flow
- `403`: `{ "error": "Forbidden for requested tenant", "readOnly": true }`
- `404`: `{ "error": "RAG document not found", "metadataOnly": true }`

## UX Contract

- Trigger the preview from a sober "Prévisualiser préparation" action on each
  row of the existing RAG documents table.
- Show compact loading, success, and error states for the preview request.
- Render `ingestionReadiness`, `missingFields`, `allowedNextSteps`, and
  `blockedReasons` verbatim.
- Always show `llmEnabled=false`, `vectorStoreEnabled=false`,
  `embeddingsEnabled=false`, `chunks=0`, `citations=0`.
- Always show the disclosure: "Prévisualisation uniquement. Aucun fichier
  n'est lu, traité, découpé, vectorisé ou analysé par IA."
- Never expose upload, ingest, index, vectorize, or question-answer controls.
- Never render `READY` as a possible or displayed state.
