---

description: "Task list for PHASE 2D.5 - IDJOR RAG Audit Trail UI"
---

# Tasks: PHASE 2D.5 - IDJOR RAG Audit Trail UI

**Input**: Design documents from `/specs/006-idjor-rag-audit-trail/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Validation uses `npm run lint`, `npm run build`, and forbidden-text scans.

## Phase 1: Setup

- [X] T001 Create the Phase 2D.5 Spec Kit feature package in `specs/006-idjor-rag-audit-trail/`
- [X] T002 Point `.specify/feature.json` and `AGENTS.md` to the Phase 2D.5 plan

## Phase 2: Foundational

- [X] T003 Define the audit events GET contracts and data model in `specs/006-idjor-rag-audit-trail/`
- [X] T004 Confirm the backend audit read contracts remain unchanged

## Phase 3: User Story 1 - Read the global RAG audit trail (Priority: P1)

**Goal**: Allow a protected assurance user to read the append-only global RAG audit journal on `/fr/idjor`

**Independent Test**: Expanding "Journal d'audit RAG" renders events with `eventType`, `documentKey`, `source`, `ingestionStatus`, `actorRole`, `actorUserId`, `createdAt`

- [X] T005 [US1] Add RAG audit event response types in `src/types/index.ts`
- [X] T006 [US1] Add `getIdjorRagAuditEvents()` to `src/lib/api.ts`
- [X] T007 [US1] Add the "Journal d'audit RAG" section and load state in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 4: User Story 2 - Inspect one document's audit trail (Priority: P2)

**Goal**: Allow drilling down to a single RAG document's audit events

**Independent Test**: Clicking "Voir audit" on a document row narrows the journal to that document's events only

- [X] T008 [US2] Add `getIdjorRagDocumentAuditEvents(documentId)` to `src/lib/api.ts`
- [X] T009 [US2] Add a per-row "Voir audit" action and per-document journal state in `src/components/idjor/idjor-foundation-panel.tsx`

## Phase 5: User Story 3 - Keep the audit surface read-only and truthful (Priority: P3)

**Goal**: Make the audit panel demo-friendly while preserving all non-negotiable guardrails

**Independent Test**: The panel never exposes a modify/delete/re-run control and always shows the append-only disclosure sentence

- [X] T010 [US3] Render audit fields verbatim with a minimal redacted summary in `src/components/idjor/idjor-foundation-panel.tsx`
- [X] T011 [US3] Add loading/success/empty/error feedback for both audit flows
- [X] T012 [US3] Add the fixed append-only disclosure wording and avoid prohibited mutate/AI-activation language

## Phase 6: Polish

- [X] T013 Run `npm run lint`, `npm run build`, and the required forbidden-text scan
- [X] T014 Record final validation notes in `specs/006-idjor-rag-audit-trail/validation-log.md`
- [X] T015 Update `specs/006-idjor-rag-audit-trail/tasks.md` with completed status
