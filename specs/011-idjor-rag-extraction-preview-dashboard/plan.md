# Implementation Plan: IDJOR RAG Extraction Preview Dashboard

**Branch**: `011-idjor-rag-extraction-preview-dashboard` | **Date**: 2026-06-19 | **Spec**: spec.md

## Summary

Wire `/fr/idjor` to the already-deployed backend extraction-preview routes so a back-office user can run a controlled extraction preview on a quarantined RAG upload and view the resulting extraction(s) read-only. No backend, auth, or business-logic change. No LLM/vector/embedding/chunking/OCR behavior is introduced. No PDF/DOCX parsing on the frontend.

## Technical Context

- **Frontend**: Next.js app (`ma-assurance-dashboard`), client component `src/components/idjor/idjor-foundation-panel.tsx`, inside the existing per-document upload/quarantine panel.
- **API client**: `src/lib/api.ts`, `apiFetch` helper (Bearer token, `credentials: include`).
- **Types**: `src/types/index.ts`.
- **Backend (read-only reference, not modified)**: `wakama-backend/src/routes/idjor.ts` (`POST /rag/uploads/:uploadId/extract-preview` ~line 704, `GET /rag/uploads/:uploadId/extractions` ~line 763); service `wakama-backend/src/idjor/services/ragExtractionPreview.ts`; contracts in `wakama-backend/src/idjor/rag/contracts.ts` (`IdjorRagDocumentExtractionItem`, `IdjorRagExtractionPreviewResult`, `IdjorRagDocumentLinkedAssetCounts`, `IDJOR_RAG_EXTRACTION_PREVIEW_MAX_CHARS = 20000`, supported mime types = `['text/plain']`).

### Confirmed backend response shapes (read directly from source)

`POST /v1/idjor/rag/uploads/:uploadId/extract-preview` -> 201:
```
{
  scope, documentId, documentKey, uploadId,
  extraction: { id, tenantId, institutionId, country, vertical, documentId, uploadId,
                mimeType, status, previewText, previewTextLength, errorReason, source,
                createdAt, updatedAt },
  linkedAssetCounts: { chunks, embeddings, citations },
  resolutionMode, readOnly: true
}
```
`status` is one of `EXTRACTED_PENDING_REVIEW | UNSUPPORTED_PENDING_EXTRACTOR | FILE_MISSING | FAILED`.

`GET /v1/idjor/rag/uploads/:uploadId/extractions` -> 200:
```
{ scope, uploadId, extractions: IdjorRagDocumentExtractionItem[], securitySummary, resolutionMode, readOnly: true }
```

## Constitution Check

- No backend modified: PASS (read-only inspection only).
- No auth changed: PASS.
- No new frontend route: PASS (feature lives inside the existing `/fr/idjor` page/component, inside the existing quarantine panel).
- No LLM/vector/embedding/chunking/OCR: PASS (extraction-preview endpoint only reads raw bytes for `text/plain`; all other mime types return `UNSUPPORTED_PENDING_EXTRACTOR` with no read attempted).
- No PDF/DOCX parsing on frontend: PASS (frontend only renders backend-provided `previewText`/`errorReason`, never parses files itself).

## Project Structure

```
specs/011-idjor-rag-extraction-preview-dashboard/
├── spec.md
├── plan.md
├── tasks.md
├── validation-log.md
└── checklists/
    └── requirements.md
```

### Source files touched

- `src/types/index.ts` — add `IdjorRagDocumentExtraction`, `IdjorRagDocumentExtractionsPage`, `IdjorRagExtractionPreviewResponse`.
- `src/lib/api.ts` — add `runIdjorRagUploadExtractionPreview(uploadId)` and `getIdjorRagUploadExtractions(uploadId)`, plus matching response mappers following the existing `mapIdjorRag*` pattern.
- `src/components/idjor/idjor-foundation-panel.tsx` — inside the existing quarantine panel, per upload row: add a "Previsualiser extraction" action, loading/success/error state, and a read-only list of extractions for that upload (status, mimeType, previewText or unsupported/error messaging, createdAt). After success, refresh extractions list, the document audit view if open, and do not touch `ingestionStatus`.

## Phase 0: Research

No open unknowns — backend contracts were read directly from `wakama-backend` source (routes + service + contracts) to match field names exactly (`mimeType`, `status`, `previewText`, `previewTextLength`, `errorReason`, `createdAt`, `updatedAt`).

## Phase 1: Design

- Reuse the existing state-machine pattern (`{status: "idle" | "loading" | "success" | "error"}` keyed by an id) already used for `ragIngestionPreviewState`, `ragDocumentAuditState`, and `ragUploadsListState`, keyed by `uploadId` for the new extraction states.
- Reuse `RegistryTable<T extends {id: string}>` for the extractions list rather than building a new table component.
- Reuse `mapIdjorRagScope`, `mapIdjorRagSecuritySummary`, `asObject`, `readString`, `readNumberLike` helpers already in `api.ts`.
- Place the new action/list inside the per-document upload row already rendered for each `IdjorRagDocumentUpload`, since extraction is scoped to an upload, not a document.

## Phase 2: Tasks

See tasks.md.
