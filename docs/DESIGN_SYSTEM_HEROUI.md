# DESIGN_SYSTEM_HEROUI

## Phase 20 - Wakama RWA Oracle visual direction
- Primary inspiration is now the Wakama Oracle / Solana RWA command-center style, not a generic HeroUI clone.
- Visual objective: premium dark oracle telemetry shell for institutional agricultural insurance workflows.
- Product wording remains insurance/compliance wording (no crypto product framing).

## Direction update
- HeroUI runtime remains deferred (`@heroui/react` not installed in this phase).
- Tailwind v3 wrapper strategy remains in place for stability.
- Dark mode is the primary aesthetic.

## Core style rules
- Dark navy/deep blue background with subtle atmospheric gradients.
- Cyan/emerald/purple accent glows used sparingly for telemetry emphasis.
- Rounded translucent surfaces with soft borders.
- Compact cards, compact badges, and dense elegant tables.
- Transparent rounded action buttons for secondary actions.
- Search bars use a dark oracle style with subtle glow and icon placement.

## Shell and layout
- Sidebar is now collapsible with icon-only collapsed mode.
- Sidebar branding keeps Wakama logo and oracle subtitle.
- Topbar is compact and telemetry-oriented, including LIVE status emphasis.
- Hard divider lines are removed in favor of soft separation via spacing, contrast, and glow.
- Footer is compact and aligned with the oracle shell style.

## Wrappers and inheritance
- The wrapper layer remains the shared UI contract:
  - `app-card`, `app-button`, `app-badge`, `app-kpi-card`, `app-table`, `app-page-header`, `app-section`, `app-empty-state`
- Table wrappers enforce:
  - Rounded shell
  - Slightly raised header row
  - Thin subtle borders
  - Compact row density
  - Soft hover
  - Compact action controls

## Theme support
- `next-themes` is preserved.
- Modes remain: `Light`, `Dark`, `System`.
- Default remains `System`.
- Light mode remains supported and coherent, while dark mode is the hero mode.

## Branding and compliance-safe constraints
- Wakama logo usage is preserved from `src/img/wakama_logo.png`.
- DataSourceBadge visibility (`LIVE` / `SEED_DEMO`) is preserved.
- Footer contains the updated legal line with `© 2026 Wakama Edge Ventures Inc.`.
- Service behavior, API/fallback logic, routes, data contracts, auth flow, and compliance/business rules are unchanged.
