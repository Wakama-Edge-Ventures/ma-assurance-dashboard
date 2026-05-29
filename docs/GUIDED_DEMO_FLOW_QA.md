# GUIDED_DEMO_FLOW_QA — Phase 25

## Overview

Phase 25 adds a guided end-to-end demo flow for the Wakama Assurance insurance pipeline.
Presenters can walk through a complete dossier from Application → Mission → Arbitrage → RAX/WRS → Pricing → Policy → Monitoring → Claim — all on SEED_DEMO data.

**Strict rules preserved:**
- No live API behavior changed
- No backend write calls added
- No SEED_DEMO data presented as live
- Wakama positioning unchanged (structure, score, document, monitor)
- All compliance wording intact

---

## Files created / modified

### New files

| File | Purpose |
|------|---------|
| `src/lib/demo-scenario.ts` | Pure data module — scenario definition, 9 steps, entity IDs, SSR-safe |
| `src/lib/demo-scenario-state.ts` | localStorage state management — client-safe, checks `typeof window` |
| `src/components/demo/guided-demo-panel.tsx` | "use client" — Oracle dark panel shown on each detail page |
| `src/components/demo/pipeline-stepper.tsx` | "use client" — horizontal 9-step stepper, clickable |
| `src/components/demo/dashboard-demo-section.tsx` | "use client" — dashboard demo launcher + progress |

### Modified files

| File | Change |
|------|--------|
| `src/app/fr/(protected)/applications/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/missions/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/arbitrage/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/rax/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/pricing/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/policies/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/monitoring/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/claims/[id]/page.tsx` | Added PipelineStepper + GuidedDemoPanel |
| `src/app/fr/(protected)/dashboard/page.tsx` | Added DashboardDemoSection import + rendering |
| `src/components/settings/settings-panel.tsx` | Added DemoScenarioControls to governance tab |
| `src/lib/reporting.ts` | Added `parcours-demo-assureur` report template |

---

## Demo scenario

### Scenario ID
`parcours-cereales-maroc-001`

### Pipeline steps

| Step | Label | Route | Entity ID | Status |
|------|-------|-------|-----------|--------|
| 1 | Demande | `/fr/applications/app_001` | `app_001` | completed |
| 2 | Mission | `/fr/missions/mis_001` | `mis_001` | completed |
| 3 | Audit terrain | `/fr/arbitrage/aud_001` | `aud_001` | completed |
| 4 | Arbitrage | `/fr/arbitrage/aud_001` | `aud_001` | completed |
| 5 | RAX / WRS | `/fr/rax/rax_001` | `rax_001` | completed |
| 6 | Tarification | `/fr/pricing/off_001` | `off_001` | active |
| 7 | Police | `/fr/policies/pol_001` | `pol_001` | pending |
| 8 | Monitoring | `/fr/monitoring/alr_001` | `alr_001` | pending |
| 9 | Sinistre | `/fr/claims/clm_001` | `clm_001` | pending |

### Note on steps 3 and 4

Steps 3 (Audit terrain) and 4 (Arbitrage) share the same route and entity ID (`aud_001` → `/fr/arbitrage/aud_001`). The `GuidedDemoPanel` on the arbitrage detail page shows `step-arbitrage` (step 4). This is acceptable in SEED_DEMO context.

---

## localStorage keys

| Key | Purpose |
|-----|---------|
| `wakama_assurance_demo_scenario_v1` | Full scenario state (stepId, previewedIds, timestamps) |
| `wakama_assurance_demo_current_step_v1` | Current step ID (convenience key) |

---

## Compliance check

- All panels show `SEED_DEMO` badge
- `disclosureText` from scenario is displayed on each panel: "Ce parcours est une simulation interface SEED_DEMO. Aucune mutation backend. La décision finale reste réservée à l'assureur."
- `complianceNote` per step is shown in each `GuidedDemoPanel`
- No panel or component claims Wakama decides, insures, or indemnifies
- No LIVE data is referenced in demo panels
- Demo components only render when `isScenarioEntityId(entityId)` returns true (i.e., only for `app_001`, `mis_001`, `aud_001`, `rax_001`, `off_001`, `pol_001`, `alr_001`, `clm_001`)

