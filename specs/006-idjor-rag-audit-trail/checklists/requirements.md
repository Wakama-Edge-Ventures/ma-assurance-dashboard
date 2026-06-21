# Requirements Checklist: PHASE 2D.5 - IDJOR RAG Audit Trail UI

- [x] Spec Kit feature package created for Phase 2D.5
- [x] Frontend audit event and audit events page response types defined
- [x] `getIdjorRagAuditEvents()` added to the API client
- [x] `getIdjorRagDocumentAuditEvents(documentId)` added to the API client
- [x] "Journal d'audit RAG" section added to `/fr/idjor`
- [x] "Voir audit" action added per document row on `/fr/idjor`
- [x] Panel shows `eventType`, `documentKey`, `source`, `ingestionStatus`,
      `actorRole`, `actorUserId`, `createdAt`, and a minimal redacted summary
- [x] Append-only/read-only disclosure wording present verbatim
- [x] Loading, success, empty, and error states rendered cleanly
- [x] No modify/delete/re-run control for audit events
- [x] No backend change, upload, parsing, ingest/index/vectorize/question
      controls, LLM, vector store, embeddings, or business calculation added
- [x] Forbidden wording and enabled-boolean validation planned
