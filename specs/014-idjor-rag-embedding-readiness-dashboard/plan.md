# Implementation Plan: IDJOR RAG Embedding Readiness Dashboard

**Branch**: `014-idjor-rag-embedding-readiness-dashboard` | **Date**: 2026-06-20 | **Spec**: spec.md

## Summary

Wire `/fr/idjor` to the already-deployed backend embedding-readiness routes so a back-office user can check, per extraction, whether its chunks are eligible for embedding and why embeddings remain blocked, and can request a (always-blocked) embedding preview. No backend, auth, or business-logic change. No real embedding, external provider activation, vector store, or retrieval is introduced.

## Technical Context

- **Frontend**: Next.js app (`ma-assurance-dashboard`), client component `src/components/idjor/idjor-foundation-panel.tsx`, inside the existing chunking panel (`ExtractionResultBlock`), below the deterministic chunk list added in phase 012.
- **API client**: `src/lib/api.ts`, `apiFetch` helper (Bearer token, `credentials: include`).
- **Types**: `src/types/index.ts`.
- **Backend (read-only reference, not modified)**: `wakama-backend/src/routes/idjor.ts` (`GET /rag/extractions/:extractionId/embedding-readiness` ~line 904, `POST /rag/extractions/:extractionId/embedding-preview-request` ~line 944); service `wakama-backend/src/idjor/services/ragEmbeddingReadiness.ts` (`buildRagEmbeddingReadiness`, `requestRagEmbeddingJobPreview`); contracts in `wakama-backend/src/idjor/rag/contracts.ts` (`IdjorRagEmbeddingReadiness`, `IdjorRagEmbeddingReadinessState`, `IdjorRagEmbeddingBlockedReason`, `IdjorRagEmbeddingRequiredFlag`, `IdjorRagEmbeddingProviderStatus`, `IdjorRagEmbeddingModelStatus`, `IdjorRagEmbeddingVectorStoreStatus`, `IdjorRagEmbeddingPreviewResult`).

### Confirmed backend response shapes (read directly from source)

`GET /v1/idjor/rag/extractions/:extractionId/embedding-readiness` -> 200:
```
{
  scope, documentId, documentKey, extractionId,
  eligibleChunksCount, embeddingReadiness: "NOT_READY" | "BLOCKED",
  requiredFlags: [{ targetType: "RAG"|"PROVIDER"|"MODEL", targetKey, enabled }],
  providerStatus: { providerKey, isEnabled, registryStatus },
  modelStatus: { modelKey, isEnabled, registryStatus },
  vectorStoreStatus: { vectorStoreEnabled: false, reason },
  blockedReasons: ("NO_CHUNKS"|"EMBEDDINGS_FEATURE_FLAG_OFF"|"EMBEDDING_PROVIDER_DISABLED"|"EMBEDDING_MODEL_DISABLED"|"VECTOR_STORE_DISABLED")[],
  linkedAssetCounts: { chunks, embeddings, citations },
  securitySummary: { ragEnabled: false, vectorStoreEnabled: false, embeddingsEnabled: false, llmEnabled: false, decisioningEnabled: false, sourceLabels, readOnly: true },
  embeddingsComputed: false,
  resolutionMode, readOnly: true
}
```
Errors: 404 if extraction/tenant not found.

`POST /v1/idjor/rag/extractions/:extractionId/embedding-preview-request` -> 200:
```
{
  scope, documentId, documentKey, extractionId,
  previewStatus: "BLOCKED",
  readiness: <same shape as the GET response above, minus resolutionMode/readOnly>,
  embeddingJobCreated: false,
  embeddingReferenceCreated: false,
  resolutionMode, readOnly: true
}
```

Note: `IdjorRagEmbeddingReadinessState` only has two members, `"NOT_READY"` and `"BLOCKED"` — there is no backend-supported `"READY"` value in this phase, so the UI structurally cannot render an active-readiness state.

## Naming deviation from the request

