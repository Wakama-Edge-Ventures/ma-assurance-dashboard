# RELEASE_CANDIDATE_QA

## A. Environment
- [ ] `NEXT_PUBLIC_API_BASE_URL=https://api.wakama.farm`
- [ ] `NEXT_PUBLIC_USE_LIVE_API=true`
- [ ] `NEXT_PUBLIC_USE_LIVE_INSURANCE_API=false`
- [ ] `NEXT_PUBLIC_DEBUG_API_SHAPES=false`

## B. Commands
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run smoke:live-shared`
- [ ] `npm run dev`

## C. Pages To Verify Manually
- [ ] `/fr/login`
- [ ] `/fr/dashboard`
- [ ] `/fr/farmers`
- [ ] `/fr/cooperatives`
- [ ] `/fr/alerts`
- [ ] `/fr/applications`
- [ ] `/fr/missions`
- [ ] `/fr/arbitrage`
- [ ] `/fr/rax`
- [ ] `/fr/pricing`
- [ ] `/fr/policies`
- [ ] `/fr/monitoring`
- [ ] `/fr/claims`

## D. Expected Live Shared Counts (Example Baseline)
- [ ] `farmers: 63`
- [ ] `cooperatives: 2`
- [ ] `parcelles: 12`
- [ ] `alerts: 50`

## E. Expected MVP Rule
- [ ] Shared Wakama data can be `LIVE`.
- [ ] Insurance workflow data stays `SEED_DEMO` until dedicated backend routes exist.

## F. Wording Checks
- [ ] No "Wakama indemnise".
- [ ] No "Wakama emet la police".
- [ ] No "Wakama valide le sinistre".
- [ ] No "ACAPS compliant".
- [ ] Use "concu pour le cadre ACAPS/CNDP".
- [ ] Use "decision reservee a l'assureur".

## G. Debug Safety
- [ ] No full PII logs in console.
- [ ] Debug output limited to endpoint names, counts, and keys.
