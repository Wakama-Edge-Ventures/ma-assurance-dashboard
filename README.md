# Wakama Morocco Insurance Dashboard (Frontend MVP)

Frontend Next.js du dashboard B2B Wakama pour operations assurance agricole au Maroc:
applications, missions, arbitrage, RAX/WRS, pricing, policies, monitoring, claims.

## Rappel important
- Wakama n'est pas un assureur.
- Wakama ne prend pas la decision finale d'eligibilite.
- Wakama produit une recommandation non decisionnelle et un audit trail technique.
- L'assureur decide, emet la police et indemnise.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint

## Phase 27C - Live Insurance Integration
- Le frontend connecte des routes assurance live de `https://api.wakama.farm` (sante, references Maroc, references assurance, applications, missions, RAX, monitoring, evidence bundle).
- Les etats `LIVE`, `SEED_DEMO`, `UNAVAILABLE`, `DEGRADED`, `EXCEL_IMPORT`, `MANUAL_ESTIMATE` sont visibles en UI via badges.
- La documentation detaillee de phase est dans `docs/PHASE_27C_FRONTEND_LIVE_INSURANCE_INTEGRATION.md`.

## Design System Layer
- UI wrappers are the primary extension point: `src/components/ui/app-*`.
- Existing components (`card`, `button`, `badge`, `page-title`, `stat-card`) are mapped to wrappers to keep pages consistent.
- For future pages, do not bypass wrappers unless there is a clear technical reason.
- Visual system direction (Phase 20): **Wakama RWA Oracle inspired** (dark-first command center with compact telemetry cards and dense tables).
- Sidebar shell is collapsible in protected pages (icon-only collapsed mode on desktop).
- Theme modes are available via `next-themes`: `Light`, `Dark`, `System` (default: `System`).
- Brand logo asset used in UI shell: `src/img/wakama_logo.png`.
- Protected pages include a compact shared dashboard footer with LIVE/SEED_DEMO visibility and legal line.

## HeroUI Compatibility Note
- HeroUI v3 documentation and package metadata were reviewed before integration.
- Current repository stack is Tailwind CSS v3.4.17, while HeroUI v3 requires Tailwind CSS v4.
- To avoid risky framework-level migration in this release-candidate phase, HeroUI was used as design inspiration only.
- The project keeps an internal Tailwind wrapper layer to preserve stability.
- A dedicated Tailwind v4 migration can be planned later if direct HeroUI runtime components are required.

## Demarrage local
```bash
npm install
npm run dev
```

Application locale: `http://localhost:3000` puis redirection vers `/fr/dashboard`.

## Scripts utiles
```bash
npm run dev
npm run lint
npm run build
npm run start
npm run smoke:live-shared
```

## Variables d'environnement (local)
Creer un fichier `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.wakama.farm
NEXT_PUBLIC_USE_LIVE_API=true
NEXT_PUBLIC_USE_LIVE_INSURANCE_API=true
NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK=true
NEXT_PUBLIC_DEBUG_API_SHAPES=false
```

- `NEXT_PUBLIC_USE_LIVE_API=true`: active les lectures LIVE pour les donnees Wakama partagees.
- `NEXT_PUBLIC_USE_LIVE_INSURANCE_API=true`: active les appels live assurance (`/v1/insurance/*` et `/v1/morocco/*`) avec gestion des etats `AUTH_REQUIRED`/`DEGRADED`.
- `NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK=true`: active le repli `SEED_DEMO` explicite si endpoint indisponible ou non authentifie.

## Compte de demo MVP
- Email: `demo@wakama.farm`
- Mot de passe: `demo`

## Mode Demo
- Le MVP fonctionne en `SEED_DEMO` sans backend live.
- Chaque objet metier porte `source: "LIVE" | "SEED_DEMO"`.
- L'interface affiche explicitement la provenance des donnees.

## Demo data and future API mode
- Le mode par defaut utilise les donnees `SEED_DEMO`.
- Si `NEXT_PUBLIC_USE_LIVE_API=true`, le frontend tente les appels live pour les donnees Wakama partagees (read-only).
- Les workflows assurance utilisent les routes live quand disponibles, sinon repli `SEED_DEMO` avec badge source visible.
- Si un appel live echoue, le service repasse automatiquement sur `SEED_DEMO`.
- Ce fallback est volontaire pour garantir une demo MVP stable de bout en bout.
- La couche service inclut des DTO mappers defensifs (sans dependance lourde) pour normaliser les reponses live.
- Le mode live accepte les formats `[...]` et `{ data: [...] }`.
- Si la donnee live est mal formee, le fallback `SEED_DEMO` est applique pour la stabilite MVP.

## Phase 25 — Guided Demo Flow

- End-to-end guided demo for the full insurance pipeline (Application → Mission → Audit/Arbitrage → RAX/WRS → Pricing → Policy → Monitoring → Claim).
- Demo scenario anchored on SEED_DEMO dossier: Youssef El Amrani, blé tendre, Meknès, `app_001`.
- State managed client-side via localStorage (`wakama_assurance_demo_scenario_v1`).
- `PipelineStepper` and `GuidedDemoPanel` components visible on all 8 insurance detail pages when viewing demo entity IDs.
- Dashboard includes `DashboardDemoSection` for launching and tracking demo progress.
- Settings Gouvernance tab includes `DemoScenarioControls` (reset + status).
- Report template `parcours-demo-assureur` added to `/fr/reports`.
- No API, service layer, auth, fallback, or compliance changes.
- Demo panels always display SEED_DEMO badge and Wakama non-decisional compliance wording.
- See `docs/GUIDED_DEMO_FLOW_QA.md` for full checklist and file inventory.

