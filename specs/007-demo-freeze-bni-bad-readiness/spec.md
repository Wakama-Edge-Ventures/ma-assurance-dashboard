# Feature Specification: DEMO-FREEZE-1 BNI/BAD Demo Readiness Audit

**Feature Branch**: `007-demo-freeze-bni-bad-readiness`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "DEMO-FREEZE-1 — Audit BNI/BAD tenant demo readiness"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Produce a read-only demo-readiness audit (Priority: P1)

As a product and demo owner, I can read a structured audit of the current BNI/BAD demo surfaces so that I know what is already safe to show and what must be neutralized before the demo.

**Why this priority**: The immediate need is decision support for demo preparation, not feature delivery.

**Independent Test**: Open the audit package and confirm it documents the current state of `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, and `/fr/idjor`, including visible wording risks, demo-safe elements, and next-phase file targets.

**Acceptance Scenarios**:

1. **Given** the current frontend state, **When** the audit is read, **Then** it identifies what is demo-ready, what is risky, and what is out of scope for this phase.
2. **Given** a reviewer preparing a BNI or BAD demo, **When** the reviewer uses the audit, **Then** they can derive a concrete pre-demo checklist without changing the product.

---

### User Story 2 - Validate the local frontend baseline without changing behavior (Priority: P2)

As a delivery lead, I can see the current validation status of the frontend so that I know whether the demo risk is primarily technical or editorial.

**Why this priority**: A demo freeze decision must distinguish build/auth/data risks from wording and positioning risks.

**Independent Test**: Review the validation log and confirm it captures the outcomes of `npm run lint`, `npm run build`, and the required text scan.

**Acceptance Scenarios**:

1. **Given** the audit package, **When** a reviewer checks the validation artifacts, **Then** the results of `npm run lint` and `npm run build` are recorded accurately.
2. **Given** the audit package, **When** a reviewer checks the text scan section, **Then** visible occurrences of `Assurance`, `assureur`, `sinistre`, `police`, `DCA`, `RAX`, `IDJOR`, `BNI`, `BAD`, and `LIVE IA` are summarized with actionable interpretation.

---

### User Story 3 - Prepare the next non-functional demo hardening phase (Priority: P3)

As the next-phase implementer, I can use the audit to target only the wording and visibility changes needed for the demo freeze so that we avoid accidental product regressions.

**Why this priority**: The user explicitly wants a read-only audit now and a clear list of files to modify later.

**Independent Test**: Read the report and confirm it lists the next-phase candidate files, the keep/minimize guidance, and a freeze-branch recommendation.

**Acceptance Scenarios**:

1. **Given** the next phase starts after this audit, **When** the implementer reviews the package, **Then** they can identify which files drive shell wording, page hero wording, tenant framing, and IDJOR/RAG exposure.
2. **Given** the user requested no functional changes, **When** the package is reviewed, **Then** it explicitly confirms that no UI behavior, API client behavior, route behavior, or backend behavior changed in this phase.

### Edge Cases

- What happens if the backend is healthy locally but seeded demo data remains visually inconsistent across tenants?
- What happens if the BNI/BAD tenants route to neutral landing surfaces while `/fr/applications` still exposes insurance wording?
- How should the next phase handle read-only IDJOR sections that are truthful but still too technical for a bank/program demo audience?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a documentation-only audit package under `specs/007-demo-freeze-bni-bad-readiness/`.
- **FR-002**: The audit MUST cover `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, and `/fr/idjor`.
- **FR-003**: The audit MUST assess visual tenant readiness for `assurance-ma`, `bni-ci`, `bad-program`, and `wakama`.
- **FR-004**: The audit MUST identify wording that remains too insurance-specific for BNI/BAD demo use, including shell, header, hero, card, disclaimer, and CTA surfaces.
- **FR-005**: The audit MUST identify elements that are safe to keep in the demo, including DCA, documents, hash, audit trail, RAX/WRS as non-decision support, and IDJOR as a proof/audit layer rather than autonomous AI.
- **FR-006**: The audit MUST identify elements to hide, minimize, or de-emphasize in the next phase, including technical RAG modules, metadata registration controls, upload-adjacent intake wording, and any "LIVE IA" style promise.
- **FR-007**: The audit MUST record the outcomes of `npm run lint` and `npm run build`.
- **FR-008**: The audit MUST summarize a source scan for the visible occurrences of `Assurance`, `assureur`, `sinistre`, `police`, `DCA`, `RAX`, `IDJOR`, `BNI`, `BAD`, and `LIVE IA`.
- **FR-009**: The audit MUST recommend whether to create a freeze branch now, later, or not at all.
- **FR-010**: The audit MUST list the files that should be modified in the next phase, without modifying them in this phase.
- **FR-011**: The audit MUST explicitly confirm that no functional product change was performed.
- **FR-012**: The audit MUST NOT modify any UI component behavior, API client behavior, route behavior, authentication behavior, or backend behavior.

### Key Entities *(include if feature involves data)*

- **Critical Demo Route**: One of the required frontend surfaces whose visible state influences demo readiness.
- **Tenant Demo Readiness Finding**: A documented observation linking one tenant-facing surface to a demo risk, a severity, and a recommended next-step.
- **Demo Freeze Checklist Item**: A pre-demo action that can be completed by a delivery or demo owner before audience-facing use.
- **Next-Phase File Target**: A frontend file whose wording or visibility should be adjusted in the follow-up demo-hardening phase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The audit package documents all 5 required routes and all 4 required tenants.
- **SC-002**: The audit package records the exact outcomes of `npm run lint` and `npm run build` from 2026-06-19.
- **SC-003**: The audit package includes at least one explicit "keep", "minimize", and "fix next phase" decision for the IDJOR surface.
- **SC-004**: The audit package includes a clear pre-demo checklist and a concrete next-phase file list.
- **SC-005**: The audit package states unambiguously that no functional change was made during this phase.

## Assumptions

- The backend remains out of scope and must not be modified for this phase.
- Local backend validation for seeded data may be performed separately by the user if needed, using the provided `DATABASE_URL` and seed instructions.
- Demo readiness is currently limited more by visible wording and surface framing than by frontend build health.
- A subsequent phase may change wording, visibility, and emphasis, but must preserve `/fr/applications` and `/fr/applications/[id]` behavior.
