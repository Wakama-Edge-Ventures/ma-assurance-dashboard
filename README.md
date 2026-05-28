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
```

## Variables d'environnement
Creer un fichier `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.wakama.farm
NEXT_PUBLIC_USE_LIVE_API=true
NEXT_PUBLIC_USE_LIVE_INSURANCE_API=false
NEXT_PUBLIC_DEBUG_API_SHAPES=false
```

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
- Les workflows assurance (`/v1/insurance/*`) restent en `SEED_DEMO` tant que `NEXT_PUBLIC_USE_LIVE_INSURANCE_API=false`.
- Si un appel live echoue, le service repasse automatiquement sur `SEED_DEMO`.
- Ce fallback est volontaire pour garantir une demo MVP stable de bout en bout.
- La couche service inclut des DTO mappers defensifs (sans dependance lourde) pour normaliser les reponses live.
- Le mode live accepte les formats `[...]` et `{ data: [...] }`.
- Si la donnee live est mal formee, le fallback `SEED_DEMO` est applique pour la stabilite MVP.

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
- `NEXT_PUBLIC_USE_LIVE_INSURANCE_API=false` (par defaut) evite les appels `/v1/insurance/*` non disponibles.
- Les modules assurance (applications, missions, arbitrage, RAX/WRS, pricing, policies, monitoring assurance, claims) restent demonstrables en `SEED_DEMO`.
- Le fallback `SEED_DEMO` reste actif meme si le mode live assurance est active plus tard.

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
- Configurer `NEXT_PUBLIC_API_BASE_URL` dans les variables Coolify.
- Pointer le domaine production vers `https://assurance.wakama.farm`.
