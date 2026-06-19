# Quickstart: PHASE 2D.5 - IDJOR RAG Audit Trail UI

## Goal

Add a read-only "Journal d'audit RAG" section to `/fr/idjor`, plus a
per-document "Voir audit" drill-down, without changing the backend, without
adding any audit modify/delete/re-run control, and without touching existing
assurance journeys.

## Steps

1. Extend `src/types/index.ts` with the audit event and audit events page
   response types.
2. Extend `src/lib/api.ts` with `getIdjorRagAuditEvents()` and
   `getIdjorRagDocumentAuditEvents(documentId)`.
3. Update `src/components/idjor/idjor-foundation-panel.tsx` to:
   - load the global audit journal alongside the other RAG snapshots,
   - add a "Voir audit" action per row in the RAG documents table,
   - render the read-only journal panel (global or per-document),
   - show loading, success, empty, and error states,
   - show the fixed append-only disclosure wording.
4. Keep `src/app/fr/(protected)/idjor/page.tsx` unchanged.
5. Run `npm run lint`, `npm run build`, and the forbidden-text scan.

## Local Backend Validation (before frontend validation)

```bash
# in wakama-backend
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public" npm run seed:assurance-admin
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public" npm run seed:idjor-foundation
PORT=4000 DATABASE_URL="postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public" npm run dev
```

If port 4000 is occupied, document the port actually used without changing
any business logic.

## Non-Negotiables

- No backend change
- No file upload
- No file parsing
- No chunking, embeddings, or vector store activation
- No LLM activation
- No question-answer or business-decision control
- No `LIVE IA` wording
- No modify/delete/re-run control for any audit event
