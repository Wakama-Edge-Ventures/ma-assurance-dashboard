# Quickstart: PHASE 2C.6 - IDJOR RAG Metadata Registration UI

## Goal

Add a compact metadata-only documentary registration form to `/fr/idjor`
without changing the backend, without adding upload or AI activation, and
without touching existing assurance journeys.

## Steps

1. Extend `src/types/index.ts` with metadata-only registration request and response types.
2. Extend `src/lib/api.ts` with `registerIdjorRagDocumentMetadata()`.
3. Update `src/components/idjor/idjor-foundation-panel.tsx` to:
   - show the explanatory wording,
   - render the compact form,
   - validate `metadataJson`,
   - submit to the backend,
   - refresh RAG snapshots after success.
4. Keep `src/app/fr/(protected)/idjor/page.tsx` unchanged unless stability demands otherwise.
5. Run `npm run lint`, `npm run build`, and the forbidden-text scan.

## Non-Negotiables

- No backend change
- No file upload
- No file parsing
- No chunking, embeddings, or vector store activation
- No LLM activation
- No question-answer or business-decision control
- No `LIVE IA` wording
