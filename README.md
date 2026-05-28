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
```

## Compte de demo MVP
- Email: `demo@wakama.farm`
- Mot de passe: `demo`

## Mode Demo
- Le MVP fonctionne en `SEED_DEMO` sans backend live.
- Chaque objet metier porte `source: "LIVE" | "SEED_DEMO"`.
- L'interface affiche explicitement la provenance des donnees.

## Deployment (Coolify)
- Builder via `npm install && npm run build`.
- Runner via `npm run start`.
- Configurer `NEXT_PUBLIC_API_BASE_URL` dans les variables Coolify.
- Pointer le domaine production vers `https://assurance.wakama.farm`.
