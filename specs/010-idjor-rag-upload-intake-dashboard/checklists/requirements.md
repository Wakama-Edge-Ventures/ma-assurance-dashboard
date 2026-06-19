# Requirements Checklist: IDJOR RAG Upload Intake Dashboard

- [X] Frontend calls only `POST /v1/idjor/rag/documents/:id/upload-intake` and `GET /v1/idjor/rag/documents/:id/uploads`.
- [X] Client-side size validation: reject files > 10 MB before any request.
- [X] Client-side MIME validation: allow only `application/pdf`, `text/plain`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- [X] Single-file input (no multi-file selection).
- [X] Fixed disclosure text present: "Quarantaine documentaire uniquement. Aucun contenu n'est lu, extrait, decoupe, vectorise ou analyse par IA."
- [X] Action labels limited to "Joindre fichier controle" / "Envoyer en quarantaine"; no ingest/index/vectorize/question wording.
- [X] Loading / success / error states implemented for the upload action.
- [X] Read-only uploads list per document: filename, mimeType, sizeBytes, sha256Hash, status, createdAt.
- [X] After successful upload: uploads list refreshed, RAG audit/health snapshot refreshed.
- [X] Document `ingestionStatus` not changed by upload (verified via live API call: stayed `REGISTERED`).
- [X] No backend file modified.
- [X] No auth flow modified.
- [X] No new frontend route added (feature lives inside existing `/fr/idjor`).
- [X] `src/components/insurance/evidence-bundle-panel.tsx` left untouched.
- [X] `.claude/settings*.json` left untouched.
- [X] `npm run lint` passes.
- [X] `npm run build` passes, `/fr/idjor` present in route output.
- [X] Forbidden-wording scan over `src/` clean (no new occurrence).
