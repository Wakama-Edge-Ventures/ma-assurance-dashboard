# Data Model: PHASE 2B.5 - IDJOR Foundation Read-Only Dashboard

## Foundation Health Snapshot

Represents the tenant-scoped read-only health summary returned by the protected
foundation health endpoint.

| Field | Type | Notes |
|---|---|---|
| `tenant.tenantKey` | string | Current or explicitly selected tenant key |
| `tenant.institutionId` | string | Institution scope returned by backend |
| `tenant.country` | string | Tenant country code |
| `tenant.vertical` | string | Tenant business vertical |
| `counts.agents` | number | Count of tenant-scoped agent registry entries |
| `counts.engines` | number | Count of tenant-scoped engine registry entries |
| `counts.tools` | number | Count of visible tenant-scoped tool entries |
| `counts.providers` | number | Count of provider catalog entries |
| `counts.models` | number | Count of model catalog entries |
| `counts.featureFlags` | number | Count of feature flag entries |
| `allFeatureFlagsOff` | boolean | Must remain `true` in this phase |
| `allProvidersDisabled` | boolean | Must remain `true` in this phase |
| `allModelsDisabled` | boolean | Must remain `true` in this phase |
| `allToolsReadOnly` | boolean | Must remain `true` in this phase |
| `securitySummary.llmEnabled` | boolean | Expected `false` |
| `securitySummary.vectorStoreEnabled` | boolean | Expected `false` |
| `securitySummary.decisioningEnabled` | boolean | Expected `false` |
| `securitySummary.sourceLabels` | string[] | Allowed source labels surfaced by backend |
| `securitySummary.readOnly` | boolean | Expected `true` |
| `resolutionMode` | string | Backend tenant resolution mode when provided |
| `readOnly` | boolean | Top-level truth flag from backend |

## Foundation Registry Snapshot

Represents the tenant-scoped registry payload returned by the protected
foundation registry endpoint.

| Field | Type | Notes |
|---|---|---|
| `tenant` | object | Same tenant identity block as health snapshot |
| `agents` | array | Agent registry rows, each surfaced as read-only metadata |
| `engines` | array | Engine registry rows, each surfaced as read-only metadata |
| `tools` | array | Visible tool registry rows scoped by backend role rules |
| `featureFlags` | array | Feature flag rows expected to remain disabled |
| `providers` | array | Provider catalog rows expected to remain disabled |
| `models` | array | Model catalog rows expected to remain disabled |
| `securitySummary` | object | Same disabled-control summary as health snapshot |
| `resolutionMode` | string | Backend tenant resolution mode when provided |
| `readOnly` | boolean | Top-level truth flag from backend |

## Foundation View State

Tracks the protected page rendering lifecycle.

| State | Meaning |
|---|---|
| `loading` | The page is waiting for one or both backend reads |
| `ready` | Both foundation reads completed and can be rendered together |
| `error` | At least one protected read failed or returned an unusable payload |

## Derived Presentation State

| Derived Value | Source | Use |
|---|---|---|
| `selectedTenantKey` | Explicit user choice or backend tenant | Shows current target tenant |
| `foundationModeLabel` | Health + registry disabled flags | Explains read-only preparatory posture |
| `featureFlagsOffCount` | Disabled feature flag rows | Summarizes OFF-by-default posture |
| `disabledProvidersCount` | Provider rows with disabled status | Summarizes provider posture |
| `disabledModelsCount` | Model rows with disabled status | Summarizes model posture |
| `allowedSourceLabels` | `securitySummary.sourceLabels` | Shows approved source labels only |
