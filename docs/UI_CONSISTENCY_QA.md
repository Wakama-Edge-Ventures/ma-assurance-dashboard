# UI_CONSISTENCY_QA — Phase 24

## Visual standard: Wakama Oracle / RWA command center

All protected pages use the dark navy Oracle shell. Key tokens are defined in `src/lib/design-tokens.ts`.

---

## Component fixes applied

### Section headings inside cards

All `h2` labels inside Card/panel content replaced with Oracle mono heading:
- **Before:** `text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200`
- **After:** `font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400`

Files fixed: all `*-next-action-card.tsx`, `*-checklist.tsx`, `*-formula-card.tsx`, `*-config-summary.tsx`, `*-breakdown-card.tsx`, `shared/implementation-card.tsx`

### Body text / info grids

- **Before:** `text-sm text-slate-700 dark:text-slate-200`
- **After:** `text-[13px] text-slate-300`

### Formula / white-on-dark text

- **Before:** `text-sm text-slate-900 dark:text-slate-100`
- **After:** `text-[13px] text-slate-200`

### Strong value text

- **Before:** `font-semibold text-slate-900 dark:text-slate-100`
- **After:** `font-semibold text-white`

### Hero ID text in detail cards

- **Before:** `text-lg font-semibold text-slate-900 dark:text-slate-100`
- **After:** `text-lg font-semibold text-white`

### Tabular numerics in tables

- **Before:** `tabular-nums text-slate-700 dark:text-slate-200`
- **After:** `tabular-nums text-slate-300`

### Primary action buttons (violet)

- **Before:** `rounded-md bg-brand-violet px-3 py-2 text-sm font-medium text-white`
- **After:** `inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-3.5 py-1.5 font-mono text-[12.5px] text-violet-200 transition-colors hover:bg-violet-500/24`

Files fixed: `application-next-action-card`, `mission-next-action-card`, `arbitrage-next-action-card`

### Secondary action buttons (ghost pill)

- **Before:** `inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-900 dark:text-slate-100`
- **After:** `inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white`

Files fixed: `monitoring`, `claims`, `policies`, `rax`, `pricing` next-action cards + all detail page Link buttons

### Oracle inline action panel (pricing-next-action-card)

- **Before:** `space-y-3 rounded-lg border border-brand-border bg-slate-900/40 p-3`
- **After:** `space-y-3 rounded-[20px] border border-slate-400/10 bg-[#101726]/92 p-[18px_20px_20px]`

---

## List pages fixed

| Page | Change |
|------|--------|
| `/fr/applications` | `Card + h2` → `AppSection` for status distribution chips |
| `/fr/monitoring` | Two `Card + h2` → two `AppSection` (severity + readiness) |
| `/fr/claims` | Two `Card + h2` → two `AppSection` (lien alertes + distribution) |
| `/fr/missions` | `Card + h2` → `AppSection` for status distribution chips |
| `/fr/arbitrage` | `Card + h2` → `AppSection` for linked missions note |
| `/fr/rax` | `Card + h2` → `AppSection` for risk tier distribution |
| `/fr/policies` | `Card + h2` → `AppSection` for monitoring readiness note |

Distribution chip style: `rounded-full border border-slate-400/10 bg-slate-800/60 px-3 py-1 font-mono text-[11px] text-slate-400`

---

## Detail pages fixed

| Page | Patterns replaced |
|------|------------------|
| `/fr/applications/[id]` | h2, body grid, body lists, secondary buttons, hero ID |
| `/fr/monitoring/[id]` | h2, body text, secondary buttons, hero ID |
| `/fr/claims/[id]` | h2, body text, secondary buttons, hero ID |
| `/fr/pricing/[id]` | h2, body text, secondary buttons, hero ID |
| `/fr/missions/[id]` | h2, body text, hero ID, formula text |
| `/fr/arbitrage/[id]` | h2, body text, hero ID |
| `/fr/rax/[id]` | h2, body text, hero ID |
| `/fr/policies/[id]` | h2, body text, secondary buttons, hero ID |

---

## Pages verified clean (no changes needed)

- `/fr/dashboard` — uses StatCard/AppKpiCard wrappers, already Oracle
- `/fr/farmers` — uses AppTable/AppTableFilters, reference implementation
- `/fr/cooperatives` — uses AppTable, clean
- `/fr/alerts` — uses AppTable, clean
- `/fr/analytics` — Phase 23, uses AppSection/AppKpiCard, clean
- `/fr/reports` — Phase 23, uses wrapper layer, clean
- `/fr/settings` — Phase 23, internal client component, clean

---

## Rules preserved (unchanged)

- All compliance wording intact verbatim
- LIVE / SEED_DEMO behavior unchanged
- API service, DTO mappers, fallback logic unchanged
- Auth logic, routes, business logic unchanged
- localStorage (settings, reports) unchanged
- Report export (CSV, JSON, PDF) unchanged
- Settings simulation logic unchanged

---

## Build status

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ npm run lint — clean
✓ npm run build — clean
✓ npm run smoke:live-shared — 63 farmers, 2 cooperatives, 12 parcelles, 50 alerts
```
