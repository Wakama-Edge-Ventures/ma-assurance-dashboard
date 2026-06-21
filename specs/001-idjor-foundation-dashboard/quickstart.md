# Quickstart: PHASE 2B.5 - IDJOR Foundation Read-Only Dashboard

## Goal

Validate that the protected dashboard can read the local IDJOR foundation
surface and render it without activating any AI capability.

## Prerequisites

- local backend is running and exposes the protected foundation surface under
  `http://localhost:<port>/v1`
- dashboard uses the existing `NEXT_PUBLIC_API_BASE_URL` configuration
- authenticated dashboard session already works for protected assurance pages

## Validation Flow

1. Confirm the feature package exists:

   ```bash
   ls specs/001-idjor-foundation-dashboard
   ls specs/001-idjor-foundation-dashboard/contracts
   ```

2. Confirm the new protected page and API functions exist:

   ```bash
   rg -n "getIdjorFoundationHealth|getIdjorFoundationRegistry" src/lib/api.ts src/components src/app
   rg -n "/fr/idjor|idjor" src/app/fr src/components/layout
   ```

3. Confirm no AI provider or vector client was introduced:

   ```bash
   rg -n "openai|anthropic|mistral|qwen|ollama|vllm|pinecone|weaviate|qdrant|milvus|pgvector" src
   ```

4. Run the frontend validation commands:

   ```bash
   npm run lint
   npm run build
   ```

5. Sanity-check the protected assurance routes remain present:

   ```bash
   rg -n "/fr/applications|applications/\\[id\\]" src/app/fr
   ```

## Expected Outcomes

- the protected page renders a read-only IDJOR foundation surface
- the UI shows disabled LLM, vector store, and decisioning state
- no activation control appears
- existing assurance pages still compile and remain routable
- lint and build pass
