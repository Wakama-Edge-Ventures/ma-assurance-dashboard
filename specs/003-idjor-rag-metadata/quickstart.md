# Quickstart: PHASE 2C.3 - IDJOR RAG Metadata Dashboard

## Prerequisites

- local dashboard running from `ma-assurance-dashboard`
- local backend exposing:
  - `GET /v1/idjor/rag/health`
  - `GET /v1/idjor/rag/documents`
  - `GET /v1/idjor/rag/chunks`
  - `GET /v1/idjor/rag/citations`
- dashboard `NEXT_PUBLIC_API_BASE_URL` pointing to the local backend

## Validation Steps

1. Start the dashboard and backend locally.
2. Sign in with an assurance account that already has protected read access.
3. Open `/fr/idjor`.
4. Confirm the page still shows the existing compact executive summary.
5. Confirm a `Base documentaire RAG` section is visible.
6. Confirm the section shows:
   - `ragEnabled=false`
   - `readOnly=true`
   - `llmEnabled=false`
   - `vectorStoreEnabled=false`
   - `embeddingsEnabled=false`
7. Confirm documents are visible with state and source.
8. Confirm chunks and citations are visible in bounded technical tables or empty
   read-only states.
9. Confirm there is no upload, ingestion, indexing, vectorization, or question
   action in the page.

## Repo Validation

```bash
npm run lint
npm run build
rg -n 'Activer IA|LIVE IA|vectorStoreEnabled: true|llmEnabled: true|embeddingsEnabled: true' src specs -g '!node_modules'
```

## Expected Outcome

- `/fr/idjor` remains compact and premium-styled
- RAG metadata is visible but clearly inactive
- no backend route or business workflow changes are required