---

## Rules preserved (unchanged)

- LIVE API behavior unchanged
- SEED_DEMO fallback behavior unchanged
- Auth logic unchanged
- Service layer, DTO mappers, fallback logic unchanged
- Routes unchanged
- Business logic unchanged
- localStorage settings (`wakama_assurance_settings_*`) unchanged
- Report export logic unchanged

---

## QA checklist

### Demo scenario module
- [ ] `getDemoStepByEntityId("app_001")` returns `step-application`
- [ ] `getDemoStepByEntityId("aud_001")` returns `step-audit` (first match)
- [ ] `isScenarioEntityId("app_001")` returns `true`
- [ ] `isScenarioEntityId("app_002")` returns `false`
- [ ] `demo-scenario.ts` has no client imports (SSR-safe)

### Demo state module
- [ ] `getDemoScenarioState()` returns default state when no localStorage entry
- [ ] `setDemoCurrentStep("step-mission")` updates localStorage
- [ ] `resetDemoScenario()` clears both localStorage keys
- [ ] `markDemoStepPreviewed` adds stepId without duplicates
- [ ] All functions check `typeof window` before localStorage access

### PipelineStepper
- [ ] Shows all 9 steps in horizontal scroll
- [ ] Active step shown with violet highlight
- [ ] Previewed steps shown with cyan tint
- [ ] Each step is a link to its route
- [ ] SEED_DEMO badge visible
- [ ] Mobile-friendly horizontal scroll

### GuidedDemoPanel
- [ ] Shows current step number/total (e.g., "Étape 6/9")
- [ ] Shows step description
- [ ] Shows evidence summary
- [ ] Shows compliance note
- [ ] Shows "Continuer" link (violet pill) when next step exists
- [ ] Shows "← prev" ghost pill when previous step exists
- [ ] Shows "Parcours démo complet ✓" on step 9
- [ ] Shows disclosure text
- [ ] "Réinitialiser démo" resets state and navigates to dashboard

### Detail pages
- [ ] PipelineStepper + GuidedDemoPanel only visible when visiting demo entity IDs
- [ ] Non-demo entity pages (app_002, mis_002, etc.) show no demo components
- [ ] Applications detail: `app_001` → shows step 1
- [ ] Missions detail: `mis_001` → shows step 2
- [ ] Arbitrage detail: `aud_001` → shows step 4
- [ ] RAX detail: `rax_001` → shows step 5
- [ ] Pricing detail: `off_001` → shows step 6
- [ ] Policies detail: `pol_001` → shows step 7
- [ ] Monitoring detail: `alr_001` → shows step 8
- [ ] Claims detail: `clm_001` → shows step 9

### Dashboard
- [ ] `DashboardDemoSection` renders without server errors
- [ ] "Démarrer la démo" navigates to step 1
- [ ] "Continuer" shows current active step when demo started
- [ ] Progress bar reflects visited steps count
- [ ] All 9 steps listed with labels
- [ ] SEED_DEMO badge + disclosure visible

### Settings (Gouvernance tab)
- [ ] `DemoScenarioControls` section visible under "Gouvernance"
- [ ] Shows current demo status (active/not started)
- [ ] Shows count of visited steps
- [ ] "Réinitialiser" resets demo state
- [ ] "Aller au tableau de bord" link works
- [ ] SEED_DEMO badge + disclosure visible

### Reports
- [ ] `parcours-demo-assureur` template appears in the template list
- [ ] Template labeled `SEED_DEMO`
- [ ] Contains disclosure in description

---

## Build status

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ npm run lint — clean
✓ npm run build — clean
✓ npm run smoke:live-shared — 63 farmers, 2 cooperatives, 12 parcelles, 50 alerts
```
