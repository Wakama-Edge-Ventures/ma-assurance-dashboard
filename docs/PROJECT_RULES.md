# PROJECT_RULES

## Positionnement Wakama
- Wakama n'est pas un assureur.
- Wakama n'emet pas de police d'assurance.
- Wakama ne prend pas la decision finale d'eligibilite.
- Wakama fournit une recommandation non decisionnelle, prepare des evidences, monitore et maintient un audit trail.
- L'assureur valide le prix commercial, emet et detient la police, decide et indemnise.

## Mode Demo MVP
- Le MVP doit rester demonstrable de bout en bout meme sans donnees live.
- Toute donnee doit porter `source: "LIVE" | "SEED_DEMO"`.
- Les donnees `SEED_DEMO` sont autorisees pour le MVP et doivent etre visibles dans l'UI.

## Roadmap Technique
- L'ancrage Solana sera asynchrone et non bloquant dans une phase ulterieure.
- RAX/WRS est un cadre v1 a calibrer progressivement avec les donnees assureur.
- Les donnees CNDP/PII exigent un traitement prudent, avec durcissement ulterieur.
- Les futures integrations backend utiliseront `https://api.wakama.farm`.
- Les entites Wakama existantes (`farmers`, `cooperatives`, `parcelles`, `NDVI`, `alerts`, `IoT`) sont des donnees partagees en lecture seule: ne pas dupliquer ni muter sans contrat backend explicite.
- Les tokens mock d'auth UI ne doivent jamais etre traites comme des credentials backend valides: seuls de vrais tokens backend peuvent etre envoyes aux appels live API.
- Les alertes Wakama existantes sont des signaux operationnels contextuels: ne jamais les presenter comme une approbation automatique de sinistre, une indemnisation ou une decision assureur.

## Formulations autorisees
- Utiliser: "preuve d'integrite horodatee".
- Utiliser: "architecture alignee ISO 27001".
- Utiliser: "concu pour le cadre ACAPS/CNDP".
- Utiliser: "recommandation non decisionnelle".
