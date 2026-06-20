# Plan — Spec 015 (UIX-1)

## Stratégie
Réutiliser le design system existant (`src/lib/design-tokens.ts`) plutôt qu'en créer un nouveau : il gère déjà light/dark proprement pour cards/buttons/table/status. Le bug vient de pages qui le contournent avec des classes Tailwind codées en dur. La correction consiste donc à **rebrancher** le shell et IDJOR sur ce système, en étendant `DESIGN_TOKENS` avec les entrées manquantes (titre de marque, surfaces de header/sidebar).

## Étapes
1. **Tokens** (`design-tokens.ts`) : ajouter `appShell.brandTitle`, `appShell.headerSurface`, étendre `sidebar.*` si besoin pour couvrir le header.
2. **Shell** : réécrire `sidebar.tsx`, `header.tsx`, `dashboard-footer.tsx` en consommant ces tokens au lieu des hex codés en dur. Corriger le wording "IDJOR read-only" / "Lecture seule".
3. **Composants UI** : créer `ui/app-tabs.tsx`, `ui/app-accordion.tsx`, `ui/status-overview-card.tsx`, `ui/section-header.tsx`, `ui/data-panel.tsx` — tous theme-aware par construction (tokens, pas de hex en dur).
4. **IDJOR** :
   - Corriger les sous-composants partagés (`SummaryMetric`, `ExecutiveStatus`, `SectionCard`, `RegistryTable`, `AuditEventList`, `ExtractionChunkList`, `EmbeddingReadinessPanel`, `ExtractionResultBlock`) pour qu'ils utilisent des classes theme-aware au lieu de `bg-[#0c1322]`, `text-white`, `text-slate-300/400`.
   - Regrouper les `SectionCard` existants (rag, ragAudit, agents, engines, tools, flags, providersModels, security) sous 4 onglets `AppTabs`, sans toucher à leur contenu interne ni aux données chargées.
   - Mettre à jour le wording de gouvernance (badges "lecture seule" → formulation alignée sur l'audit).
5. **Validation** : grep ciblé, lint, build, puis backend (docker/prisma/seed) + frontend pour test manuel login + visuel dark/light.

## Risques
- `idjor-foundation-panel.tsx` fait 3056 lignes : la restructuration en onglets se fait au niveau JSX top-level (regroupement des `SectionCard` existants), sans réécrire leur logique interne, pour limiter le risque de régression fonctionnelle.
- Le namespace `DESIGN_TOKENS.oracle` (utilisé par les panels RAX live) est volontairement laissé inchangé — hors périmètre (RAX/WRS exclu).

## Fichiers attendus en sortie
- `src/lib/design-tokens.ts` (étendu)
- `src/components/layout/sidebar.tsx`, `header.tsx`, `dashboard-footer.tsx`
- `src/components/ui/app-tabs.tsx`, `app-accordion.tsx`, `status-overview-card.tsx`, `section-header.tsx`, `data-panel.tsx` (nouveaux)
- `src/components/idjor/idjor-foundation-panel.tsx`
- `specs/015-ui-dashboard-redesign-foundations/*`
