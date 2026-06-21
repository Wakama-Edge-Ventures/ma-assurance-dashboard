# Feature Specification: DEMO-FREEZE-2 Neutral Tenant Wording

**Feature Branch**: `008-demo-freeze-neutral-wording`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "DEMO-FREEZE-2 — Neutraliser wording et visibilité pour démo BNI/BAD"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read shared surfaces without assurance leakage (Priority: P1)

As a BNI/BAD demo audience member, I can navigate the shared shell and key routes without seeing avoidable assurance-only wording so that the demo feels institutionally credible.

**Why this priority**: Shared wording is the biggest remaining freeze blocker because it appears across multiple critical screens.

**Independent Test**: Open `/fr/login`, `/fr/dashboard`, `/fr/applications`, and `/fr/applications/[id]` with visual tenants `bni-ci`, `bad-program`, and `wakama`, and confirm the wording is institutionally neutral while `assurance-ma` remains coherent.

**Acceptance Scenarios**:

1. **Given** a non-assurance demo tenant, **When** the user opens a shared surface, **Then** the UI avoids unnecessary `assureur` and `assurance` wording in shared labels and disclaimers.
2. **Given** the default assurance tenant, **When** the user opens the same surfaces, **Then** the UI still reads as assurance-oriented without breaking route behavior.

---

### User Story 2 - Keep IDJOR demo-safe and non-technical (Priority: P2)

As a demo presenter, I can open `/fr/idjor` and keep the story focused on documents, proof, hash, and audit so that I do not expose technical RAG/LLM internals unless explicitly needed.

**Why this priority**: The previous audit identified `/fr/idjor` as truthful but too technical for BNI/BAD demo use.

**Independent Test**: Open `/fr/idjor` for demo tenants and confirm the route emphasizes documents, audit, hash, and read-only posture while minimizing technical registration, preview, chunk, citation, provider, and model surfaces.

**Acceptance Scenarios**:

1. **Given** a demo tenant, **When** `/fr/idjor` loads, **Then** the route foregrounds proof and audit wording and minimizes technical RAG controls and catalogs.
2. **Given** any tenant, **When** `/fr/idjor` is reviewed, **Then** the page never suggests autonomous AI, live AI, vector store activation, or institutional backend completeness.

---

### User Story 3 - Prepare the repository for freeze validation (Priority: P3)

As a delivery lead, I can validate the freeze hardening pass with lint, build, and wording scans so that I can decide whether the repository is ready to freeze.

**Why this priority**: Freeze readiness depends on both product stability and narrative cleanup.

**Independent Test**: Run `npm run lint`, `npm run build`, the prohibited phrase scan, and the residual domain-term scan, then review the recorded results.

**Acceptance Scenarios**:

1. **Given** the hardening pass is complete, **When** the validation commands run, **Then** the repository still passes lint and build.
2. **Given** the wording scans run, **When** the results are reviewed, **Then** prohibited AI-language is absent and residual assurance-domain terms are explainable as intentional.

### Edge Cases

- What happens if a non-assurance tenant still lands on shared components that contain fallback assurance copy?
- What happens if `/fr/idjor` remains truthful but still shows too many backend-internal readiness markers for a business audience?
- What happens if neutralizing wording accidentally weakens the assurance-ma experience or breaks `/fr/applications` and `/fr/applications/[id]`?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST create a new Spec Kit feature package under `specs/008-demo-freeze-neutral-wording/`.
- **FR-002**: The frontend MUST neutralize shared wording that is unnecessarily assurance-specific on `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, and shared shell surfaces.
- **FR-003**: The frontend MUST preserve `assurance-ma` as the default assurance-oriented visual case.
- **FR-004**: The frontend MUST support tenant-aware wording for `assurance-ma`, `bni-ci`, `bad-program`, and `wakama` without modifying auth, routes, backend, or API behavior.
- **FR-005**: The frontend MUST prefer `institution` wording over `assureur` on shared multi-tenant surfaces.
- **FR-006**: The frontend MUST keep `DCA` visible as the documentary intake concept for the demo.
- **FR-007**: The frontend MUST present `RAX/WRS` as a non-decision risk analysis aid.
- **FR-008**: The frontend MUST present `IDJOR` as a proof, audit, and documentary layer rather than an autonomous AI.
- **FR-009**: The frontend MUST reduce technical exposure on `/fr/idjor` for demo tenants, especially metadata registration, preview internals, chunks, citations, providers, and models when they are not needed for the demo story.
- **FR-010**: The frontend MUST NEVER display `LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, or `ingérer` as user-facing demo prompts.
- **FR-011**: The frontend MUST NOT promise a bank-native backend that does not exist.
- **FR-012**: The system MUST preserve route behavior for `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, and `/fr/idjor`.
- **FR-013**: The system MUST run `npm run lint`, `npm run build`, a prohibited phrase scan, and a residual domain-term scan before reporting completion.
- **FR-014**: The system MUST NOT modify backend code, auth behavior, API contracts, business calculations, LLM behavior, vector store behavior, embeddings, uploads, or parsing.

### Key Entities *(include if feature involves data)*

- **Tenant Visual Wording Surface**: A shared or route-level UI surface whose labels, notes, and badges change the perceived institutional positioning of the product.
- **Demo-Safe IDJOR Surface**: A read-only presentation mode of `/fr/idjor` that emphasizes documents, proof, hash, and audit while de-emphasizing technical internals.
- **Residual Domain Term**: A remaining occurrence of assurance-domain vocabulary that is kept intentionally because it reflects route truth, backend entity naming, or the assurance-ma primary use case.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Shared shell, login, applications, and application-detail wording are tenant-aware and no longer rely on avoidable `assureur` wording for BNI/BAD demo use.
- **SC-002**: `/fr/idjor` opens in a demo-safe, proof-first presentation for demo tenants without exposing the metadata registration form or chunk/citation/provider/model sections.
- **SC-003**: `npm run lint` and `npm run build` both pass after the hardening pass.
- **SC-004**: The prohibited scan finds no visible occurrences of `LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, or `ingérer`.
- **SC-005**: Residual occurrences of `assureur`, `assurance`, `sinistre`, `police`, `banque`, `BNI`, and `BAD` are documented and justified.

## Assumptions

- Demo tenants should emphasize institutional proof, portfolio, and documentary workflows rather than backend insurance internals.
- Some assurance-domain terms may remain intentionally where they are route-truthful, backend-traceable, or required for the assurance-ma default case.
- The demo hardening pass should stay strictly frontend-only.
