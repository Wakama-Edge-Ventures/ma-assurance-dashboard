# Requirements Checklist: IDJOR RAG Embedding Readiness Dashboard

- [X] Frontend calls only `GET /v1/idjor/rag/extractions/:extractionId/embedding-readiness` and `POST /v1/idjor/rag/extractions/:extractionId/embedding-preview-request`.
- [X] Fixed disclosure text present: "Readiness embeddings uniquement. Aucun embedding reel, provider externe, vector store, retrieval ou LLM n'est active."
- [X] "Verifier readiness embeddings" action available inside the chunking panel.
- [X] "Demande preview embedding" action only offered after a readiness result of `BLOCKED` or `NOT_READY`.
- [X] Readiness panel renders `embeddingReadiness`, `eligibleChunksCount`, `blockedReasons`, `requiredFlags`, `providerStatus`, `modelStatus`, `vectorStoreStatus`.
- [X] After a successful preview request: readiness snapshot refreshed; document audit refreshed if open for same document.
- [X] `READY` is never rendered or implied as an active/achievable state.
- [X] No button, label, or state suggests ingestion, indexing, vectorization, real embedding activation, retrieval, citation, OCR, or question-answering.
- [X] No backend file modified.
- [X] No auth flow modified.
- [X] No new backend endpoint added.
- [X] No new frontend route added (feature lives inside the existing `/fr/idjor` chunking panel).
- [X] No embedding, vector store, retrieval, citation, OCR, or PDF/DOCX parsing added on the frontend.
- [X] `src/components/insurance/evidence-bundle-panel.tsx` left untouched.
- [X] `.claude/settings*.json` left untouched.
- [X] `npm run lint` passes.
- [X] `npm run build` passes, `/fr/idjor` present in route output.
- [X] Forbidden-wording scan over `src/` clean (no new occurrence).
