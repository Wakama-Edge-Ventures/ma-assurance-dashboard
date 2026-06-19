# Validation Log: PHASE 2D.2 - IDJOR RAG Ingestion Preview UI

## Scope

- Frontend-only changes
- No backend modification
- No route change
- No upload, chunking, embeddings, vector store, LLM, or business decisioning

## Local Backend Setup

- Started a disposable `postgres:15-alpine` container (`wakama-idjor-test-postgres`)
  bound to host port `55432` because no test database was already listening.
- `DATABASE_URL='postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public' npx prisma migrate deploy` (wakama-backend): PASS, all 20 migrations applied.
- `npm run seed:assurance-admin`: PASS, seeded `assurance-admin@wakama.farm`.
- `npm run seed:idjor-foundation`: PASS, seeded 4 tenants, RAG metadata for `assurance-ma` including 6 documents.
- `PORT=4000 DATABASE_URL=... npm run dev` (wakama-backend): backend listening on `http://127.0.0.1:4000`.

## Validation Commands

- `npm run lint`: PASS (run from WSL bash; the Windows shell cannot run repo scripts from the UNC workspace path)
- `npm run build`: PASS, generated routes include `/fr/idjor`, `/fr/applications`, `/fr/applications/[id]`
- Forbidden-text scan:
  `rg -n -e 'Activer IA' -e 'LIVE IA' -e 'poser une question' -e 'vectoriser' -e 'ingérer' -e 'llmEnabled: true' -e 'vectorStoreEnabled: true' -e 'embeddingsEnabled: true' src`
  -> PASS, no forbidden matches found in `src`

## Manual End-to-End Verification

- Confirmed `GET /v1/idjor/rag/documents/:id/ingestion-preview` directly against the
  freshly seeded backend returns the exact shape consumed by
  `getIdjorRagDocumentIngestionPreview()`/`IdjorRagIngestionPreview`.
- Drove the running Next.js dev server (`http://localhost:3000`, already configured
  with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`) with a headless Chrome
  session via Playwright:
  - Logged in as `assurance-admin@wakama.farm`.
  - Opened `/fr/idjor`, expanded "Base documentaire RAG".
  - Clicked "Previsualiser preparation" on `phase-2a-idjor-backend-audit`.
  - Panel rendered `documentId`, `tenant assurance-ma`, `ingestionReadiness: NOT_READY`,
    `ingestionStatus: REGISTERED`, `llmEnabled=false`, `vectorStoreEnabled=false`,
    `embeddingsEnabled=false`, `chunks=0`, `citations=0`, the `missingFields`,
    `allowedNextSteps`, and `blockedReasons` lists, and the disclosure sentence.
  - Confirmed no standalone `READY` state is rendered (only `NOT_READY` and the
    pre-existing "Aucun READY" disclaimer from the Phase 2C.6 registration form).
  - Confirmed no `LIVE IA` or `Activer IA` wording anywhere on the page.
  - Navigated to `/fr/applications`: loads correctly, unaffected by the phase.

## Results

- `npm run lint`: PASS
- `npm run build`: PASS
- Forbidden-text scan: PASS (`No forbidden matches found in src`)
- Manual browser verification: PASS

## Notes

- Validation was executed from `bash` in WSL because the Windows shell cannot run
  repo scripts correctly from the UNC workspace path.
- Docker Desktop was not running at the start of this session and had to be
  started before the test Postgres container could be created.
