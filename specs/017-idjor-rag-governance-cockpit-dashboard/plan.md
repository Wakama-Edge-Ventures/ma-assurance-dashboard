# Implementation Plan: PHASE 2J.2 - IDJOR RAG Governance Cockpit Dashboard

**Branch**: `017-idjor-rag-governance-cockpit-dashboard` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-idjor-rag-governance-cockpit-dashboard/spec.md`

## Summary

Extend `/fr/idjor` so users can check retrieval readiness, request a blocked
retrieval preview, and view a compact RAG Governance Cockpit for document and
extraction scopes. The UI remains read-only and truthful: no active retrieval,
no live vector store, no embedding execution, and no LLM runtime.

## Technical Context

**Language/Version**: TypeScript 5 with React 19 and Next.js 15 App Router

**Primary Dependencies**: Existing `/fr/idjor` client panel, shared API client,
shared type definitions, and current read-only backend routes

**Testing**: `npm run lint`, `npm run build`, and prohibited-wording scans

**Constraints**: No backend change, no auth change, no new business
calculation, no active AI wording, no "vectoriser" or "poser une question"
action, and no automatic commit

## Constitution Check

- PASS: The dashboard remains truthful about inactive AI and institutional
  decision ownership.
- PASS: The phase adds no backend, auth, or business logic.
- PASS: All new actions remain read-only or blocked-preview only.

## Structure Decision

Keep all UI work inside the existing `src/components/idjor/idjor-foundation-panel.tsx`,
extend `src/types/index.ts`, and add additive API mappers and request helpers in
`src/lib/api.ts`.
