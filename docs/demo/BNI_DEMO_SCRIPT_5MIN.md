# Script oral — Démo BNI (5 minutes)

**Audience** : BNI Côte d'Ivoire — banque, crédit agricole.

**Angle** : portefeuille agricole, risque, crédit agricole, conformité, preuves, traçabilité.

**Règle absolue** : ne jamais dire que Wakama prête à la place de BNI. Toujours dire que Wakama prépare, documente, analyse et sécurise le dossier ; BNI décide.

---

## 0. Ouverture (30 secondes)

"Bonjour, merci pour votre temps. Aujourd'hui je vais vous montrer comment Wakama peut aider BNI à mieux préparer, documenter et tracer ses dossiers de crédit agricole. Je précise d'emblée : ce que vous allez voir est une adaptation tenant et frontend de démonstration sur la plateforme Wakama, pas un backend bancaire natif complet. L'objectif est de vous montrer la logique et la valeur, pas un produit fini clé en main."

## 1. Connexion et cadrage (30 secondes)

Ouvrir `/fr/login`, se connecter avec le tenant BNI Côte d'Ivoire.

"Voici l'espace institutionnel BNI. Chaque institution a son propre espace, avec son vocabulaire et ses données. Ici, on parle de dossiers agricoles, de risque portefeuille, de comité risque — pas de jargon assurance."

## 2. Tableau de bord (1 minute)

Ouvrir `/fr/dashboard`.

"Ce tableau de bord donne une vue portefeuille agricole : risque, suivi, et indicateurs structurés par Wakama à partir des dossiers reçus. C'est une lecture d'aide à la décision. Wakama ne décide jamais à la place de BNI — la décision de crédit, l'éligibilité, les conditions, tout cela reste entièrement sous votre contrôle."

## 3. Dossiers agricoles — DCA (1 minute 30)

Ouvrir `/fr/applications`.

"Ici, on retrouve les dossiers agricoles — ce que nous appelons en interne la DCA, la déclaration de capacité agricole. C'est le point d'entrée du dossier : informations sur l'exploitant, la parcelle, les documents. Cette vue est strictement en lecture seule pour la démonstration : aucune décision n'est prise depuis cet écran."

Ouvrir un dossier `/fr/applications/[id]`.

"Sur le détail d'un dossier, vous voyez les documents reçus, leur hash d'intégrité — c'est-à-dire une empreinte numérique qui garantit qu'un document n'a pas été modifié après réception — et la trace complète des statuts. Tout ce qui se passe sur un dossier est tracé et horodaté. Et en bas de chaque section, vous voyez ce rappel : Wakama prépare et documente, l'institution reste seule décisionnaire."

## 4. Socle IDJOR — preuves et audit (1 minute 30)

Ouvrir `/fr/idjor`.

"Cette dernière vue s'appelle le socle IDJOR. C'est notre couche de preuve et d'audit. Vous y voyez les documents, leur hash, et un journal d'audit en append-only — c'est-à-dire qu'aucun événement ne peut être modifié ou supprimé après coup, seulement ajouté. C'est ce qui donne à BNI une traçabilité complète et vérifiable sur l'ensemble du cycle de vie d'un dossier."

"Pour être très clair : IDJOR n'est pas une intelligence artificielle autonome. Il ne décide pas, il ne score pas, il ne déclenche aucune action automatique. C'est un registre de preuves et de gouvernance documentaire, strictement en lecture seule dans cette démonstration. De la même façon, les scores d'analyse de risque — RAX et WRS — ne sont jamais des décisions : ce sont des aides à l'analyse, que votre comité risque interprète et valide."

## 5. Conclusion (30 secondes)

"Pour résumer : Wakama prépare le dossier, structure les preuves, et sécurise la traçabilité. BNI garde l'entière maîtrise de la décision de crédit, de la tarification, et de l'engagement. C'est une couche de confiance et d'efficacité opérationnelle, pas un remplacement de votre expertise bancaire. Je suis à votre disposition pour toute question."
