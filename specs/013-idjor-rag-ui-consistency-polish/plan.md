# Implementation Plan: IDJOR RAG UI Consistency Polish

**Branch**: `013-idjor-rag-ui-consistency-polish` | **Date**: 2026-06-20 | **Spec**: spec.md

## Summary

Wording- and presentation-only cleanup of `/fr/idjor` now that controlled upload quarantine (010), controlled extraction preview (011), and deterministic chunking (012) all exist on top of the originally strict read-only foundation page. No backend, auth, or business-logic change. No new endpoint call. No embedding/vector-store/retrieval/citation/LLM behavior.

## Technical Context

- **Frontend**: Next.js app (`ma-assurance-dashboard`), client component `src/components/idjor/idjor-foundation-panel.tsx`.
- **No API client change expected** (`src/lib/api.ts`) — this phase does not add or change any backend call. Only touched if a refresh wiring gap is found (none was, on inspection: `handleSubmitUploadIntake`, `handleRunExtractionPreview`, and `handleRunExtractionChunking` already call `refreshRagSection` / `handleLoadExtractionChunks` / `handleViewDocumentAudit` as appropriate).
- **No type change expected** (`src/types/index.ts`).

### Root cause of each reported inconsistency (read directly from the component)

1. **"strictement read-only"**: appears in the `PageTitle` description (both demo-safe and full-detail variants, ~line 1273-1274) and in `getErrorCard`'s `DegradedStateCard` description (~line 779). Written before upload/extraction/chunking existed; now inaccurate since the page performs controlled write actions (quarantine upload, extraction preview, chunking).
2. **"Aucun upload..."**: the RAG section's "Message de demo" block (~line 1596-1601) predates feature 010 and still claims no upload exists. Inaccurate now.
3. **"chunks 0" contradiction**: NOT a data-wiring bug. `state.ragHealth.counts.chunks` / `state.ragChunks.chunks` (type `IdjorRagChunk`, endpoint `GET /v1/idjor/rag/chunks`) and `IdjorRagIngestionPreview.linkedAssetCounts.chunks` are a **distinct, pre-existing metadata-only governance counter**, unrelated to `IdjorRagExtractionChunk` (the deterministic chunks created via `POST /v1/idjor/rag/extractions/:id/chunk`, feature 012). They are two different backend tables/concepts by design (see `specs/012-idjor-rag-chunks-dashboard/plan.md`, "Naming deviation" section). The fix is to label both counters as governance/metadata-only and point the user to the extraction panel for the technical chunks, not to merge or recompute them (out of scope: no new calculation).
4. **Duplicated extraction**: `ExtractionResultBlock` is rendered once for `ragExtractionPreviewState.response.extraction` (the just-fetched result) and the extractions list (`ragUploadExtractionsListState.page.extractions`) is reloaded right after via `handleLoadUploadExtractions`, so the same extraction (same `id`) now also appears as the first item of that list — same record shown twice. Fix: filter the just-shown extraction id out of the list render.

## Constitution Check

- No backend modified: PASS (no file under `wakama-backend` touched).
- No auth changed: PASS.
- No new frontend route: PASS (same component, same page).
- No new endpoint call / no new business calculation: PASS (purely JSX text/label changes plus one list-rendering filter; no new `api.ts` export, no new state shape).
- No embedding/vector store/retrieval/citation/LLM: PASS (no behavior touched, wording only).
- No OCR / PDF/DOCX parsing: PASS (untouched).

## Project Structure

```
specs/013-idjor-rag-ui-consistency-polish/
├── spec.md
├── plan.md
├── tasks.md
├── validation-log.md
└── checklists/
    └── requirements.md
```

### Source files touched

- `src/components/idjor/idjor-foundation-panel.tsx` only:
  - `getErrorCard`: reword degraded-state description.
  - `PageTitle` description (both demoSafeMode branches): reword.
  - RAG section "Message de demo" block: reword to reflect existing controlled actions.
  - Ingestion-preview panel: relabel `ingestionReadiness`/`chunks` ExecutiveStatus entries as governance counters, add a one-line clarifying note.
  - Detailed-view "Chunks" / "Citations" `RegistryTable` empty labels: relabel as governance/metadata-only counters.
  - Extraction panel: filter the "current result" extraction id out of the `ragUploadExtractionsListState.page.extractions` list render to avoid duplicate display.

No change to `src/lib/api.ts` or `src/types/index.ts` is required or made.

## Phase 0: Research

No open unknowns — all four reported inconsistencies were traced to exact line numbers and exact root causes by reading the component, `src/types/index.ts`, and `specs/010-012` directly (see "Root cause" above). No backend or type investigation was needed beyond confirming `IdjorRagChunk` and `IdjorRagExtractionChunk` are intentionally distinct types (already documented in `specs/012.../plan.md`).

## Phase 1: Design

- Wording changes are direct JSX string edits; no new component, no new state.
- The duplicate-extraction fix uses a derived `.filter(...)` on the already-loaded `ragUploadExtractionsListState.page.extractions` array at render time — no new state, no new fetch.
- Governance-vs-technical chunk clarification is text-only (relabeling + one explanatory sentence); the two counters keep displaying their real (unmerged) values, per the spec's explicit Out-of-Scope note.

## Phase 2: Tasks

See tasks.md.
