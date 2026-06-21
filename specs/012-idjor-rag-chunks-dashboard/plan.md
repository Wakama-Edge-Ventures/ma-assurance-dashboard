# Implementation Plan: IDJOR RAG Chunks Dashboard

**Branch**: `012-idjor-rag-chunks-dashboard` | **Date**: 2026-06-20 | **Spec**: spec.md

## Summary

Wire `/fr/idjor` to the already-deployed backend deterministic-chunking routes so a back-office user can trigger chunking on an `EXTRACTED_PENDING_REVIEW` extraction and view the resulting chunks read-only. No backend, auth, or business-logic change. No embedding/vector-store/retrieval/citation/LLM behavior is introduced.

## Technical Context

- **Frontend**: Next.js app (`ma-assurance-dashboard`), client component `src/components/idjor/idjor-foundation-panel.tsx`, inside the existing per-upload extraction panel (`ExtractionResultBlock`).
- **API client**: `src/lib/api.ts`, `apiFetch` helper (Bearer token, `credentials: include`).
- **Types**: `src/types/index.ts`.
- **Backend (read-only reference, not modified)**: `wakama-backend/src/routes/idjor.ts` (`POST /rag/extractions/:extractionId/chunk` ~line 803, `GET /rag/extractions/:extractionId/chunks` ~line 862); service `wakama-backend/src/idjor/services/ragDeterministicChunking.ts`; contracts in `wakama-backend/src/idjor/rag/contracts.ts` (`IdjorRagChunkItem`, `IdjorRagChunkingRequest`, `IdjorRagChunkingResult`, `IDJOR_RAG_CHUNK_SIZE_CHARS = 1200`, `IDJOR_RAG_CHUNK_OVERLAP_CHARS = 150`).

### Confirmed backend response shapes (read directly from source)

`POST /v1/idjor/rag/extractions/:extractionId/chunk` -> 201 (created) or 200 (already existed):
```
{
  scope, documentId, documentKey, extractionId,
  chunks: [{ id, tenantId, institutionId, country, vertical, documentId, extractionId,
             chunkIndex, contentText, contentHash, tokenCount, source, createdAt, updatedAt }],
  chunkCount, created,
  linkedAssetCounts: { chunks, embeddings, citations },
  resolutionMode, readOnly: true
}
```
Errors: 400 if extraction status is not `EXTRACTED_PENDING_REVIEW` (`EXTRACTION_NOT_PENDING_REVIEW`); 404 if extraction/tenant not found.

`GET /v1/idjor/rag/extractions/:extractionId/chunks` -> 200:
```
{ scope, extractionId, chunks: IdjorRagChunkItem[], securitySummary, resolutionMode, readOnly: true }
```

Note: `IdjorRagChunkItem` has no `startOffset`/`endOffset` fields in the current backend contract — chunk boundaries are not exposed beyond `chunkIndex`. The UI therefore only renders chunkIndex/contentHash/size/excerpt, per FR-004.

## Naming deviation from the request

The request named the new frontend types `IdjorRagChunk`, `IdjorRagChunksPage`, `IdjorRagChunkingResponse`. `IdjorRagChunk` already exists in `src/types/index.ts` (used by the unrelated document-level `/v1/idjor/rag/chunks` snapshot, shape: `documentKey`/`documentTitle`, no `extractionId`). Reusing that name would either collide (duplicate identifier) or silently misshape an existing type used elsewhere on the page. New types are instead named `IdjorRagExtractionChunk`, `IdjorRagExtractionChunksPage`, `IdjorRagExtractionChunkingResponse` to keep both chunk shapes distinct and compiling.

## Constitution Check

- No backend modified: PASS (read-only inspection only).
- No auth changed: PASS.
- No new frontend route: PASS (feature lives inside the existing `/fr/idjor` page/component, inside the existing extraction panel).
- No embedding/vector store/retrieval/citation/LLM: PASS (chunking endpoint only splits already-extracted `previewText` into fixed-size text spans; no embedding, no vector store write, no retrieval, no citation, no LLM call).
- No OCR / PDF/DOCX parsing: PASS (chunking operates only on the extraction's already-bounded `previewText`; no new file parsing introduced).

## Project Structure

```
specs/012-idjor-rag-chunks-dashboard/
├── spec.md
├── plan.md
├── tasks.md
├── validation-log.md
└── checklists/
    └── requirements.md
```

### Source files touched

- `src/types/index.ts` — add `IdjorRagExtractionChunk`, `IdjorRagExtractionChunksPage`, `IdjorRagExtractionChunkingResponse`.
- `src/lib/api.ts` — add `runIdjorRagExtractionChunking(extractionId)` and `getIdjorRagExtractionChunks(extractionId)`, plus matching response mappers following the existing `mapIdjorRag*` pattern.
- `src/components/idjor/idjor-foundation-panel.tsx` — inside `ExtractionResultBlock`, for extractions with `status: EXTRACTED_PENDING_REVIEW`: add a "Decouper deterministiquement" action, loading/success/error state, and a read-only list of chunks for that extraction (chunkIndex, contentHash, size, excerpt). After success, refresh the chunk list and the document audit view if open. Do not touch `ingestionStatus`.

## Phase 0: Research

No open unknowns — backend contracts were read directly from `wakama-backend` source (routes + service + contracts) to match field names exactly (`chunkIndex`, `contentText`, `contentHash`, `tokenCount`, `chunkCount`, `created`).

## Phase 1: Design

- Reuse the existing state-machine pattern (`{status: "idle" | "loading" | "success" | "error"}` keyed by an id) already used for `ragExtractionPreviewState` and `ragUploadExtractionsListState`, keyed by `extractionId` for the new chunking states.
- Add a single-slot "panel open" id (`chunkingPanelExtractionId`), mirroring `extractionPanelUploadId`, so only one extraction's chunk panel is expanded at a time.
- Extend `ExtractionResultBlock` (rather than duplicating it) to optionally render the chunking action/panel, since it is already used both for the latest preview result and for each item in the extractions list.
- Reuse `mapIdjorRagScope`, `mapIdjorRagSecuritySummary`, `mapIdjorRagLinkedAssetCounts`, `asObject`, `readString`, `readNumberLike` helpers already in `api.ts`.

## Phase 2: Tasks

See tasks.md.
