# IDJOR Embedding Activation UI Spec - 2026-06-21

**Status**: Draft - Specification Only (no implementation in this phase)

**Companion to**: `wakama-backend/specs/017-idjor-rag-embedding-activation-governance/spec.md`

## Scope of this document

This document is design/spec-only. It does not add a route, component,
button, or API client call. It binds a future dashboard implementation phase
to the wording and display rules below, once the backend's
`017-idjor-rag-embedding-activation-governance` gates exist. Today, the
dashboard already shows embedding readiness as `NOT_READY` / `BLOCKED` with
no activation control (confirmed in
`IDJOR_DASHBOARD_HANDOFF_2026-06-21.md`, section 4); this document does not
change that current behavior.

## 1. What the dashboard MAY display (future phase)

- The embedding readiness status, using only the statuses already defined in
  `specs/014-idjor-rag-embedding-readiness` (`NOT_READY`, `BLOCKED`) and, once
  a future activation phase exists, the lifecycle statuses proposed in the
  backend spec section 7 (`EMBEDDING_NOT_READY`,
  `EMBEDDING_BLOCKED_FEATURE_FLAG_OFF`, `EMBEDDING_BLOCKED_PROVIDER_DISABLED`,
  `EMBEDDING_BLOCKED_MODEL_DISABLED`, `EMBEDDING_BLOCKED_VECTOR_STORE_DISABLED`,
  `EMBEDDING_QUEUED`, `EMBEDDING_COMPUTED_PENDING_REVIEW`, `EMBEDDING_FAILED`,
  `EMBEDDING_REVOKED`).
- The specific blocked reason for each status, never a generic "unavailable"
  label.
- Configured provider and model identifiers, presented strictly as
  configuration metadata, never as evidence that computation occurred.
- A neutral phase-status line such as: "Specification gouvernee prete -
  activation non demarree" ("governed specification ready - activation not
  started").

## 2. What the dashboard MUST NEVER display

- Any button, link, toggle, or form that would trigger real embedding
  computation, a real provider call, a real vector store write, or a real
  retrieval, regardless of environment, while the backend's six gating flags
  (`IDJOR_EMBEDDINGS_ENABLED`, `IDJOR_EMBEDDING_PROVIDER_ENABLED`,
  `IDJOR_VECTOR_STORE_ENABLED`, `IDJOR_EMBEDDING_WRITE_ENABLED`,
  `IDJOR_EMBEDDING_BACKFILL_ENABLED`, `IDJOR_RETRIEVAL_ENABLED`) are off.
- A citation, retrieved passage, or "semantic match" - none of these exist
  today and none may be rendered as if they do.
- Any label implying activation or liveness while flags are off, including
  but not limited to: "LIVE IA", "embeddings actifs", "recherche semantique
  activee", "activer embeddings", "activer retrieval", "vectoriser", "poser
  une question". This list extends, without replacing, the anti-pattern scan
  already confirmed clean in the 2026-06-20/21 dashboard handoffs.
- Any numeric claim of "vectors computed" or "documents indexed" unless that
  number is read directly from a real, persisted `RagChunkEmbedding` count -
  never a placeholder or estimate.

## 3. Forbidden vs. allowed wording (quick reference)

| Forbidden (implies live/active) | Allowed (governed/neutral) |
|---|---|
| "Embeddings actifs" | "Embedding: specification prete, activation non demarree" |
| "Recherche semantique activee" | "Recherche semantique: non disponible (flag desactive)" |
| "Activer les embeddings" (as a button) | "Statut: bloque - flag fonctionnalite desactive" |
| "Resultat de recherche" / "citation trouvee" | "Aucune citation - retrieval non actif" |
| "IA en direct" / "LIVE IA" | "Mode gouverne - aucun moteur actif" |

## 4. Display rule for blocked reasons

Each blocked status MUST render its specific cause, mirrored 1:1 from the
backend response, matching the existing pattern already used for extraction
statuses (e.g. `EXTRACTION_BLOCKED_SCANNED_OR_IMAGE_ONLY` ->
"Aucune couche texte exploitable detectee. OCR desactive, extraction
bloquee."). A future embedding-blocked reason MUST follow the same pattern,
e.g. `EMBEDDING_BLOCKED_PROVIDER_DISABLED` -> "Fournisseur d'embedding
desactive. Aucun appel externe effectue."

## 5. No activation control in this phase or the next

This phase, and the backend's companion governance phase, do not implement
any activation control. Consequently:

- No ticket derived from this document may add a clickable "Activer" control
  for embeddings until a separate, explicitly authorized activation phase has
  shipped on the backend and the relevant flags have been deliberately
  reviewed by an authorized operator.
- If a future phase adds a read-only embedding-job list (mirroring the
  backend's proposed `GET /v1/idjor/rag/embedding-jobs/:jobId`), it remains
  read-only; job creation, if ever exposed in the dashboard, requires its own
  separate spec and its own separate review.

## 6. Decision of this phase

This document does not change any dashboard route, component, or API client.
It exists to bind a future dashboard implementation to honest, governed
wording before that implementation starts. No build or lint change is
expected as a result of this document; validation for this phase is limited
to confirming `npm run lint` and `npm run build` remain unaffected.
