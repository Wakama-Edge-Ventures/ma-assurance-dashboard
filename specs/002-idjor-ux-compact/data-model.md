# Data Model: PHASE 2B.6 - IDJOR Compact Demo UX

## Executive Summary View

Top-of-page synthesis derived from the existing foundation snapshots.

| Field | Type | Notes |
|---|---|---|
| `foundationReady` | boolean | Derived from read-only and disabled-control posture |
| `registryReadOnly` | boolean | Derived from backend read-only state |
| `llmOff` | boolean | Derived from `securitySummary.llmEnabled === false` |
| `vectorStoreOff` | boolean | Derived from `securitySummary.vectorStoreEnabled === false` |
| `decisioningOff` | boolean | Derived from `securitySummary.decisioningEnabled === false` |
| `institutionDecisionMaker` | boolean | Presentation rule that remains explicitly true in wording |
| `tenantKey` | string | Current tenant or selected tenant key |

## Compact Section State

Client-side section visibility model for the polished page.

| Field | Type | Notes |
|---|---|---|
| `compactMode` | boolean | Controls compact presentation behavior |
| `summaryOpen` | boolean | Executive area visibility |
| `agentsOpen` | boolean | Agents section visibility |
| `enginesOpen` | boolean | Engines section visibility |
| `toolsOpen` | boolean | Tools section visibility |
| `flagsOpen` | boolean | Flags section visibility |
| `providersOpen` | boolean | Providers/models section visibility |
| `securityOpen` | boolean | Security section visibility |

## Bounded Detail Region

Presentation wrapper for large data blocks.

| Field | Type | Notes |
|---|---|---|
| `maxHeightClass` | string | Constrains visible height in compact mode |
| `isScrollable` | boolean | Enables internal scroll for large tables |
| `itemCount` | number | Used in section summary labels |

## Existing Registry Data

The phase reuses the existing health and registry snapshots from Phase 2B.5
without changing their structure or source.
