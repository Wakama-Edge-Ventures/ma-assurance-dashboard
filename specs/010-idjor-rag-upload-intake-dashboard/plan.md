# Implementation Plan: IDJOR RAG Upload Intake Dashboard

**Branch**: `010-idjor-rag-upload-intake-dashboard` | **Date**: 2026-06-19 | **Spec**: spec.md

## Summary

Wire `/fr/idjor` to the already-deployed backend upload-intake routes so a back-office user can attach one controlled file (PDF/TXT/DOCX, <=10 MB) to a RAG document's quarantine record and view the resulting upload list. No backend, auth, or business-logic change. No LLM/vector/embedding/chunking/parsing/OCR behavior is introduced.

## Technical Context

- **Frontend**: Next.js app (`ma-assurance-dashboard`), client component `src/components/idjor/idjor-foundation-panel.tsx`.
- **API client**: `src/lib/api.ts`, `apiFetch` helper (Bearer token, `credentials: include`, no global `Content-Type` override so `FormData` keeps its multipart boundary).
- **Types**: `src/types/index.ts`.
- **Backend (read-only reference, not modified)**: `wakama-backend/src/routes/idjor.ts` lines ~420-455 (`GET /rag/documents/:id/uploads`) and ~541-699 (`POST /rag/documents/:id/upload-intake`); contracts in `wakama-backend/src/idjor/rag/contracts.ts` (`IdjorRagDocumentUploadItem`, `IDJOR_RAG_UPLOAD_INTAKE_MAX_BYTES` = 10 MiB, `IDJOR_RAG_UPLOAD_INTAKE_ALLOWED_MIME_TYPES`).

## Constitution Check

- No backend modified: PASS (read-only inspection only).
- No auth changed: PASS.
- No new frontend route: PASS (feature lives inside the existing `/fr/idjor` page/component).
- No LLM/vector/embedding/chunking/parsing/OCR: PASS (upload-intake endpoint only quarantines bytes; verified server-side metadata sets all those flags to `false`).

## Project Structure

```
specs/010-idjor-rag-upload-intake-dashboard/
├── spec.md
├── plan.md
├── tasks.md
├── validation-log.md
└── checklists/
    └── requirements.md
```

### Source files touched

- `src/types/index.ts` — add `IdjorRagDocumentUpload`, `IdjorRagDocumentUploadsPage`, `IdjorRagUploadIntakeResponse`.
- `src/lib/api.ts` — add `uploadIdjorRagDocumentIntake(documentId, file)` and `getIdjorRagDocumentUploads(documentId)`, plus matching response mappers following the existing `mapIdjorRag*` pattern.
- `src/components/idjor/idjor-foundation-panel.tsx` — add a "Quarantaine" column with a "Joindre fichier controle" toggle per document row, an inline panel with file input, client-side validation, submit button, success/error state, and a read-only uploads table for the active document.

## Phase 0: Research

No open unknowns — backend contracts were read directly from `wakama-backend` source (routes + service + contracts) to match field names exactly (`originalFilename`, `mimeType`, `sizeBytes`, `sha256Hash`, `quarantineStatus`, `storageProvider`, `createdAt`, `updatedAt`).

## Phase 1: Design

- Reuse existing state-machine pattern (`{status: "idle" | "loading" | "success" | "error"}` keyed by `documentId`) already used for `ragIngestionPreviewState` and `ragDocumentAuditState`, for consistency and to avoid introducing a new abstraction.
- Reuse `RegistryTable<T extends {id: string}>` for the uploads list rather than building a new table component.
- Reuse `mapIdjorRagScope`, `mapIdjorRagSecuritySummary`, `mapIdjorRagLinkedAssetCounts`, `asObject`, `readString`, `readNumberLike` helpers already in `api.ts`.

## Phase 2: Tasks

See tasks.md.
