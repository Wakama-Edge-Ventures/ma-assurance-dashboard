# Implementation Plan: DEMO-FREEZE-1 BNI/BAD Demo Readiness Audit

**Branch**: `007-demo-freeze-bni-bad-readiness` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-demo-freeze-bni-bad-readiness/spec.md`

## Summary

Produce a documentation-only audit for the BNI/BAD demo freeze. The work reads the current protected frontend surfaces, validates the local frontend baseline with lint/build, scans visible wording, and records findings plus next-phase targets. No UI, API, route, auth, or backend behavior changes are allowed.

## Technical Context

**Language/Version**: N/A for this phase; documentation-only assessment of an existing TypeScript/React/Next.js frontend

**Primary Dependencies**: Existing frontend routes, tenant configuration, protected layout components, Spec Kit documentation structure

**Storage**: N/A

**Testing**: `npm run lint`, `npm run build`, and source wording scan

**Target Platform**: Local frontend workspace

**Project Type**: Documentation-only audit

**Performance Goals**: N/A

**Constraints**: No backend changes, no UI behavior changes, no API changes, no route changes, no auth rewrite, no added LLM/vector/upload/embedding capability, no automatic commit

**Scale/Scope**: Audit only the requested routes and cross-tenant visible wording for demo readiness

## Constitution Check

- PASS: This phase is read-only and documentary.
- PASS: No LLM, vector, upload, or backend capability is added.
- PASS: Existing application routes remain untouched.
- PASS: The output is decision support for a later wording/visibility hardening phase.

## Project Structure

### Documentation (this feature)

```text
specs/007-demo-freeze-bni-bad-readiness/
|-- spec.md
|-- plan.md
|-- tasks.md
|-- validation-log.md
`-- checklists/
    `-- requirements.md

docs/demo/
`-- BNI_BAD_DEMO_FREEZE_AUDIT.md
```

### Source Code (reviewed only, not modified)

```text
src/
|-- app/fr/(protected)/
|   |-- dashboard/page.tsx
|   |-- applications/page.tsx
|   |-- applications/[id]/page.tsx
|   `-- idjor/page.tsx
|-- components/
|   |-- layout/
|   |   |-- sidebar.tsx
|   |   `-- header.tsx
|   `-- idjor/
|       `-- idjor-foundation-panel.tsx
|-- components/auth/login-page-client.tsx
|-- components/tenant/TenantDashboardLanding.tsx
|-- components/ui/app-page-header.tsx
|-- config/tenants.ts
|-- lib/api.ts
`-- types/index.ts
```

**Structure Decision**: Keep all product files read-only and place every output in documentation artifacts only.

## Phase 0: Research

### Research Goals

- Confirm the current intended product framing from the foundation and audit-trail specs.
- Confirm current tenant-specific routing and wording behavior for assurance, BNI, BAD, and Wakama demo tenants.
- Confirm whether `/fr/idjor` exposes demo-risky technical RAG details or metadata-only actions.

### Research Outputs

- Route and component reading notes captured in the final audit report

## Phase 1: Validation

### Validation Goals

- Record the current local results of `npm run lint`
- Record the current local results of `npm run build`
- Record wording scan hotspots across visible frontend source files

### Validation Outputs

- [validation-log.md](./validation-log.md)

## Phase 2: Demo Readiness Assessment

### Assessment Goals

- Classify each critical route as ready, conditionally ready, or not ready for BNI/BAD demo use
- Separate technical readiness from narrative/readability readiness
- Identify what to keep visible versus what to minimize in the next phase

### Assessment Outputs

- [docs/demo/BNI_BAD_DEMO_FREEZE_AUDIT.md](../../docs/demo/BNI_BAD_DEMO_FREEZE_AUDIT.md)

## Phase 3: Handoff

### Handoff Goals

- Provide a pre-demo checklist
- Provide a next-phase target file list
- Provide a freeze-branch recommendation

### Handoff Outputs

- [tasks.md](./tasks.md)
- [checklists/requirements.md](./checklists/requirements.md)

## Complexity Tracking

No constitution violations or complexity exceptions are required for this audit phase.
