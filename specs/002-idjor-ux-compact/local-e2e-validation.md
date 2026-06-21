# PHASE 2B.7 - IDJOR Local E2E Validation And Freeze

Date: 2026-06-19

## Scope

- Documentation only
- No UI component change
- No API change
- No route change
- No backend file change
- No functional behavior change

## Validation Sources

1. Live local HTTP checks against:
   - dashboard: `http://localhost:3000`
   - backend: `http://localhost:4000`
2. Existing backend validation evidence from:
   - `../wakama-backend/specs/004-idjor-protected-registry/validation-log.md`
3. Frontend source scan in this repo
4. Dashboard lint/build validation

## Commands Executed

```bash
npm run lint
npm run build
rg -n 'LIVE IA|Activer IA' src -g '!node_modules'
rg -n 'llmEnabled: true|vectorStoreEnabled: true|decisioningEnabled: true' src specs -g '!node_modules'
curl -I http://localhost:3000/fr/idjor
curl -i http://localhost:4000/v1/idjor/foundation/health
curl -i -c /tmp/idjor.cookies \
  -H 'Content-Type: application/json' \
  -d '{"email":"assurance-admin@wakama.farm","password":"WakamaAssurance@2026"}' \
  http://localhost:4000/v1/auth/institution-login
curl -b /tmp/idjor.cookies http://localhost:4000/v1/auth/me
curl -b /tmp/idjor.cookies http://localhost:4000/v1/idjor/foundation/health
curl -b /tmp/idjor.cookies \
  'http://localhost:4000/v1/idjor/foundation/registry?tenantKey=assurance-ma'
```

## Validation Matrix

| Check | Status | Evidence |
|---|---|---|
| Backend local launched | Confirmed | `localhost:4000` answered `401 Unauthorized` on protected IDJOR endpoint before login, then returned authenticated data after login |
| Backend local uses a local DB URL | Partially confirmed | Historical backend validation log confirms targeted IDJOR route validation against local `wakama_idjor_test` on `127.0.0.1:55432`; current running process `DATABASE_URL` was not directly dumped from this repo |
| IDJOR migration applied | Confirmed by backend evidence | `../wakama-backend/specs/004-idjor-protected-registry/validation-log.md` shows the protected IDJOR route suite passed against local `wakama_idjor_test` |
| IDJOR seed executed | Confirmed | Live `/v1/idjor/foundation/health` and `/v1/idjor/foundation/registry` returned seeded tenant, agent, engine, tool, provider, model, and flag data |
| Dashboard connected to local backend | Confirmed | `ma-assurance-dashboard/.env.local` sets `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` |
| Login assurance OK | Confirmed | `POST /v1/auth/institution-login` returned `200 OK` for `assurance-admin@wakama.farm`; `/v1/auth/me` then returned the authenticated institution admin profile |
| `/fr/idjor` accessible | Confirmed | `curl -I http://localhost:3000/fr/idjor` returned `200 OK` |
| Tenant `assurance-ma` displayed by backend data | Confirmed | Live `/v1/idjor/foundation/health` returned `tenantKey: "assurance-ma"` and `displayName: "Wakama Assurance Maroc"` |
| LLM OFF | Confirmed | Live health payload returned `"llmEnabled": false` |
| Vector Store OFF | Confirmed | Live health payload returned `"vectorStoreEnabled": false` |
| Decisioning OFF | Confirmed | Live health payload returned `"decisioningEnabled": false` |
| Registry read-only | Confirmed | Live health payload returned `"readOnly": true`; registry items are also `isReadOnly: true` and tools are `READ_ONLY` |
| Agents visible | Confirmed | Live registry payload returned a populated `agents` array |
| Engines visible | Confirmed | Live registry payload returned a populated `engines` array |
| Tools visible | Confirmed | Live registry payload returned a populated `tools` array |
| Flags visible | Confirmed | Live health payload reported `featureFlags: 48`; live registry payload returned populated feature flags |
| Providers/models visible | Confirmed | Live registry payload returned populated `providers` and `models` arrays |
| No AI activation button | Confirmed in source | Text scan found no `Activer IA` string in `src/` |
| No business AI calculation added in this phase | Confirmed in scope and live payload | This phase changed no code; live health payload shows advisory foundation only with all AI/security toggles off |
| No false `LIVE IA` wording | Confirmed in source | Text scan found no `LIVE IA` string in `src/`; remaining matches are documentation constraints only |

## Live Payload Highlights

### Authenticated assurance login

- Email: `assurance-admin@wakama.farm`
- Role: `INSTITUTION_ADMIN`
- Institution: `Wakama Assurance Maroc Pilot`
- Modules: `assurance`, `insurance`, `rax`, `missions`, `monitoring`, `evidence`

### IDJOR foundation health

- `tenantKey`: `assurance-ma`
- `counts.agents`: `13`
- `counts.engines`: `15`
- `counts.tools`: `8`
- `counts.providers`: `3`
- `counts.models`: `4`
- `counts.featureFlags`: `48`
- `allFeatureFlagsOff`: `true`
- `allProvidersDisabled`: `true`
- `allModelsDisabled`: `true`
- `allToolsReadOnly`: `true`
- `securitySummary.llmEnabled`: `false`
- `securitySummary.vectorStoreEnabled`: `false`
- `securitySummary.decisioningEnabled`: `false`
- `readOnly`: `true`

### IDJOR registry sample outcome

- Agents, engines, tools, feature flags, providers, and models were all returned for `tenantKey=assurance-ma`
- Returned registry entries are seed/read-only oriented and remain disabled
- No mutating IDJOR action was exercised or exposed during this validation

## Text Scan Outcome

- `rg -n 'LIVE IA|Activer IA' src -g '!node_modules'`: no matches
- `rg -n 'llmEnabled: true|vectorStoreEnabled: true|decisioningEnabled: true' src specs -g '!node_modules'`: no matches
- Documentation files still mention `LIVE IA` only as a forbidden wording constraint, not as runtime UI text

## Build And Lint

- `npm run lint`: passed
- `npm run build`: passed
- Build output included successful rendering for `/fr/idjor`, `/fr/applications`, and `/fr/applications/[id]`

## Freeze Statement

This Phase 2B.7 deliverable made no functional change.

- No UI behavior was modified
- No API client was modified
- No route was modified
- No backend file was modified
- No LLM was connected
- No vector store was connected
- No provider IA frontend was added
- No decisioning, scoring, pricing, eligibility, policy, or indemnization action was added
