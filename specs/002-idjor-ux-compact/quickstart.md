# Quickstart: PHASE 2B.6 - IDJOR Compact Demo UX

## Goal

Validate that `/fr/idjor` is more compact, more demo-friendly, and still fully
read-only.

## Prerequisites

- the Phase 2B.5 IDJOR foundation page already exists
- the protected backend foundation routes still respond through the configured
  dashboard base URL

## Validation Flow

1. Confirm the feature package exists:

   ```bash
   ls specs/002-idjor-ux-compact
   ls specs/002-idjor-ux-compact/contracts
   ```

2. Confirm the compact UX implementation is present:

   ```bash
   rg -n "Resume executif|compact|Synthese|Agents|Moteurs|Tools|Flags|Providers / Models|Securite" src/components/idjor src/app/fr
   ```

3. Confirm no provider or vector client was added:

   ```bash
   rg -n "openai|anthropic|mistral|qwen|ollama|vllm|pinecone|weaviate|qdrant|milvus|pgvector" src
   ```

4. Run validation commands:

   ```bash
   npm run lint
   npm run build
   ```

5. Sanity-check existing assurance routes still exist:

   ```bash
   rg -n "/fr/applications|applications/\\[id\\]" src/app/fr
   ```

## Expected Outcomes

- the first viewport gives a professional executive summary
- the page is shorter by default than the previous full-detail layout
- technical tables remain accessible through sections and bounded containers
- no AI activation control appears
- lint and build pass
