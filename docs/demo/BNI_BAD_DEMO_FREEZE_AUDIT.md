# BNI/BAD Demo Freeze Audit

**Repo**: `ma-assurance-dashboard`

**Phase**: `DEMO-FREEZE-1`

**Date**: 2026-06-19

## Executive Verdict

- Local frontend technical status: **READY**
- BNI/BAD narrative and visual demo status: **NOT READY**
- Recommended branch strategy: **do not freeze the demo branch yet**

The application currently passes `npm run lint` and `npm run build`, so the local frontend baseline is stable. The blocker is not product behavior. The blocker is visible positioning: too much assurance wording remains on shared or critical surfaces, and `/fr/idjor` still exposes technical RAG and metadata-only controls that are truthful but too dense for a BNI/BAD demo.

## What Was Audited

- Routes:
  - `/fr/login`
  - `/fr/dashboard`
  - `/fr/applications`
  - `/fr/applications/[id]`
  - `/fr/idjor`
- Shared surfaces:
  - `src/components/layout/sidebar.tsx`
  - `src/components/layout/header.tsx`
  - `src/components/auth/login-page-client.tsx`
  - `src/components/tenant/TenantDashboardLanding.tsx`
  - `src/components/ui/app-page-header.tsx`
  - `src/config/tenants.ts`
- Product context:
  - `docs/idjor/Wakama_IDJOR_Master_Plan.md`
  - `specs/001-idjor-foundation-dashboard/spec.md`
  - `specs/006-idjor-rag-audit-trail/spec.md`

## Validation Results

- `npm run lint`: PASS
- `npm run build`: PASS
- Forbidden wording scan on `src/`: completed

This means the freeze risk is editorial and demo-journey related, not a current frontend compile or lint failure.

## Route Readiness

| Route | Status | Audit Note |
|---|---|---|
| `/fr/login` | Conditional | Multi-tenant framing exists for BNI/BAD, but backend/auth error wording still says `backend assurance`. |
| `/fr/dashboard` | Not ready | The assurance dashboard hero is strongly insurance-branded and contains `Live`, `Wakama Assurance`, `Risk Oracle`, `Polices`, `Sinistres`, and `RAX / WRS` emphasis. |
| `/fr/applications` | Conditional | Read-only behavior is good, but the assurance tenant wording is explicit and the DCA framing is still product-internal. |
| `/fr/applications/[id]` | Conditional | Strong proof/audit value, but many assurance-domain labels remain visible, especially around DCA, sinistres, side effects, and insurer disclaimers. |
| `/fr/idjor` | Not ready | The read-only proof posture is strong, but technical RAG sections, metadata registration form, chunks/citations, and dense control-plane detail should be minimized for a BNI/BAD demo. |

## Tenant Readiness

| Tenant | Status | Audit Note |
|---|---|---|
| `assurance-ma` | Ready for assurance demo | Current product framing matches this tenant best. |
| `bni-ci` | Partially ready | Tenant configuration and dashboard landing are promising, but shared assurance wording still leaks through critical surfaces. |
| `bad-program` | Partially ready | Tenant framing is coherent, but the app still reveals assurance-oriented shell and IDJOR technical depth. |
| `wakama` | Partially ready | Useful as a neutral fallback, but still carries live/control-plane language that can overstate maturity if shown carelessly. |

## Keep For Demo

- DCA as dossier intake and evidence packaging
- Documents and documentary proof
- Hash and integrity narrative
- Audit trail and append-only traceability
- RAX/WRS only as non-decision analysis support
- IDJOR only as governance, proof, and audit layer
- Repeated statement that the institution remains sole decision-maker

## Hide Or Minimize Next Phase

- Technical RAG subsections on `/fr/idjor`
- Metadata registration controls on `/fr/idjor`
- Chunk and citation tables unless explicitly requested
- Any wording that implies autonomous AI, live AI, or bank-native completeness
- Assurance-only hero language on `/fr/dashboard`
- Overexposed `Live` badges where they are not necessary for the demo story

## Main Findings

