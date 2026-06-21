# Ce qu'il ne faut pas montrer — Démo BNI / BAD

Liste à relire juste avant chaque appel de démonstration.

- Ne pas ouvrir les routes `claims`, `policies`, `pricing` si elles ne sont pas strictement nécessaires.
- Ne pas insister sur les modules IDJOR trop techniques (agents, moteurs, providers, modèles, feature flags) — rester sur preuves, audit, documents, hash, journal.
- Ne pas promettre un backend bancaire complet : Wakama prépare et documente, l'institution décide.
- Ne pas dire que l'IA est décisionnelle, ni qu'elle score ou décide automatiquement.
- Ne pas montrer de logs techniques (console navigateur, terminal backend, requêtes réseau).
- Ne pas montrer d'erreurs Prisma ou un état `DEGRADED`.
- Ne pas faire d'upload de document en direct si ce n'est pas indispensable au discours.
- Ne pas ouvrir de fichiers `.env` ou tout fichier contenant des secrets.
- Ne pas improviser hors du parcours validé : `/fr/login` → `/fr/dashboard` → `/fr/applications` → `/fr/applications/[id]` → `/fr/idjor`.
