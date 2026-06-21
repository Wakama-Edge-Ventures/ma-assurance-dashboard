# Validation Log: DEMO-FREEZE-2 - Neutral Tenant Wording

**Date**: 2026-06-19

## Commands Run

### `npm run lint`

- Result: PASS
- Notes: `eslint` completed successfully on 2026-06-19.

### `npm run build`

- Result: PASS
- Notes:
  - `next build` completed successfully on 2026-06-19
  - Next.js reported version `15.5.19`
  - Critical preserved routes built successfully, including `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`, and `/fr/idjor`
  - Build was re-run successfully after the final wording cleanup on shared demo surfaces

## Prohibited Phrase Scan

- Terms: `LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `ingérer`
- Result: PASS
- Notes: No matching visible occurrences were returned by the scan in `src/`.

## Residual Domain-Term Scan

- Terms: `assureur`, `assurance`, `sinistre`, `police`, `banque`, `BNI`, `BAD`
- Result: PASS WITH DOCUMENTED RESIDUALS
- Notes:
  - Residual `assurance` terms remain intentionally in `assurance-ma` tenant configuration, assurance-only routes, and assurance-default copy.
  - Residual `assureur`, `sinistre`, and `police` terms remain intentionally in assurance workflows, privacy/reporting/legal surfaces, seeded demo scenario content, and backend-truthful status labels outside the hardened shared demo shell.
  - `BNI` and `BAD` remain intentionally in tenant names and tenant-facing configuration for the demo switcher and visual routing.
  - The hardened shared surfaces now use more neutral wording, but the repository still contains assurance-domain vocabulary in non-targeted or assurance-specific areas by design.

## Notes

- The prohibited scan returned no results; the residual domain-term scan returned expected domain vocabulary that was reviewed and accepted for this phase.
- A final wording pass removed residual demo-facing `assurance` copy from `/fr/applications/[id]` detail text and from hidden IDJOR registration placeholders before the closing validation run.
