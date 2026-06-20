# IDJOR Dashboard Handoff - 2026-06-20

## Routes and pages

- `/fr/login`
- `/fr/idjor`

Supporting UI integration:

- sidebar link to `/fr/idjor`
- protected auth/session flow reused from the dashboard login
- `.env.local` points `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:4000`

## API clients added

The dashboard consumes the protected backend through `src/lib/api.ts`.

### Foundation

- `getIdjorFoundationHealth`
- `getIdjorFoundationRegistry`

### RAG read snapshots

- `getIdjorRagHealth`
- `getIdjorRagDocuments`
- `getIdjorRagChunks`
- `getIdjorRagCitations`
- `getIdjorRagAuditEvents`
- `getIdjorRagDocumentAuditEvents`
- `getIdjorRagDocumentIngestionPreview`

### Controlled workflow actions

- `uploadIdjorRagDocumentIntake`
- `getIdjorRagDocumentUploads`
- `runIdjorRagUploadExtractionPreview`
- `getIdjorRagUploadExtractions`
- `runIdjorRagExtractionChunking`
- `getIdjorRagExtractionChunks`
- `getIdjorRagEmbeddingReadiness`
- `requestIdjorRagEmbeddingPreview`
- `getIdjorRagRetrievalReadiness`
- `requestIdjorRagRetrievalPreview`
- `getIdjorRagDocumentGovernanceCockpit`
- `getIdjorRagExtractionGovernanceCockpit`

## Types added

The dashboard contract surface is typed in `src/types/index.ts`.

### Foundation

- `IdjorFoundationTenant`
- `IdjorFoundationCounts`
- `IdjorFoundationSecuritySummary`
- `IdjorFoundationHealth`
- `IdjorFoundationRegistry`
- registry agent, engine, tool, provider, model, and feature-flag types

### RAG snapshots and workflow

- `IdjorRagResponseScope`
- `IdjorRagSecuritySummary`
- `IdjorRagHealth`
- `IdjorRagDocument`
- `IdjorRagChunk`
- `IdjorRagCitation`
- `IdjorRagDocumentsSnapshot`
- `IdjorRagChunksSnapshot`
- `IdjorRagCitationsSnapshot`
- `IdjorRegisterRagDocumentMetadataInput`
- `IdjorRegisterRagDocumentMetadataResult`
- `IdjorRagIngestionPreview`
- `IdjorRagAuditEvent`
- `IdjorRagAuditEventsPage`
- `IdjorRagDocumentUpload`
- `IdjorRagUploadIntakeResponse`
- `IdjorRagDocumentExtraction`
- `IdjorRagExtractionPreviewResponse`
- `IdjorRagExtractionChunk`
- `IdjorRagExtractionChunkingResponse`
- `IdjorRagEmbeddingReadinessResponse`
- `IdjorRagEmbeddingPreviewRequestResponse`
- `IdjorRagRetrievalReadinessResponse`
- `IdjorRagRetrievalPreviewRequestResponse`
- `IdjorRagGovernanceCockpitResponse`

## User journey on `/fr/idjor`

1. log in through `/fr/login` with a valid backend institution session
2. open `/fr/idjor`
3. view foundation health, registry, RAG health, documents, chunks, citations, and tenant audit snapshot
4. open a document and inspect metadata-only preparation state
5. upload a controlled file into quarantine
6. trigger extraction preview for that upload
7. trigger deterministic chunking for the extraction
8. inspect embedding readiness and request a preview that remains blocked
9. inspect retrieval readiness and request a preview that remains blocked
10. open the governance cockpit at document or extraction level
11. read the append-only audit events

## Doctrine and wording status

The UI wording stays aligned with the governed doctrine:

- the institution decides
- IDJOR prepares, documents, and traces
- actions stay controlled without active AI runtime
- blocked and not-ready states are presented as expected workflow states, not as alarming failures

The requested anti-pattern phrases were not found in the IDJOR dashboard scan:

- no `LIVE IA`
- no `poser une question`
- no `activer embeddings`
- no `activer retrieval`
- no `vectoriser`

## Remaining UI limits

- the IDJOR experience is still concentrated in a single large client panel
- the page depends on a valid live backend session and does not offer an offline fallback
- the dashboard exposes governed blocked states but does not yet provide a lightweight progress wizard
- extraction beyond `text/plain` remains visibly unsupported because the backend intentionally blocks it
- no browser E2E automation was added in this phase

## Reported design issues

- the requested scan for legacy dark tokens still finds existing `dark:*` and slate-based styles in the broader dashboard and within the IDJOR panel
- these are existing styling remnants, not a functional regression in this phase
- they were documented rather than broadly refactored to respect the no-heavy-UI-refactor constraint

## Validation results

- `npm run lint`: passed
- `npm run build`: passed
- local page load checks on `http://127.0.0.1:3001/fr/login` and `http://127.0.0.1:3001/fr/idjor`: passed

## Recommended next plan

1. keep the current governed single-panel flow stable as the baseline
2. add browser-level E2E coverage for `/fr/login` to `/fr/idjor` once the next governed backend phase is chosen
3. only then decide whether to split the large IDJOR panel into smaller task-focused surfaces