The request suggested `IdjorRagEmbeddingReadiness`, `IdjorRagEmbeddingReadinessResponse`, `IdjorRagEmbeddingPreviewRequestResponse`. These names are free in `src/types/index.ts` and are used as-is, split into the smaller shared sub-types (`IdjorRagEmbeddingReadinessState`, `IdjorRagEmbeddingBlockedReason`, `IdjorRagEmbeddingRequiredFlag`, `IdjorRagEmbeddingProviderStatus`, `IdjorRagEmbeddingModelStatus`, `IdjorRagEmbeddingVectorStoreStatus`) to mirror the backend contracts field-for-field and stay consistent with the existing `IdjorRagExtractionChunk*` naming pattern from phase 012.

## Constitution Check

- No backend modified: PASS (read-only inspection only).
- No auth changed: PASS.
- No new frontend route: PASS (feature lives inside the existing `/fr/idjor` page/component, inside the existing chunking panel).
- No embedding/vector store/retrieval/citation/LLM: PASS (readiness endpoint only reads catalog/flag state and counts eligible chunks; preview-request endpoint always returns `BLOCKED` and never creates an embedding job or embedding reference).
- No OCR / PDF/DOCX parsing: PASS (no file parsing is touched by this phase).

## Project Structure

```
specs/014-idjor-rag-embedding-readiness-dashboard/
├── spec.md
├── plan.md
├── tasks.md
├── validation-log.md
└── checklists/
    └── requirements.md
```

### Source files touched

- `src/types/index.ts` — add `IdjorRagEmbeddingReadinessState`, `IdjorRagEmbeddingBlockedReason`, `IdjorRagEmbeddingRequiredFlag`, `IdjorRagEmbeddingProviderStatus`, `IdjorRagEmbeddingModelStatus`, `IdjorRagEmbeddingVectorStoreStatus`, `IdjorRagEmbeddingReadiness`, `IdjorRagEmbeddingReadinessResponse`, `IdjorRagEmbeddingPreviewRequestResponse`.
- `src/lib/api.ts` — add `getIdjorRagEmbeddingReadiness(extractionId)` (`GET`) and `requestIdjorRagEmbeddingPreview(extractionId)` (`POST`), plus matching response mappers following the existing `mapIdjorRag*` pattern.
- `src/components/idjor/idjor-foundation-panel.tsx` — inside `ExtractionResultBlock`'s chunking panel: add an `EmbeddingReadinessPanel` display component, a "Verifier readiness embeddings" action (always available), a "Demande preview embedding" action (only after a `BLOCKED`/`NOT_READY` readiness result), loading/success/error states for both, and the fixed disclosure text. After a successful preview request, refresh the readiness snapshot and the document audit view if open.

## Phase 0: Research

No open unknowns — backend contracts were read directly from `wakama-backend` source (routes + service + contracts) to match field names exactly (`eligibleChunksCount`, `embeddingReadiness`, `requiredFlags`, `providerStatus`, `modelStatus`, `vectorStoreStatus`, `blockedReasons`, `previewStatus`, `embeddingJobCreated`, `embeddingReferenceCreated`).

## Phase 1: Design

- Reuse the existing state-machine pattern (`{status: "idle" | "loading" | "success" | "error"}` keyed by `extractionId`) already used for `ragExtractionChunkingState` and `ragExtractionChunksListState`.
- No new "panel open" toggle is needed: the new UI lives inside the existing chunking panel, gated on `chunkingPanelExtractionId === extraction.id`, matching the chunk list.
- Extend `ExtractionResultBlock` (rather than duplicating it) with four new optional props (`ragEmbeddingReadinessState`, `ragEmbeddingPreviewRequestState`, `onCheckEmbeddingReadiness`, `onRequestEmbeddingPreview`), since it is already used both for the latest preview result and for each item in the extractions list.
- Add a small `EmbeddingReadinessPanel` presentational component to render the readiness fields, reusing `ExecutiveStatus` for provider/model/vector-store status.
- Reuse `mapIdjorRagScope`, `mapIdjorRagSecuritySummary`, `mapIdjorRagLinkedAssetCounts`, `asObject`, `readString`, `readNumberLike`, `readBooleanLike`, `readArray` helpers already in `api.ts`.
- Reset the new states whenever the chunking panel, extraction panel, or upload panel is toggled, mirroring the existing reset pattern for chunking state.

## Phase 2: Tasks

See tasks.md.
