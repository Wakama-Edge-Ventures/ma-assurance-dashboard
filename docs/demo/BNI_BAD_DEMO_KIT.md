# Kit de démo BNI / BAD

**Repo**: `ma-assurance-dashboard`

**Branche**: `freeze/bni-bad-demo` (figée)

**Phase**: `DEMO-KIT-1`

Ce document est le kit opérationnel unique pour présenter Wakama à BNI et BAD. Il s'appuie sur l'audit de freeze (`docs/demo/BNI_BAD_DEMO_FREEZE_AUDIT.md`) et sur la validation finale (`docs/demo/BNI_BAD_DEMO_FREEZE_FINAL.md`).

## Phrase de cadrage (à dire en ouverture)

> BNI et BAD sont des adaptations tenant/frontend de démonstration sur la plateforme Wakama, pas des backends bancaires natifs complets.

Cette phrase doit être posée avant toute navigation, et rappelée si l'audience pose des questions sur la complétude du système.

## Objectif de la démo

Montrer que Wakama prépare, documente, analyse et sécurise le dossier agricole — sans jamais se positionner comme décisionnaire bancaire ou substitut d'un système métier complet. L'institution (BNI ou BAD) reste seule décisionnaire à chaque étape.

## Message central

- Wakama structure le dossier (DCA), les preuves et les preuves d'audit.
- Wakama ne prête pas, ne tarife pas, ne décide pas, et ne remplace pas la banque ou l'assureur.
- IDJOR est une couche de preuve, d'audit et de gouvernance documentaire — pas une IA autonome ni décisionnelle.
- RAX/WRS n'apparaît que comme support d'analyse non décisionnel, jamais comme verdict.

## Parcours validé

Le parcours suit le 5-step script validé dans `BNI_BAD_DEMO_FREEZE_FINAL.md` :

1. `/fr/login` — tenant `bni-ci` ou `bad-program`
2. `/fr/dashboard` — portefeuille et cadrage institutionnel
3. `/fr/applications` — dossiers (DCA) en lecture seule
4. `/fr/applications/[id]` — détail dossier, documents, traçabilité, disclaimers de décision
5. `/fr/idjor` — preuves, audit, documents, hash, journal (mode demo, sections techniques masquées)

## Prérequis

- Backend local démarré, `DATABASE_URL` correcte, port `4000`.
- Dashboard démarré sur port `3000`.
- Seeds exécutés : `npm run seed:assurance-admin`, `npm run seed:idjor-foundation`.
- Connexion testée avant l'appel.
- Tenant sélectionné : `bni-ci` pour l'audience BNI, `bad-program` pour l'audience BAD.
- Voir `docs/demo/DEMO_RUNBOOK_TECHNIQUE.md` pour la checklist complète.

## Liens / routes à ouvrir (dans cet ordre)

1. `/fr/login`
2. `/fr/dashboard`
3. `/fr/applications`
4. `/fr/applications/[id]` (choisir un dossier avec documents et audit terrain renseignés)
5. `/fr/idjor`

Ne pas ouvrir d'autres routes (voir `docs/demo/DEMO_DO_NOT_SHOW.md`).

## Ordre exact de présentation

1. Connexion avec le tenant cible, en rappelant la phrase de cadrage.
2. Tableau de bord : portefeuille agricole, vue institutionnelle, pas de jargon assurance.
3. Liste des dossiers : présenter comme intake documentaire en lecture seule.
4. Détail d'un dossier : documents, hash, statut, disclaimer de décision institutionnelle, audit terrain si disponible.
5. Socle IDJOR : preuves, documents, hash, journal d'audit append-only. Insister sur "lecture seule" et "institution décisionnaire".
6. Conclusion en reprenant le message central et la phrase de cadrage.

## Risques restants

- Wording assurance résiduel dans des routes hors périmètre (claims, polices, monitoring, pricing, analytics, rapports, settings) — ne pas les ouvrir.
- Contenu de démonstration seedé encore présent dans des bibliothèques de support ; peut apparaître si la démo sort du parcours validé.
- Sensibilité à la narration : le présentateur doit éviter toute affirmation de backend bancaire natif complet ou d'IA décisionnelle.
- L'état du backend local (seed, connectivité) doit être vérifié avant l'appel.

## Plan de secours

- Si le backend tombe ou que des erreurs apparaissent : couper l'écran de partage, expliquer brièvement ("incident technique local, non lié au produit"), reprendre sur la capture vidéo de secours préparée en amont (voir runbook technique).
- Si une route affiche un état dégradé (`DEGRADED`) : ne pas insister, fermer l'onglet, revenir au tableau de bord ou à la capture vidéo.
- Toujours avoir un deuxième poste ou un export vidéo prêt en cas d'incident réseau.

## Documents associés

- Script oral BNI : `docs/demo/BNI_DEMO_SCRIPT_5MIN.md`
- Script oral BAD : `docs/demo/BAD_DEMO_SCRIPT_5MIN.md`
- Checklist technique avant call : `docs/demo/DEMO_RUNBOOK_TECHNIQUE.md`
- Ce qu'il ne faut pas montrer : `docs/demo/DEMO_DO_NOT_SHOW.md`
