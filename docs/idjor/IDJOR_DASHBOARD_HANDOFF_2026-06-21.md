# IDJOR Dashboard Handoff - 2026-06-21

This document supersedes `IDJOR_DASHBOARD_HANDOFF_2026-06-20.md` as the active dashboard reference. It keeps the 2026-06-20 baseline intact and adds the Phase 2A and Phase 2B dashboard changes that followed the backend's governed PDF/DOCX extraction adapters.

## 1. Baseline already delivered before Phase 2A/2B (2026-06-20)

Carried over unchanged from `IDJOR_DASHBOARD_HANDOFF_2026-06-20.md`:

- `/fr/login` and `/fr/idjor` pages, sidebar entry, protected session reuse, `.env.local` pointed at `http://localhost:4000`
- full API client surface in `src/lib/api.ts` for foundation, RAG read snapshots, and the controlled workflow (upload intake, extraction preview, chunking, embedding readiness/preview, retrieval readiness/preview, governance cockpit)
- full type surface in `src/types/index.ts` for the same
- the 11-step user journey on `/fr/idjor` (login -> foundation/RAG snapshots -> upload -> extraction preview -> chunking -> embedding readiness -> retrieval readiness -> governance cockpit -> audit)
- governed doctrine wording confirmed clean of anti-pattern phrases (no "LIVE IA", no "poser une question", no "activer embeddings", no "activer retrieval", no "vectoriser")
- `npm run lint` and `npm run build` passing as of 2026-06-20

## 2. What changed since 2026-06-20

### Phase 2A - display governed extraction statuses (commit `c8cee41`)

File touched: `src/components/idjor/idjor-foundation-panel.tsx`, `src/lib/api.ts`, `src/types/index.ts`.

- `IdjorRagExtractionStatus` extended with `EXTRACTED_PARTIAL_PENDING_REVIEW`, `EXTRACTION_UNSUPPORTED_TYPE`, `EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY`, `EXTRACTION_FAILED`, mirroring the backend's new Prisma enum values one to one
- `IdjorRagGovernanceBlockedReason` extended with `EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY` and `EXTRACTION_FAILED`
- `ExtractionResultBlock` now treats `EXTRACTED_PARTIAL_PENDING_REVIEW` as chunkable (same as `EXTRACTED_PENDING_REVIEW`) and shows the preview text for both
- new copy block for `EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY`: "Aucune couche texte exploitable detectee. OCR desactive, extraction bloquee."
- new copy block for `EXTRACTED_PARTIAL_PENDING_REVIEW`: "Texte natif partiel detecte. Le decoupage reste possible, mais certaines pages restent sans texte exploitable."
- `EXTRACTION_FAILED` now shares the existing error-reason display path used by `FILE_MISSING` / `FAILED`
- `mapIdjorRagDocumentExtraction` in `src/lib/api.ts` now casts the extraction status to the full typed union instead of leaving it as `string`

### Phase 2B - harden governed extraction cockpit UI (commit `4e409c3`)

Same file: `src/components/idjor/idjor-foundation-panel.tsx`.

- removed the client-side MIME-type allowlist check (`RAG_UPLOAD_INTAKE_ALLOWED_MIME_TYPES`) and the `accept=".pdf,.txt,.docx,..."` attribute on the upload `<input type="file">`, matching the backend's Phase 2B decision to accept any file into quarantine and let extraction classify unsupported types
- helper text updated from "Formats acceptes: PDF, TXT, DOCX." to "PDF, TXT et DOCX sont extraits en texte natif. Les autres formats restent en quarantaine et seront marques non supportes."
- governance cockpit access (`Voir cockpit extraction` / `Voir cockpit document` buttons and inline `GovernanceCockpitPanel`) is now also rendered when an extraction is **not** chunkable (i.e. blocked, unsupported, or failed), not only after a successful chunkable extraction, so a blocked/unsupported extraction is still auditable from the UI

No new dashboard route, no new API client function, no new type beyond the extraction-status enum extension already listed under Phase 2A.

## 3. Statuses now rendered in the dashboard

Matches the backend one to one:

- `EXTRACTED_PENDING_REVIEW` - preview text shown, chunkable
- `EXTRACTED_PARTIAL_PENDING_REVIEW` - preview text shown, chunkable, partial-text warning shown
- `EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY` - blocked warning shown, not chunkable, governance cockpit still reachable
- `EXTRACTION_UNSUPPORTED_TYPE` - shares the "extracteur non active" message with the legacy `UNSUPPORTED_PENDING_EXTRACTOR` status, not chunkable, governance cockpit still reachable
- `EXTRACTION_FAILED` - shares the error-reason display with `FILE_MISSING` / `FAILED`, not chunkable, governance cockpit still reachable

## 4. Guardrails confirmed still off in the UI

- embedding readiness panel still reports `NOT_READY` / `BLOCKED` with no activation control exposed
- retrieval readiness panel still reports `NOT_READY` / `BLOCKED` with no activation control exposed
- no citation is ever rendered as created
- no upload format restriction is enforced client-side anymore, but no new client-side parsing, OCR, or LLM call was introduced either; the relaxed `accept` attribute only changes which files the browser lets the user pick, the backend still does all classification

## 5. Validation results (this session, 2026-06-21)

Run from the actual WSL environment (`wsl.exe -d UbuntuWakama -- bash -lc "cd ~/dev/ma-assurance-dashboard && ..."`), because running `npm run lint` / `npm run build` from a Windows shell against the `\\wsl.localhost\...` UNC path fails (`cmd.exe` cannot use a UNC path as its working directory, so `eslint`/`next` cannot be resolved). This is an environment note, not a code change.

- `npm run lint`: passed, no output (clean)
- `npm run build`: passed, `next build` compiled successfully and generated all 16 static/dynamic routes, including `/fr/idjor` (21.9 kB route, 143 kB first load JS)

Browser-driven, click-by-click E2E verification of the upload -> extraction -> chunking flow on `/fr/idjor` (e.g. confirming an exact chunk count for a specific native-text PDF) was **not** executed in this documentation-only session, and no committed test artifact in either repository records such a number for this phase. Any earlier verbal claim of an exact chunk count for a specific upload is not reconfirmed here and should not be treated as validated until a browser E2E run actually produces it.

## 6. Remaining UI limits (carried over, still true)

- the IDJOR experience is still concentrated in a single large client panel (`idjor-foundation-panel.tsx`)
- the page still depends on a valid live backend session with no offline fallback
- no browser E2E automation (Playwright or similar) exists in this repository for `/fr/login` -> `/fr/idjor`
- existing `dark:*`/slate styling remnants noted in the 2026-06-20 handoff are still present and were not refactored in Phase 2A/2B, consistent with the no-heavy-UI-refactor constraint

## 7. Recommended next plan

Same recommendation as the backend handoff: freeze this governed baseline and move to a **design specification for embedding activation** (governed, not an actual activation). Browser-level E2E coverage for `/fr/login -> /fr/idjor` remains a valid alternative next step but is ranked second because the API-level and code-level evidence for the upload/extraction/chunking path is already strong from the backend integration suite.
