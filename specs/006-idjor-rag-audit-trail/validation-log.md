# Validation Log: PHASE 2D.5 - IDJOR RAG Audit Trail UI

## Scope

- Frontend-only changes
- No backend modification
- No new route
- No upload, chunking, embeddings, vector store, LLM, or business decisioning
- No modify/delete/re-run control for any audit event

## Local Backend Setup

- Reused the existing `wakama-idjor-test-postgres` Docker container
  (`postgres:15-alpine`) already bound to host port `55432`.
- `DATABASE_URL='postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public' npx prisma migrate deploy` (wakama-backend): PASS, "No pending migrations to apply" (20 migrations already applied).
- `npm run seed:assurance-admin`: PASS, seeded/confirmed `assurance-admin@wakama.farm`.
- `npm run seed:idjor-foundation`: PASS, seeded 4 tenants, 24 RAG metadata documents (6 per tenant).
- Found 3 stale `wakama-backend` dev-server processes left over from a prior
  session, one of them bound to the production-like default `DATABASE_URL`
  from `.env` (`...@80.65.211.227:5432/wakama_db`) instead of the local test
  database. Stopped all of them and started a single fresh instance:
  `PORT=4000 DATABASE_URL='postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public' npm run dev`.
  Port `4000` was free after cleanup, so no port fallback was needed; backend
  listened at `http://127.0.0.1:4000`.
- The Next.js dev server was already running on `http://localhost:3000` with
  `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` in `.env.local`.

## Validation Commands

- `npm run lint` (via WSL bash, since the Windows shell cannot run repo
  scripts from the UNC workspace path): PASS, no errors or warnings.
- `npm run build`: PASS. Route list includes `/fr/idjor` (11.5 kB), `/fr/applications`, and `/fr/applications/[id]`, all compiled and type-checked successfully.
- Forbidden-text scan:
  `rg -n -i -e 'Activer IA' -e 'LIVE IA' -e 'poser une question' -e 'vectoriser' -e 'ing(é|e)rer' -e 'modifier audit' -e 'supprimer audit' -e 'llmEnabled: true' -e 'vectorStoreEnabled: true' -e 'embeddingsEnabled: true' src`
  -> PASS, no forbidden matches found in `src` (ripgrep exit code 1).

## Direct Backend Contract Verification

- Logged in as `assurance-admin@wakama.farm` against the freshly seeded
  backend and confirmed:
  - `GET /v1/idjor/rag/audit/events` initially returns `events: []` (seeding
    alone does not create audit rows; only registration/preview API calls
    do).
  - Calling `GET /v1/idjor/rag/documents/:id/ingestion-preview` for document
    `phase-2a-idjor-backend-audit` recorded a `RAG_INGESTION_PREVIEW_VIEWED`
    audit row, as expected from `ragIngestionPreview.ts`.
  - `GET /v1/idjor/rag/audit/events` and
    `GET /v1/idjor/rag/documents/:id/audit/events` then both returned that
    event with the exact shape consumed by
    `getIdjorRagAuditEvents()`/`getIdjorRagDocumentAuditEvents()` and the
    `IdjorRagAuditEvent`/`IdjorRagAuditEventsPage` types.

## Manual End-to-End Verification (Playwright, headless Chromium)

No browser automation tool was preinstalled in this environment, so
Playwright + Chromium were installed into a scratch directory
(`/tmp/pw-verify`, outside the repo) to drive a real headless browser against
the running dev servers.

- Logged in as `assurance-admin@wakama.farm` at `http://localhost:3000/fr/login`.
- Opened `/fr/idjor`; the "Base documentaire RAG" table renders a "Voir
  audit" button (6 occurrences, one per seeded document) alongside the
  existing "Previsualiser preparation" button.
- Clicked "Voir audit" on `phase-2a-idjor-backend-audit`: an "Audit du
  document" panel appeared showing the `RAG_INGESTION_PREVIEW_VIEWED` event
  with `documentKey`, a summary line
  (`VIEWED - phase-2a-idjor-backend-audit - ingestionStatus=REGISTERED`),
  `source: SEED_DEMO`, `actorRole: ADMIN`, `actorUserId`, the timestamp, and
  the sentence "Journal append-only. Lecture seule. Aucun evenement n'est
  modifie depuis le dashboard."
- Expanded the separate "Journal d'audit RAG" section (between "Base
  documentaire RAG" and "Agents"): it independently rendered the same event
  with the same fields and the same disclosure sentence, confirming the
  global journal loads on page load.
- Searched the rendered DOM for any button matching
  modify/delete/replay/re-run audit wording: 0 matches.
- Navigated to `/fr/applications`: loaded correctly (Demandes d'assurance -
  DCA Farmer), unaffected by the phase.
- Console/network check: the only error observed was a `401` on
  `/v1/auth/me`, which fires during the pre-login session check on the
  `/fr/login` page load and is unrelated to this phase's endpoints.

## Results

- `npm run lint`: PASS
- `npm run build`: PASS
- Forbidden-text scan: PASS
- Direct backend contract check: PASS
- Manual headless-browser verification: PASS

## Notes

- Validation commands were executed from `bash` in WSL because the Windows
  shell cannot run repo scripts correctly from the UNC workspace path.
- Playwright and its Chromium binary were installed only into a temporary
  out-of-repo scratch directory for this verification session; nothing was
  added to the project's own dependencies.
