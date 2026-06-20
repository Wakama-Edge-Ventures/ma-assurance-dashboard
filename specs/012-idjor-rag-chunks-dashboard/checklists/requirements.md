# Requirements Checklist: IDJOR RAG Chunks Dashboard

- [X] Frontend calls only `POST /v1/idjor/rag/extractions/:extractionId/chunk` and `GET /v1/idjor/rag/extractions/:extractionId/chunks`.
- [X] Fixed disclosure text present: "Decoupage deterministe. Aucun embedding, vector store, retrieval ou LLM n'est active."
- [X] "Decouper deterministiquement" action only offered for extractions with `status: EXTRACTED_PENDING_REVIEW`.
- [X] Chunk list renders chunkIndex, contentHash, size, and a bounded excerpt for each chunk, ordered by chunkIndex ascending.
- [X] Explicit empty-state message when an extraction has no chunks.
- [X] Action label limited to "Decouper deterministiquement"; no ingest/index/vectorize/question/citation wording.
- [X] Loading / success / error states implemented for the chunking action.
- [X] After successful chunking: chunk list refreshed; document audit refreshed if open for same document.
- [X] Document `ingestionStatus` not changed to `READY` by chunking.
- [X] No backend file modified.
- [X] No auth flow modified.
- [X] No new frontend route added (feature lives inside existing `/fr/idjor` extraction panel).
- [X] No embedding, vector store, retrieval, citation, OCR, or PDF/DOCX parsing added on the frontend.
- [X] `src/components/insurance/evidence-bundle-panel.tsx` left untouched.
- [X] `.claude/settings*.json` left untouched.
- [X] `npm run lint` passes.
- [X] `npm run build` passes, `/fr/idjor` present in route output.
- [X] Forbidden-wording scan over `src/` clean (no new occurrence).
