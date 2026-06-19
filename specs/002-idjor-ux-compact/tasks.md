---

description: "Task list for PHASE 2B.6 - IDJOR Compact Demo UX"
---

# Tasks: PHASE 2B.6 - IDJOR Compact Demo UX

**Input**: Design documents from `/specs/002-idjor-ux-compact/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Validation uses `npm run lint` and `npm run build`.

## Phase 1: Setup

- [X] T001 Create the Phase 2B.6 Spec Kit feature package in `specs/002-idjor-ux-compact/`
- [X] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase 2B.6 plan

## Phase 2: Foundational

- [X] T003 Define the compact UX contract, data model, and validation workflow in `specs/002-idjor-ux-compact/`
- [X] T004 Confirm the existing backend contract is sufficient and remains unchanged

## Phase 3: User Story 1 - Executive summary first (Priority: P1)

**Goal**: Make the page understandable in the first viewport for demo audiences

**Independent Test**: The top of `/fr/idjor` clearly states foundation readiness, registry read-only, LLM OFF, vector store OFF, decisioning OFF, and institutional decision authority

- [X] T005 [US1] Add a clearer executive summary hero in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T006 [US1] Add professional demo wording at the top of the page in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 4: User Story 2 - Compact sections and bounded detail (Priority: P2)

**Goal**: Reduce page length while keeping technical detail reachable

**Independent Test**: `/fr/idjor` renders bounded, sectioned detail areas for Synthese, Agents, Moteurs, Tools, Flags, Providers / Models, and Securite

- [X] T007 [US2] Add compact mode state and section visibility controls in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T008 [US2] Reorganize registry details into compact sections in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T009 [US2] Add internal scroll or bounded height behavior for large detail tables in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 5: User Story 3 - Premium polish without regression (Priority: P3)

**Goal**: Keep the premium shell and existing assurance routes stable

**Independent Test**: The polished page fits the dashboard style and `/fr/applications` plus `/fr/applications/[id]` remain unaffected

- [X] T010 [US3] Adjust any IDJOR-specific shell wording only if needed in `src/components/layout/header.tsx`
- [X] T011 [US3] Review `/fr/applications` and `/fr/applications/[id]` for regressions after the polish
- [X] T012 [US3] Run `npm run lint` and `npm run build`

## Phase 6: Polish

- [X] T013 Normalize wording across `specs/002-idjor-ux-compact/` and `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T014 Record final validation notes in `specs/002-idjor-ux-compact/validation-log.md`
- [X] T015 Update `specs/002-idjor-ux-compact/tasks.md` with completed status
