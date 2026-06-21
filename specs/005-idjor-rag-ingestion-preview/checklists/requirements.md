# Requirements Checklist: PHASE 2D.2 - IDJOR RAG Ingestion Preview UI

- [x] Spec Kit feature package created for Phase 2D.2
- [x] Frontend ingestion preview response types defined
- [x] `getIdjorRagDocumentIngestionPreview(documentId)` added to the API client
- [x] "Prévisualiser préparation" action added per document row on `/fr/idjor`
- [x] Panel shows `documentId`, tenant/scope, `ingestionReadiness`,
      `missingFields`, `allowedNextSteps`, `blockedReasons`
- [x] Panel shows `llmEnabled=false`, `vectorStoreEnabled=false`,
      `embeddingsEnabled=false`, `chunks=0`, `citations=0`
- [x] `READY` excluded from the panel and never displayed
- [x] Disclosure wording present verbatim
- [x] Loading, success, and error states rendered cleanly
- [x] No backend change, upload, parsing, ingest/index/vectorize/question
      controls, LLM, vector store, embeddings, or business calculation added
- [x] Forbidden wording and enabled-boolean validation planned