## Phase 24 — UI Consistency Pass
- Oracle design tokens applied across all 22+ protected pages for full visual coherence.
- Section headings, body text, action buttons, chip pills, hero ID text all use the Wakama Oracle mono/dark palette.
- List page `Card + h2` summary blocks replaced by `AppSection` across 7 list pages.
- Detail pages (applications, monitoring, claims, pricing, missions, arbitrage, rax, policies) fully cleaned of legacy light-mode text/button styles.
- No changes to service behavior, API logic, fallback, auth, routes, or compliance wording.
- See `docs/UI_CONSISTENCY_QA.md` for full checklist.

## Phase 23 — Advanced pages (Analytics, Reports, Settings)
- **/fr/analytics** upgraded to a full risk intelligence center: regional heatmap, culture exposure, alert intelligence, RAX/WRS distribution, mission and claims analytics.
- **/fr/reports** upgraded to a full reporting center: 8 report templates, advanced generator with filters, CSV/JSON/PDF export, report preview panel, demo history.
- **/fr/settings** upgraded to an insurer control center: 7 tabs covering company profile, RAX/WRS simulation, pricing configuration, mission parameters, alert thresholds, governance and version history.
- Settings are demo-local (localStorage) until a backend config API (`POST /api/insurer/config`) is available.
- See `docs/ADVANCED_PAGES_QA.md` for full feature checklist, localStorage keys, and future backend endpoints.

## Existing Wakama API read-only data
- Les entites Wakama existantes (`farmers`, `cooperatives`, `parcelles`, `alerts`, `ndvi`, `iot`) sont consommees en lecture seule depuis `https://api.wakama.farm`.
- Avec `NEXT_PUBLIC_USE_LIVE_API=true`, le dashboard tente les endpoints live read-only.
- Si l'API est indisponible, le fallback `SEED_DEMO` est applique automatiquement pour maintenir la demo stable.
- Aucune operation d'ecriture backend n'est effectuee par le dashboard assurance dans cette phase.

## Shared Wakama live data
- `NEXT_PUBLIC_USE_LIVE_API=true` active les lectures live pour `farmers`, `cooperatives`, `parcelles`, `alerts`, `ndvi`, `iot`.
- Les donnees live sont normalisees en conservant `source: "LIVE" | "SEED_DEMO"`.
- Les alertes Wakama sont des signaux operationnels contextuels, pas des decisions sinistre.

## Insurance workflow demo data
- `NEXT_PUBLIC_USE_LIVE_INSURANCE_API=true` active la connexion live aux routes assurance.
- Les modules assurance conservent un mode demonstrable avec fallback `SEED_DEMO` si le live est indisponible.
- Le fallback `SEED_DEMO` est volontairement visible et n'est jamais presente comme `LIVE`.

## Paginated live API reads
- Les endpoints live `farmers`, `cooperatives`, `parcelles` et `alerts` peuvent etre pagines par le backend.
- La couche service tente `page=1&pageSize=100`, puis charge les pages restantes si `total` indique plus de donnees.
- Un garde-fou limite la collecte a 20 pages maximum pour rester robuste en MVP.
- En cas d'echec ou de shape incompatible, le fallback `SEED_DEMO` reste actif.

## Live shared data smoke test
- Executer `npm run smoke:live-shared` pour verifier les endpoints partages live.
- Le script affiche uniquement des compteurs et des cles de structure (pas de valeurs PII).
- Endpoints testes: `/v1/farmers`, `/v1/cooperatives`, `/v1/parcelles`, `/v1/alerts`.

## LIVE API shape debugging
- Activer `NEXT_PUBLIC_DEBUG_API_SHAPES=true` pour diagnostiquer les changements de shape backend.
- Les logs affichent uniquement des metadonnees non sensibles: endpoint, root keys, taille du tableau extrait et cles du premier item.
- Les valeurs des enregistrements (PII) ne sont pas journalisees.

## Mock auth vs backend auth
- Le login actuel est un mock local (protection UI demo) et ne represente pas une authentification backend.
- Les tokens demo/mock ne sont pas envoyes a `https://api.wakama.farm`.
- Les tokens backend reels pourront etre pris en charge dans une phase ulterieure.
- Sur les appels read-only `GET`, si un token est refuse (401), un retry unique sans Authorization est tente.
- Le fallback `SEED_DEMO` reste actif pour garantir la stabilite des demonstrations MVP.

## Deployment (Coolify)
- Builder via `npm install && npm run build`.
- Runner via `npm run start`.
- Configurer les variables frontend ci-dessous dans Coolify:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.wakama.farm
NEXT_PUBLIC_USE_LIVE_API=true
NEXT_PUBLIC_USE_LIVE_INSURANCE_API=true
NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK=true
NEXT_PUBLIC_DEBUG_API_SHAPES=false
```
- Les routes assurance live sont actives, avec repli `SEED_DEMO` explicite si auth/backend indisponible.
- Verifier l'etat des endpoints partages avec `npm run smoke:live-shared` avant release.
- Pointer le domaine production vers `https://assurance.wakama.farm`.
