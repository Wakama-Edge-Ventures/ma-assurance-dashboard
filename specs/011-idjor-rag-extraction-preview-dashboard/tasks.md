# Tasks: IDJOR RAG Extraction Preview Dashboard

**Input**: plan.md, spec.md

## Phase 1: Types

- [X] T001 Add `IdjorRagDocumentExtraction`, `IdjorRagDocumentExtractionsPage`, `IdjorRagExtractionPreviewResponse` to `src/types/index.ts`, matching the backend `IdjorRagDocumentExtractionItem` / `IdjorRagExtractionPreviewResult` contracts.

## Phase 2: API client

- [X] T002 Add `mapIdjorRagDocumentExtraction`, `mapIdjorRagDocumentExtractionsPage`, `mapIdjorRagExtractionPreviewResponse` mappers to `src/lib/api.ts`.
- [X] T003 Add `runIdjorRagUploadExtractionPreview(uploadId)` (`POST`) to `src/lib/api.ts`.
- [X] T004 Add `getIdjorRagUploadExtractions(uploadId)` (`GET`) to `src/lib/api.ts`.

## Phase 3: UI — `src/components/idjor/idjor-foundation-panel.tsx`

- [X] T005 Add per-upload state: extraction preview submission state and extractions-list fetch state, both keyed by `uploadId`.
- [X] T006 Add "Previsualiser extraction" action per upload row inside the existing quarantine panel uploads table.
- [X] T007 Add inline result block: fixed disclosure text, loading/success/error states, bounded `previewText` for `text/plain`, "Extracteur non active pour ce format" for unsupported mime types, `errorReason` for `FILE_MISSING`/`FAILED`.
- [X] T008 Add read-only extractions list per upload (status, mimeType, previewText/errorReason, createdAt) with an explicit empty state, most recent first.
- [X] T009 On successful extraction preview: refresh the extractions list for that upload, and refresh the document audit view if it is currently open for the same document. Do not touch `ingestionStatus`.

## Phase 4: Validation

- [X] T010 `npm run lint` passes.
- [X] T011 `npm run build` passes and `/fr/idjor` is listed in route output.
- [X] T012 Forbidden-wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `ingerer`, `indexer`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/` finds no new occurrence.
- [X] T013 Confirm `wakama-backend` working tree is untouched (read-only reference only).
- [X] T014 Live API smoke test (see validation-log.md): login, attach `text/plain` upload, run extraction preview, confirm `previewText`; attach PDF upload, run extraction preview, confirm `UNSUPPORTED_PENDING_EXTRACTOR`; confirm document `ingestionStatus` and `linkedAssetCounts` (chunks/embeddings/citations) unchanged. Browser click-through of `/fr/idjor` itself was not performed in this session.
