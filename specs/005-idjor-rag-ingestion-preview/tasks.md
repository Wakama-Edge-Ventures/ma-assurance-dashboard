---

description: "Task list for PHASE 2D.2 - IDJOR RAG Ingestion Preview UI"
---

# Tasks: PHASE 2D.2 - IDJOR RAG Ingestion Preview UI

**Input**: Design documents from `/specs/005-idjor-rag-ingestion-preview/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Validation uses `npm run lint`, `npm run build`, and forbidden-text scans.

## Phase 1: Setup

- [X] T001 Create the Phase 2D.2 Spec Kit feature package in `specs/005-idjor-rag-ingestion-preview/`
- [X] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase 2D.2 plan

## Phase 2: Foundational

- [X] T003 Define the ingestion preview GET contract and data model in `specs/005-idjor-rag-ingestion-preview/`
- [X] T004 Confirm the backend ingestion preview contract remains unchanged

## Phase 3: User Story 1 - Preview ingestion readiness (Priority: P1)

**Goal**: Allow a protected assurance user to preview ingestion readiness for any RAG document listed on `/fr/idjor`

**Independent Test**: Selecting a document's preview action renders `documentId`, scope, `ingestionReadiness`, `missingFields`, `allowedNextSteps`, and `blockedReasons`

- [X] T005 [US1] Add ingestion preview response types in `src/types/index.ts`
- [X] T006 [US1] Add `getIdjorRagDocumentIngestionPreview()` to `src/lib/api.ts`
- [X] T007 [US1] Add a per-row "Prévisualiser préparation" action and preview panel state in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 4: User Story 2 - Keep the preview surface truthful and safe (Priority: P2)

**Goal**: Make the preview panel demo-friendly while preserving all non-negotiable guardrails

**Independent Test**: The panel never shows `READY` and always shows `llmEnabled=false`, `vectorStoreEnabled=false`, `embeddingsEnabled=false`, `chunks=0`, `citations=0`, and the disclosure sentence

- [X] T008 [US2] Render `ingestionReadiness`, `missingFields`, `allowedNextSteps`, `blockedReasons` verbatim in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T009 [US2] Add loading/success/error feedback for the preview request in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T010 [US2] Add the fixed disclosure wording and avoid prohibited AI activation language

## Phase 5: User Story 3 - Preserve shell stability and validation (Priority: P3)

**Goal**: Keep the premium shell and existing assurance routes safe while documenting the phase

**Independent Test**: `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]` continue to build and the forbidden wording scan stays clean

- [X] T011 [US3] Keep the route entry stable in `src/app/fr/(protected)/idjor/page.tsx`
- [X] T012 [US3] Run `npm run lint`, `npm run build`, and the required forbidden-text scan

## Phase 6: Polish

- [X] T013 Normalize wording across `specs/005-idjor-rag-ingestion-preview/` and `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T014 Record final validation notes in `specs/005-idjor-rag-ingestion-preview/validation-log.md`
- [X] T015 Update `specs/005-idjor-rag-ingestion-preview/tasks.md` with completed status
