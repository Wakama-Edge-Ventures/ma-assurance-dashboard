# Quickstart: PHASE 2D.2 - IDJOR RAG Ingestion Preview UI

## Goal

Add a per-document "Prévisualiser préparation" action to `/fr/idjor` that
renders a read-only RAG ingestion preview, without changing the backend,
without adding upload or AI activation, and without touching existing
assurance journeys.

## Steps

1. Extend `src/types/index.ts` with the ingestion preview response types.
2. Extend `src/lib/api.ts` with `getIdjorRagDocumentIngestionPreview(documentId)`.
3. Update `src/components/idjor/idjor-foundation-panel.tsx` to:
   - add a "Prévisualiser préparation" action per row in the RAG documents table,
   - render the read-only preview panel for the selected document,
   - show loading, success, and error states,
   - show the fixed disclosure wording.
4. Keep `src/app/fr/(protected)/idjor/page.tsx` unchanged.
5. Run `npm run lint`, `npm run build`, and the forbidden-text scan.

## Local Backend Validation (before frontend validation)

```bash
# in wakama-backend
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public" npm run seed:assurance-admin
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public" npm run seed:idjor-foundation
PORT=4000 DATABASE_URL="postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public" npm run dev
```

## Non-Negotiables

- No backend change
- No file upload
- No file parsing
- No chunking, embeddings, or vector store activation
- No LLM activation
- No question-answer or business-decision control
- No `LIVE IA` wording
- No `READY` ingestion readiness state
