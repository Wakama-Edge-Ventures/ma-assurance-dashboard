# Feature Specification: IDJOR Compact Demo UX

**Feature Branch**: `002-idjor-ux-compact`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "PHASE 2B.6 — Polish UX IDJOR dashboard + compact demo mode"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the executive summary quickly (Priority: P1)

As a demo viewer or institutional stakeholder, I can understand the IDJOR foundation status from the top of the page so that I do not need to scan the full technical registry before grasping the message.

**Why this priority**: The main problem is page density. A strong executive summary is the highest-value UX improvement for BAD, BNI, and Rabii demo flows.

**Independent Test**: Open `/fr/idjor` and confirm the first screen clearly states that the technical foundation is ready, the registry is read-only, LLM is OFF, vector store is OFF, decisioning is OFF, and the institution remains the decision-maker.

**Acceptance Scenarios**:

1. **Given** the IDJOR page loads successfully, **When** the user lands on the page, **Then** the top area presents a simple professional executive summary before the technical details.
2. **Given** the backend reports disabled AI controls, **When** the executive summary renders, **Then** it presents those controls as OFF without implying active AI.

---

### User Story 2 - Navigate technical detail in a compact layout (Priority: P2)

As a dashboard user, I can move through the registry details by section so that the page stays compact while the technical depth remains accessible.

**Why this priority**: The current page already contains the right information, but it is too long and visually dense. Sectioning and compact containers solve that directly.

**Independent Test**: Open `/fr/idjor`, confirm the page is broken into Synthese, Agents, Moteurs, Tools, Flags, Providers / Models, and Securite, and verify that default page height is reduced through collapsible or internally scrollable sections.

**Acceptance Scenarios**:

1. **Given** the user wants a compact overview, **When** the page renders in compact mode, **Then** only the summary and high-signal sections are expanded by default while detailed sections stay available on demand.
2. **Given** the user needs technical evidence, **When** the user expands a section, **Then** the relevant tables and security details remain visible without requiring a separate route or backend call.

---

### User Story 3 - Keep the premium dashboard experience coherent (Priority: P3)

As an assurance dashboard user, I can use the polished IDJOR page without degrading the current premium shell or other protected workflows so that the new UX feels native and safe.

**Why this priority**: The polish should improve presentation quality without causing regressions on the rest of the dashboard.

**Independent Test**: Navigate between `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]`, and confirm the protected shell, routing, and wording remain intact.

**Acceptance Scenarios**:

1. **Given** the user opens `/fr/idjor`, **When** the refined page renders, **Then** it preserves the premium dark/glass design language already used by the dashboard.
2. **Given** the user returns to assurance flows, **When** the user opens applications list and detail pages, **Then** those routes continue to behave as before with no new decision or activation controls.

### Edge Cases

- What happens when the page is in compact mode and a section has no visible rows for the current role?
- How does the page behave when the backend returns an error while the compact summary shell still needs to stay readable?
- How does the compact layout behave on narrow screens where section controls and badges have less horizontal space?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST keep `/fr/idjor` read-only and backed by the existing protected backend routes only.
- **FR-002**: The system MUST present a top-level executive summary card that clearly states the technical foundation is ready, the registry is read-only, LLM is OFF, vector store is OFF, decisioning is OFF, and the institution remains decision-maker.
- **FR-003**: The system MUST present a simple professional demo wording at the top of the page that is understandable to non-technical viewers.
- **FR-004**: The system MUST organize the page into clear sections covering Synthese, Agents, Moteurs, Tools, Flags, Providers / Models, and Securite.
- **FR-005**: The system MUST reduce default vertical density through compact mode behavior, collapsible sections, internal scrolling regions, or equivalent layout constraints.
- **FR-006**: The system MUST keep technical tables and registry details accessible without adding any backend route or API change.
- **FR-007**: The system MUST preserve the premium dark/glass design language of the existing protected dashboard.
- **FR-008**: The system MUST NOT add any LLM provider wiring, vector store wiring, activation button, decision button, scoring button, pricing button, eligibility button, policy button, or claim decision button.
- **FR-009**: The system MUST NOT display “LIVE IA” or any equivalent wording for the registry-only foundation surface.
- **FR-010**: The system MUST NOT modify backend code, frontend API contracts, or existing assurance routes outside the IDJOR presentation surface unless required for safe navigation wording.
- **FR-011**: The system MUST keep `/fr/applications` and `/fr/applications/[id]` working as before.
- **FR-012**: The system MUST run `npm run lint` and `npm run build` and report the results.

### Key Entities *(include if feature involves data)*

- **Executive Summary View**: Condensed top-of-page presentation of the current IDJOR technical readiness and disabled-control posture.
- **Compact Section View**: Structured, optionally collapsed presentation layer for registry categories such as agents, engines, tools, flags, providers/models, and security.
- **Section Visibility State**: Client-side UI state that controls compact mode and expanded/collapsed visibility without changing backend data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A stakeholder can identify the five core executive facts on `/fr/idjor` within the first viewport without scrolling through registry tables.
- **SC-002**: The default rendered page height is materially reduced by moving detailed tables behind compact sections or bounded scroll containers while keeping all data accessible.
- **SC-003**: All required technical categories remain reachable on the same page in 100% of successful backend responses.
- **SC-004**: The page does not introduce any AI activation, business decision, or backend mutation control.
- **SC-005**: Repository validation completes with both `npm run lint` and `npm run build` passing.

## Assumptions

- The existing `/fr/idjor` data contract remains valid and does not need backend changes for this phase.
- Compact mode can be implemented entirely in the frontend presentation layer.
- Existing dark/glass design primitives are sufficient for the polish without adding a new visual system.
- A lightweight change to route-specific header or section behavior is acceptable if it improves clarity and does not affect assurance workflows.
