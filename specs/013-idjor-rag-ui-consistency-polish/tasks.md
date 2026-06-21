# Tasks: IDJOR RAG UI Consistency Polish

**Input**: plan.md, spec.md

## Phase 1: Page-level wording

- [X] T001 Reword `getErrorCard`'s `DegradedStateCard` description in `src/components/idjor/idjor-foundation-panel.tsx` to drop "strictement read-only" in favor of governed-foundation wording.
- [X] T002 Reword the `PageTitle` description (both `demoSafeMode` branches) to drop "strictement read-only".

## Phase 2: Outdated "no upload" message

- [X] T003 Reword the RAG section "Message de demo" block to reflect the existing controlled upload/extraction/chunking actions, while keeping the "no AI analysis/vectorization/automatic extraction" statement.

## Phase 3: Governance vs technical chunk counters

- [X] T004 Relabel the ingestion-preview panel's `ingestionReadiness` and `chunks` `ExecutiveStatus` entries as governance/metadata-only counters; add a one-line note pointing to the extraction panel for technical deterministic chunks.
- [X] T005 Relabel the detailed-view "Chunks" and "Citations" `RegistryTable` empty-state labels as governance/metadata-only counters (chunks table only; citations table wording was already accurate and is unchanged).

## Phase 4: Duplicated extraction display

- [X] T006 Filter the "current result" extraction id out of the `ragUploadExtractionsListState.page.extractions` render in the extraction panel so the same extraction is not shown twice.

## Phase 5: Validation

- [X] T007 `npm run lint` passes.
- [X] T008 `npm run build` passes and `/fr/idjor` is listed in route output.
- [X] T009 Forbidden-wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/` finds no new occurrence.
- [X] T010 Confirm `wakama-backend` working tree is untouched (no file read or written under it this session).
- [ ] T011 Live API / browser smoke test (see validation-log.md) — perform if a local backend instance is reachable in this session; otherwise document as not performed.
