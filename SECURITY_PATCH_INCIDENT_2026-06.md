# SECURITY_PATCH_INCIDENT_2026-06

## Scope

- Repo audited: `~/dev/ma-assurance-dashboard`
- Application: `https://assurance.wakama.farm`
- Coolify resource target for future rebuild only: `assurance-ma-wakama`
- Branch audited: `design/heroui-polish`
- Audit date: `2026-06-11`
- Deployment performed: `NO`

## Incident Context

The previous production container running Next.js `15.2.4` was reported compromised and removed outside this repository. This repository was audited as a clean-rebuild candidate only. No VPS access, deployment, DNS, or PostgreSQL changes were performed during this work.

## Repository Verification

- Branch verified: `design/heroui-polish`
- Remote verified: `origin https://github.com/Wakama-Edge-Ventures/ma-assurance-dashboard.git`
- Initial local worktree was already dirty before this audit.
- Pre-existing local changes preserved:
  - `.claude/settings.local.json`
  - `src/components/insurance/evidence-bundle-panel.tsx`
  - multiple `Zone.Identifier` artifact path entries under `docs/design-references/` and `src/img/`

## Initial Dependency State

- `next`: `15.2.4`
- `eslint-config-next`: `15.2.4`
- `react`: `19.0.0`
- `react-dom`: `19.0.0`
- top-level `postcss`: `8.4.49`
- local WSL default Node before remediation: `18.20.8`

Initial `npm audit` results:

- runtime/dev: `1 critical`, `1 moderate`
- primary direct vulnerability path:
  - `next@15.2.4`
  - nested `next -> postcss@8.4.31`

## Compromise Indicator Search

Searches completed excluding `node_modules` and `.next` for:

- `xmrig`
- `moneroocean`
- `OVH-AMP`
- `185.123.188.115`
- `safenet_vvz`
- suspicious filenames such as `amps` and `god`

Results:

- no malware indicator filenames found in the repo payload
- no compromise indicator strings found in application source
- no system execution primitives found in runtime app code (`src/`, `scripts/`, `next.config.ts`, `package.json`)

Additional note:

- `.claude/settings.local.json` contains local tool allowlist entries referencing `curl`, backend repo reads, and git commands. These are developer-tool settings, not runtime application code.
- `Zone.Identifier` entries are Windows metadata artifact filenames in the worktree, not executable payloads.

## System Execution Review

Searches for `child_process`, `exec`, `spawn`, `fork`, `eval`, `new Function`, `wget`, and `curl` in runtime code returned no matches in application source.

Conclusion:

- no justified or unjustified shell/system execution path exists in shipped app code

## Middleware, Server Actions, and API Route Review

Reviewed areas:

- `src/app/api/blockchain-verify/route.ts`
- `src/app/api/bug/route.ts`
- `src/app/api/hotline/route.ts`
- `src/lib/auth.ts`
- `src/lib/api.ts`
- `src/lib/api/insuranceApi.ts`
- `src/app/fr/(protected)/layout.tsx`

Results:

- no `middleware.ts` present
- no `"use server"` files present
- no `headers()` or `cookies()` usage in app code
- API routes return generic browser errors (`missing_fields`, `internal_error`) and do not expose stack traces to the client
- no user input is transformed into shell/system commands
- application/resource ids used in backend paths are wrapped with `encodeURIComponent` in `src/lib/api.ts`
- backend calls use `credentials: "include"` and optional bearer tokens
- protected UI routes rely on client-side session restoration in `src/app/fr/(protected)/layout.tsx`

Residual auth gap:

- anonymous HTTP requests to protected pages return `200` with the session-check shell instead of a true server-side `302` or `401`
- verified content returned to anonymous `/fr/dashboard` requests contains the session-check placeholder, not the protected dashboard body
- auth is therefore not fully enforced at the HTTP layer on first response
- tracked as `P1_SERVER_SIDE_ROUTE_GATING`

## Environment Variable Inventory

No non-public `process.env.*` variables are referenced in the repository.

Exact variables referenced by code:

| Variable | Build or runtime | Secret | Files |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Build + runtime | No | `src/lib/auth.ts`, `src/lib/api.ts`, `src/lib/api/insuranceApi.ts`, `src/lib/constants.ts`, `scripts/smoke-live-shared-data.mjs` |
| `NEXT_PUBLIC_USE_LIVE_API` | Build | No | `src/lib/insurance-service.ts`, UI status components |
| `NEXT_PUBLIC_USE_LIVE_INSURANCE_API` | Build | No | `src/lib/api/insuranceApi.ts`, `src/lib/insurance-service.ts`, UI status components |
| `NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK` | Build | No | `src/lib/api/insuranceApi.ts`, `src/lib/insurance-service.ts`, `src/app/fr/(protected)/farmers/page.tsx`, UI status components |
| `NEXT_PUBLIC_DEBUG_API_SHAPES` | Build | No | `src/lib/insurance-service.ts`, `src/components/insurance/rax-live-panel.tsx` |

