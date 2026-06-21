# Phase 27C - Frontend Live Insurance Integration

## Objectif
Connexion progressive du frontend `assurance.wakama.farm` aux routes live `https://api.wakama.farm`, en conservant:
- mode dégradé non bloquant
- fallback `SEED_DEMO` explicite
- badges de provenance visibles

## Variables d'environnement
Configurer:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.wakama.farm
NEXT_PUBLIC_USE_LIVE_API=true
NEXT_PUBLIC_USE_LIVE_INSURANCE_API=true
NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK=true
NEXT_PUBLIC_DEBUG_API_SHAPES=false
```

## Couche API ajoutée
Fichier: `src/lib/api/insuranceApi.ts`

Fonctions clés:
- `request<T>()` typée, avec gestion:
  - `200`
  - `401 AUTH_REQUIRED`
  - `403 FORBIDDEN`
  - `404 NOT_FOUND`
  - erreur réseau (`NETWORK_ERROR`)
  - mode `DEGRADED` / `UNAVAILABLE`
- injection `Authorization: Bearer <token>` si token backend détecté
- token lu via mécanismes existants (`getBackendAuthToken`) + clés storage usuelles backend
- routes protégées non appelées sans token (retour `AUTH_REQUIRED`)
- parsing défensif sans crash sur tableaux vides

## Composants UI ajoutés
- `SourceBadge`
- `DisclosureNote`
- `DegradedStateCard`
- `AuthRequiredCard`
- `EmptyLiveDataCard`
- `EvidenceBundlePanel`

Textes de disclosure utilisés:
- général:
  - "Wakama fournit une structuration technique du risque. L’assureur reste seul décisionnaire pour l’éligibilité, la tarification commerciale, l’émission de police et l’indemnisation."
- blockchain/IPFS:
  - "L’ancrage blockchain constitue une preuve d’intégrité horodatée. Il ne remplace pas la décision réglementaire ou contractuelle de l’assureur."

## Endpoints connectés

### Public
- `GET /health`
- `GET /v1/insurance/evidence/health`

### Maroc (protégés)
- `GET /v1/morocco/regions`
- `GET /v1/morocco/provinces`
- `GET /v1/morocco/communes`
- `GET /v1/morocco/cities`
- `GET /v1/morocco/crops`
- `GET /v1/morocco/crop-seasons`
- `GET /v1/morocco/agro-climatic-zones`
- `GET /v1/morocco/risk-zones`
- `GET /v1/morocco/dams`
- `GET /v1/morocco/river-segments`
- `GET /v1/morocco/flood-risk-zones`

### Références assurance (protégés)
- `GET /v1/insurance/references`
- `GET /v1/insurance/references/threats`
- `GET /v1/insurance/references/vulnerabilities`
- `GET /v1/insurance/references/rax-parameters`
- `GET /v1/insurance/references/claim-causes`
- `GET /v1/insurance/references/claim-statuses`
- `GET /v1/insurance/references/alert-thresholds`
- `GET /v1/insurance/references/pricing-parameters`

### Applications / missions / RAX / monitoring / evidence
- `GET /v1/insurance/applications`
- `POST /v1/insurance/applications`
- `GET /v1/insurance/missions`
- `POST /v1/insurance/missions`
- `POST /v1/insurance/rax/calculate`
- `GET /v1/insurance/hydro-risk`
- `GET /v1/insurance/weather/archive`
- `GET /v1/insurance/ndvi/history`
- `POST /v1/insurance/evidence/bundle`
- `POST /v1/insurance/applications/:id/evidence-bundle`

## Pages connectées
- `/fr/dashboard`
  - santé API/evidence (status, Pinata, Solana, cluster, mode READY/DISABLED_SAFE)
- `/fr/settings`
  - santé live
  - référentiels Maroc + assurance
  - panel evidence bundle intégrations
- `/fr/applications`
  - liste live applications
  - `AuthRequiredCard` sur 401
  - `EmptyLiveDataCard` dédié live
  - formulaire "Créer pré-dossier technique" (`source=MANUAL_ENTRY`)
- `/fr/missions`
  - liste live missions
  - création live mission
  - état vide si aucune application live
- `/fr/rax`
  - calcul RAX live (lat/lng/cropCode + options)
  - affichage score/composantes/warnings/sourceDisclosure
  - référentiels RAX live
- `/fr/monitoring`
  - hydro risk / weather archive / NDVI history live
  - états dégradés météo/NDVI sans sur-promesse
  - coordonnées pilote par défaut: `34.9417,-5.8394`, `radiusKm=25`, `crop=BLE_DUR`
- `/fr/claims`
  - catalogues live causes/statuts/seuils
  - mention "Sinistres transactionnels: prochaine phase backend."
- `/fr/pricing`
  - paramètres pricing live

### Détails avec evidence bundle
- `/fr/applications/[id]`
- `/fr/missions/[id]`
- `/fr/rax/[id]`

## Référentiel barrage attendu
Le panneau Maroc met en évidence `Oued El Makhazine` quand présent:
- `lat: 34.9417`
- `lng: -5.8394`
- `capacity: 807`
- `source: EXCEL_IMPORT`
- `confidence: MEDIUM`

## Comportement auth
- Sans token backend valide:
  - routes protégées => `AUTH_REQUIRED`
  - UI non bloquante avec `AuthRequiredCard`
  - aucune donnée présentée comme LIVE à tort
- Le token demo local n'est pas utilisé comme token backend.

## Règles fallback demo
Fallback actif uniquement si `NEXT_PUBLIC_INSURANCE_DEMO_FALLBACK=true` et:
- erreur réseau
- `401` sur route protégée sans token
- données live vides pour panneaux nécessitant une prévisualisation

Règles visuelles:
- fallback toujours marqué `SEED_DEMO`
- pas de mélange silencieux fallback/live sans badge source

## Labels source utilisés
- `LIVE`
- `SEED_DEMO`
- `MANUAL_ESTIMATE`
- `EXCEL_IMPORT`
- `UNAVAILABLE`
- `DEGRADED`
- `MANUAL_ENTRY` (origine de création technique)

## Limitations connues
- farmers/coops/parcelles pas encore live dans ce scope assurance
- pas encore de backend transactionnel sinistres
- NDVI live Copernicus encore en attente
- Pinata/Solana peuvent rester `DISABLED_SAFE` tant que les variables backend ne sont pas activées

## Vérifications
Commandes exécutées:

```bash
npm run lint
npm run build
```

Checklist QA manuelle:
1. Vérifier `/fr/dashboard` et `/fr/settings` pour `GET /health` + `GET /v1/insurance/evidence/health`.
2. Vérifier `AuthRequiredCard` sur pages protégées sans token backend.
3. Vérifier fallback `SEED_DEMO` visuellement badgé (jamais affiché comme LIVE).
4. Créer un pré-dossier technique sur `/fr/applications` puis confirmer refresh de la liste.
5. Créer une mission live sur `/fr/missions` avec `applicationId` valide.
6. Lancer un calcul RAX live et vérifier les champs affichés (gravity/frequency/detection/raxBrut/wrs/tier).
7. Vérifier `/fr/monitoring` en modes normal et dégradé (weather/NDVI).
8. Tester génération Evidence Bundle sur pages détail.
