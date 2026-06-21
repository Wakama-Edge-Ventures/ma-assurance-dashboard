# Validation Log: IDJOR RAG Chunks Dashboard

**Date**: 2026-06-20

## Static checks

- `npm run lint`: PASS (no output, clean).
- `npm run build`: PASS. `/fr/idjor` listed in the dynamic route output (17.9 kB, 138 kB First Load JS — up from 17.2 kB / 137 kB in phase 011, consistent with the added chunking UI).
- Forbidden wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `ingerer`, `indexer`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/`: no new occurrence. Same pre-existing unrelated match as phase 011 (`// TODO: ... query Solana RPC or indexer for the hash` in `src/app/api/blockchain-verify/route.ts`), out of scope.

## Backend untouched

- `git status --porcelain` in `wakama-backend` shows only pre-existing, unrelated diffs (`.claude/settings.json`, `.claude/settings.local.json`); no file under `src/` was modified.
- Read-only inspection only: `wakama-backend/src/routes/idjor.ts` (lines ~803-899), `wakama-backend/src/idjor/services/ragDeterministicChunking.ts`, `wakama-backend/src/idjor/rag/contracts.ts`.

## Frontend diff scope

`git diff --stat` for this session touches exactly:
- `src/types/index.ts` (+39 lines: 3 new interfaces)
- `src/lib/api.ts` (+126 lines: 3 mappers + 2 exported functions)
- `src/components/idjor/idjor-foundation-panel.tsx` (+257/-3 lines: new chunk list component, extended `ExtractionResultBlock`, new state/handlers, two call-site updates)
- `specs/012-idjor-rag-chunks-dashboard/` (new spec kit folder)

`src/components/insurance/evidence-bundle-panel.tsx` and `.claude/settings*.json` show as modified in `git status`, but that diff predates this session (present at session start, unrelated to this feature) and was not touched by any edit in this session.

## Live API / browser smoke test

Not performed in this session: no local backend instance (`localhost:4000` / Postgres on `localhost:55432`) was started or reachable in this environment. The implementation was validated by:
- Reading the backend route handlers and service (`runRagDeterministicChunking`, `listRagChunksForDocumentOrExtraction`, `IdjorRagChunkItem`/`IdjorRagChunkingResult` contracts) directly from source to match field names exactly (`chunkIndex`, `contentText`, `contentHash`, `tokenCount`, `chunkCount`, `created`, `extractionId`).
- TypeScript compilation succeeding end-to-end through `next build` (type-checks the full call chain: `api.ts` mappers -> component state -> JSX).
- Confirming the chunking action only renders for `extraction.status === "EXTRACTED_PENDING_REVIEW"`, matching the backend's `EXTRACTION_NOT_PENDING_REVIEW` 400 guard.

If a local stack is available in a follow-up session, the recommended smoke test is: login -> upload a `text/plain` file -> run extraction preview (existing phase 011 action) until `status: EXTRACTED_PENDING_REVIEW` -> click "Decouper deterministiquement" -> confirm `chunkCount > 0`, `created: true` on first call and `created: false` on a repeat call -> confirm `GET .../chunks` returns the same chunks ordered by `chunkIndex` -> confirm the source document's `ingestionStatus` is unchanged.

## Confirmation

- No backend route, auth flow, frontend route, or business calculation was added or modified.
- No embedding, vector store, retrieval, citation, OCR, or PDF/DOCX-parsing behavior was added. The chunking endpoint only splits an extraction's already-bounded `previewText` into fixed-size, overlapping text spans (`IDJOR_RAG_CHUNK_SIZE_CHARS = 1200`, `IDJOR_RAG_CHUNK_OVERLAP_CHARS = 150`) server-side; the frontend only displays the result.
- `startOffset`/`endOffset` are not rendered because the current backend `IdjorRagChunkItem` contract does not expose them (documented as a deviation in plan.md).
- `src/components/insurance/evidence-bundle-panel.tsx` and `.claude/settings*.json` were not modified by this session.
- No commit was created automatically.
