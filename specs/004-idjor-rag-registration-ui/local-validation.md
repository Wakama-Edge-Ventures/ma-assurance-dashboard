# Local Validation: PHASE 2C.7 — IDJOR RAG Metadata Registration UI

## Scope

- Documentation only. No UI component, API client, route, or backend file was modified.
- Goal: validate the metadata-only RAG registration form on `/fr/idjor` end-to-end against a
  locally running backend + test database, and confirm the security/scope guarantees hold.

## Environment

- Backend: `wakama-backend`, started with
  `DATABASE_URL=postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public`
  and `PORT=4000` (process was already running with this exact configuration at the start of
  this validation session; confirmed via `/proc/<pid>/environ`).
- Seeds re-run against the test database:
  - `npm run seed:assurance-admin` → institution admin `assurance-admin@wakama.farm` ready.
  - `npm run seed:idjor-foundation` → 4 tenants seeded, including 6 `SEED_DEMO` RAG documents
    for `assurance-ma` (`IDJOR RAG metadata seed complete: 24 REGISTERED, 0 DEGRADED, 24 total
    tenant-scoped registrations.`).
- Frontend: `ma-assurance-dashboard`, `next dev` on `http://localhost:3000`, pointed at
  `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` (`.env.local`).
- No browser-automation tool (Playwright/MCP) was available in this environment. Validation was
  performed by (a) exercising the exact backend endpoint the form's `onSubmit` handler calls
  (`registerIdjorRagDocumentMetadata` in [src/lib/api.ts](../../src/lib/api.ts)), with the same
  request shape, and (b) static inspection of the rendered JSX in
  [src/components/idjor/idjor-foundation-panel.tsx](../../src/components/idjor/idjor-foundation-panel.tsx)
  to confirm the absence of forbidden controls. Both are noted explicitly below.

## Checklist Results

1. **Login assurance OK** — `POST /v1/auth/login` with `assurance-admin@wakama.farm` /
   `WakamaAssurance@2026` returns a valid JWT and `institutionType: "ASSURANCE"`. ✅
2. **`/fr/idjor` accessible** — `GET http://localhost:3000/fr/idjor` → `200`. ✅
3. **RAG metadata form visible** — Confirmed in source: the form at
   [idjor-foundation-panel.tsx:953-1103](../../src/components/idjor/idjor-foundation-panel.tsx#L953-L1103)
   renders fields `documentKey`, `title`, `source` (select), `ingestionStatus` (select,
   `REGISTERED`/`DEGRADED` only), `externalReference`, `metadataJson` (textarea), and a single
   submit button labelled "Enregistrer la metadata". No `<input type="file">` exists in the
   component. ✅
4. **Metadata-only registration succeeds** — Submitted via the same backend call the form makes:
   ```
   POST /v1/idjor/rag/documents/register
   { tenantKey: "assurance-ma", documentKey: "local-demo-rag-ui-002",
     title: "Validation locale formulaire RAG metadata", source: "MANUAL_ESTIMATE",
     ingestionStatus: "REGISTERED",
     externalReference: "local-dashboard-validation-2026-06-19",
     metadataJson: { language: "fr", category: "validation", metadataOnly: true } }
   → { "operation": "CREATED", "document": { ...documentKey: "local-demo-rag-ui-002"... },
        "linkedAssetCounts": { "chunks": 0, "embeddings": 0, "citations": 0 },
        "metadataOnly": true }
   ```
   ✅
5. **Docs RAG counter increments** — `GET /v1/idjor/rag/health?tenantKey=assurance-ma`:
   - Before registration: `"counts": { "documents": 8, "chunks": 0, "citations": 0 }`
   - After registration: `"counts": { "documents": 9, "chunks": 0, "citations": 0 }`

   Note: the baseline of `8` (rather than the `7` implied by "6 seeded docs + 1 pre-existing
   manual document") already includes one prior validation artifact (`local-demo-rag-ui-001`,
   created during an earlier local validation pass tied to commit `7791097`). This session's own
   registration is the `8 → 9` transition documented above, which is the same counter-increment
   behavior described in the phase objective (`7 → 8`). The mechanism is verified either way.
6. **New document appears in the list** — `GET /v1/idjor/rag/documents?tenantKey=assurance-ma`
   (the same endpoint and shape the `RegistryTable` in the panel renders from) includes
   `local-demo-rag-ui-002` with `status: "REGISTERED"` after registration. ✅
7. **No chunk created** — `linkedAssetCounts.chunks: 0` in the registration response, and
   `rag/health.counts.chunks` stayed `0` (8→9 transition only changed `documents`). ✅
8. **No embedding created** — `linkedAssetCounts.embeddings: 0`. The backend's response
   `metadataJson` echo confirms `embeddingsEnabled: false`. ✅
9. **No citation created** — `linkedAssetCounts.citations: 0`; `rag/health.counts.citations`
   stayed `0`. ✅
10. **No file upload** — No `<input type="file">` in the component; the request body sent is
    pure JSON metadata, no multipart/binary payload. ✅
11. **No ingérer/indexer/vectoriser button** — Confirmed by source inspection (single
    "Enregistrer la metadata" submit button) and by the forbidden-text scan (below). ✅
12. **No "poser une question" button** — Same. ✅
13. **No LLM activated** — Response `metadataJson.llmEnabled: false`; UI displays a static
    `LLM: false` status badge ([idjor-foundation-panel.tsx:942](../../src/components/idjor/idjor-foundation-panel.tsx#L942)). ✅
14. **No vector store activated** — Response `metadataJson.vectorStoreEnabled: false`; UI shows
    `Vector store: false` ([idjor-foundation-panel.tsx:943](../../src/components/idjor/idjor-foundation-panel.tsx#L943)). ✅
15. **No business calculation added** — The registration response and form only carry
    documentary metadata fields (key, title, source, status, reference, free-form JSON); no
    scoring/decisioning field is read or written. ✅

## Validation Commands

- `npm run lint` → **PASS** (no errors/warnings).
- `npm run build` → **PASS**. Build output includes `ƒ /fr/idjor 9.88 kB (132 kB First Load JS)`.
- Forbidden-text scan:
  ```
  rg -n -e 'Activer IA' -e 'LIVE IA' -e 'poser une question' -e 'vectoriser' -e 'ingérer' \
     -e 'llmEnabled: true' -e 'vectorStoreEnabled: true' -e 'embeddingsEnabled: true' src
  ```
  → **PASS** (`No forbidden matches found in src`).

## Notes

- Commands were run from WSL (`wsl.exe -d UbuntuWakama`) rather than the Windows shell, because
  the Windows shell cannot reliably execute symlinked binaries (e.g. `node_modules/.bin/prisma`)
  across the UNC workspace path (`I/O error` on `ls`/`exec`) — consistent with the note already
  recorded in [validation-log.md](./validation-log.md).
- The backend process and frontend dev server were already running with the correct
  configuration at the start of this session; they were left running as-is (no restart was
  required, no destructive action taken).
- Two metadata-only documents now persist in the `wakama_idjor_test` database for tenant
  `assurance-ma` as artifacts of local validation passes (`local-demo-rag-ui-001` and
  `local-demo-rag-ui-002`). They are inert metadata rows (`REGISTERED`, zero linked chunks /
  embeddings / citations) and were not removed, per the documentation-only scope of this task.

## Confirmation

No functional change was made to any UI component, API client, route, or backend code during
this validation. All actions were either read-only (`GET` calls, source inspection, `npm run
lint`/`build`, `rg` scan) or exercised existing, already-shipped functionality
(`POST /v1/idjor/rag/documents/register`) exactly as the shipped form already does.
