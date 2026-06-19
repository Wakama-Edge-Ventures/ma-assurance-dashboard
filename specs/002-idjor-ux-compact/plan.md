# Implementation Plan: PHASE 2B.6 - IDJOR Compact Demo UX

**Branch**: `002-idjor-ux-compact` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-idjor-ux-compact/spec.md`

## Summary

Refine the existing `/fr/idjor` page so it reads first as a professional demo
summary and second as a technical registry. The implementation stays strictly
frontend, keeps the same protected backend reads, adds a compact presentation
mode with structured sections and bounded detail containers, and preserves the
existing premium dark/glass dashboard language.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: Existing `PageTitle`, `AppCard`, `AppSection`,
tenant context, protected auth-backed API helper, `lucide-react`

**Storage**: N/A on the frontend; consumes the same protected IDJOR snapshots

**Testing**: `npm run lint` and `npm run build`

**Target Platform**: Local protected dashboard frontend

**Project Type**: Single frontend web application

**Performance Goals**: Improve scanability and reduce apparent page height
without adding extra backend reads or route churn

**Constraints**: No backend change, no route change, no AI activation control,
no provider wiring, no vector client, no business decision control, no
regression on `/fr/applications` or `/fr/applications/[id]`, no “LIVE IA”
wording, no automatic commit

**Scale/Scope**: IDJOR page polish only, with optional route-local wording and
compact section behavior inside current frontend components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: The page remains advisory and read-only.
- PASS: No score, pricing, eligibility, or decision behavior is added.
- PASS: All surfaced AI controls stay OFF, disabled, or read-only.
- PASS: No provider runtime or vector runtime is introduced.
- PASS: The UI remains truthful and does not imply active AI.
- PASS: Existing assurance workflows stay isolated from this polish phase.

## Project Structure

### Documentation (this feature)

```text
specs/002-idjor-ux-compact/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- idjor-compact-ux-surface.md
|-- checklists/
|   `-- requirements.md
|-- tasks.md
`-- validation-log.md
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
|   |-- idjor/
|   |   `-- idjor-foundation-panel.tsx
|   `-- layout/
|       `-- header.tsx
`-- lib/
    `-- api.ts
```

**Structure Decision**: Keep the route entry thin and concentrate UX polish in
`src/components/idjor/idjor-foundation-panel.tsx`, with only minimal shell
wording changes if needed.

## Phase 0: Research

### Research Goals

- Decide how to reduce default page height without losing technical detail.
- Decide whether compact mode should rely on sections, bounded table regions, or
  both.
- Decide how to write demo-friendly wording that remains truthful to the IDJOR
  doctrine.

### Research Outputs

- [research.md](./research.md)

## Phase 1: Design & Contracts

### Design Goals

- Define the executive summary surface and compact section model.
- Define section states for summary, agents, engines, tools, flags,
  providers/models, and security.
- Define bounded detail behavior that preserves access to full registry data.
- Define validation steps proving no AI or backend activation was added.

### Design Outputs

- [data-model.md](./data-model.md)
- [contracts/idjor-compact-ux-surface.md](./contracts/idjor-compact-ux-surface.md)
- [quickstart.md](./quickstart.md)
- refreshed `AGENTS.md` managed plan pointer

## Post-Design Constitution Check

- PASS: The design stays read-only and presentational.
- PASS: The design adds no backend mutation, no provider runtime, and no new API
  route.
- PASS: The design highlights institutional decision authority rather than AI
  autonomy.
- PASS: Detailed technical evidence remains available without making the page
  interminable by default.

## Complexity Tracking

No constitution violations or complexity exceptions are required for this plan.
