---

description: "Task list for PHASE 2B.5 - IDJOR Foundation Read-Only Dashboard"
---

# Tasks: PHASE 2B.5 - IDJOR Foundation Read-Only Dashboard

**Input**: Design documents from `/specs/001-idjor-foundation-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Validation uses the repository's existing `npm run lint` and
`npm run build` commands.

## Phase 1: Setup

- [X] T001 Create the Phase 2B.5 Spec Kit feature package in `specs/001-idjor-foundation-dashboard/`
- [X] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase 2B.5 plan

## Phase 2: Foundational

- [X] T003 Define the frontend contract, data model, and validation workflow in `specs/001-idjor-foundation-dashboard/`
- [X] T004 Confirm the existing dashboard auth, tenant, and API base URL layers are sufficient with no backend change

## Phase 3: User Story 1 - Protected foundation read (Priority: P1)

**Goal**: Show the protected IDJOR health and registry state inside the dashboard

**Independent Test**: An authenticated user can open `/fr/idjor` and see the tenant-scoped read-only health and registry summary

- [X] T005 [P] [US1] Add `getIdjorFoundationHealth` and `getIdjorFoundationRegistry` in `src/lib/api.ts`
- [X] T006 [P] [US1] Add frontend foundation types in `src/types/index.ts`
- [X] T007 [US1] Create the protected IDJOR page entry in `src/app/fr/(protected)/idjor/page.tsx`
- [X] T008 [US1] Create the read-only foundation UI in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 4: User Story 2 - Safe loading and truthful wording (Priority: P2)

**Goal**: Render loading, error, and disabled-control states without implying active AI

**Independent Test**: The page shows clear loading or failure messaging and disabled-control status without any live-AI wording

- [X] T009 [US2] Add loading, protected-error, and unavailable-backend rendering in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T010 [US2] Adjust protected header wording for the `/fr/idjor` route in `src/components/layout/header.tsx`

## Phase 5: User Story 3 - Native navigation and non-regression (Priority: P3)

**Goal**: Make the new page discoverable while preserving existing assurance routes

**Independent Test**: The sidebar exposes the new IDJOR page and `/fr/applications` plus `/fr/applications/[id]` remain intact

- [X] T011 [US3] Add an IDJOR navigation entry in `src/components/layout/sidebar.tsx`
- [X] T012 [US3] Review the protected shell and applications routes for regressions in `src/app/fr/(protected)/applications/page.tsx` and `src/app/fr/(protected)/applications/[id]/page.tsx`
- [X] T013 [US3] Run `npm run lint` and `npm run build`

## Phase 6: Polish

- [X] T014 Normalize wording across `specs/001-idjor-foundation-dashboard/`, `src/lib/api.ts`, and the new IDJOR UI
- [X] T015 Update `specs/001-idjor-foundation-dashboard/tasks.md` with completed status
