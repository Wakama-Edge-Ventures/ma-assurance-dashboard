---

description: "Task list for DEMO-FREEZE-3 - final validation and freeze recommendation"
---

# Tasks: DEMO-FREEZE-3 - Final Validation and Freeze Recommendation

**Input**: Design documents from `/specs/009-demo-freeze-final-validation/`

**Prerequisites**: `spec.md`, `plan.md`, prior audit report, Phase 008 validation log, and the requested source files

**Tests**: Validation uses `npm run lint`, `npm run build`, prohibited wording scan, and residual domain-term scan

## Phase 1: Setup

- [x] T001 Create the Phase DEMO-FREEZE-3 Spec Kit feature package in `specs/009-demo-freeze-final-validation/`
- [x] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase DEMO-FREEZE-3 plan

## Phase 2: Foundational

- [x] T003 Review the prior audit and Phase 008 validation artifacts in `docs/demo/BNI_BAD_DEMO_FREEZE_AUDIT.md` and `specs/008-demo-freeze-neutral-wording/validation-log.md`
- [x] T004 Review the current tenant wording and demo-safe route sources in `src/config/tenants.ts`, `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`, `src/app/fr/(protected)/applications/page.tsx`, `src/app/fr/(protected)/applications/[id]/page.tsx`, and `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 3: User Story 1 - Final technical validation (Priority: P1)

**Goal**: Re-run the required validations and capture route-generation evidence for the freeze decision

**Independent Test**: Review the final validation log and confirm the lint, build, route, and prohibited wording results are recorded

- [x] T005 [US1] Run `npm run lint`
- [x] T006 [US1] Run `npm run build`
- [x] T007 [US1] Scan `src/` for `LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, and `ingérer`
- [x] T008 [US1] Scan `src/` for `assurance`, `assureur`, `sinistre`, `police`, `banque`, `BNI`, and `BAD`

## Phase 4: User Story 2 - Freeze assessment and handoff (Priority: P2)

**Goal**: Turn the validation evidence into a final freeze recommendation with documented residual risks

**Independent Test**: Review the final documentation and confirm it contains a clear verdict, risk list, residual-term rationale, and a five-step demo script

- [x] T009 [US2] Classify remaining domain wording as voluntary or out of scope in `specs/009-demo-freeze-final-validation/validation-log.md`
- [x] T010 [US2] Write the final freeze recommendation in `docs/demo/BNI_BAD_DEMO_FREEZE_FINAL.md`
- [x] T011 [US2] Record the same verdict and traceability in `specs/009-demo-freeze-final-validation/validation-log.md`
- [x] T012 [US2] Update this task list and checklist with final status
