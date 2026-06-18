# Research: PHASE 2B.5 - IDJOR Foundation Read-Only Dashboard

## Decision: Fetch the IDJOR surface client-side inside the protected shell

**Rationale**: The dashboard already restores authenticated browser sessions and
stores the live session identity on the client. Fetching the new foundation
surface from a client component reuses the current cookie/token behavior and
avoids inventing a parallel server-side credential forwarding path.

**Alternatives considered**:

- Fetch in a server component: rejected because the current dashboard auth model
  is browser-restored and would require extra assumptions about forwarding
  protected backend credentials.
- Add a new proxy route in the frontend: rejected because the phase forbids
  unnecessary new surfaces and the existing API helper is sufficient.

## Decision: Extend the existing general API helper with new read-only functions

**Rationale**: `src/lib/api.ts` already handles protected fetches, auth token
  reuse, retry behavior, and session-expiry handling. Extending that helper
  keeps the new feature aligned with the current dashboard patterns.

**Alternatives considered**:

- Add an AI-specific frontend client: rejected because the phase explicitly
  forbids provider wiring and the endpoints are not a live AI runtime.
- Hardcode `fetch` calls in the component: rejected because it would duplicate
  auth and error handling logic.

## Decision: Add a dedicated `/fr/idjor` page and explicit navigation entry

**Rationale**: A standalone protected page makes the foundation state easy to
  demo, easy to isolate, and low-risk for existing assurance workflows.

**Alternatives considered**:

- Fold the content into `/fr/dashboard`: rejected because the assurance dashboard
  already serves a broader mixed telemetry role and the IDJOR foundation needs a
  clearer read-only framing.
- Add the content to `/fr/settings`: rejected because the phase is about a new
  tenant-scoped control-plane status surface, not insurer settings.

## Decision: Replace generic "Live" wording on the IDJOR route with read-only foundation wording

**Rationale**: The current protected header shows a generic live badge on most
  pages. On the IDJOR route that would overstate the surface and conflict with
  the requirement to avoid implying active AI behavior.

**Alternatives considered**:

- Leave the existing live badge unchanged: rejected because it can be read as
  "live AI" for a registry-only foundation page.
- Remove all live badges globally: rejected because other existing views still
  use them legitimately.

## Decision: Do not add a demo fallback for this page

**Rationale**: The user asked for a local-only connection to the real protected
  backend surface. If the backend is unavailable or tenant resolution fails, the
  UI should say so clearly instead of simulating a foundation state.

**Alternatives considered**:

- Seed demo fallback for IDJOR: rejected because it would blur the boundary
  between the true backend foundation surface and illustrative data.
