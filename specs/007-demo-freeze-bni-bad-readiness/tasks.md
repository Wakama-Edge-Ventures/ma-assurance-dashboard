---

description: "Task list for DEMO-FREEZE-1 - BNI/BAD demo readiness audit"
---

# Tasks: DEMO-FREEZE-1 - BNI/BAD Demo Readiness Audit

**Input**: Audit brief and existing frontend/spec artifacts

**Prerequisites**: `AGENTS.md`, `docs/idjor/Wakama_IDJOR_Master_Plan.md`, `specs/001-idjor-foundation-dashboard/spec.md`, `specs/006-idjor-rag-audit-trail/spec.md`, and the requested route/component files

**Tests**: Validation uses `npm run lint`, `npm run build`, and wording scans only

## Phase 1: Audit Setup

- [x] T001 Create the documentation-only feature package in `specs/007-demo-freeze-bni-bad-readiness/`
- [x] T002 Review the mandatory planning and spec context before auditing the product

## Phase 2: Surface Review

- [x] T003 Audit `/fr/login` tenant framing and demo wording
- [x] T004 Audit `/fr/dashboard` for assurance-heavy hero, KPI, and live-language exposure
- [x] T005 Audit `/fr/applications` and `/fr/applications/[id]` for DCA wording, disclaimers, and demo-safe read-only behavior
- [x] T006 Audit `/fr/idjor` for proof/audit positioning versus overly technical RAG/module exposure
- [x] T007 Audit shared shell wording in sidebar, header, tenant landing, and tenant config

## Phase 3: Validation

- [x] T008 Run `npm run lint`
- [x] T009 Run `npm run build`
- [x] T010 Run the required frontend wording scan for `Assurance`, `assureur`, `sinistre`, `police`, `DCA`, `RAX`, `IDJOR`, `BNI`, `BAD`, and `LIVE IA`

## Phase 4: Reporting

- [x] T011 Record validation outcomes in `specs/007-demo-freeze-bni-bad-readiness/validation-log.md`
- [x] T012 Produce the final audit report in `docs/demo/BNI_BAD_DEMO_FREEZE_AUDIT.md`
- [x] T013 Capture the pre-demo checklist and next-phase file targets in `specs/007-demo-freeze-bni-bad-readiness/checklists/requirements.md`
- [x] T014 Confirm that no functional product change was made and no commit was created
