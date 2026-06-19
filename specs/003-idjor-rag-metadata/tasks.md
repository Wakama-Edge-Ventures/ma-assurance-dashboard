---

description: "Task list for PHASE 2C.3 - IDJOR RAG Metadata Dashboard"
---

# Tasks: PHASE 2C.3 - IDJOR RAG Metadata Dashboard

**Input**: Design documents from `/specs/003-idjor-rag-metadata/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Validation uses `npm run lint`, `npm run build`, and forbidden-text scans.

## Phase 1: Setup

- [X] T001 Create the Phase 2C.3 Spec Kit feature package in `specs/003-idjor-rag-metadata/`
- [X] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase 2C.3 plan

## Phase 2: Foundational

- [X] T003 Define the compact RAG metadata contract, data model, and validation workflow in `specs/003-idjor-rag-metadata/`
- [X] T004 Confirm the existing backend RAG contract is sufficient and remains unchanged

## Phase 3: User Story 1 - Surface read-only RAG metadata (Priority: P1)

**Goal**: Show the protected RAG metadata foundation in the existing IDJOR page

**Independent Test**: An authenticated user can open `/fr/idjor` and see the RAG health summary plus tenant-scoped documents without any AI activation control

- [X] T005 [US1] Add read-only RAG types in `src/types/index.ts`
- [X] T006 [US1] Add read-only RAG API mapping and fetch functions in `src/lib/api.ts`
- [X] T007 [US1] Extend `src/components/idjor/idjor-foundation-panel.tsx` to load protected RAG snapshots alongside foundation snapshots

## Phase 4: User Story 2 - Keep technical RAG detail compact (Priority: P2)

**Goal**: Keep chunks and citations visible without breaking compact demo mode

**Independent Test**: The RAG section shows bounded documents/chunks/citations detail and explicit inactive read-only states for disabled RAG controls

- [X] T008 [US2] Add a compact `Base documentaire RAG` section in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T009 [US2] Present disabled RAG, LLM, vector, and embeddings posture in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T010 [US2] Keep technical chunk and citation detail bounded and readable in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 5: User Story 3 - Preserve shell stability and validation (Priority: P3)

**Goal**: Keep the premium shell and current assurance routes safe

**Independent Test**: `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]` all continue to build and the forbidden wording scan stays clean

- [X] T011 [US3] Keep the route entry stable in `src/app/fr/(protected)/idjor/page.tsx`
- [X] T012 [US3] Run `npm run lint`, `npm run build`, and the forbidden-text scans

## Phase 6: Polish

- [X] T013 Normalize wording across `specs/003-idjor-rag-metadata/` and `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T014 Record final validation notes in `specs/003-idjor-rag-metadata/validation-log.md`
- [X] T015 Update `specs/003-idjor-rag-metadata/tasks.md` with completed status
