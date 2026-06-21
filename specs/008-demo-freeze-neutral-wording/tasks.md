---

description: "Task list for DEMO-FREEZE-2 - neutral tenant wording and demo-safe IDJOR visibility"
---

# Tasks: DEMO-FREEZE-2 - Neutral Tenant Wording

**Input**: Design documents from `/specs/008-demo-freeze-neutral-wording/`

**Prerequisites**: `spec.md`, `plan.md`, prior audit report, and the requested frontend files

**Tests**: Validation uses `npm run lint`, `npm run build`, prohibited phrase scan, and residual domain-term scan

## Phase 1: Setup

- [x] T001 Create the Phase DEMO-FREEZE-2 Spec Kit feature package in `specs/008-demo-freeze-neutral-wording/`
- [x] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase DEMO-FREEZE-2 plan

## Phase 2: Foundational

- [x] T003 Strengthen tenant terminology for shared frontend surfaces in `src/config/tenants.ts`
- [x] T004 Neutralize shared shell and page-header wording in `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`, and `src/components/ui/app-page-header.tsx`

## Phase 3: User Story 1 - Shared tenant wording (Priority: P1)

**Goal**: Remove avoidable assurance leakage from shared and key route surfaces while preserving the assurance default case

**Independent Test**: Open `/fr/login`, `/fr/applications`, and `/fr/applications/[id]` with demo tenants and confirm institution-first wording

- [x] T005 [US1] Neutralize tenant login wording in `src/components/auth/login-page-client.tsx`
- [x] T006 [US1] Neutralize applications route wording in `src/app/fr/(protected)/applications/page.tsx`
- [x] T007 [US1] Neutralize DCA list wording in `src/components/insurance/applications-live-panel.tsx` and `src/components/insurance/applications-table.tsx`
- [x] T008 [US1] Neutralize application detail wording in `src/app/fr/(protected)/applications/[id]/page.tsx`

## Phase 4: User Story 2 - Demo-safe IDJOR visibility (Priority: P2)

**Goal**: Keep `/fr/idjor` proof-first and hide unnecessary technical depth for demo tenants

**Independent Test**: Open `/fr/idjor` as a demo tenant and confirm the page foregrounds documents, hash, and audit while minimizing technical controls

- [x] T009 [US2] Add demo-safe tenant visibility rules in `src/components/idjor/idjor-foundation-panel.tsx`
- [x] T010 [US2] Keep documents, hash, and audit visible while removing demo-irrelevant technical sections in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 5: Polish

- [x] T011 Run `npm run lint`
- [x] T012 Run `npm run build`
- [x] T013 Run prohibited and residual wording scans
- [x] T014 Record validation outcomes in `specs/008-demo-freeze-neutral-wording/validation-log.md`
- [x] T015 Update this task list and checklist with final status
