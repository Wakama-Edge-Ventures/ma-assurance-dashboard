# Feature Specification: DEMO-FREEZE-3 Final Validation and Freeze Recommendation

**Feature Branch**: `009-demo-freeze-final-validation`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "DEMO-FREEZE-3 — Final validation and freeze recommendation for BNI/BAD demo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decide whether the BNI/BAD demo can freeze (Priority: P1)

As a delivery owner, I can review a single final validation package with technical evidence and a freeze verdict so that I can decide whether the demo branch is ready to freeze.

**Why this priority**: The phase exists to convert prior audit and wording work into a final go or no-go recommendation.

**Independent Test**: Review the final validation report and confirm it states a clear verdict, supporting evidence, remaining risks, and a recommended demo sequence.

**Acceptance Scenarios**:

1. **Given** the prior demo-hardening phase is complete, **When** the final validation is run, **Then** the report records whether the repository is `READY_FOR_FREEZE` or `NOT_READY`.
2. **Given** remaining domain wording still exists elsewhere in the repository, **When** the final report is reviewed, **Then** those occurrences are classified as voluntary or out of scope rather than treated as unexplained blockers.

---

### User Story 2 - Confirm critical routes and tenant framing remain demo-safe (Priority: P2)

As a demo presenter, I can confirm the critical routes and visual tenants remain coherent after the wording pass so that I can present BNI/BAD as a frontend adaptation, not a fictional backend launch.

**Why this priority**: The freeze decision depends on preserving the demo story across routes, tenants, and IDJOR positioning.

**Independent Test**: Review the specified frontend files and the build route output, then confirm the critical routes are present and the tenant wording remains compatible for `assurance-ma`, `bni-ci`, `bad-program`, and `wakama`.

**Acceptance Scenarios**:

1. **Given** the shared shell and DCA routes were neutralized previously, **When** the final validation reviews the source files, **Then** BNI/BAD wording stays institution-first while `assurance-ma` remains functional.
2. **Given** `/fr/idjor` is opened for a demo tenant, **When** the final validation reviews its current behavior, **Then** the route remains proof-, document-, hash-, and journal-first without promising autonomous AI.

### Edge Cases

- What happens if critical routes still build successfully but residual assurance vocabulary remains elsewhere in the repository?
- What happens if the shared demo surfaces are clean but assurance-only routes still contain truthful assurance wording?
- What happens if BNI/BAD wording implies a complete native banking backend instead of a frontend tenant adaptation?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a new Spec Kit feature package under `specs/009-demo-freeze-final-validation/`.
- **FR-002**: The system MUST create `docs/demo/BNI_BAD_DEMO_FREEZE_FINAL.md`.
- **FR-003**: The system MUST run `npm run lint` and record the result.
- **FR-004**: The system MUST run `npm run build` and record the result.
- **FR-005**: The system MUST record whether `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, and `/fr/idjor` are present in the generated route output.
- **FR-006**: The system MUST review the current tenant wording posture for `assurance-ma`, `bni-ci`, `bad-program`, and `wakama`.
- **FR-007**: The system MUST confirm `/fr/idjor` remains demo-safe around proofs, audit, documents, hash, and journal.
- **FR-008**: The system MUST confirm the final documentation does not claim autonomous AI, native banking backend completeness, or a changed backend capability.
- **FR-009**: The system MUST scan `src/` for `LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, and `ingérer`, and record the outcome.
- **FR-010**: The system MUST scan `src/` for `assurance`, `assureur`, `sinistre`, `police`, `banque`, `BNI`, and `BAD`, and document remaining occurrences as voluntary or out of scope.
- **FR-011**: The system MUST confirm `RAX/WRS` remains positioned as non-decision analysis support.
- **FR-012**: The system MUST confirm `IDJOR` remains positioned as a proof, audit, and documentary layer.
- **FR-013**: The system MUST confirm `assurance-ma` remains functional as the default assurance-oriented tenant.
- **FR-014**: The system MUST state whether BNI/BAD are presented as frontend tenant adaptations rather than complete backend implementations.
- **FR-015**: The system MUST provide a final verdict of `READY_FOR_FREEZE` or `NOT_READY`.
- **FR-016**: The system MUST provide a five-step recommended demo script.
- **FR-017**: The system MUST confirm that no functional product change was made during this phase.
- **FR-018**: The system MUST NOT modify UI components, routes, API clients, auth, backend, or business logic during this phase.

### Key Entities *(include if feature involves data)*

- **Freeze Verdict**: The final documented recommendation stating whether the repository is ready to freeze for the BNI/BAD demo.
- **Residual Domain Term**: A remaining occurrence of domain vocabulary that is intentionally preserved because it belongs to assurance-specific routes, demo seed content, tenant identity, or truthful workflow wording outside the hardened shared demo surfaces.
- **Demo-Safe Route Posture**: A route-level presentation that keeps the story centered on dossiers, documents, audit, hash, and non-decision risk support.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm run lint` and `npm run build` both pass during the final validation run.
- **SC-002**: The generated route output includes `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, and `/fr/idjor`.
- **SC-003**: The prohibited wording scan finds no visible occurrences of `LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, or `ingérer`.
- **SC-004**: Remaining occurrences of `assurance`, `assureur`, `sinistre`, `police`, `banque`, `BNI`, and `BAD` are documented with rationale.
- **SC-005**: The final report provides a clear freeze verdict, remaining risks, a five-step demo script, and an explicit confirmation that no functional change was made in this phase.

## Assumptions

- The freeze decision is based on current frontend state plus documentary evidence, not on new feature implementation.
- Residual assurance vocabulary outside the hardened demo surfaces is acceptable if it is documented and not used to narrate the BNI/BAD demo.
- BNI/BAD demo readiness depends on positioning the current frontend as a tenant adaptation rather than a claim of native backend banking completeness.
