# Requirements Checklist: DEMO-FREEZE-2 - Neutral Tenant Wording

**Purpose**: Validate freeze-hardening completeness before deciding to freeze

**Created**: 2026-06-19

**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] Shared shell wording was reviewed for avoidable assurance leakage
- [x] Tenant-aware wording was reviewed for `assurance-ma`, `bni-ci`, `bad-program`, and `wakama`
- [x] `/fr/idjor` visibility was reviewed for demo-safe proof-first presentation
- [x] Validation commands and wording scans were planned and executed

## Freeze Gate

- [x] No backend code was modified
- [x] No auth behavior was modified
- [x] No API contract was modified
- [x] No route was modified
- [x] No business calculation, LLM, vector store, embedding, upload, or parsing capability was added
- [x] `assurance-ma` remains supported as the default assurance-oriented case
- [x] `/fr/applications` remains preserved
- [x] `/fr/applications/[id]` remains preserved

## Validation Readiness

- [x] `npm run lint` passes
- [x] `npm run build` passes
- [x] Prohibited phrase scan returns no visible occurrences of `LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, or `ingérer`
- [x] Residual occurrences of `assureur`, `assurance`, `sinistre`, `police`, `banque`, `BNI`, and `BAD` are documented and justified

## Notes

- Residual domain terms remain primarily in assurance-specific routes, seeded demo content, reporting/privacy text, and backend-truthful workflow labels outside the hardened demo surfaces.
