# Validation Log: IDJOR RAG Upload Intake Dashboard

**Date**: 2026-06-19

## Static checks

- `npm run lint`: PASS.
- `npm run build`: PASS. `/fr/idjor` listed in the dynamic route output (16.4 kB, 136 kB First Load JS).
- Forbidden wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `ingérer`, `indexer`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/`: no new occurrence. One pre-existing unrelated match (`// TODO: ... query Solana RPC or indexer for the hash` in `src/app/api/blockchain-verify/route.ts`) predates this change and is out of scope.

## Backend untouched

- `git status` confirms no file under `wakama-backend/` was modified.
- Read-only inspection only: `wakama-backend/src/routes/idjor.ts`, `wakama-backend/src/idjor/services/ragUploadIntake.ts`, `wakama-backend/src/idjor/rag/contracts.ts`.

## Live end-to-end smoke test

Local stack used (already running): Postgres on `localhost:55432`, backend on `localhost:4000`.

1. Logged in as `assurance-admin@wakama.farm` against `POST /v1/auth/institution-login` — obtained a valid JWT.
2. Listed RAG documents for tenant `assurance-ma` via `GET /v1/idjor/rag/documents` — picked document `phase-2a-idjor-backend-audit` (`ingestionStatus: REGISTERED`).
3. Uploaded a small `text/plain` file via `POST /v1/idjor/rag/documents/:id/upload-intake` (multipart, field `file`) — response shape matched the frontend's `IdjorRagUploadIntakeResponse` mapper field-for-field: `scope`, `documentId`, `documentKey`, `upload` (`id`, `tenantId`, `institutionId`, `country`, `vertical`, `documentId`, `originalFilename`, `mimeType`, `sizeBytes`, `sha256Hash`, `quarantineStatus`, `storageProvider`, `source`, `uploadedByUserId`, `createdAt`, `updatedAt`), `linkedAssetCounts` (`chunks: 0, embeddings: 0, citations: 0`), `quarantineStorage: "LOCAL_PRIVATE"`, `publicDownloadEnabled: false`.
4. Listed uploads via `GET /v1/idjor/rag/documents/:id/uploads` — the new upload appeared, response shape matched `IdjorRagDocumentUploadsPage` mapper exactly, `securitySummary` showed `ragEnabled: false`, `vectorStoreEnabled: false`, `embeddingsEnabled: false`, `llmEnabled: false`, `decisioningEnabled: false`.
5. Re-fetched the document and confirmed `ingestionStatus` was still `REGISTERED` (unchanged by the upload).

Browser-based click-through of `/fr/idjor` (login UI, file picker, on-screen hash display) was not performed in this session — the API contract was validated directly against the live local backend instead, which is the part that determines correctness of the new frontend code (`src/lib/api.ts` mappers, `src/types/index.ts`). The UI wiring (button → fetch → render) follows the existing, already-shipped pattern used for ingestion preview and document audit in `idjor-foundation-panel.tsx`, byte-for-byte the same state-machine shape.

## Confirmation

- No backend route, auth flow, frontend route, or business calculation was added or modified.
- No LLM, vector store, embedding, chunking, parsing, or OCR behavior was added.
- No commit was created automatically.
