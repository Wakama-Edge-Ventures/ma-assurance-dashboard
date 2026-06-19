# Contract: IDJOR RAG Metadata Registration UI

## Backend Endpoint

- `POST /v1/idjor/rag/documents/register`

## Request Shape

```json
{
  "tenantKey": "assurance-ma",
  "tenantId": "optional-tenant-id",
  "documentKey": "rag.assurance-ma.guide-souscription",
  "title": "Guide de souscription assurance recolte",
  "source": "SEED_DEMO",
  "ingestionStatus": "REGISTERED",
  "externalReference": "DOC-ASS-MA-2026-001",
  "metadataJson": {
    "language": "fr",
    "category": "guide",
    "metadataOnly": true
  }
}
```

## Request Rules

- `documentKey` is required.
- `title` is required.
- `source` must be one of `LIVE`, `SEED_DEMO`, `MANUAL_ESTIMATE`, `DEGRADED`, or `UNAVAILABLE`.
- `ingestionStatus` must be `REGISTERED` or `DEGRADED`.
- `READY` is not allowed in this UI.
- `metadataJson` is optional and frontend validation restricts it to JSON objects.

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
  "operation": "CREATED",
  "document": {
    "id": "doc-id",
    "tenantId": "tenant-id",
    "institutionId": "optional-institution-id",
    "country": "MA",
    "vertical": "ASSURANCE",
    "documentKey": "rag.assurance-ma.guide-souscription",
    "title": "Guide de souscription assurance recolte",
    "mimeType": null,
    "contentHash": "hash",
    "ingestionStatus": "REGISTERED",
    "source": "SEED_DEMO",
    "externalReference": "DOC-ASS-MA-2026-001",
    "metadataJson": {
      "metadataOnly": true
    },
    "createdAt": "2026-06-19T00:00:00.000Z",
    "updatedAt": "2026-06-19T00:00:00.000Z"
  },
  "linkedAssetCounts": {
    "chunks": 0,
    "embeddings": 0,
    "citations": 0
  },
  "metadataOnly": true
}
```

## UX Contract

- Show compact loading, success, and error states in the RAG section.
- Refresh the RAG documents list after a successful response.
- Never expose upload, indexing, vector, question-answer, or `READY` controls.
