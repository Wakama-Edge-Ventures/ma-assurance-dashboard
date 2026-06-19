# Research: PHASE 2B.6 - IDJOR Compact Demo UX

## Decision: Use a compact executive-first layout with collapsible detail sections

**Rationale**: The page already has the right data. The UX problem is density,
not missing information. Leading with an executive summary and moving deeper
catalogues into collapsible sections keeps the same truth while reducing scroll
fatigue.

**Alternatives considered**:

- Remove technical detail entirely: rejected because the user explicitly wants
  all information to remain available.
- Split the page into multiple routes: rejected because the request asks for a
  polish of `/fr/idjor`, not a new navigation tree.

## Decision: Bound the largest data blocks with internal scroll containers

**Rationale**: Registry tables are the main source of excessive height. Internal
scroll areas keep them accessible without letting a single section dominate the
entire page.

**Alternatives considered**:

- Paginate registry data: rejected because it adds unnecessary interaction for a
  read-only demo surface.
- Truncate data aggressively: rejected because technical detail must remain
  available.

## Decision: Add a dedicated compact demo mode toggle

**Rationale**: A user-controlled compact mode makes demo presentation cleaner
without preventing a more detailed technical review.

**Alternatives considered**:

- One fixed layout for everyone: rejected because demo and technical review have
  different scan patterns.
- Compact mode only for demo tenants: rejected because the page benefits from
  the same UX improvement for assurance review as well.

## Decision: Keep wording simple and institutional at the top

**Rationale**: The first viewport should read like a professional institutional
brief, not like an internal registry dump. This aligns with the IDJOR doctrine
and demo needs.

**Alternatives considered**:

- Lead with technical registry counts only: rejected because it does not solve
  the non-technical readability problem.
- Use stronger “live AI” language for impact: rejected because it would be
  untruthful for this read-only registry surface.
