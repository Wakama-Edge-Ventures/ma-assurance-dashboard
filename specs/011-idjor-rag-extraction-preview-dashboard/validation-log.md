# Validation Log: IDJOR RAG Extraction Preview Dashboard

**Date**: 2026-06-19

## Static checks

- `npm run lint`: PASS (no output, clean).
- `npm run build`: PASS. `/fr/idjor` listed in the dynamic route output (17.2 kB, 137 kB First Load JS).
- Forbidden wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `ingerer`, `indexer`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/`: no new occurrence. One pre-existing unrelated match (`// TODO: ... query Solana RPC or indexer for the hash` in `src/app/api/blockchain-verify/route.ts`) predates this change and is out of scope.

## Backend untouched

- `git status` in `wakama-backend` shows only pre-existing, unrelated diffs (`.claude/settings.json`, `.claude/settings.local.json`); no file under `src/` was modified.
- Read-only inspection only: `wakama-backend/src/routes/idjor.ts`, `wakama-backend/src/idjor/services/ragExtractionPreview.ts`, `wakama-backend/src/idjor/rag/contracts.ts`.
- Any temporary smoke-test scripts created during this session were written outside the backend repo (`C:\Users\wakama\AppData\Local\Temp\verify-idjor\`) and removed after use; none were committed or left inside `wakama-backend/`.

## Live end-to-end smoke test

Local stack used (already running): Postgres on `localhost:55432`, backend on `localhost:4000`.

1. Logged in as `assurance-admin@wakama.farm` against `POST /v1/auth/institution-login` — obtained a valid JWT.
2. Listed RAG documents for tenant `assurance-ma` via `GET /v1/idjor/rag/documents` — picked document `phase-2a-idjor-backend-audit` (`ingestionStatus: REGISTERED`).
3. **Text/plain happy path**: uploaded a small `text/plain` file via `POST /v1/idjor/rag/documents/:id/upload-intake`, then called `POST /v1/idjor/rag/uploads/:uploadId/extract-preview`. Response: `extraction.status: "EXTRACTED_PENDING_REVIEW"`, `previewText` containing the file's text, `previewTextLength: 68`, `errorReason: null`. Shape matched the frontend's `IdjorRagExtractionPreviewResponse` mapper field-for-field.
4. Called `GET /v1/idjor/rag/uploads/:uploadId/extractions` — the extraction appeared, shape matched `IdjorRagDocumentExtractionsPage` mapper exactly; `securitySummary` showed `ragEnabled: false`, `vectorStoreEnabled: false`, `embeddingsEnabled: false`, `llmEnabled: false`, `decisioningEnabled: false`; `linkedAssetCounts: { chunks: 0, embeddings: 0, citations: 0 }`.
5. Re-fetched `GET /v1/idjor/rag/documents` and confirmed `phase-2a-idjor-backend-audit` still had `ingestionStatus: "REGISTERED"` (unchanged by the extraction).
6. **PDF unsupported path**: uploaded a fake `application/pdf` file to the same document, then called the extraction-preview endpoint. Response: `extraction.status: "UNSUPPORTED_PENDING_EXTRACTOR"`, `previewText: null`, `previewTextLength: null`, `errorReason: null` — confirming the backend never attempts to read/parse non-`text/plain` uploads, which matches the frontend's "Extracteur non active pour ce format" messaging (no parsing implied).

Browser-based click-through of `/fr/idjor` (login UI, button clicks, on-screen preview rendering) was not performed in this session — the API contract was validated directly against the live local backend instead, covering the part that determines correctness of the new frontend code (`src/lib/api.ts` mappers, `src/types/index.ts`, and the `ExtractionResultBlock` rendering logic in `idjor-foundation-panel.tsx`, which switches on the exact `status` values observed above). The UI wiring (button -> fetch -> render) follows the existing, already-shipped pattern used for upload intake and document audit in the same component.

## Confirmation

- No backend route, auth flow, frontend route, or business calculation was added or modified.
- No LLM, vector store, embedding, chunking, or OCR behavior was added.
- No PDF/DOCX parsing was added on the frontend; unsupported formats are reported as-is from the backend's `UNSUPPORTED_PENDING_EXTRACTOR` status.
- No commit was created automatically.
