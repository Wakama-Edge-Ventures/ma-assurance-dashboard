# Audit UI/UX — Wakama Dashboard
Date : 2026-06-20 · Branche : `feat/idjor-rag-upload-dashboard` · Aucune modification de code effectuée.

Méthode : lecture du design system (`globals.css`, `tailwind.config.ts`), des composants `src/components/ui/`, du shell (`sidebar.tsx`, `header.tsx`), et de la page `/fr/idjor` (`idjor-foundation-panel.tsx`, 3056 lignes). Comptage `grep` des classes Tailwind codées en dur (`text-white`, `bg-white/*`, `border-white/*`, `text-slate-{1-4}00`) sur 69 fichiers / 494 occurrences pour objectiver le diagnostic light mode.

---

## A. Diagnostic global

**Ce qui marche**
- Un vrai design system existe : tokens centralisés en CSS custom properties (`--app-bg`, `--app-surface`, `--app-success/warning/danger/info`, couleurs de marque), consommés via Tailwind (`rgb(var(--app-*))`). Ce n'est pas un dashboard sans fondations.
- Les composants `ui/` de base les plus utilisés en transverse (`app-badge.tsx`, vraisemblablement `app-button.tsx`, `app-card.tsx`) sont correctement écrits en **paire light/dark** (`border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/45 dark:bg-violet-500/14 dark:text-violet-200`). La grammaire de couleur de statut (succès/alerte/danger/info) est cohérente et accessible.
- La doctrine produit (« Wakama prépare, structure et documente — l'institution décide ») est intégrée nativement dans l'UI (`disclosure-note.tsx`), pas plaquée après coup. C'est un vrai actif de confiance institutionnelle à préserver tel quel dans la refonte.
- Le mode démo-safe (masquage des sections techniques IDJOR quand `tenant.demoMode = true`) est une bonne logique de gradation d'information déjà en place — réutilisable comme principe de disclosure progressive.

**Ce qui ne marche pas**
- Le design a été conçu **dark-mode-first**, puis le light mode a été ajouté en surface (variables `:root` dans `globals.css`) sans réécrire les pages. Résultat : la fondation (tokens, `app-badge`) est bi-thème, mais les pages produit (IDJOR, sidebar, RAX live panel, etc.) **contournent la fondation** avec des classes Tailwind codées en dur orientées fond sombre (`text-white`, `text-slate-300/400`, `bg-[#0c1322]`, `border-slate-400/16`). Ces classes n'ont pas d'équivalent `dark:` car elles sont déjà la valeur "dark" — sans préfixe, elles s'appliquent identiquement en light mode.
- Densité de l'information très élevée sans hiérarchie typographique forte : beaucoup de texte à `text-xs`/`text-[11px]` au même niveau visuel que les titres de section, peu de respiration entre blocs.
- Pas de composant Accordion/Tabs partagé : chaque page réinvente son propre système de disclosure (chevrons manuels dans IDJOR), ce qui empêche une cohérence d'interaction et alourdit chaque page de code dupliqué.
- Deux pages-monstres concentrent l'essentiel de la dette : `idjor-foundation-panel.tsx` (3056 lignes, 14 `useState`, 9 sous-composants locaux) et `applications/[id]/page.tsx` (2211 lignes). Une seule page = un seul fichier géant rend la hiérarchie visuelle difficile à raisonner et à faire évoluer.

**Pourquoi l'interface fatigue**
La densité d'information (beaucoup de cartes, tableaux, badges, listes d'audit) n'est pas compensée par du contraste de taille/poids/espacement. Tout est à peu près au même niveau visuel : titres de section, labels, valeurs, hints, badges de statut — l'œil n'a pas de point d'ancrage clair pour scanner la page. Ajoutez les arrière-plans en gradients radiaux multiples (`globals.css:72-87`, jusqu'à 5 dégradés superposés) qui créent du bruit visuel derrière un contenu déjà chargé.

**Pourquoi le rendu paraît déprimant**
La palette dark mode est très saturée vers le bleu marine profond (`#050816`, `#070b17`, `#08111f`) avec des accents néon (cyan/violet) — c'est un style "console futuriste" plutôt que "institutionnel premium". Pour un produit qui s'adresse à des assureurs/banques, l'esthétique actuelle évoque davantage un dashboard de trading crypto qu'un outil de gouvernance documentaire sobre et rassurant.

**Pourquoi la page IDJOR est pénible à consulter**
Elle empile 9 sections potentiellement ouvertes simultanément (summary, agents, engines, tools, flags, providers/models, RAG, RAG audit, security), chacune avec ses propres tableaux/listes, plus un workflow RAG complet (upload → extraction → chunking → embedding readiness) inséré dans le même flux. Rien n'indique visuellement "ceci est une vue de synthèse" vs "ceci est une preuve technique détaillée" — tout est au même niveau de densité. Le `compactMode` existe mais semble n'agir que sur la synthèse exécutive, pas sur le reste de la page.

**Pourquoi le light theme échoue**
Preuve concrète : `src/components/layout/sidebar.tsx:188` fixe le titre de marque en `text-white` sans variante claire — sur le fond clair de la sidebar (`--app-surface: 253 255 255`), ce texte devient quasi invisible. Même chose ligne 244 (`"text-white"` pour l'item de nav actif) et ligne 207 (`bg-[#070b17]/45` — une pastille quasi-noire codée en dur appliquée indifféremment en light/dark). `idjor-foundation-panel.tsx:412` répète le motif sur le titre de chaque section (`text-white`). Ce n'est pas un détail isolé : 494 occurrences de ce pattern sur 69 fichiers. Le light mode n'est donc pas "mal réglé", il n'a tout simplement jamais été appliqué à la majorité des pages produit — seules les briques `ui/` génériques en bénéficient.

---

## B. Liste priorisée des problèmes

### P0 — Bloquant UX

| # | Problème observé | Impact utilisateur | Zone | Recommandation |
|---|---|---|---|---|
| P0-1 | Texte/éléments codés en dur en `text-white`, `text-slate-300/400`, fonds `bg-[#0c1322]`/`bg-[#070b17]` sans variante light, appliqués dans les pages produit (sidebar, header, IDJOR, RAX live panel — 494 occurrences/69 fichiers) | En light mode : titres invisibles (texte blanc sur fond blanc), pastilles noires plaquées sur fond clair, lisibilité générale dégradée | Sidebar, Header, IDJOR, Applications, RAX, Monitoring, Reports... (quasi toute l'app) | Remplacer systématiquement par les tokens (`text-[rgb(var(--app-foreground))]`) ou par des paires Tailwind `text-slate-900 dark:text-white`. Faire un audit-grep + correction fichier par fichier, en commençant par shell + IDJOR |
| P0-2 | Page IDJOR : 9 sections + workflow RAG complet dans un seul flux vertical sans hiérarchie de niveau (synthèse vs preuve technique) | Surcharge cognitive, impossible de scanner rapidement "où en est mon dossier" | `/fr/idjor` | Séparer explicitement Vue synthèse (toujours visible, légère) / Vue preuves (sections secondaires, accès volontaire) — cf. section D |
| P0-3 | Aucun composant Tabs/Accordion partagé et accessible (clavier, aria) — chaque page réimplémente son propre disclosure | Incohérence d'interaction entre pages, dette de code, risque d'accessibilité (pas de gestion clavier/aria garantie) | Transverse | Créer `ui/tabs.tsx` et `ui/accordion.tsx` (ou adopter Radix déjà probablement dispo via shadcn) une fois, migrer IDJOR en premier |
| P0-4 | Fichiers monolithes `idjor-foundation-panel.tsx` (3056 lignes) et `applications/[id]/page.tsx` (2211 lignes) | Empêche une vraie hiérarchie visuelle (tout est pensé comme un seul bloc), ralentit toute évolution future du design | IDJOR, Applications/[id] | Découper en sous-composants fichiers distincts dès la passe de redesign (pas un changement fonctionnel — juste structurel) |

### P1 — Important

| # | Problème observé | Impact utilisateur | Zone | Recommandation |
|---|---|---|---|---|
| P1-1 | Empilement de jusqu'à 5 gradients radiaux superposés en arrière-plan (`globals.css:72-87`) | Bruit visuel derrière un contenu déjà dense, sensation de "trop plein" | Background global, toutes pages | Réduire à 1-2 gradients très subtils, ou supprimer en mode light où l'effet est encore plus criard sur fond clair |
| P1-2 | Hiérarchie typographique plate : labels, hints, valeurs, titres de section souvent à 1-2 tailles d'écart (`text-xs`, `text-[11px]`, `text-[10px]`) | Difficulté à scanner visuellement ce qui est important | IDJOR, tableaux de registre, badges | Définir une échelle typographique à 4-5 paliers nets (titre page > titre section > label > valeur > meta) avec contraste de poids, pas seulement de taille |
| P1-3 | Beaucoup de petits badges/pills à bordure + fond translucide quasi identiques visuellement (`border-slate-400/16 bg-slate-400/8`) répétés pour des significations différentes (statut, type, source, compteur) | Les badges perdent leur capacité à signaler — tout se ressemble | IDJOR, tableaux insurance | Réserver le badge "pill colorée" aux statuts métiers réels (succès/alerte/danger), utiliser des styles distincts (texte simple, icône) pour le reste |
| P1-4 | Tableaux denses sans zébrage ni séparation visuelle forte entre lignes au repos | Difficulté à suivre une ligne sur des tableaux larges (RegistryTable, AuditEventList) | IDJOR, Applications, tables insurance | Ajouter un zébrage léger ou des séparateurs plus visibles, augmenter le `padding` vertical des lignes |
| P1-5 | Recherche du header en `readOnly` (mentionnée dans l'audit structurel) | Signal trompeur — un champ de recherche qui ne cherche rien | Header global | Soit la rendre fonctionnelle, soit la remplacer par un élément qui ne simule pas une affordance inactive |

### P2 — Amélioration souhaitable

| # | Problème observé | Impact utilisateur | Zone | Recommandation |
|---|---|---|---|---|
| P2-1 | Pas de composant `Tabs` dédié pour basculer entre vues (ex: synthèse / détail) — actuellement géré par toggles bouton ad hoc (`compactMode`) | Manque de cohérence d'interaction | IDJOR | Introduire un vrai composant Tabs réutilisable |
| P2-2 | Scrollbar avec dégradé néon cyan/violet animé custom | Détail cohérent avec l'esthétique "console" actuelle mais à reconsidérer avec la nouvelle direction plus sobre | Global | Simplifier au moment du repositionnement visuel |
| P2-3 | Sidebar : 4 groupes de navigation avec labels conditionnels par tenant — bonne logique mais pas de moyen visuel de distinguer "section cœur métier" de "section support/admin" | Légère confusion de priorité dans le menu | Sidebar | Renforcer la hiérarchie visuelle entre groupes (espacement, étiquette de groupe plus discrète mais structurante) |

---

## C. Audit spécifique dark / light

### Problèmes dark mode
- Globalement le mode le mieux traité (c'est la cible native du design), mais l'esthétique est plus "tech néon" que "institutionnel premium" : fonds très sombres (`#050816`), accents cyan/violet saturés, multiples halos lumineux. Pour le public visé (assurance/banque), c'est un signal de positionnement à recalibrer plutôt qu'un bug.
- Les statuts (succès/alerte/danger) restent lisibles car gérés via tokens (`--app-success`, etc.) et déclinés correctement dans `app-badge.tsx`.

### Problèmes light mode
- **Texte invisible** : tout `text-white` codé en dur (titres de section IDJOR, titre de marque sidebar, items de nav actifs) devient illisible sur fond clair (`--app-surface: 253 255 255`).
- **Pastilles/fonds non adaptés** : `bg-[#070b17]/45`, `bg-[#0c1322]/80` codés en dur produisent des blocs presque noirs plaqués sur une interface par ailleurs claire — rupture visuelle, pas de cohérence de palette.
- **Sur-saturation des gradients de fond** : les radiaux cyan/violet pensés pour un fond sombre (`globals.css:72-76`) deviennent des taches pastel visibles et un peu "sales" sur fond clair — l'effet recherché (profondeur subtile) ne fonctionne pas du tout en light.
- **Texte secondaire `text-slate-300/400`** : ces teintes sont calibrées pour rester lisibles sur fond très sombre ; sur fond clair elles tombent sous le seuil de contraste confortable (texte gris clair sur fond quasi blanc).

### Problèmes de contraste
- Le ratio de contraste n'est correct que pour les composants qui passent par les tokens ou par des paires `dark:` explicites. Tout le reste hérite des valeurs "dark" par défaut, qui n'ont jamais été pensées pour un fond clair — ce n'est pas un problème de réglage fin de contraste, c'est une absence totale de variante.

### Problèmes de couleurs trop pâles / états invisibles
- Le bouton/lien de recherche `oracle-search-input` utilise une icône SVG inline avec `stroke='%2394a3b8'` (gris moyen) — correct sur les deux fonds, mais isolé ; le pattern n'est pas généralisé.
- Les bordures `border-slate-400/16` (16% d'opacité) sont déjà très subtiles en dark mode ; en light mode sur fond clair elles deviennent quasiment invisibles, supprimant les délimitations de carte/section qui structurent la page.

---

## D. Audit spécifique de /fr/idjor

### Ce qu'il faut garder absolument
- Toutes les données et tous les contrôles existants : synthèse exécutive, registres (agents/moteurs/outils/flags), providers/models, sections RAG (documents, audit append-only, chunking, embedding readiness), le workflow d'upload/extraction complet.
- La doctrine affichée (« Wakama prépare, structure et documente. Il ne décide pas... ») — élément de confiance non négociable.
- Le mode démo-safe (masquage des sections techniques) — bonne base de disclosure progressive, à renforcer plutôt qu'à retirer.
- La distinction conceptuelle "Résumé exécutif" vs "Preuves & audit" déjà présente dans le code (`demoMode`) — c'est exactement l'axe de hiérarchisation à généraliser à tout le monde (pas seulement en mode démo).

### Ce qu'il faut regrouper
- Les 4 registres techniques (Agents, Moteurs, Outils, Flags) sont conceptuellement une seule chose : "État de la configuration gouvernée". Les présenter comme 4 cartes/tableaux côte à côte distincts noie l'utilisateur — les regrouper sous un seul onglet/panneau "Configuration & gouvernance" avec sous-tableaux internes.
- Providers/Models et Security sont deux angles du même sujet ("ce qui est activé vs désactivé côté IA") — à rapprocher dans un même bloc "Garde-fous IA".
- Le workflow RAG (upload → extraction → chunking → embedding readiness → preview) est actuellement une succession de blocs dans le même flux que le reste — il devrait être son propre parcours linéaire (type stepper) séparé visuellement du reste de la page.

### Ce qu'il faut condenser
- `ExtractionResultBlock` (215 lignes) mélange statut, aperçu texte, et actions de chunking/embedding dans un seul bloc dense — à condenser en un état résumé (1-2 lignes + badge de statut) avec un accès "voir le détail" pour le contenu complet.
- Les listes d'audit (`AuditEventList`) doivent rester en table compacte par défaut (date, acteur, action), avec le détail JSON complet en disclosure à la demande plutôt qu'affiché systématiquement.

### Ce qu'il faut transformer en vue synthétique (toujours visible)
- La synthèse exécutive actuelle (KPIs + contexte tenant + état de préparation) — déjà bien identifiée dans le code comme bloc prioritaire, à conserver en haut de page, condensée, avec une vraie respiration visuelle.
- Un statut global unique par grande catégorie (Documents, Gouvernance, Sécurité IA, RAG) sous forme de 3-4 cartes de statut clair (vert/orange/gris), qui renvoient chacune vers la vue détaillée correspondante.

### Ce qu'il faut transformer en vue détaillée secondaire (accès volontaire)
- Tous les registres techniques (agents, moteurs, outils, flags, providers/models) → derrière un onglet "Configuration" séparé de la synthèse.
- Le détail des chunks d'extraction et le contenu brut des previews → derrière un "voir le détail" par document, pas affiché en continu dans le flux principal.
- Le détail de chaque événement d'audit (JSON metadata) → en disclosure ligne par ligne, pas développé par défaut.

### Comment mieux organiser les sections
Proposition de structure à 3 niveaux pour IDJOR :
1. **Bandeau de synthèse** (toujours visible, compact) : statut global + 3-4 cartes de statut par domaine + doctrine.
2. **Onglets de second niveau** : `Documents & RAG` / `Configuration & gouvernance` / `Sécurité IA` / `Audit`. Un seul onglet actif à la fois — élimine l'empilement vertical actuel des 9 sections.
3. **Disclosure de troisième niveau** à l'intérieur de chaque onglet pour le détail ligne par ligne (JSON, preview de chunk, etc.).

### Comment réduire le stress visuel sans rien perdre
- Remplacer l'accordéon vertical à 9 sections par des onglets horizontaux : la quantité d'information reste identique, mais l'utilisateur n'en voit qu'un sous-ensemble pertinent à la fois.
- Renforcer le contraste de poids typographique entre titre de section / label / valeur, pour que l'œil identifie immédiatement les points d'ancrage.
- Limiter la hauteur visible par défaut des tableaux/listes (déjà amorcé via `getTableHeightClass` dans le code — à généraliser et systématiser).
- Réduire à 1 le nombre de gradients de fond visibles simultanément sur cette page en particulier, étant la plus chargée du dashboard.

---

## E. Proposition de direction design

**Style visuel recommandé** : "institutionnel premium sobre" plutôt que "console tech néon". Conserver l'identité de marque (violet/cyan/vert comme accents de marque), mais les réserver aux éléments de marque et de statut — pas comme fond d'écran lumineux permanent. Fonds neutres (gris-bleu très clair en light, bleu-nuit profond mais uni en dark), surfaces de carte nettes avec ombre douce plutôt que halo coloré.

**Principes d'ergonomie**
- Une seule action/lecture principale par écran à la fois — disclosure progressive plutôt qu'empilement.
- Les statuts (succès/alerte/danger/info) sont les seuls éléments autorisés à porter de la couleur saturée — tout le reste reste neutre.
- Aucune classe de couleur codée en dur sans variante `dark:` ou sans passer par un token — règle non négociable pour tout nouveau code.

**Principe de hiérarchie**
- 5 paliers typographiques nets : Titre de page > Titre de section > Label de champ > Valeur > Métadonnée. Le poids (`font-medium`/`font-semibold`) doit porter une partie du contraste, pas seulement la taille.

**Densité cible**
- Vue par défaut = synthèse compacte (cartes de statut, KPIs clés). Le détail technique/preuve est toujours à un clic, jamais affiché par défaut sur les pages à fort volume de données (IDJOR, Applications/[id]).

**Structure idéale du shell**
- Sidebar : groupes de navigation avec un séparateur visuel plus net entre "cœur métier" (Dashboard, IDJOR, Applications) et "support/admin" (Monitoring, Rapports, Paramètres).
- Header : remplacer la recherche `readOnly` par un élément honnête (soit fonctionnel, soit retiré), garder statut tenant/démo et toggle de thème visibles.

**Structure idéale d'une page data-heavy**
Bandeau de synthèse (KPIs) → Onglets de catégorie → Tableaux/listes avec hauteur limitée par défaut et disclosure pour le détail ligne par ligne.

**Structure idéale de la page IDJOR**
Cf. section D — bandeau de synthèse + 4 onglets (Documents & RAG / Configuration & gouvernance / Sécurité IA / Audit) + disclosure de détail à l'intérieur de chaque onglet.

---

## F. Plan d'action concret

- **Phase 1 — Fondations (shell, tokens, contrastes)**
  Corriger tous les `text-white`/`text-slate-*`/`bg-[#…]` codés en dur dans `sidebar.tsx`, `header.tsx`, `dashboard-footer.tsx`, `protected-shell.tsx` pour qu'ils passent par les tokens ou par des paires `dark:` explicites. Recalibrer la palette de fond (réduire les gradients). Créer les composants `ui/tabs.tsx` et `ui/accordion.tsx` partagés.

- **Phase 2 — Pages core**
  Appliquer la correction light/dark et la nouvelle échelle typographique sur `/fr/login`, `/fr/dashboard`, `/fr/applications`, `/fr/applications/[id]`. Découper `applications/[id]/page.tsx` en sous-composants par section fonctionnelle.

- **Phase 3 — Refonte IDJOR**
  Découper `idjor-foundation-panel.tsx` en sous-composants fichiers distincts. Implémenter la structure à 3 niveaux (synthèse / onglets / disclosure) définie en section D, en réutilisant les `Tabs`/`Accordion` créés en phase 1. Aucune donnée ni fonctionnalité supprimée — uniquement réorganisation et hiérarchisation.

- **Phase 4 — Polish dark/light**
  Repasse fine sur toutes les pages restantes (alerts, claims, cooperatives, farmers, missions, monitoring, policies, pricing, rax, reports, settings...) avec le même grep de contrôle (`text-white|bg-white/|border-white/|text-slate-[1-4]00`) jusqu'à 0 occurrence sans variante de thème.

- **Phase 5 — QA visuelle**
  Revue manuelle de chaque page en light et dark, sur desktop et mobile (la sidebar a déjà un mode mobile via `MobileNav`). Vérification des contrastes (WCAG AA minimum) sur texte/fond pour les combinaisons critiques (titres, badges de statut, texte de tableau).

---

## G. Notes complémentaires

- Pas de captures d'écran annotées dans cette passe : le diagnostic light mode s'appuie sur une preuve de code directe et reproductible (grep + lecture de fichiers cités avec numéros de ligne), plus fiable qu'une capture isolée. Je peux lancer l'app localement et produire des captures comparatives light/dark si vous voulez les joindre à ce document avant la passe de redesign.
- Composants réutilisables à créer en priorité pour la refonte : `ui/tabs.tsx`, `ui/accordion.tsx` (ou disclosure générique remplaçant les chevrons manuels de `SectionCard`), et un composant `StatusOverviewCard` générique pour les futures cartes de statut par domaine (Documents/Gouvernance/Sécurité IA/RAG) proposées en section D.
