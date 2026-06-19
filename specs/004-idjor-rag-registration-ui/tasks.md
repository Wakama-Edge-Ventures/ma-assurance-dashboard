---

description: "Task list for PHASE 2C.6 - IDJOR RAG Metadata Registration UI"
---

# Tasks: PHASE 2C.6 - IDJOR RAG Metadata Registration UI

**Input**: Design documents from `/specs/004-idjor-rag-registration-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Validation uses `npm run lint`, `npm run build`, and forbidden-text scans.

## Phase 1: Setup

- [X] T001 Create the Phase 2C.6 Spec Kit feature package in `specs/004-idjor-rag-registration-ui/`
- [X] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase 2C.6 plan

## Phase 2: Foundational

- [X] T003 Define the metadata-only POST contract, data model, and validation workflow in `specs/004-idjor-rag-registration-ui/`
- [X] T004 Confirm the backend registration contract remains unchanged

## Phase 3: User Story 1 - Register metadata-only RAG documents (Priority: P1)

**Goal**: Allow a protected assurance user to submit metadata-only document registrations from `/fr/idjor`

**Independent Test**: A valid metadata-only submission succeeds and the RAG documents list refreshes on the same page

- [X] T005 [US1] Add metadata-only registration request and response types in `src/types/index.ts`
- [X] T006 [US1] Add `registerIdjorRagDocumentMetadata()` to `src/lib/api.ts`
- [X] T007 [US1] Extend `src/components/idjor/idjor-foundation-panel.tsx` with a compact metadata-only form and submission flow

## Phase 4: User Story 2 - Keep the UI truthful and constrained (Priority: P2)

**Goal**: Make the registration surface demo-friendly while preserving all non-negotiable guardrails

**Independent Test**: The form shows only allowed fields, excludes `READY`, and clearly states that no file or AI analysis occurs

- [X] T008 [US2] Restrict the source and status options in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T009 [US2] Add client-side metadata JSON validation and success/error feedback in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T010 [US2] Preserve compact wording that avoids prohibited AI activation language in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 5: User Story 3 - Preserve shell stability and validation (Priority: P3)

**Goal**: Keep the premium shell and existing assurance routes safe while documenting the phase

**Independent Test**: `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]` continue to build and the forbidden wording scan stays clean

- [X] T011 [US3] Keep the route entry stable in `src/app/fr/(protected)/idjor/page.tsx`
- [X] T012 [US3] Run `npm run lint`, `npm run build`, and the required forbidden-text scan

## Phase 6: Polish

- [X] T013 Normalize wording across `specs/004-idjor-rag-registration-ui/` and `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T014 Record final validation notes in `specs/004-idjor-rag-registration-ui/validation-log.md`
- [X] T015 Update `specs/004-idjor-rag-registration-ui/tasks.md` with completed status
