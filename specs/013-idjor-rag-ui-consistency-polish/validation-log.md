# Validation Log: IDJOR RAG UI Consistency Polish

**Date**: 2026-06-20

## Static checks

- `npm run lint` (run via WSL, `eslint`): PASS, no output.
- `npm run build` (`next build`): PASS. `/fr/idjor` listed in the dynamic route output at 18.2 kB / 138 kB First Load JS (up from 17.9 kB / 138 kB at the end of phase 012 — consistent with the added clarifying text and the duplicate-filter logic; no new chunk/route was introduced).
- Forbidden-wording scan (`LIVE IA`, `Activer IA`, `poser une question`, `vectoriser`, `llmEnabled: true`, `vectorStoreEnabled: true`, `embeddingsEnabled: true`) over `src/`: no match (`NO_MATCH`).

## Backend untouched

- No file under `wakama-backend` was read or written during this session. `git status` for `ma-assurance-dashboard` shows only frontend files changed.

## Frontend diff scope

`git status --porcelain` for the touched paths shows:
- `src/components/idjor/idjor-foundation-panel.tsx` — modified (this session's only functional change).
- `src/components/insurance/evidence-bundle-panel.tsx` — shown as modified, but this predates this session (present in the initial `git status` snapshot at conversation start) and was not opened or edited in this session.
- `.claude/settings.json`, `.claude/settings.local.json` — shown as modified, but predate this session and were not touched.
- `src/lib/api.ts`, `src/types/index.ts` — untouched, as planned (no new endpoint or type was needed).
- `specs/013-idjor-rag-ui-consistency-polish/` — new spec kit folder (this session).

## Wording/presentation fixes applied (all in `idjor-foundation-panel.tsx`)

1. **"strictement read-only"** (2 sites: `getErrorCard`'s degraded-state description, and both `PageTitle` description branches) -> reworded to "socle gouverne: lecture, tracabilite et actions controlees sans IA active", matching the brief's requested replacement.
2. **"Aucun upload..."** in the RAG section's "Message de demo" block -> reworded to describe the existing controlled quarantine/extraction-preview/chunking actions while keeping "Aucune analyse IA, vectorisation ou extraction automatique n'est activee, et aucune question en langage naturel n'est traitee."
3. **Governance vs. technical chunk counters**:
   - Ingestion-preview panel: relabeled `ingestionReadiness` -> "Readiness gouvernance", `linkedAssetCounts.chunks`/`.citations` -> "Chunks gouvernance (metadata-only)" / "Citations gouvernance (metadata-only)", and added a one-line note clarifying that technical deterministic chunks (created via "Decouper deterministiquement") remain visible in the extraction panel regardless of the governance readiness state.
   - Detailed-view technical "Chunks"/"Citations" tables: added the same clarifying note above the grid, and reworded the chunks table's empty-state label from "0 chunk actif ou chunking non active pour ce tenant." (which read as a blanket "chunking is inactive" claim) to "0 chunk metadata-only pour ce tenant (gouvernance, distinct des chunks techniques deterministes)." The citations empty-state label was left unchanged — it is accurate, since no citation/retrieval feature exists in any phase.
   - No data/calculation was merged or added: `IdjorRagChunk` (metadata-only, `GET /v1/idjor/rag/chunks`) and `IdjorRagExtractionChunk` (technical, `GET /v1/idjor/rag/extractions/:id/chunks`) remain two distinct, separately-fetched backend concepts, per the explicit Out-of-Scope note in spec.md.
4. **Duplicated extraction display**: in the "Extractions pour ce fichier" list, the extraction matching the currently-displayed "result" block (`ragExtractionPreviewState.response.extraction.id`) is now filtered out of `ragUploadExtractionsListState.page.extractions` before rendering, computed inline at render time with no new state or fetch. Empty-state wording distinguishes "no other extraction" vs "no extraction at all" depending on whether a current result is being shown.

The fixed disclosure strings mandated by specs 010/011/012 ("Quarantaine documentaire uniquement...", "Extraction controlee...", "Decoupage deterministe...") were intentionally left unchanged: each is scoped to a single controlled action that genuinely does not read/chunk/vectorize content by itself, so they remain accurate and are required verbatim by those specs' FR-003/FR-002/FR-002 respectively.

## Live API / browser smoke test

Not performed in this session: no local backend instance (`localhost:4000` / Postgres on `localhost:55432`) was started in this environment. The implementation was validated by:
- Reading every changed JSX block and its surrounding conditional rendering to confirm no closing-tag/brace mismatch (confirmed indirectly by `next build`'s successful type-check and static-page generation, which would fail on any JSX/TS error).
- Tracing the duplicate-extraction filter logic against the existing state shapes (`ragExtractionPreviewState`, `ragUploadExtractionsListState`) already used elsewhere in the file, with no new state introduced.
- Confirming via `src/types/index.ts` that `IdjorRagChunk` (line ~164) and `IdjorRagExtractionChunk` (line ~402) are distinct types tied to distinct endpoints, so the wording fix does not paper over an actual data bug.

If a local stack is available in a follow-up session, the recommended smoke test is: login -> upload a `.txt` file -> run extraction preview -> confirm the extraction appears exactly once (not duplicated between the result block and the list below) -> run "Decouper deterministiquement" -> confirm chunks appear in the extraction panel -> open "Previsualiser preparation" for the same document and confirm the readiness/chunks counters are now labeled as governance/metadata-only, with the clarifying note visible -> confirm the document's `ingestionStatus` is unchanged throughout.

## Confirmation

- No backend route, auth flow, frontend route, new endpoint, or business calculation was added or modified.
- No embedding, vector store, retrieval, citation, OCR, or PDF/DOCX-parsing behavior was added.
- No LLM wording or capability was introduced; all fixed disclosure strings from specs 010-012 are unchanged.
- `src/components/insurance/evidence-bundle-panel.tsx` and `.claude/settings*.json` were not modified by this session (their `git status` entries predate this session).
- `src/lib/api.ts` and `src/types/index.ts` were not modified — only `src/components/idjor/idjor-foundation-panel.tsx` changed.
- No commit was created automatically.
