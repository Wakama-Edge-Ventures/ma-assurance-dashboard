# Tasks: IDJOR RAG Chunks Dashboard

**Input**: plan.md, spec.md

## Phase 1: Types

- [X] T001 Add `IdjorRagExtractionChunk`, `IdjorRagExtractionChunksPage`, `IdjorRagExtractionChunkingResponse` to `src/types/index.ts`, matching the backend `IdjorRagChunkItem` / `IdjorRagChunkingResult` contracts.

## Phase 2: API client

- [X] T002 Add `mapIdjorRagExtractionChunk`, `mapIdjorRagExtractionChunksPage`, `mapIdjorRagExtractionChunkingResponse` mappers to `src/lib/api.ts`.
- [X] T003 Add `runIdjorRagExtractionChunking(extractionId)` (`POST`) to `src/lib/api.ts`.
- [X] T004 Add `getIdjorRagExtractionChunks(extractionId)` (`GET`) to `src/lib/api.ts`.

## Phase 3: UI — `src/components/idjor/idjor-foundation-panel.tsx`

- [X] T005 Add chunking state: chunking submission state and chunk-list fetch state, both keyed by `extractionId`, plus a single-slot `chunkingPanelExtractionId` toggle.
- [X] T006 Extend `ExtractionResultBlock` to show a "Decouper deterministiquement" action only when `extraction.status === "EXTRACTED_PENDING_REVIEW"`.
- [X] T007 Add inline chunking panel: fixed disclosure text, loading/success/error states for the chunking call.
- [X] T008 Add read-only chunk list per extraction (chunkIndex, contentHash, size, excerpt) with an explicit empty state, ordered by chunkIndex ascending.
- [X] T009 On successful chunking: refresh the chunk list for that extraction, and refresh the document audit view if it is currently open for the same document. Do not touch `ingestionStatus`.
- [X] T010 Reset chunking panel/state when the extraction panel or upload panel is toggled closed/changed.

## Phase 4: Validation

- [X] T011 `npm run lint` passes.
- [X] T012 `npm run build` passes and `/fr/idjor` is listed in route output.
- [X] T013 Forbidden-wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `ingerer`, `indexer`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/` finds no new occurrence.
- [X] T014 Confirm `wakama-backend` working tree is untouched (read-only reference only).
- [ ] T015 Live API / browser smoke test (see validation-log.md) — perform if a local backend instance is reachable in this session; otherwise document as not performed.
