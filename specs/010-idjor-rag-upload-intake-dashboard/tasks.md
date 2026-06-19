# Tasks: IDJOR RAG Upload Intake Dashboard

**Input**: plan.md, spec.md

## Phase 1: Types

- [X] T001 Add `IdjorRagDocumentUpload`, `IdjorRagDocumentUploadsPage`, `IdjorRagUploadIntakeResponse` to `src/types/index.ts`, matching the backend `IdjorRagDocumentUploadItem` / `IdjorRagUploadIntakeResult` contracts.

## Phase 2: API client

- [X] T002 Add `mapIdjorRagDocumentUpload`, `mapIdjorRagDocumentUploadsPage`, `mapIdjorRagUploadIntakeResponse` mappers to `src/lib/api.ts`.
- [X] T003 Add `uploadIdjorRagDocumentIntake(documentId, file)` (multipart `POST`) to `src/lib/api.ts`.
- [X] T004 Add `getIdjorRagDocumentUploads(documentId)` (`GET`) to `src/lib/api.ts`.

## Phase 3: UI — `src/components/idjor/idjor-foundation-panel.tsx`

- [X] T005 Add client-side validation constants/helper: 10 MB max size, MIME allowlist (`application/pdf`, `text/plain`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- [X] T006 Add per-document state: active upload panel id, selected file, upload submission state, uploads-list fetch state.
- [X] T007 Add "Quarantaine" column with "Joindre fichier controle" toggle button on each document row.
- [X] T008 Add inline panel: fixed disclosure text, file input, "Envoyer en quarantaine" button (loading/disabled while submitting or while validation fails), success message with sha256 hash, error message.
- [X] T009 Add read-only uploads table for the active document (filename, mimeType, sizeBytes, sha256Hash, quarantineStatus, createdAt) with an explicit empty state.
- [X] T010 On successful upload: refresh the uploads list, refresh the RAG health/documents/audit snapshot, and refresh the document audit view if it is currently open for the same document. Do not touch `ingestionStatus`.

## Phase 4: Validation

- [X] T011 `npm run lint` passes.
- [X] T012 `npm run build` passes and `/fr/idjor` is listed in route output.
- [X] T013 Forbidden-wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `ingérer`, `indexer`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/` finds no new occurrence.
- [X] T014 Confirm `wakama-backend` working tree is untouched (read-only reference only).
- [ ] T015 Manual smoke test: login, open `/fr/idjor`, select a document, attach a small `.txt`/`.pdf`, confirm hash + audit refresh, confirm chunks/embeddings/citations stay at 0.