Rotation assessment:

- code-referenced variables in this repo are public configuration flags, not secrets
- `ROTATION_REQUIRED`: none for code-referenced variables
- if any additional non-repo secrets were injected into the compromised container outside code usage, they must be rotated separately; this repo audit cannot enumerate them without reading external secret stores

## Applied Remediation

Updated:

- `next`: `15.2.4` -> `15.5.19`
- `eslint-config-next`: `15.2.4` -> `15.5.19`
- `react`: `19.0.0` -> `19.2.7`
- `react-dom`: `19.0.0` -> `19.2.7`
- top-level `postcss`: `8.4.49` -> `8.5.15`
- added `engines.node = "20.x"`
- added npm override:
  - `"overrides": { "next": { "postcss": "8.5.15" } }`
- added `outputFileTracingRoot` to `next.config.ts` to stop incorrect workspace-root inference during build

Install validation executed under Node `20.20.2` via `nvm`.

Deterministic reinstall cycle executed:

1. attempted override with existing `package-lock.json`
2. observed stale nested `node_modules/next/node_modules/postcss@8.4.31` persisted
3. demonstrated that the same manifest + override resolved correctly in a clean temp project
4. backed up and removed stale `package-lock.json`
5. removed `node_modules`
6. regenerated lockfile with `npm install`
7. removed `node_modules`
8. validated clean deterministic install with `npm ci`

Why lockfile regeneration was necessary:

- with the pre-existing lockfile, npm kept rehydrating a stale nested `next/node_modules/postcss@8.4.31` edge even after the override
- after lockfile regeneration, the exact same manifest resolved `next -> postcss@8.5.15` correctly and audits dropped to zero

## Final Dependency State

- `next`: `15.5.19`
- `eslint-config-next`: `15.5.19`
- `react`: `19.2.7`
- `react-dom`: `19.2.7`
- top-level `postcss`: `8.5.15`
- nested `next -> postcss`: `8.5.15` via npm override
- Node target declared: `20.x`

Final `npm ls next postcss` tree:

```txt
ma-assurance-dashboard@0.1.0
|- autoprefixer@10.5.0
|  `- postcss@8.5.15 deduped
|- next@15.5.19 overridden
|  `- postcss@8.5.15 deduped
|- postcss@8.5.15
`- tailwindcss@3.4.19
   `- postcss@8.5.15 deduped
```

Final `npm explain postcss` conclusion:

- no `postcss@8.4.31` remains installed
- `next@15.5.19` resolves its `postcss` dependency to `8.5.15`

## Remaining Vulnerabilities

Current final `npm audit` and `npm audit --omit=dev` results:

- `0 vulnerabilities`
- `0 high`
- `0 critical`
- no remaining runtime or dev advisories after override + lockfile regeneration

## Validation Results

### npm audit --omit=dev

- status: `PASSED`
- result: `found 0 vulnerabilities`

### npm audit

- status: `PASSED`
- result: `found 0 vulnerabilities`

### lint

- command: `npm run lint`
- status: `PASSED`

### build

- command: `npm run build`
- status: `PASSED`
- Next.js version in build output: `15.5.19`

## HTTP Smoke Tests

Server started locally with:

- `PORT=3015 npm run start`

Observed responses:

- `/` -> `307` redirect to `/fr/dashboard`
- `/fr/login` -> `200`
- `/fr/dashboard` -> `200`
- `/fr/applications` -> `200`
- `/fr/bug` -> `200`
- `/fr/hotline` -> `200`
- `/fr/blockchain` -> `200`

Interpretation:

- public pages render correctly
- protected pages do not emit a server-side auth redirect or status on anonymous first response
- residual auth risk remains tracked as `P1_SERVER_SIDE_ROUTE_GATING`
- prior anonymous content verification in this audit cycle confirmed the `/fr/dashboard` response shell contains the session-check placeholder rather than business data

## Coolify Rebuild Settings

Recommended future clean rebuild settings:

- Build Pack: `Nixpacks`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Start Command: `npm run start`
- Port: `3000`
- Node: `20`
- Env: `NIXPACKS_NODE_VERSION=20`

## Redeployment Recommendation

- rebuild from a new image only
- do not restart or reuse any previous compromised image or container

## Final Verdict

`READY_FOR_CLEAN_REDEPLOYMENT`

Reason:

- `npm audit --omit=dev`: green
- `npm audit`: green
- `npm run lint`: green
- `npm run build`: green
- smoke-test routes respond as expected for the current app behavior
- redeployment should still use a brand-new image, and `P1_SERVER_SIDE_ROUTE_GATING` remains a separate follow-up hardening item
