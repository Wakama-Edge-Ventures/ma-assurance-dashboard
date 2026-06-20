# Requirements Checklist: IDJOR RAG UI Consistency Polish

- [X] No new backend endpoint called; no existing call signature changed.
- [X] "strictement read-only" wording removed from the page header description and the degraded-state error description.
- [X] "Aucun upload..." sentence in the RAG "Message de demo" block reworded to reflect existing controlled upload/extraction/chunking actions while keeping the no-AI/no-vectorization/no-automatic-extraction statement.
- [X] Fixed disclosure strings from specs 010/011/012 ("Quarantaine documentaire uniquement...", "Extraction controlee...", "Decoupage deterministe...") left unchanged.
- [X] Ingestion-preview panel and technical Chunks/Citations tables labeled as governance/metadata-only counters, with a note pointing to the extraction panel for technical deterministic chunks.
- [X] Extraction panel no longer shows the same extraction twice (current-result block vs. extractions list).
- [X] No new button/label suggesting ingestion, indexing, vectorization, embedding, retrieval, citation, OCR, or question-answering.
- [X] No backend file modified.
- [X] No auth flow modified.
- [X] No new frontend route added.
- [X] `src/components/insurance/evidence-bundle-panel.tsx` left untouched.
- [X] `.claude/settings*.json` left untouched.
- [X] `npm run lint` passes.
- [X] `npm run build` passes, `/fr/idjor` present in route output.
- [X] Forbidden-wording scan over `src/` clean (no match).
- [ ] Live browser smoke test — not performed (no local backend stack reachable in this session); documented in validation-log.md.
