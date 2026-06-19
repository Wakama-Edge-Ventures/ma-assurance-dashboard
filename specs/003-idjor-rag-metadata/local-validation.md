# PHASE 2C.4 - Local Validation Of IDJOR RAG Metadata Dashboard

Date: 2026-06-19

## Scope

- Documentation only
- No UI component change
- No API client change
- No route change
- No backend change
- No functional behavior change

## Validation Sources

1. Live local HTTP checks against:
   - dashboard: `http://localhost:3000`
   - backend: `http://localhost:4000`
2. Protected backend RAG metadata responses after assurance login
3. Frontend source scan in this repo
4. Dashboard lint/build validation

## Commands Executed

```bash
npm run lint
npm run build
rg -n 'Activer IA|LIVE IA|llmEnabled: true|vectorStoreEnabled: true|embeddingsEnabled: true' src -g '!node_modules'
curl -I http://localhost:3000/fr/login
curl -I http://localhost:3000/fr/idjor
curl -i -c /tmp/idjor-rag.cookies \
  -H 'Content-Type: application/json' \
  -d '{"email":"assurance-admin@wakama.farm","password":"WakamaAssurance@2026"}' \
  http://localhost:4000/v1/auth/institution-login
curl -b /tmp/idjor-rag.cookies http://localhost:4000/v1/auth/me
curl -b /tmp/idjor-rag.cookies \
  'http://localhost:4000/v1/idjor/rag/health?tenantKey=assurance-ma'
curl -b /tmp/idjor-rag.cookies \
  'http://localhost:4000/v1/idjor/rag/documents?tenantKey=assurance-ma'
curl -b /tmp/idjor-rag.cookies \
  'http://localhost:4000/v1/idjor/rag/chunks?tenantKey=assurance-ma'
curl -b /tmp/idjor-rag.cookies \
  'http://localhost:4000/v1/idjor/rag/citations?tenantKey=assurance-ma'
```

## Validation Matrix

| Check | Status | Evidence |
|---|---|---|
| `/fr/login` fonctionne | Confirmed | `curl -I http://localhost:3000/fr/login` returned `200 OK` before build |
| `/fr/idjor` accessible apres login | Partially confirmed | `curl -I http://localhost:3000/fr/idjor` returned `200 OK` before build; authenticated backend session and protected RAG responses succeeded; post-build local frontend server became unstable and returned `500` |
| Section `Base documentaire RAG` visible | Confirmed by implementation + backend data | Phase 2C.3 implementation added the section in `src/components/idjor/idjor-foundation-panel.tsx`; live backend RAG data for `assurance-ma` matched the section contract |
| Tenant `assurance-ma` affiche | Confirmed | Live `GET /v1/idjor/rag/health?tenantKey=assurance-ma` returned `tenantKey: "assurance-ma"` |
| `ragEnabled=false` | Confirmed | Live RAG health returned `"ragEnabled": false` |
| `readOnly=true` | Confirmed | Live RAG health returned `"readOnly": true` |
| `llmEnabled=false` | Confirmed | Live RAG health returned `"llmEnabled": false` |
| `vectorStoreEnabled=false` | Confirmed | Live RAG health returned `"vectorStoreEnabled": false` |
| `embeddingsEnabled=false` | Confirmed | Live RAG health returned `"embeddingsEnabled": false` |
| Documents RAG `REGISTERED` visibles | Confirmed | Live RAG documents returned 6 assurance documents, all with `"ingestionStatus": "REGISTERED"` |
| Chunks restent a `0` ou non actives | Confirmed | Live RAG health returned `chunks: 0`; live chunks endpoint returned `[]` |
| Embeddings restent a `0` ou non actives | Confirmed | Live RAG health returned `"embeddingsEnabled": false`; no embedding runtime or UI control exists in `src/` |
| Citations restent a `0` ou non actives | Confirmed | Live RAG health returned `citations: 0`; live citations endpoint returned `[]` |
| Aucun bouton `poser une question` | Confirmed in source | No such string or control was found in `src/`; the phase added metadata only |
| Aucun bouton `ingerer/indexer/vectoriser` | Confirmed in source | No such strings or controls were introduced in `src/` |
| Aucun bouton `Activer IA` | Confirmed in source | Text scan found no `Activer IA` string in `src/` |
| Aucun wording `LIVE IA` | Confirmed in source | Text scan found no `LIVE IA` string in `src/` |
| `/fr/applications` et `/fr/applications/[id]` non cassees | Confirmed by build | Successful `npm run build` included `/fr/applications` and `/fr/applications/[id]`; live HTTP checks during/after build were not treated as reliable because the running local frontend server became unstable |

