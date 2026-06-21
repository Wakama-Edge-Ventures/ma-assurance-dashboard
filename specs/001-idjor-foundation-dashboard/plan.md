# Implementation Plan: PHASE 2B.5 - IDJOR Foundation Read-Only Dashboard

**Branch**: `001-idjor-foundation-dashboard` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-idjor-foundation-dashboard/spec.md`

## Summary

Add a protected IDJOR foundation page to the assurance dashboard that reads the
new backend health and registry endpoints through the existing dashboard auth
and API base URL model. The implementation reuses the current protected shell,
tenant context, and browser-authenticated API helpers, surfaces only truthful
read-only registry data, adds no AI provider wiring, and keeps current DCA
flows untouched.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: Next.js App Router, existing auth/session helpers,
existing API helpers, `lucide-react`, current UI card/badge primitives

**Storage**: N/A on the frontend; reads protected backend responses only

**Testing**: Existing repository validation commands: `npm run lint` and
`npm run build`

**Target Platform**: Local protected dashboard frontend using the existing API
base URL

**Project Type**: Single frontend web application

**Performance Goals**: One protected page load should fetch the health and
registry snapshots without degrading existing protected navigation flows

**Constraints**: Local-only backend usage, no backend modification, no LLM
activation, no vector store activation, no provider wiring, no decision or
calculation controls, no regression on `/fr/applications` and
`/fr/applications/[id]`, no misleading "live AI" wording, no automatic commit

**Scale/Scope**: Two read-only API functions, one protected dashboard page, one
navigation entry, one header wording adjustment, and repository lint/build
validation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The frontend remains advisory and read-only.
- PASS: No score, pricing, eligibility, amount, or status decision is computed.
- PASS: All surfaced AI controls remain OFF, disabled, or read-only.
- PASS: No provider client, vector client, or external AI integration is added.
- PASS: Existing assurance workflows remain unchanged.
- PASS: The UI must remain truthful and avoid "live AI" claims for registry-only
  data.

## Project Structure

### Documentation (this feature)

```text
specs/001-idjor-foundation-dashboard/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- idjor-foundation-dashboard-surface.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- app/
|   `-- fr/
|       `-- (protected)/
|           `-- idjor/
|               `-- page.tsx
|-- components/
|   |-- layout/
|   |   |-- header.tsx
|   |   `-- sidebar.tsx
|   `-- idjor/
|       `-- idjor-foundation-panel.tsx
|-- lib/
|   |-- api.ts
|   `-- auth.ts
`-- types/
    `-- index.ts
```

**Structure Decision**: Keep the protected page entry thin in App Router and
place the actual browser-authenticated foundation UI in a dedicated component.
Extend the existing general API helper rather than introducing a new provider or
parallel client stack.

## Phase 0: Research

### Research Goals

- Decide whether the new page should fetch server-side or client-side.
- Decide where to place the IDJOR page in the protected navigation.
- Decide how to avoid misleading "live AI" wording while preserving the premium
  shell.
- Confirm the backend route contract needed by the frontend without modifying
  the backend.

### Research Outputs

- [research.md](./research.md) capturing decisions, rationale, and rejected
  alternatives.

## Phase 1: Design & Contracts

### Design Goals

- Define the frontend view model for the protected health and registry payloads.
- Define how loading, auth, scope, and unavailable-backend states render.
- Define the page contract for tenant, counts, disabled controls, allowed source
  labels, and registry tables.
- Define the local validation steps proving no AI activation or workflow
  regression was introduced.

### Design Outputs

- [data-model.md](./data-model.md)
- [contracts/idjor-foundation-dashboard-surface.md](./contracts/idjor-foundation-dashboard-surface.md)
- [quickstart.md](./quickstart.md)
- refreshed `AGENTS.md` managed plan pointer

## Post-Design Constitution Check

- PASS: The page stays read-only and advisory-only.
- PASS: The page reuses current protected auth instead of creating a new access
  path.
- PASS: The page shows truthful OFF/disabled/read-only states for all AI
  controls.
- PASS: The design adds no mutation action and no provider runtime.
- PASS: Existing assurance routes remain isolated from the new surface.

## Complexity Tracking

No constitution violations or complexity exceptions are required for this plan.
