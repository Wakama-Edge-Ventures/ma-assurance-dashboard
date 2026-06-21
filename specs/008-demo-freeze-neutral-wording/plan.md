# Implementation Plan: DEMO-FREEZE-2 Neutral Tenant Wording

**Branch**: `008-demo-freeze-neutral-wording` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-demo-freeze-neutral-wording/spec.md`

## Summary

Harden the frontend demo narrative for BNI/BAD by neutralizing shared wording, reinforcing tenant-aware terminology, and reducing technical exposure on `/fr/idjor`. The implementation remains frontend-only and preserves `assurance-ma`, auth, routes, APIs, and business logic.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: Existing tenant configuration, shared header/sidebar/page-title surfaces, protected `/fr/idjor` panel, existing DCA pages

**Storage**: N/A

**Testing**: `npm run lint`, `npm run build`, prohibited wording scan, residual domain-term scan

**Target Platform**: Local protected dashboard frontend

**Project Type**: Single frontend web application

**Performance Goals**: No meaningful regression; route behavior remains unchanged

**Constraints**: No backend/auth/API changes, no new calculations, no LLM/vector/embedding/upload/parsing additions, no route changes, no automatic commit

**Scale/Scope**: Shared wording, tenant-aware labels, `/fr/idjor` demo-safe visibility, and Spec Kit documentation for this phase

## Constitution Check

- PASS: Frontend-only hardening; no backend or auth changes
- PASS: No new LLM, vector, embedding, upload, or calculation capability
- PASS: Existing application routes remain stable
- PASS: IDJOR remains explicitly non-decision and read-only

## Project Structure

### Documentation (this feature)

```text
specs/008-demo-freeze-neutral-wording/
|-- spec.md
|-- plan.md
|-- tasks.md
|-- validation-log.md
`-- checklists/
    `-- requirements.md
```

### Source Code (targeted changes)

```text
src/
|-- app/fr/(protected)/
|   |-- applications/page.tsx
|   `-- applications/[id]/page.tsx
|-- components/
|   |-- auth/login-page-client.tsx
|   |-- idjor/idjor-foundation-panel.tsx
|   |-- insurance/
|   |   |-- applications-live-panel.tsx
|   |   `-- applications-table.tsx
|   |-- layout/
|   |   |-- header.tsx
|   |   `-- sidebar.tsx
|   `-- ui/app-page-header.tsx
|-- config/tenants.ts
`-- AGENTS.md
```

**Structure Decision**: Reuse the existing tenant configuration as the wording backbone and keep the demo hardening localized to shared surfaces plus the IDJOR panel.

## Phase 0: Research

### Research Goals

- Identify shared wording hotspots that leak assurance-only language across tenants
- Identify which `/fr/idjor` subsections are too technical for demo tenants
- Confirm that the default assurance dashboard path remains isolated to `assurance-ma`

### Research Outputs

- Existing audit report and targeted code reading notes

## Phase 1: Tenant Wording Hardening

### Design Goals

- Strengthen tenant terminology in the frontend config
- Update shared shell and page-header wording to avoid assurance leakage
- Neutralize login and DCA route wording without changing behavior

### Outputs

- Tenant-aware frontend wording updates in shared and route-level components

## Phase 2: Demo-Safe IDJOR Visibility

### Design Goals

- Keep documents, hash, and journal visible
- De-emphasize technical RAG registration and catalog sections for demo tenants
- Preserve the truthful read-only proof posture

### Outputs

- Tenant-aware proof-first presentation on `/fr/idjor`

## Phase 3: Validation & Handoff

### Validation Goals

- Record successful lint/build results
- Record prohibited and residual wording scan results
- State whether the repository is ready to freeze

### Outputs

- [validation-log.md](./validation-log.md)
- [checklists/requirements.md](./checklists/requirements.md)

## Complexity Tracking

No constitution violations or complexity exceptions are required for this phase.
