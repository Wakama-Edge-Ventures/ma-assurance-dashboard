# ADVANCED_PAGES_QA — Phase 23

## Pages implemented

| Page | Route | Type | Status |
|------|-------|------|--------|
| Analytics | /fr/analytics | Server component | ✅ |
| Reports | /fr/reports | Server + Client | ✅ |
| Settings | /fr/settings | Server shell + Client | ✅ |

---

## /fr/analytics — Feature checklist

- [x] KPI command header: 6 StatPill cards (farmers, alerts, critical, WRS avg, parcelles, active policies)
- [x] Risk tier distribution: conic-gradient ring + 4 fill-bar tier rows (LOW/MEDIUM/HIGH/UNINSURABLE)
- [x] Regional risk heatmap table: region, farmers, alerts, critiques, WRS moy., culture dominante, niveau
- [x] Culture exposure table with inline NdviBar (green→amber→red based on value)
- [x] Alert intelligence: by type (NDVI/METEO/IOT/OTHER) + by severity (CRITICAL/WARNING/INFO)
- [x] RAX/WRS intelligence: 4 KPI chips + top-3 highest-risk evaluations table
- [x] Mission performance: 2 stat pills + status breakdown table
- [x] Polices & sinistres: 4 stat pills + claims-by-type table
- [x] LIVE/SEED_DEMO disclosure panel
- [x] All data from live service functions (farmers, parcelles, wakamaAlerts, applications, policies, claims, missions, raxEvaluations, sharedOverview)
- [x] Analytics helpers extracted to `src/lib/analytics.ts`

Helper functions in `src/lib/analytics.ts`:
- `buildRegionStats(farmers, alerts, raxEvals, applications): RegionStat[]`
- `buildCultureStats(farmers, parcelles, alerts): CultureStat[]`
- `buildAlertTypeStats(alerts): AlertTypeStat[]`
- `buildRiskTierDist(raxEvals): Record<RiskTier, number>`
- `buildMissionStats(missions): Record<string, number>`

---

## /fr/reports — Feature checklist

- [x] 8 report template cards with source label, recipient, description, format pills
- [x] Advanced generator with 7 filters (type, period, region, culture, risk tier, source, checkboxes)
- [x] Export CSV (client-side, uses applications data)
- [x] Export JSON (client-side, full portfolio snapshot)
- [x] Print / Export PDF via `window.print()`
- [x] Report preview panel with executive summary, recent alerts, claims breakdown, compliance note
- [x] Static demo report history table (4 rows)
- [x] Bottom compliance disclaimer block
- [x] Report helpers in `src/lib/reporting.ts`
- [x] LIVE/SEED_DEMO clearly labeled throughout

Helper exports in `src/lib/reporting.ts`:
- `REPORT_TEMPLATES: ReportTemplate[]` — 8 templates
- `buildCsvFromRows(headers, rows): string` — RFC-4180 CSV builder

localStorage keys: none (reports are generated on demand, not persisted)

---

## /fr/settings — Feature checklist

- [x] 7-tab navigation: Profil assureur, RAX/WRS, Tarification, Missions terrain, Seuils alertes, Gouvernance, Versions & audit
- [x] Tab 1 — Profil assureur: 5 editable fields (company name, country, currency, insurer type, operating mode) + data source status cards
- [x] Tab 2 — RAX/WRS: formula display, G/F/D sliders (1–10), live simulation result panel with progress bar + tier label, tier thresholds table, amber disclaimer
- [x] Tab 3 — Tarification: live P_TTC formula preview, 7 core inputs, 4 majorations, 4 minorations
- [x] Tab 4 — Missions terrain: mandatory toggles (KYC, GPS polygon, photos, signature), field parameter inputs, 4 audit type toggles
- [x] Tab 5 — Seuils alertes: 8 numeric threshold inputs, static severity mapping cards
- [x] Tab 6 — Gouvernance: roles table (5 roles), 4 governance toggles, workflow state pill chain
- [x] Tab 7 — Versions & audit: 4 demo version rows with status badges, audit note
- [x] localStorage draft persistence: `wakama_assurance_settings_draft_v1`
- [x] localStorage active version: `wakama_assurance_settings_active_v1`
- [x] Saved-at timestamp: `wakama_assurance_settings_draft_saved_at`
- [x] Dirty state tracking
- [x] Export JSON button
- [x] Activate version button
- [x] Reset to default button
- [x] SEED_DEMO badge always visible (settings are local demo until backend config API exists)

### localStorage keys

| Key | Content | Purpose |
|-----|---------|---------|
| `wakama_assurance_settings_draft_v1` | JSON SettingsConfig | Draft configuration |
| `wakama_assurance_settings_active_v1` | `{ version, config, activatedAt }` | Simulated active version |
| `wakama_assurance_settings_draft_saved_at` | ISO timestamp | Last save time display |

---

## LIVE vs SEED_DEMO rules

| Data domain | Source | Notes |
|-------------|--------|-------|
| Farmers | LIVE (api.wakama.farm) | Real data, 63 farmers |
| Cooperatives | LIVE | 2 cooperatives |
| Parcelles | LIVE | 12 parcelles |
| WakamaAlerts | LIVE | 50 alerts |
| Applications | SEED_DEMO | Insurance workflow seed data |
| Missions | SEED_DEMO | Insurance workflow seed data |
| RAX/WRS evaluations | SEED_DEMO | Scoring seed data |
| Pricing offers | SEED_DEMO | Tarification seed data |
| Policies | SEED_DEMO | Policy seed data |
| Claims | SEED_DEMO | Claims seed data |
| Monitoring alerts | SEED_DEMO | Monitoring seed data |
| Settings (all tabs) | SEED_DEMO | Local demo, no backend API yet |

---

## Compliance wording used

All three pages use only the allowed phrasing:
- "Recommandation non décisionnelle"
- "Configuration technique"
- "Simulation technique non décisionnelle"
- "Preuve d'intégrité horodatée"
- "Conçu pour le cadre ACAPS/CNDP"

Forbidden phrases not used:
- ~~"Wakama décide"~~
- ~~"Wakama assure"~~
- ~~"Preuve juridique absolue"~~
- ~~"ACAPS compliant"~~
- ~~"ISO certified"~~

---

## Export behavior

| Export | Where | Method |
|--------|-------|--------|
| CSV | /fr/reports | `Blob` + `URL.createObjectURL`, downloads applications data |
| JSON | /fr/reports | `Blob` + `URL.createObjectURL`, downloads full portfolio snapshot |
| PDF/Print | /fr/reports | `window.print()` — browser native print dialog |
| Settings JSON | /fr/settings | `Blob` + `URL.createObjectURL`, downloads current SettingsConfig |

---

## Future backend endpoints needed

| Feature | Endpoint | Notes |
|---------|----------|-------|
| Settings persistence | `POST /api/insurer/config` | Save SettingsConfig server-side |
| Settings versions | `GET /api/insurer/config/versions` | Version history from DB |
| Report generation | `POST /api/reports/generate` | Server-side PDF/CSV generation |
| Report history | `GET /api/reports/history` | Persisted report archive |
| Analytics export | `GET /api/analytics/export` | Pre-computed analytics export |
| Alert thresholds | `PUT /api/insurer/alert-thresholds` | Apply alert config to live pipeline |

---

## Build status

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ npm run lint — clean
✓ npm run build — clean
✓ npm run smoke:live-shared — 63 farmers, 2 cooperatives, 12 parcelles, 50 alerts
```
