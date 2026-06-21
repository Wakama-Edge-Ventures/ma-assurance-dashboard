# Spec 015 — UI Dashboard Redesign Foundations (UIX-1)

## Référence
- Audit source : [docs/ui/audit-ui-ux-2026-06-20.md](../../docs/ui/audit-ui-ux-2026-06-20.md)
- Phase : UIX-1 — Design foundations, shell, theme contrast and IDJOR layout strategy

## Problème
Le design system de base (`design-tokens.ts`, `app-badge.tsx`) gère correctement light/dark, mais le shell (sidebar, header) et la page `/fr/idjor` contournent ce système avec des couleurs Tailwind codées en dur orientées dark-mode (`text-white`, `bg-[#070b17]`, `text-slate-300/400`...). Conséquence : le light mode est cassé (titres invisibles, blocs sombres forcés sur fond clair) et la page IDJOR empile 9 sections sans hiérarchie, ce qui la rend stressante à consulter.

## Objectif
Corriger les fondations UI (shell + tokens) et amorcer la restructuration de `/fr/idjor` en synthèse → onglets → disclosure, sans supprimer d'information, sans toucher au backend/auth/API/calcul métier.

## Périmètre inclus
1. Tokens de thème (`design-tokens.ts`, `globals.css` si nécessaire) pour le shell.
2. Shell global : `sidebar.tsx`, `header.tsx`, `dashboard-footer.tsx` — contraste light/dark, état actif menu, wording.
3. Nouveaux composants UI réutilisables : `AppTabs`, `AppAccordion`, `StatusOverviewCard`, `SectionHeader`, `DataPanel`.
4. Page `/fr/idjor` (`idjor-foundation-panel.tsx`) : correction des couleurs codées en dur dans les sous-composants partagés, regroupement des sections existantes en onglets (Synthèse hors-onglet + Documents & RAG/Audit + Configuration & gouvernance + Sécurité IA), wording "read-only" → "socle gouverné : lecture, traçabilité et actions contrôlées sans IA active".

## Hors périmètre (explicitement exclu)
- Backend, auth, API, endpoints, calculs métier.
- `src/components/insurance/evidence-bundle-panel.tsx`.
- RAX / WRS.
- `.claude/settings*.json`.
- Tout wording "LIVE IA", bouton "poser une question", "activer embeddings", "vectoriser".
- Suppression d'information.

## Critères d'acceptation
- Aucun `text-white` / `bg-[#...]` / `text-slate-300|400` sans variante `dark:` (ou remplacé par un token) dans `src/components/layout` et `src/components/idjor`.
- Sidebar et header lisibles en light ET dark (titre de marque, item de nav actif, badges).
- `/fr/idjor` : sections existantes accessibles via onglets, aucune donnée retirée, wording de gouvernance à jour.
- `npm run lint` et `npm run build` passent.
- `evidence-bundle-panel.tsx` non modifié (diff vide).
- Aucun fichier backend modifié.
