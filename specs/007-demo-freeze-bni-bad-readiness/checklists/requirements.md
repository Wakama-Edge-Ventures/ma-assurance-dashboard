# Requirements Checklist: DEMO-FREEZE-1 - BNI/BAD Demo Readiness Audit

**Purpose**: Validate audit completeness and provide the pre-demo action list

**Created**: 2026-06-19

**Feature**: [spec.md](../spec.md)

## Audit Completeness

- [x] All mandatory context files were reviewed before reporting
- [x] All critical routes were assessed: `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, `/fr/idjor`
- [x] All required tenants were assessed: `assurance-ma`, `bni-ci`, `bad-program`, `wakama`
- [x] Validation results for `npm run lint` and `npm run build` were recorded
- [x] Wording scan results were summarized for the requested keywords

## Pre-Demo Checklist

- [ ] Confirm backend uses `postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public` before any local backend validation
- [ ] Run `npm run seed:assurance-admin` in `wakama-backend`
- [ ] Run `npm run seed:idjor-foundation` in `wakama-backend`
- [ ] Restart backend with `PORT=4000 DATABASE_URL="postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public" npm run dev`
- [ ] Demo on `bni-ci` or `bad-program`, not `assurance-ma`, for external audience walkthroughs
- [ ] Avoid showing `/fr/dashboard` in its current state to BNI/BAD audiences until wording neutralization is done
- [ ] Avoid opening technical RAG subsections on `/fr/idjor` during the demo unless the audience explicitly asks for audit-proof internals
- [ ] Keep the narrative on DCA, documents, hash, audit trail, and non-decision support only
- [ ] State explicitly that `RAX/WRS` is an analysis aid and that the institution remains the sole decision-maker
- [ ] State explicitly that `IDJOR` is a proof, governance, and audit layer, not an autonomous AI

## Next-Phase File Targets

- [x] `src/app/fr/(protected)/dashboard/page.tsx`
- [x] `src/app/fr/(protected)/applications/page.tsx`
- [x] `src/app/fr/(protected)/applications/[id]/page.tsx`
- [x] `src/components/layout/sidebar.tsx`
- [x] `src/components/layout/header.tsx`
- [x] `src/components/idjor/idjor-foundation-panel.tsx`
- [x] `src/components/auth/login-page-client.tsx`
- [x] `src/components/tenant/TenantDashboardLanding.tsx`
- [x] `src/components/ui/app-page-header.tsx`
- [x] `src/config/tenants.ts`

## Decision Gate

- [x] Technical baseline currently acceptable for demo use
- [ ] Narrative and visual neutrality for BNI/BAD currently acceptable without another wording/visibility pass
- [x] No product behavior was changed in this phase