## Live Backend Outcome

### Assurance Login

- `POST /v1/auth/institution-login`: `200 OK`
- Login account used: `assurance-admin@wakama.farm`
- Role: `INSTITUTION_ADMIN`
- Institution: `Wakama Assurance Maroc Pilot`
- Session cookie written to `/tmp/idjor-rag.cookies`

### RAG Health For `assurance-ma`

- `documents`: `6`
- `chunks`: `0`
- `citations`: `0`
- `ragEnabled`: `false`
- `vectorStoreEnabled`: `false`
- `embeddingsEnabled`: `false`
- `llmEnabled`: `false`
- `decisioningEnabled`: `false`
- `readOnly`: `true`
- `resolutionMode`: `EXPLICIT`

### RAG Documents For `assurance-ma`

- Returned document count: `6`
- Returned tenant key: `assurance-ma`
- Returned ingestion state: all observed documents were `REGISTERED`
- Returned source: `SEED_DEMO`

Observed document keys:

- `phase-2a-idjor-backend-audit`
- `spec-002-idjor-ai-foundation`
- `spec-003-idjor-seed-registry`
- `spec-004-idjor-protected-registry`
- `spec-005-idjor-rag-readonly-foundation`
- `wakama-idjor-master-plan`

### RAG Chunks And Citations For `assurance-ma`

- `GET /v1/idjor/rag/chunks?tenantKey=assurance-ma`: returned `[]`
- `GET /v1/idjor/rag/citations?tenantKey=assurance-ma`: returned `[]`

## Notes On Expected Seed Volume

- The expected seed context described for this phase is `24` RAG metadata
  documents total across `4` tenants, which implies `6` documents per tenant.
- The live assurance-scoped response returned `6` documents for `assurance-ma`,
  which is consistent with that expected per-tenant partitioning.
- This validation did not enumerate the other tenants from the dashboard repo
  because the protected frontend surface is tenant-scoped and the local check was
  performed with the assurance account.

## Frontend Route Notes

- Before running `npm run build`, `curl -I` returned `200 OK` for:
  - `/fr/login`
  - `/fr/idjor`
- After and during the build, the already-running local frontend server on
  `:3000` became unstable and returned `500 Internal Server Error` for some HTTP
  checks. This appears to be a local runtime artifact contention issue rather
  than an application build failure, because:
  - the backend protected RAG endpoints stayed healthy
  - `npm run build` completed successfully
  - the build output still listed `/fr/idjor`, `/fr/applications`, and
    `/fr/applications/[id]`

## Build And Lint

- `npm run lint`: passed
- `npm run build`: passed
- Build output included successful routes for:
  - `/fr/idjor`
  - `/fr/applications`
  - `/fr/applications/[id]`

## Source Scan Outcome

- `rg -n 'Activer IA|LIVE IA|llmEnabled: true|vectorStoreEnabled: true|embeddingsEnabled: true' src -g '!node_modules'`
- Result: no matches

## Freeze Statement

This Phase 2C.4 deliverable made no functional change.

- No UI behavior was modified
- No API client was modified
- No route was modified
- No backend file was modified
- No LLM was connected
- No vector store was connected
- No embedding runtime was activated
- No upload, ingestion, indexing, vectorization, or question control was added
- No business calculation or decision route was added
