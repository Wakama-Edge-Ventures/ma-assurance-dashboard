# Research: PHASE 2D.5 - IDJOR RAG Audit Trail UI

## Backend Contract Confirmation

- Two protected GET routes already exist in `wakama-backend/src/routes/idjor.ts`:
  - `GET /rag/audit/events` (mounted under `/v1/idjor`) — global, tenant-scoped
    audit list with optional `documentId`, `eventType`, `limit`, `cursor`
    query params.
  - `GET /rag/documents/:id/audit/events` — same listing narrowed to one
    document; 404s with `{ error: 'RAG document not found', readOnly: true }`
    when the document does not exist or belongs to another tenant.
- Both routes call `listRagAuditEvents` in
  `wakama-backend/src/idjor/audit/ragAuditReadService.ts`, which queries
  `prisma.aiAuditTrail` filtered to
  `IDJOR_RAG_AUDIT_EVENT_TYPES` (`RAG_DOCUMENT_METADATA_REGISTERED`,
  `RAG_DOCUMENT_METADATA_DEGRADED_REGISTERED`,
  `RAG_INGESTION_PREVIEW_VIEWED`, `RAG_INGESTION_PREVIEW_BLOCKED`), ordered by
  `createdAt desc, id desc`, with cursor-based pagination
  (`IDJOR_RAG_AUDIT_EVENT_DEFAULT_LIMIT = 20`,
  `IDJOR_RAG_AUDIT_EVENT_MAX_LIMIT = 100`).
- Each event (`IdjorRagAuditEventListItem`, see
  `wakama-backend/src/idjor/audit/ragAuditReadContracts.ts`) has: `id`,
  `tenantId`, `institutionId`, `country`, `vertical`, `eventType`,
  `documentId`, `documentKey`, `source`, `ingestionStatus`, `operation`,
  `actorUserId`, `role`, `createdAt`. `documentId`, `documentKey`,
  `ingestionStatus`, `operation`, `actorUserId`, and `role` are all nullable
  and read out of the audit row's redacted JSON payload
  (`mapRagAuditEventForRead` in `ragAuditReadService.ts`); no raw
  prompt/response content is exposed by this read path.
- The route response wraps the list with the shared envelope already used by
  other `/v1/idjor/rag/*` GET routes: `scope`, `events`, `nextCursor`,
  `securitySummary`, `resolutionMode`, `readOnly: true`. The per-document
  route additionally echoes `documentId` at the top level.
- Auth/tenant scoping reuses the same `verifyToken` + protected tenant context
  resolution as every other `/v1/idjor/*` route, so the existing
  `apiFetch`/`ApiError` session-expiry flow applies unchanged.

## UX Decisions

- Add a new "Journal d'audit RAG" `SectionCard` inside the existing RAG
  section area on `/fr/idjor`, loaded once when the page loads (mirrors how
  `ragHealth`/`ragDocuments`/`ragChunks`/`ragCitations` already load).
- Add a per-row "Voir audit" action next to the existing "Prévisualiser
  préparation" action in the RAG documents table; selecting it loads that
  document's events into the same journal panel state, replacing rather than
  stacking with the global view, consistent with how the ingestion preview
  panel already replaces itself per document.
- Render the redacted `operation`/`ingestionStatus` fields as a compact
  "summary" line per event instead of any raw payload, since the backend read
  path already strips raw prompt/response content.
- Support "load more" via `nextCursor` for the global list only, kept simple
  (append next page) to avoid building a full pagination control for a
  read-only demo surface.

## Validation Decisions

- Render `eventType`, `documentKey`, `source`, `ingestionStatus`,
  `actorRole` (mapped from the backend's `role` field), `actorUserId`, and
  `createdAt` verbatim from the backend with no frontend reinterpretation.
- Treat `null` `actorUserId`/`actorRole` as "Système" in the UI label only,
  without implying a specific system identity that the backend did not
  provide.
- Preserve prohibited-word scans by avoiding any wording that implies
  mutate/replay of audit events, active AI, upload, ingestion, indexing, or
  vector runtime.
- Add the disclosure sentence "Journal append-only. Lecture seule. Aucun
  événement n'est modifié depuis le dashboard." once per journal panel state
  (global and per-document).
