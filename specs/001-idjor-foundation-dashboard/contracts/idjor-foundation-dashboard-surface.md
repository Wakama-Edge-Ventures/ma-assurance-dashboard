# Contract: PHASE 2B.5 IDJOR Foundation Dashboard Surface

## Purpose

Define the frontend surface that connects the protected assurance dashboard to
the existing backend IDJOR foundation endpoints without enabling any AI runtime,
vector runtime, or decisioning control.

## Backend Reads

The frontend reads two protected backend resources through the existing API base
URL:

1. `GET /v1/idjor/foundation/health`
2. `GET /v1/idjor/foundation/registry`

Optional query behavior:

- support forwarding `tenantKey` when an explicit tenant is needed

## Required Dashboard Output

The protected page must display:

- current tenant or explicitly chosen `tenantKey`
- read-only status
- `llmEnabled = false`
- `vectorStoreEnabled = false`
- `decisioningEnabled = false`
- agents
- engines
- tools
- feature flags in OFF state
- providers and models in disabled state
- allowed source labels

## Required UI Rules

- use the existing protected layout, header, sidebar, and premium card language
- show explicit loading and error states
- do not show an activation button, decision button, scoring button, or pricing
  button
- do not label the registry/foundation surface as live AI
- any AI wording must stay within preparatory, read-only, disabled-by-default
  framing

## Required Safety Rules

- no LLM provider client is created
- no vector store client is created
- no backend route is changed
- no business calculation is added
- no existing DCA assurance flow is changed

## Validation Rules

- the repo validation commands must run and their result must be reported with
  the phase
- `/fr/applications` and `/fr/applications/[id]` must remain intact
- the new page must depend on the existing dashboard API base URL rather than a
  separate hardcoded integration client