### 1. `/fr/dashboard` is the biggest BNI/BAD demo blocker

The dashboard route is effectively hard-switched to `TenantDashboardLanding` for non-`assurance-ma` tenants, which is good. However, the assurance dashboard implementation remains highly branded around:

- `Wakama Assurance · Risk Oracle`
- `Live agricultural risk intelligence`
- `Polices`
- `Sinistres`
- `RAX / WRS synthesis`

This route should not be used as-is for a BNI/BAD audience if the tenant context can accidentally fall back to `assurance-ma`.

### 2. Shared shell wording still leaks assurance posture

The sidebar and header are partially tenant-aware, but several shared labels remain too product- or insurance-specific:

- `Socle IDJOR`
- `Telemetrie en direct`
- generic `Live` status pill
- `Assurance Command Center` in shared page-header utility
- `Assurance LIVE` / `SEED_DEMO` badge in shared page-header utility

These are prime next-phase targets because they affect many screens at once.

### 3. `/fr/idjor` is truthful but too technical for the target demo

The good news:

- the page clearly says read-only
- it repeatedly says IDJOR does not decide
- audit-trail positioning is strong

The problem:

- the page still contains metadata-only registration controls
- it exposes RAG health, chunks, citations, and preview internals
- it is easy to drift from proof/governance storytelling into technical architecture storytelling

For BNI/BAD demo use, `/fr/idjor` should be narrowed to proof, audit, documentary base, and governance indicators only.

### 4. `/fr/applications` and `/fr/applications/[id]` are usable with controlled narration

These surfaces already have strong read-only and non-decision disclaimers. They are good demo candidates because they preserve the key story:

- intake dossier
- documents
- status progression
- traceability
- no hidden side effects

They still need wording cleanup in a follow-up phase, but they are closer to demo-safe than `/fr/dashboard` and `/fr/idjor`.

### 5. Login is visually acceptable, but backend wording needs cleanup

`/fr/login` already adapts its title and description by tenant, which is a strong base for the demo. The remaining issue is support/error wording such as:

- `Identifiants invalides pour le backend assurance.`
- `Acces refuse pour ce compte cote backend assurance.`
- `Impossible de contacter le backend assurance.`

This is not a functional problem, but it breaks the BNI/BAD narrative.

## Files To Modify In The Next Phase

Priority 1:

- `src/app/fr/(protected)/dashboard/page.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/idjor/idjor-foundation-panel.tsx`
- `src/components/ui/app-page-header.tsx`

Priority 2:

- `src/app/fr/(protected)/applications/page.tsx`
- `src/app/fr/(protected)/applications/[id]/page.tsx`
- `src/components/auth/login-page-client.tsx`
- `src/config/tenants.ts`
- `src/components/tenant/TenantDashboardLanding.tsx`

## Checklist Before Demo

- Use tenant `bni-ci` or `bad-program` for the external demo.
- Do not demo with `assurance-ma` unless the audience is explicitly assurance-focused.
- Keep the walkthrough centered on dossiers, documents, proof, hash, and audit trail.
- Present `RAX/WRS` only as a non-decision analytic aid.
- Present `IDJOR` only as a proof, governance, and audit layer.
- Avoid opening the technical RAG sections on `/fr/idjor`.
- Avoid any claim that the banking or program workflow is already fully native end-to-end.
- Validate backend seed state locally before demo if live backend-backed reads are required.

## Freeze Recommendation

**Recommendation: no freeze branch yet.**

Rationale:

- The product is technically stable enough to support a demo hardening pass.
- The current state is not visually neutral enough for a BNI/BAD audience.
- Freezing now would lock in wording and surface-exposure issues that are already known and localized.

Suggested next step:

- Create a short-lived demo-hardening branch after this audit.
- Limit that phase to wording neutralization and visibility minimization only.
- Re-run `lint`, `build`, and the wording scan.
- Freeze only after that pass is validated.

## Functional Change Confirmation

No functional product change was made during this phase.

- No UI behavior was changed
- No API client was changed
- No route was changed
- No backend was changed
- No commit was created automatically
