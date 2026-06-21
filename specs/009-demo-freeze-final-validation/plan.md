# Implementation Plan: DEMO-FREEZE-3 Final Validation and Freeze Recommendation

**Branch**: `009-demo-freeze-final-validation` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-demo-freeze-final-validation/spec.md`

## Summary

Produce a documentation-only final validation package for the BNI/BAD demo after wording hardening. Re-run the repo checks, confirm route generation and demo-safe positioning, classify remaining domain wording, and issue a final freeze recommendation without modifying product behavior.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: Existing demo audit, Phase 008 validation log, tenant configuration, shared shell wording, DCA routes, and IDJOR read-only panel

**Storage**: N/A

**Testing**: `npm run lint`, `npm run build`, prohibited wording scan, residual domain-term scan

**Target Platform**: Local protected dashboard frontend

**Project Type**: Single frontend web application

**Performance Goals**: No regression; documentation-only phase

**Constraints**: No UI change, no backend/auth/API/route change, no new calculations, no LLM/vector/embedding/upload/parsing additions, no automatic commit

**Scale/Scope**: Documentation-only freeze validation and final recommendation

## Constitution Check

- PASS: This phase is documentation-only
- PASS: No backend, auth, API, route, or business logic changes are introduced
- PASS: Validation relies on existing repo commands and source review
- PASS: Final report remains truthful about non-decision RAX/WRS and proof-first IDJOR posture

## Project Structure

### Documentation (this feature)

```text
specs/009-demo-freeze-final-validation/
|-- spec.md
|-- plan.md
|-- tasks.md
|-- validation-log.md
`-- checklists/
    `-- requirements.md
```

### Existing Source Reviewed

```text
docs/demo/BNI_BAD_DEMO_FREEZE_AUDIT.md
specs/008-demo-freeze-neutral-wording/validation-log.md
src/config/tenants.ts
src/components/layout/sidebar.tsx
src/components/layout/header.tsx
src/app/fr/(protected)/applications/page.tsx
src/app/fr/(protected)/applications/[id]/page.tsx
src/components/idjor/idjor-foundation-panel.tsx
```

**Structure Decision**: Keep the phase entirely documentary while relying on concrete validation evidence from the current codebase and build output.

## Phase 0: Validation Inputs

### Goals

- Gather the prior audit and post-hardening validation evidence
- Review the tenant wording and IDJOR posture in the current frontend source
- Re-run the requested validation commands and scans

### Outputs

- Current validation evidence
- Current route generation evidence

## Phase 1: Freeze Assessment

### Goals

- Assess whether shared demo surfaces are now neutral enough for BNI/BAD
- Confirm residual domain wording is explainable and out of scope for the freeze decision
- Determine whether the demo can freeze without further product edits

### Outputs

- Final verdict and risk list
- Recommended five-step demo flow

## Phase 2: Documentation Handoff

### Goals

- Capture the final verdict in both Spec Kit and demo-facing documentation
- Preserve traceability to commands, scans, and reviewed source files

### Outputs

- [validation-log.md](./validation-log.md)
- [checklists/requirements.md](./checklists/requirements.md)
- [docs/demo/BNI_BAD_DEMO_FREEZE_FINAL.md](../../docs/demo/BNI_BAD_DEMO_FREEZE_FINAL.md)

## Complexity Tracking

No constitution exceptions or complexity justifications are required for this phase.
