# Feature Specification: IDJOR Foundation Dashboard

**Feature Branch**: `001-idjor-foundation-dashboard`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "PHASE 2B.5 — Connect assurance dashboard to IDJOR registry read-only"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the IDJOR foundation state (Priority: P1)

As an authenticated assurance analyst, I can open a protected IDJOR page and see the current tenant foundation status so that I can verify the seeded control-plane baseline without activating any AI capability.

**Why this priority**: This is the core value of the phase. Without a protected read-only view of the tenant-scoped IDJOR state, the dashboard is not connected to the new backend foundation surface.

**Independent Test**: Sign in with an account that already has read access, open the protected IDJOR page, and confirm the page shows the current tenant, read-only status, disabled AI controls, and tenant-scoped registry counts from the backend.

**Acceptance Scenarios**:

1. **Given** an authenticated reader whose request scope resolves to a single tenant, **When** the user opens the IDJOR page, **Then** the page shows the tenant foundation health summary, including read-only status and disabled AI controls, without any activation controls.
2. **Given** an authenticated reader with a selected tenant key, **When** the IDJOR page loads the registry snapshot, **Then** the page shows the tenant, agents, engines, tools, feature flags, providers, models, and allowed source labels returned by the protected foundation surface.

---

### User Story 2 - Understand degraded or blocked access safely (Priority: P2)

As an authenticated assurance analyst, I can understand why the IDJOR foundation data is unavailable or incomplete so that I can continue safely without mistaking a protected error for active AI behavior.

**Why this priority**: This phase is local-only and protected. Clear loading and error states prevent confusion, avoid false "live AI" signals, and keep the dashboard honest about backend access or tenant resolution issues.

**Independent Test**: Trigger at least one protected failure mode, such as a missing tenant resolution or backend unavailability, and confirm the page shows a clear read-only explanation rather than blank content or AI activation wording.

**Acceptance Scenarios**:

1. **Given** the protected IDJOR surface returns an auth, scope, tenant, or network error, **When** the page renders, **Then** the user sees a clear loading or error state with read-only wording and no decisioning or activation controls.
2. **Given** the backend returns a valid foundation snapshot with disabled controls, **When** the page renders, **Then** the page does not label the foundation view as live AI and does not imply any active model, vector store, or automated decision flow.

---

### User Story 3 - Keep the dashboard experience coherent (Priority: P3)

As an assurance dashboard user, I can access the IDJOR foundation view inside the existing premium protected shell so that the new surface feels native and does not disrupt current assurance workflows.

**Why this priority**: The new read-only surface must fit the current dashboard, preserve navigation quality, and avoid regressions on existing applications and detail pages.

**Independent Test**: Navigate between the new IDJOR page, `/fr/applications`, and `/fr/applications/[id]`, and confirm the shell, design language, and existing flows remain intact.

**Acceptance Scenarios**:

1. **Given** the user is inside the protected dashboard shell, **When** the user navigates to the IDJOR view, **Then** the page uses the existing premium layout, sidebar, and header patterns while clearly signaling a read-only preparatory foundation.
2. **Given** the user returns to existing assurance flows, **When** the user opens applications list and detail pages, **Then** those pages continue to behave as before with no added decision or AI activation controls.

### Edge Cases

- What happens when the protected request scope cannot infer a unique tenant and no `tenantKey` is supplied?
- How does the system handle a protected response where the foundation surface is reachable but returns zero visible tools for the current role?
- How does the page behave when the backend is configured but unreachable on the local base URL?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a protected IDJOR foundation view within the existing French protected dashboard surface.
- **FR-002**: The system MUST use the dashboard's existing authentication, protected-session, and API base URL behavior to call the protected IDJOR foundation endpoints.
- **FR-003**: The system MUST read and display the tenant-scoped foundation health summary, including current tenant identity, read-only status, disabled AI controls, allowed source labels, and registry counts.
- **FR-004**: The system MUST read and display the tenant-scoped registry snapshot, including agents, engines, tools, feature flags, providers, and models returned by the backend.
- **FR-005**: The system MUST present all provider, model, vector, LLM, and decisioning states as disabled or read-only when that is how the backend reports them.
- **FR-006**: The system MUST present loading, protected-error, tenant-resolution, and unavailable-backend states with clear non-decisioning wording.
- **FR-007**: The system MUST preserve the current premium design language of the protected shell, sidebar, header, and page cards.
- **FR-008**: The system MUST NOT add any LLM provider wiring, vector store wiring, AI decision trigger, pricing trigger, scoring trigger, or activation control.
- **FR-009**: The system MUST NOT modify the existing DCA assurance workflows or break `/fr/applications` and `/fr/applications/[id]`.
- **FR-010**: The system MUST keep all IDJOR wording aligned with a preparatory, read-only foundation and MUST NOT label the foundation surface as live AI when it only reflects registry or foundation data.
- **FR-011**: The system MUST support local-only validation using the dashboard's configured backend base URL and document that the backend foundation surface is expected under `/v1`.
- **FR-012**: The system MUST run the repository validation commands that already exist for this frontend surface and report the results with the implementation.

### Key Entities *(include if feature involves data)*

- **Foundation Health Snapshot**: Tenant-scoped read-only summary containing tenant identity, registry counts, disabled-control booleans, allowed source labels, read-only markers, and tenant resolution mode.
- **Foundation Registry Snapshot**: Tenant-scoped catalog response containing agents, engines, tools, feature flags, providers, models, read-only markers, and security summary fields.
- **Foundation View State**: Protected page state covering loading, success, auth/scope failure, tenant-resolution failure, and backend-unavailable outcomes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated user with existing read access can open the protected IDJOR page and see the tenant-scoped foundation summary in one navigation flow without leaving the dashboard shell.
- **SC-002**: The protected IDJOR page displays explicit disabled or read-only status for LLM, vector store, and decisioning controls in 100% of successful backend responses.
- **SC-003**: The protected IDJOR page provides a visible loading or explanatory error state for 100% of backend unavailability, auth, scope, or tenant-resolution failures observed during local validation.
- **SC-004**: Existing `/fr/applications` and `/fr/applications/[id]` flows continue to load successfully after the feature is added.
- **SC-005**: Local validation completes with the repository's existing lint and build commands passing before the phase is reported complete.

## Assumptions

- The existing dashboard session and backend token/cookie handling remain the source of truth for protected API access.
- The local backend foundation surface is already available and remains read-only; this phase does not require backend changes.
- The new user-facing entry point can be a dedicated protected page under `/fr/idjor` without changing current applications routes.
- The backend response contract for tenant-scoped health and registry data remains aligned with the current protected foundation surface already implemented in the local backend.
