# Validation Log: IDJOR RAG Embedding Readiness Dashboard

**Date**: 2026-06-20

## Static checks

- `npm run lint`: PASS (no output, clean — run via `wsl -d UbuntuWakama -- bash -lc "cd /home/wakama/dev/ma-assurance-dashboard && npm run lint"`, exit 0).
- `npm run build`: PASS. `/fr/idjor` listed in the dynamic route output (19.1 kB, 139 kB First Load JS — up from the phase 013 baseline, consistent with the added embedding-readiness UI). All 16 pages generated successfully.
- Forbidden wording scan (`LIVE IA`, `Activer IA`, `activer embeddings`, `poser une question`, `vectoriser`, `provider externe actif`, `llmEnabled: ?true`, `vectorStoreEnabled: ?true`, `embeddingsEnabled: ?true`) over `src/`: no occurrence found.

## Backend untouched

- `git status --porcelain` in `wakama-backend` shows only pre-existing, unrelated diffs (`.claude/settings.json`, `.claude/settings.local.json`); no file under `src/` was modified.
- Read-only inspection only: `wakama-backend/src/routes/idjor.ts` (lines ~904-1001), `wakama-backend/src/idjor/services/ragEmbeddingReadiness.ts`, `wakama-backend/src/idjor/rag/contracts.ts` (lines ~339-413).

## Frontend diff scope

`git diff --stat` for this session touches exactly:
- `src/types/index.ts` (+67 lines: 9 new type declarations)
- `src/lib/api.ts` (+182 lines: 8 mapper functions + 2 exported functions + 2 imports)
- `src/components/idjor/idjor-foundation-panel.tsx` (+243 lines: new `EmbeddingReadinessPanel` component, extended `ExtractionResultBlock` props/body, new state/handlers, two call-site updates, reset wiring in three toggle handlers)
- `specs/014-idjor-rag-embedding-readiness-dashboard/` (new spec kit folder)

`src/components/insurance/evidence-bundle-panel.tsx` and `.claude/settings*.json` show as modified in `git status` (both in `ma-assurance-dashboard` and `wakama-backend`), but those diffs predate this session (present at session start, unrelated to this feature) and were not touched by any edit in this session.

## Live API / browser smoke test

Not performed in this session: no local backend instance was started or reachable in this environment. The implementation was validated by:
- Reading the backend route handlers, service (`buildRagEmbeddingReadiness`, `requestRagEmbeddingJobPreview`, `computeEmbeddingReadiness`), and contracts directly from source to match field names exactly (`eligibleChunksCount`, `embeddingReadiness`, `requiredFlags`, `providerStatus`, `modelStatus`, `vectorStoreStatus`, `blockedReasons`, `previewStatus`, `embeddingJobCreated`, `embeddingReferenceCreated`, `embeddingsComputed`).
- TypeScript compilation succeeding end-to-end through `next build` (type-checks the full call chain: `api.ts` mappers -> component state -> JSX).
- Confirming the "Demande preview embedding" action only renders once a readiness check has resolved to `BLOCKED` or `NOT_READY`, the only two states the backend's `IdjorRagEmbeddingReadinessState` type supports — so a real "READY/activation" state structurally cannot be displayed.

If a local stack is available in a follow-up session, the recommended smoke test is: login -> upload a `text/plain` file -> run extraction preview -> run "Decouper deterministiquement" until chunks exist -> click "Verifier readiness embeddings" -> confirm `embeddingReadiness` is `NOT_READY` or `BLOCKED` with a non-empty `blockedReasons` (at minimum `VECTOR_STORE_DISABLED`, always present) -> click "Demande preview embedding" -> confirm `previewStatus: BLOCKED`, `embeddingJobCreated: false`, `embeddingReferenceCreated: false` -> confirm the readiness panel and (if open) the document audit view refresh afterward -> confirm no embedding, citation, or vector-store row appears anywhere on the page as a result.

## Confirmation

- No backend route, auth flow, frontend route, or business calculation was added or modified.
- No new backend endpoint was added; only the two pre-existing endpoints (`GET .../embedding-readiness`, `POST .../embedding-preview-request`) are called.
- No embedding, vector store, retrieval, citation, OCR, or PDF/DOCX-parsing behavior was added. The readiness endpoint only reads existing chunk/flag/catalog state and counts eligible chunks; the preview-request endpoint always returns `BLOCKED` and never creates an embedding job (`embeddingJobCreated: false`) or embedding reference (`embeddingReferenceCreated: false`).
- No LLM and no external provider were activated; `providerStatus`/`modelStatus` are read-only display of existing (disabled) catalog rows.
- No button labeled "activer embeddings", "vectoriser", or "poser une question" was added.
- `src/components/insurance/evidence-bundle-panel.tsx` and `.claude/settings*.json` were not modified by this session.
- No commit was created automatically.
