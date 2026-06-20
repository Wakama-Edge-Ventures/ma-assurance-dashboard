# Tasks: IDJOR RAG Embedding Readiness Dashboard

**Input**: plan.md, spec.md

## Phase 1: Types

- [X] T001 Add `IdjorRagEmbeddingReadinessState`, `IdjorRagEmbeddingBlockedReason`, `IdjorRagEmbeddingRequiredFlag`, `IdjorRagEmbeddingProviderStatus`, `IdjorRagEmbeddingModelStatus`, `IdjorRagEmbeddingVectorStoreStatus`, `IdjorRagEmbeddingReadiness`, `IdjorRagEmbeddingReadinessResponse`, `IdjorRagEmbeddingPreviewRequestResponse` to `src/types/index.ts`, matching the backend `IdjorRagEmbeddingReadiness` / `IdjorRagEmbeddingPreviewResult` contracts.

## Phase 2: API client

- [X] T002 Add `mapIdjorRagEmbeddingBlockedReasons`, `mapIdjorRagEmbeddingRequiredFlag`, `mapIdjorRagEmbeddingProviderStatus`, `mapIdjorRagEmbeddingModelStatus`, `mapIdjorRagEmbeddingVectorStoreStatus`, `mapIdjorRagEmbeddingReadiness`, `mapIdjorRagEmbeddingReadinessResponse`, `mapIdjorRagEmbeddingPreviewRequestResponse` mappers to `src/lib/api.ts`.
- [X] T003 Add `getIdjorRagEmbeddingReadiness(extractionId)` (`GET`) to `src/lib/api.ts`.
- [X] T004 Add `requestIdjorRagEmbeddingPreview(extractionId)` (`POST`) to `src/lib/api.ts`.

## Phase 3: UI — `src/components/idjor/idjor-foundation-panel.tsx`

- [X] T005 Add embedding readiness state and preview-request state, both keyed by `extractionId`.
- [X] T006 Add `EmbeddingReadinessPanel` presentational component rendering `embeddingReadiness`, `eligibleChunksCount`, `providerStatus`, `modelStatus`, `vectorStoreStatus`, `blockedReasons`, `requiredFlags`.
- [X] T007 Extend `ExtractionResultBlock`'s chunking panel with: fixed disclosure text, "Verifier readiness embeddings" action (always available once the panel is open), loading/success/error states.
- [X] T008 Add "Demande preview embedding" action, only rendered after a readiness check resolves to `BLOCKED` or `NOT_READY` for that extraction; loading/success/error states; result always shown as blocked, never as active.
- [X] T009 On successful preview request: refresh the readiness snapshot for that extraction, and refresh the document audit view if it is currently open for the same document.
- [X] T010 Reset embedding-readiness/preview-request state when the chunking panel, extraction panel, or upload panel is toggled closed/changed.

## Phase 4: Validation

- [X] T011 `npm run lint` passes.
- [X] T012 `npm run build` passes and `/fr/idjor` is listed in route output.
- [X] T013 Forbidden-wording scan (`LIVE IA`, `Activer IA`, `activer embeddings`, `poser une question`, `vectoriser`, `provider externe actif`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/` finds no new occurrence.
- [X] T014 Confirm `wakama-backend` working tree is untouched (read-only reference only).
- [ ] T015 Live API / browser smoke test (see validation-log.md) — perform if a local backend instance is reachable in this session; otherwise document as not performed.
