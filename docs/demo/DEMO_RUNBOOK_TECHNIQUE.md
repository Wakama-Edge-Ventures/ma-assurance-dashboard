# Runbook technique — Démo BNI / BAD

Checklist opérationnelle à exécuter avant chaque appel de démonstration.

## 1. Backend local

- [ ] `DATABASE_URL` correcte :
  `postgresql://postgres:postgres@localhost:55432/wakama_idjor_test?schema=public`
- [ ] Backend démarré sur `PORT=4000`
- [ ] `npm run seed:assurance-admin` exécuté sans erreur
- [ ] `npm run seed:idjor-foundation` exécuté sans erreur

## 2. Dashboard frontend

- [ ] Dashboard démarré sur `PORT=3000`
- [ ] Aucune erreur de build ou de démarrage dans la console

## 3. Login

- [ ] Login testé avec le tenant cible (`bni-ci` ou `bad-program`) avant l'appel
- [ ] Identifiants valides confirmés (pas de session expirée)

## 4. Parcours validé — vérification écran par écran

- [ ] `/fr/dashboard` — s'affiche correctement, vue institutionnelle (pas la vue assurance)
- [ ] `/fr/applications` — liste des dossiers visible, au moins un dossier avec documents
- [ ] `/fr/applications/[id]` — choisir un dossier avec documents, hash, et idéalement un audit terrain renseigné
- [ ] `/fr/idjor` — se charge correctement, mode démo actif (sections techniques masquées)

## 5. Vérifications de sécurité visuelle

- [ ] Vérifier que le **Socle IDJOR n'affiche pas l'état DEGRADED**
- [ ] Vérifier qu'il n'y a **aucun badge ou mention "LIVE IA"**
- [ ] Vérifier qu'aucune erreur technique (Prisma, 500, stack trace) n'apparaît à l'écran

## 6. Préparation de secours

- [ ] Préparer une **capture vidéo de secours** du parcours complet (5 écrans), enregistrée à l'avance avec le tenant cible
- [ ] Préparer la phrase à dire si le backend tombe pendant l'appel :
  > "Nous avons un incident technique local sans rapport avec le produit. Je vous propose de continuer sur un enregistrement vidéo du même parcours pour ne pas perdre de temps."

## 7. Juste avant l'appel

- [ ] Fermer tous les onglets et applications non liés à la démo
- [ ] Couper les notifications système
- [ ] Avoir `docs/demo/BNI_BAD_DEMO_KIT.md` et le script oral correspondant ouverts sur un second écran ou document
- [ ] Avoir `docs/demo/DEMO_DO_NOT_SHOW.md` relu dans les 30 minutes précédentes
