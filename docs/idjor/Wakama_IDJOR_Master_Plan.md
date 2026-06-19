# Wakama — Plan de Développement Global IDJOR

**Version :** 1.0 — Architecture canonique finale
**Statut :** document de référence unique. Remplace les plans antérieurs.
**Date :** Juin 2026
**Principe fondateur :** *L'IA prépare, analyse, explique, priorise, documente et recommande. Le code calcule et applique les règles. L'institution décide.*

---

## AVERTISSEMENT DE LECTURE

Ce document est la **carte du territoire**, pas le backlog d'implémentation immédiat.

Il décrit l'architecture cible complète (13 agents, ~100 moteurs, couches transverses, blockchain, RAG, multi-tenant, souveraineté). Mais **on n'implémente jamais tout en même temps.** On fige le socle maintenant, on active les moteurs progressivement (v1 → v5), chaque activation étant visible dans le Cockpit.

Confondre « architecture canonique figée » avec « tout construire maintenant » est le risque numéro un. Ce document est conçu pour l'éviter : chaque moteur a un **statut** (`LIVE`, `SOCLE`, `À VENIR`) et n'est allumé que lorsque son tour arrive.

---

## SOMMAIRE

1. Doctrine et principes non négociables
2. Architecture canonique — les 13 agents
3. Les ~100 moteurs, agent par agent
4. Les couches transverses (LLM Cognitive Engine, IBDO, IRETEX, IFDO)
5. Le Cockpit — pièce maîtresse vivante
6. Multi-tenant & souveraineté des données
7. Stack technique (LLM, RAG, embeddings, vector store, blockchain)
8. Modèle de données canonique
9. Routes API canoniques
10. Frontière LLM / Code / Institution
11. Roadmap versionnée (v1 → v5) par trimestres
12. Statut réel actuel (ce qui est fait)
13. Séquence d'exécution immédiate
14. Règles de sécurité, gouvernance et conformité

---

## 1. DOCTRINE ET PRINCIPES NON NÉGOCIABLES

Ces règles priment sur toute considération technique. Aucune version, aucun moteur, aucune optimisation ne peut les enfreindre.

1. **L'IA ne décide jamais.** Elle prépare, analyse, explique, relie, synthétise, priorise, documente, recommande et alerte.
2. **L'IA ne calcule jamais une décision métier.** Aucun LLM ne calcule une prime, une éligibilité, un montant, un score de risque ou un statut. Ces calculs sont faits par du code déterministe (Business Rules Engine, Scoring Engine), traçable et auditable.
3. **L'IA ne modifie jamais les règles.** Elle peut proposer des améliorations au CEO / Conseil / représentants des actionnaires. Toute règle validée est gravée dans IBDO.
4. **L'institution reste seul décisionnaire.** Wakama n'est jamais prêteur, assureur ni contrepartie. L'institution régulée décide, décaisse et porte la relation client.
5. **Souveraineté totale de la donnée.** Les données client ne quittent jamais le périmètre. GPU loués considérés non fiables par défaut. Chiffrement, clés détenues par Wakama/l'institution, aucun egress réseau non autorisé.
6. **Tenant-aware partout.** Chaque donnée, document, log, scope RAG et appel LLM porte un `tenant_id` de première classe, dès la base de données.
7. **Feature flags OFF par défaut.** Tout nouveau moteur naît désactivé, read-only, sans effet de bord, et n'est activé qu'explicitement.
8. **Aucune fausse confirmation.** L'UI ne ment jamais sur l'état réel du système. Un moteur non actif est affiché comme non actif.
9. **Audit append-only.** Toute action IA est tracée de façon immuable (prompt, sources, réponse, tenant, horodatage).

### Wording régulé obligatoire

| Ne jamais dire | Toujours dire |
|---|---|
| « IDJOR décide » | « IDJOR prépare, arbitre techniquement, explique, documente » |
| « IA décisionnaire autonome » | « Aide à la décision non décisionnelle ; l'institution décide » |
| « Compagnie autonome non-humaine » | « Infrastructure institutionnelle sous gouvernance humaine » |
| « Assurance Maroc » (en démo CI) | « Infrastructure institutionnelle » / nom du tenant |
| « Backend bancaire déjà complet » | « MVP en cours, socle opérationnel démontré » |

---

## 2. ARCHITECTURE CANONIQUE — LES 13 AGENTS

Source : série complète `00_IDJOR_Organigramme` + fiches agents 01-13 + Contract Life Cycle + Enterprise Interaction Map + Knowledge Governance Pyramid + LLM Cognitive Engine. Les anciens schémas restent réservés au pitch / storytelling.

```
IDJOR Control Plane
│
├─ COUCHE CHAÎNE DE VALEUR (agents opérationnels séquentiels)
│  ├─ DCA          Acquisition / onboarding / dossier initial / OCR
│  ├─ IRAX-P       Pré-orchestration risque
│  ├─ IRAX1        Terrain / agent / preuves physiques
│  ├─ IRAX2        Back office scientifique (satellite, météo, hydro, agronomie)
│  ├─ IRAX3        Consolidation / cohérence / arbitrage technique
│  └─ IRAX-D       Calcul risque / recommandation technique (NON décisionnelle)
│
├─ COUCHE SURVEILLANCE & SINISTRE (post-contrat)
│  ├─ IDDO         Surveillance post-contrat / monitoring / déviations
│  └─ ICOO         Sinistres / causalité / optimisation indemnitaire
│
├─ COUCHE GOUVERNANCE & FORENSIC (transverse)
│  ├─ ICGO         Gouvernance contractuelle
│  └─ IFDO         Forensic / due diligence / fraude / incohérences
│
├─ COUCHE PREUVE (transverse)
│  └─ IBDO         Preuve / archivage / hash / audit trail / blockchain vault
│
├─ COUCHE CONNAISSANCE (transverse)
│  └─ IRETEX       Intelligence collective / retour d'expérience
│
├─ COUCHE COGNITIVE (transverse — alimente tous les autres)
│  └─ LLM Cognitive Engine
│     ├─ RAG Engine
│     ├─ Semantic Search Engine
│     ├─ Knowledge Graph Engine
│     ├─ Knowledge Gap Engine
│     ├─ Knowledge Debt Engine
│     ├─ Pattern Discovery Engine
│     ├─ Strategic Recommendation Engine
│     └─ Cognitive Governance Engine
│
└─ COUCHE EXÉCUTIVE (orchestration, NON décisionnelle)
   └─ IDJOR        Prépare / arbitre techniquement / explique / documente
```

### Les deux familles d'agents (distinction structurante)

- **Agents chaîne de valeur** (DCA, IRAX-P/1/2/3/D) : moteurs déterministes séquentiels qui produisent la donnée métier. Le LLM les *assiste* (explique, résume) mais ne les *remplace* jamais.
- **Agents de connaissance/gouvernance transverses** (IDDO, ICOO, ICGO, IFDO, IBDO, IRETEX, LLM Cognitive Engine, IDJOR) : alimentés par le LLM et alimentant le LLM.

### Le cycle de vie du contrat (Contract Life Cycle)

```
Acquisition → Risk Intelligence → Governance Review → Décision →
Surveillance → Claims Management → Closure → (boucle d'apprentissage)
   DCA          IRAX group          ICGO         IDJOR
                                                  IDDO      ICOO       archivage
```
Couches transverses tout au long du cycle : IFDO (forensic), IBDO (preuve), IRETEX (intelligence collective), LLM Cognitive Engine (intelligence cognitive).

### La pyramide de connaissance (Knowledge Governance Pyramid)

```
DONNÉES → INFORMATION → CONNAISSANCE → VÉRITÉ → DÉCISION → PREUVE → INTELLIGENCE → SAGESSE
(brutes)   (DCA/IRAX)    (agents)       (vérités  (IDJOR)    (IBDO)   (IRETEX/LLM)   (CEO/Board)
                                         produites)
```

---

## 3. LES ~100 MOTEURS, AGENT PAR AGENT

Chaque moteur a un statut : **LIVE** (actif en MVP), **SOCLE** (structure figée, flag OFF), **À VENIR** (roadmap ultérieure).

### 3.1 DCA — Digital Contract Acquisition Engine (10 moteurs)
*Premier maillon. Produit la Vérité Déclarative. Livrable : DCA Intake Package (DIP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Customer Engagement Engine | Attirer / assister le prospect | SOCLE |
| 2 | Prospect Intake Engine | Capter et qualifier le prospect | LIVE |
| 3 | Document Acquisition Engine | Collecter les documents | LIVE |
| 4 | OCR & Data Extraction Engine | Lire / extraire (assisté LLM) | LIVE |
| 5 | Identity Profiling Engine | Profil identité / KYC | LIVE |
| 6 | Agricultural Profiling Engine | Profil agricole | SOCLE |
| 7 | Asset Declaration Engine | Déclaration des actifs | SOCLE |
| 8 | Geospatial Intake Engine | Saisie géospatiale / parcelles | SOCLE |
| 9 | Forensic & Governance Trigger Engine | Déclencher IFDO/gouvernance | SOCLE |
| 10 | Pipeline Intelligence Engine | Intelligence du pipeline | À VENIR |

### 3.2 IRAX-P — Planning & Orchestration Engine (10 moteurs)
*Cerveau tactique du pré-contrat. Livrable : Master Risk Investigation Plan (MRIP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Risk Intake Analysis Engine | Analyser l'entrée de risque | SOCLE |
| 2 | Risk Segmentation Engine | Segmenter le risque | SOCLE |
| 3 | Investigation Strategy Engine | Stratégie d'investigation | À VENIR |
| 4 | Field Investigation Planning Engine | Planifier le terrain (→IRAX1) | À VENIR |
| 5 | Back Office Investigation Planning Engine | Planifier le back office (→IRAX2) | À VENIR |
| 6 | Forensic Coordination Engine | Coordonner le forensic | À VENIR |
| 7 | Evidence Governance Engine | Gouverner les preuves | À VENIR |
| 8 | Resource Allocation Engine | Allouer les ressources | À VENIR |
| 9 | Risk Workflow Orchestration Engine | Orchestrer le workflow | SOCLE |
| 10 | Investigation Command Center | Centre de commandement | À VENIR |

### 3.3 IRAX1 — Front Office Investigation Engine (10 moteurs)
*Les yeux et oreilles sur le terrain. Produit la Vérité Terrain. Livrable : Field Risk Assessment Package (FRAP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Field Mission Planning Engine | Planifier la mission terrain | À VENIR |
| 2 | Geospatial Verification Engine | Vérifier la géolocalisation | À VENIR |
| 3 | Parcel Verification Engine | Vérifier les parcelles | À VENIR |
| 4 | Agricultural Activity Verification Engine | Vérifier l'activité agricole | À VENIR |
| 5 | Asset Verification Engine | Vérifier les actifs | À VENIR |
| 6 | Field Evidence Collection Engine | Collecter les preuves terrain | À VENIR |
| 7 | Anomaly Detection Engine | Détecter les anomalies | À VENIR |
| 8 | Field Risk Intelligence Engine | Intelligence risque terrain | À VENIR |
| 9 | Evidence Transfer Engine | Transférer les preuves (→IBDO) | À VENIR |
| 10 | Field Reporting Engine | Rapport terrain | À VENIR |

### 3.4 IRAX2 — Back Office Investigation Engine (10 moteurs)
*Le laboratoire scientifique du risque. Produit la Vérité Scientifique. Livrable : Scientific Risk Assessment Package (SRAP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Data Aggregation Engine | Agréger les données | À VENIR |
| 2 | Geospatial Intelligence Engine | Intelligence géospatiale | À VENIR |
| 3 | Climate Intelligence Engine | Intelligence climatique | À VENIR |
| 4 | Hydrology Intelligence Engine | Intelligence hydrologique | À VENIR |
| 5 | Agronomic Intelligence Engine | Intelligence agronomique | À VENIR |
| 6 | Economic Intelligence Engine | Intelligence économique | À VENIR |
| 7 | Supply Chain Intelligence Engine | Intelligence supply chain | À VENIR |
| 8 | Risk Correlation Engine | Corréler les risques | À VENIR |
| 9 | Predictive Analytics Engine | Analyse prédictive | À VENIR |
| 10 | Scientific Reporting Engine | Rapport scientifique | À VENIR |

### 3.5 IRAX3 — Risk Consolidation & Synthesis Engine (10 moteurs)
*La salle de fusion et d'arbitrage. Produit la Vérité Consolidée. Livrable : Consolidated Risk Intelligence Package (CRIP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Multi-Source Intake Engine | Recevoir multi-sources | À VENIR |
| 2 | Consistency Analysis Engine | Analyser la cohérence | À VENIR |
| 3 | Conflict Detection Engine | Détecter les conflits | À VENIR |
| 4 | Conflict Resolution Engine | Résoudre les conflits | À VENIR |
| 5 | Evidence Correlation Engine | Corréler les preuves | À VENIR |
| 6 | Trust Evaluation Engine | Évaluer la confiance | À VENIR |
| 7 | Risk Consolidation Engine | Consolider le risque | À VENIR |
| 8 | Executive Synthesis Engine | Synthèse exécutive | À VENIR |
| 9 | IRAX-D Preparation Engine | Préparer IRAX-D | À VENIR |
| 10 | Consolidated Reporting Engine | Rapport consolidé | À VENIR |

### 3.6 IRAX-D — Decision Engine (10 moteurs)
*Le moteur officiel de CALCUL du risque contrat (par code, jamais par LLM). Produit la Vérité Décisionnelle. Formule : R = G × F × D. Livrable : Contract Risk Decision Package (CRDP).*
**Le LLM peut EXPLIQUER le score d'IRAX-D, jamais le CALCULER.**

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Risk Intake Engine | Recevoir le risque consolidé | SOCLE |
| 2 | Severity Scoring Engine | Scorer la gravité (G) | SOCLE (calcul code) |
| 3 | Frequency Scoring Engine | Scorer la fréquence (F) | SOCLE (calcul code) |
| 4 | Detectability Scoring Engine | Scorer la détectabilité (D) | SOCLE (calcul code) |
| 5 | Contract Risk Calculation Engine | Calculer R = G×F×D | SOCLE (calcul code) |
| 6 | Pricing Recommendation Engine | Recommander la tarification | À VENIR |
| 7 | Scenario Simulation Engine | Simuler des scénarios | À VENIR |
| 8 | Decision Recommendation Engine | Recommander (NON décider) | À VENIR |
| 9 | WDE Preparation Engine | Préparer la surveillance | À VENIR |
| 10 | Decision Reporting Engine | Rapport décisionnel | À VENIR |
| + | **IRAX Explanation (LLM)** | **Expliquer le score calculé** | **LIVE** |

### 3.7 IDDO — Insurance Deviation Detection Officer (10 moteurs)
*Le gardien de la santé du contrat vivant. Produit la Connaissance Surveillance. Livrable : Contract Surveillance Intelligence Package (CSIP).*
Moteurs : Surveillance, Détection (déviations négatives/positives/neutres), Qualification, Priorisation & Alerte, Historisation, Indices (CHI, DSI, DFI), Early Warning, Opportunity Detection, Pattern & Trends, RETEX Surveillance.
**Statut MVP : À VENIR (post-démo, surveillance avancée non activée).**

### 3.8 ICOO — Insurance Claims Optimization Officer (10 moteurs)
*Le défenseur des marges et de l'équité indemnitaire. Produit la Connaissance Sinistre & Causalité. Livrable : Claims Intelligence Optimization Package (CIOP).*
Moteurs : Réception & Qualification, Investigation, Détermination Causalité, Expertise, Détection Fraude, Optimisation Indemnisation, Maximisation Recours, Décision Indemnitaire, Clôture, Capitalisation.
**Statut MVP : À VENIR.**

### 3.9 ICGO — Insurance Contract Governance Officer (8 moteurs)
*Le gouverneur du contrat vivant. Produit la Connaissance de Gouvernance Contractuelle. Livrable : Contract Governance Intelligence Package (CGIP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Contract Governance Engine | Piloter la gouvernance | À VENIR |
| 2 | Decision Preparation Engine | Préparer les dossiers (→IDJOR) | À VENIR |
| 3 | Knowledge Consumption Verification Engine | Vérifier la consommation IRETEX | À VENIR |
| 4 | Evidence Compliance Engine | Vérifier conformité probatoire IBDO | À VENIR |
| 5 | Governance Escalation Engine | Identifier les escalades | À VENIR |
| 6 | Resource Allocation Engine | Recommander l'allocation | À VENIR |
| 7 | Portfolio Governance Engine | Piloter le portefeuille | À VENIR |
| 8 | Governance Intelligence Engine | Produire la connaissance gouvernance | À VENIR |

### 3.10 IFDO — Insurance Forensic & Due Diligence Officer (10 moteurs)
*La conscience critique indépendante. Produit la Connaissance Forensic. Livrable : Forensic Intelligence Package (FIP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Due Diligence Engine | Vérifier les infos précontractuelles | SOCLE |
| 2 | Fraud Detection Engine | Détecter la fraude | À VENIR |
| 3 | Whistleblowing Engine | Traiter les alertes | À VENIR |
| 4 | Data Correlation Engine | Recouper internes/externes | À VENIR |
| 5 | Conflict of Interest Detection Engine | Détecter conflits d'intérêts | À VENIR |
| 6 | Forensic Trust Engine | Indices de confiance | À VENIR |
| 7 | Portfolio Forensic Intelligence Engine | Capitaliser les patterns | À VENIR |
| 8 | Forensic Surveillance Engine | Support surveillance (IDDO) | À VENIR |
| 9 | Forensic Claims Engine | Support sinistres (ICOO) | À VENIR |
| 10 | Forensic Governance Engine | Analyses pour ICGO/IDJOR | À VENIR |

### 3.11 IBDO — Insurance Blockchain Document Officer (8 moteurs)
*Conservateur de la Connaissance Probatoire. Mémoire probante officielle. Livrable : Probative Knowledge Package (PKP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Blockchain Anchoring Engine | Ancrer les empreintes (hash) | SOCLE |
| 2 | Evidence Preservation Engine | Conserver preuves/documents | LIVE (hash SHA-256 déjà fait) |
| 3 | Rules Preservation Engine | Conserver/versionner les règles | SOCLE |
| 4 | Decision Preservation Engine | Conserver décisions + justifications | SOCLE |
| 5 | Knowledge Preservation Engine | Conserver connaissances/RETEX | À VENIR |
| 6 | Evidence Integrity Engine | Contrôle intégrité / hash / horodatage | LIVE |
| 7 | Audit & Traceability Engine | Journaux d'audit inviolables | SOCLE |
| 8 | Legal Defensibility Engine | Garantir la recevabilité juridique | À VENIR |

### 3.12 IRETEX — Insurance RETEX & Strategic Intelligence Officer (6 moteurs)
*Le cerveau collectif. Producteur de l'Intelligence Collective. Aligné ISO 30401. Livrable : Collective Intelligence Package (CIP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Knowledge Capitalization Engine | Capitaliser / diffuser / réutiliser | À VENIR |
| 2 | Internal Intelligence Engine | Pilotage / analyse 12M | À VENIR |
| 3 | External Strategic Intelligence Engine | EMAF / EMIF / PESTEL | À VENIR |
| 4 | Knowledge Gap Engine | Knowledge Gap / Debt / Coverage | À VENIR |
| 5 | Collective Intelligence Engine | Transformer connaissance → reco | À VENIR |
| 6 | Mandatory Knowledge Loop | Boucle de contribution obligatoire | À VENIR |

### 3.13 IDJOR — Insurance Decision & Judicial Operations Regulator (8 moteurs)
*Couche exécutive. Prépare, arbitre techniquement, explique, priorise, documente. NE DÉCIDE PAS (wording régulé). Livrable : Decision Intelligence Package (DIP).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | Decision Intelligence Engine | Analyser / prioriser / synthétiser | SOCLE |
| 2 | Rules Compliance Engine | Vérifier conformité aux règles | SOCLE |
| 3 | Portfolio Arbitration Engine | Arbitrer conflits de priorité | À VENIR |
| 4 | Risk Decision Engine | Préparer décisions pré-contrat | À VENIR |
| 5 | Surveillance Decision Engine | Préparer décisions surveillance | À VENIR |
| 6 | Claims Decision Engine | Préparer décisions sinistres | À VENIR |
| 7 | Resource Allocation Engine | Préparer allocation ressources | À VENIR |
| 8 | Executive Governance Engine | Pilotage et reporting exécutif | À VENIR |

### 3.14 LLM Cognitive Engine — Couche transverse (8 moteurs)
*Producteur de l'Intelligence Cognitive. Livrable : Cognitive Intelligence Package (CIP-L).*

| # | Moteur | Rôle | Statut MVP |
|---|---|---|---|
| 1 | RAG Engine | Répondre à partir de sources autorisées | LIVE (read-only) |
| 2 | Semantic Search Engine | Recherche par sens / similarité | À VENIR (v3) |
| 3 | Knowledge Graph Engine | Relier connaissances/agents/preuves | À VENIR (v3) |
| 4 | Pattern Discovery Engine | Détecter tendances / signaux faibles | À VENIR (v4) |
| 5 | Knowledge Gap Engine | Identifier ce qu'on ne sait pas | À VENIR (v4) |
| 6 | Knowledge Debt Engine | Identifier l'obsolescence | À VENIR (v4) |
| 7 | Strategic Recommendation Engine | Recommandations non décisionnelles | À VENIR (v5) |
| 8 | Cognitive Governance Engine | Contrôler accès/sources/traces/limites | SOCLE (minimal LIVE) |

**Décompte total : ~120 moteurs sur 14 entités. En MVP IA, ~12 moteurs sont LIVE.**

---

## 4. LES COUCHES TRANSVERSES

### 4.1 LLM Cognitive Engine
Transverse, alimente et est alimenté par tous. **Ne décide jamais, ne calcule jamais.** Contrôlé par RBAC/ABAC/Least Privilege/Need-to-Know. Accès IBDO strictement scopé. Produit : explications, synthèses, recherches sourcées, recommandations non décisionnelles, alertes.

### 4.2 IBDO — Preuve & Blockchain
Transverse tout au long du cycle. La blockchain sert **uniquement** à l'intégrité et l'auditabilité (ancrage de hash), **jamais** comme modèle crypto/spéculatif. Niveau CIA : Confidentialité Critique, Intégrité Critique, Disponibilité Très Élevée.

### 4.3 IRETEX — Intelligence Collective
Transverse. Boucle d'apprentissage obligatoire : chaque agent consomme et contribue. Aligné ISO 30401.

### 4.4 IFDO — Forensic
Transverse. Conscience critique indépendante sur tout le cycle (pré-contrat, surveillance, sinistre).

---

## 5. LE COCKPIT — PIÈCE MAÎTRESSE VIVANTE

**Le Cockpit est construit en PREMIER, avant tout moteur, et grandit avec eux.** À chaque branchement de moteur, il s'allume. C'est le « corps humain en fonctionnement » : on voit la donnée réelle transiter.

### Principe directeur (non négociable)
**Le Cockpit ne montre QUE de la vraie data sur les moteurs réellement actifs.** Aucune animation fictive. Un moteur non actif est affiché `À VENIR` / grisé. Mentir dans le Cockpit = perdre la confiance d'un évaluateur technique. C'est interdit.

### Ce que le Cockpit affiche
- **Les moteurs LIVE** : allumés, avec la donnée réelle qui les traverse (ex. dossier du jury en démo).
- **Les moteurs SOCLE** : présents, structure visible, état « prêt / flag OFF ».
- **Les moteurs À VENIR** : grisés, étiquetés roadmap (v3/v4/v5). Devient un atout : raconte la roadmap visuellement.

### Le flux vivant de la démo (chemin réel MVP)
```
Jury s'inscrit → DCA reçoit le dossier → Document Acquisition + OCR (LLM lit/extrait)
→ RAG Engine cherche dans la base tenant → IBDO horodate + hash + scelle la preuve
→ IRAX Explanation (LLM) résume le dossier → Cockpit montre chaque étape en temps réel
```

### Design
- **Pro et léger**, pas Hollywood. Sobriété = sérieux d'ingénieur. Néon excessif = « startup qui surfe sur la vague IA ».
- Métaphore ruche / cellule : agents = cellules, data = flux entre cellules.
- Tenant-aware : le Cockpit s'habille aux couleurs du tenant (BNI, BAD, Wakama).
- États visuels par moteur : `LIVE` (animé, vrai flux), `SOCLE` (prêt), `À VENIR` (grisé).
- Audit visible : chaque action montre son hash / horodatage IBDO.

### Statut
**Cockpit = première brique à construire en Phase 2 (après audit 2A).** Il est l'instrument de mesure de tout le reste du projet.

---

## 6. MULTI-TENANT & SOUVERAINETÉ DES DONNÉES

### Multi-tenant (déjà opérationnel en prod côté dashboard)
- Une seule UI, `tenantConfig` statique, bascule via `?tenant=`, cookie `wakama_tenant`.
- Tenants actuels : `assurance-ma`, `bni-ci`, `bad-program`, `wakama`.
- **À prolonger en Phase 2B** : `tenant_id` comme colonne de première classe dans toute la DB backend, scopes RAG par tenant, isolation des documents/logs/embeddings par tenant.

### Pays × Socle métier (deux dimensions indépendantes)
- **Pays** → localisation : devise (FCFA/MAD), langue, conformité, API régionale.
- **Socle métier** → vocabulaire + workflows : Assurance / Banque / Microcrédit-SFD / Programme de développement / Autre.
- Un tenant = combinaison. BNI = (CI × Banque). BAD = (panafricain × Programme).

### Souveraineté (architecture en 5 plans, issue du handoff Frontier Tuning)
- **Data plane** : données brutes dans le périmètre, chiffrées, clés détenues.
- **Training plane** : isolé, GPU loués non fiables par défaut.
- **Inference plane** : vLLM/TGI, pas d'egress non autorisé.
- **Policy plane** : RBAC/ABAC, mTLS, gouvernance.
- **Observability plane** : audit append-only, logs redacted.

---

## 7. STACK TECHNIQUE

### LLM (stratégie double modèle — licences à revérifier avant déploiement)
- **Modèle principal cible** : Mistral Small 3.x / 24B. Bon français, image européenne rassurante (BAD/banques/régulateurs), RAG/synthèse institutionnelle.
- **Modèle benchmark / raisonnement** : Qwen3 14B ou 32B. Fort raisonnement, candidat fine-tuning ultérieur.
- **Local / dev léger** : Qwen3 8B ou 14B quantisé.
- **Écarté en principal** : Llama (licence communautaire Meta, branding imposé) ; Kimi (MIT modifié, attribution imposée au-delà de seuils).
- **Vérification obligatoire** : licence exacte de la version précise sur la model card Hugging Face, à la date de téléchargement, avant de graver.

### RAG (n'est PAS une brique triviale)
RAG read-only = **ingestion + chunking + embeddings + vector store + retrieval + citations + audit + tenant scope**. À prévoir intégralement dès Phase 2A.
- **Embeddings** : modèle multilingue auto-hébergé (à choisir et tester sur les langues locales CI).
- **Vector store** : isolé, scopé par tenant.
- **Levier de qualité** : la qualité du retrieval prime sur la taille du modèle. Investir sur embedding + chunking + RAG, pas sur la course aux paramètres.

### Blockchain (IBDO)
- Usage strict : ancrage de hash, intégrité, auditabilité, non-répudiation.
- **Jamais** : modèle crypto, spéculation, token business.
- Technologies : Hashing & Time Stamping, PKI & Digital Signature, Smart Contracts (intégrité), Secure Archive & WORM.

### Service & infra
- **vLLM** (production, haut débit) / **Ollama** (prototypage). API compatible OpenAI.
- Stack backend existant : Prisma, App Router Next 15 (dashboard).
- Déploiement : Coolify.

---

## 8. MODÈLE DE DONNÉES CANONIQUE (à figer en Phase 2B)

Toutes les entités portent `tenant_id` (première classe). Tout en flag OFF / read-only au départ.

- **Agent** : registre des 14 agents (id, nom, couche, statut, flag).
- **Engine** : registre des ~120 moteurs (id, agent_id, nom, statut LIVE/SOCLE/À VENIR, flag).
- **Tenant** : institutions (id, pays, socle métier, branding, endpoint API).
- **AI Provider Config** : config LLM (provider, modèle, endpoint, scope tenant).
- **Embedding Provider Config** : config embeddings.
- **RAG Document** : documents ingérés (tenant_id, source, hash, statut).
- **RAG Chunk** : chunks (document_id, contenu, position, embedding_ref).
- **Vector Reference** : références vectorielles (chunk_id, vector_store_id, tenant_id).
- **AI Run Log** : exécutions IA (tenant_id, agent, moteur, prompt, sources, horodatage).
- **AI Message Log** : messages (run_id, rôle, contenu).
- **Tool Permission** : permissions des outils par agent/tenant (RBAC/ABAC).
- **Feature Flag** : flags par moteur/agent/tenant.
- **Audit Trail IA** : journal append-only immuable.
- **Evidence File** : preuves (tenant_id, hash SHA-256, horodatage IBDO) — *déjà existant*.

---

## 9. ROUTES API CANONIQUES (à créer progressivement, flags OFF)

### Existant (Phase 1.5)
- `POST /v1/insurance/applications/:id/documents` — upload documents (hash, metadata, side effects OFF).

### À créer en Phase 2 (read-only d'abord)
- `GET /v1/ai/health` — état du Control Plane.
- `GET /v1/ai/agents` — registre des agents et leur statut.
- `GET /v1/ai/engines` — registre des moteurs et leur statut (alimente le Cockpit).
- `POST /v1/ai/rag/query` — requête RAG read-only, scopée par tenant, avec citations.
- `GET /v1/ai/runs` — journal des exécutions IA.
- `GET /v1/ai/cockpit/stream` — flux temps réel pour le Cockpit (données réelles uniquement).

Toutes scopées par `tenant_id`, auth cookie-first, audit systématique.

---

## 10. FRONTIÈRE LLM / CODE / INSTITUTION (encadré non négociable)

```
┌─────────────────────────────────────────────────────────────┐
│  LLM (Cognitive Engine)                                       │
│  → comprendre, relier, synthétiser, expliquer, rechercher,    │
│    recommander (non décisionnel), alerter                     │
│  ✗ JAMAIS : calculer prime/éligibilité/montant/score/statut   │
│  ✗ JAMAIS : décider, modifier une règle                       │
├─────────────────────────────────────────────────────────────┤
│  CODE / API (Business Rules, Scoring, Workflow)               │
│  → calculer R = G×F×D, scorer, appliquer règles, statuts      │
│  → déterministe, traçable, auditable                          │
├─────────────────────────────────────────────────────────────┤
│  INSTITUTION (banque, SFD, programme, assureur)               │
│  → décision finale, décaissement, relation client             │
│  → seul décisionnaire, seul prêteur/contrepartie              │
└─────────────────────────────────────────────────────────────┘
```

**Exemple concret :** IRAX-D calcule le score (code). Le LLM *explique* ce score au comité, retrouve des dossiers similaires (RAG), signale une incohérence. Le LLM ne touche jamais au calcul. L'institution décide d'accorder ou non le crédit.

---

## 11. ROADMAP VERSIONNÉE (v1 → v5)

| Version | Trimestre | Thème | Moteurs activés | Visible au Cockpit |
|---|---|---|---|---|
| **v1** | Fait (prod) | MVP multi-tenant | Dashboard tenant-aware, upload+hash | Branding tenant |
| **v2** | T1 post-levée | Socle IA + Cockpit + RAG read-only | Control Plane, RAG, IBDO minimal, DCA assistant, IRAX explanation | Cockpit s'allume sur 5 moteurs réels |
| **v3** | T2 post-levée | Intelligence cognitive opérationnelle | Semantic Search, Knowledge Graph, synthèse | Recherche + graphe vivants |
| **v4** | T3 post-levée | Détection & anticipation | Pattern Discovery, Knowledge Gap, Knowledge Debt | Alertes signaux faibles |
| **v5** | T4 post-levée | Gouvernance & recommandation | Strategic Recommendation, Cognitive Governance complet, agents métier (IDDO, ICOO, ICGO complets) | Cockpit complet |

**Règle de séquençage :** prouver avant de scaler ; gouvernance d'abord (v2) ; l'humain décide à toutes les versions ; valeur croissante.

---

## 12. STATUT RÉEL ACTUEL

### Phase 1.5 — Upload assurance réel Farmer → Backend
- **Code clôturé.** Endpoint upload (hash SHA-256, stockage privé, metadata only, side effects OFF), Farmer webapp upload réel, dashboard lecture metadata. Régression auth corrigée (`/v1/auth/me` source de vérité).
- **Reste :** test live complet de bout en bout à rejouer (prérequis de la démo).

### Phase 1.6 — MVP multi-tenant BNI/BAD
- **En prod, clôturable.** `tenantConfig`, middleware `?tenant=`, 4 tenants, logos BNI/BAD, switcher démo, redirections tenant-aware, dashboard tenant-aware, « Maroc » neutralisé.

### Architecture IDJOR
- **Validée comme canon backend.** Nouvelle série complète adoptée. Anciens schémas = pitch.

---

## 13. SÉQUENCE D'EXÉCUTION IMMÉDIATE

### Priorité 1 — Freeze démo BNI/BAD
- Ne plus toucher `ma-assurance-dashboard` sauf bug bloquant.
- Préparer scripts démo BNI + BAD, storytelling 5 min, mots à éviter/utiliser (cf. §1).
- **Étanchéité absolue** entre le repo de démo gelé et le dev IA. Le Cockpit est v2, pas du freeze.

### Priorité 2 — Reprendre et blinder le test live Phase 1.5
- Rejouer : Farmer → créer DCA → upload documents → dashboard metadata visibles.
- **Blinder pour la démo live :** contrôler le timing du mail de confirmation (ou le sortir du chemin critique), plan B réseau (4G/5G testée sur place), 10 répétitions dont une en conditions dégradées, enregistrement de secours de la démo parfaite.
- Checklist : CIN recto/verso RECEIVED, attestation RECEIVED, hash/mime/date/taille affichés, download désactivé.

### Priorité 3 — Phase 2A : Audit backend IDJOR (read-only, zéro modification)
Repo : `~/dev/wakama-backend`. Auditer : schéma Prisma actuel, tables audit, `institutionId`/`country`/`scope`, où ajouter `tenant_id`, où créer `src/idjor/`, routes assurance existantes, feature flags, auth/scope, storage documents, evidence/IBDO existant, logs, future ingestion RAG, embeddings, vector store, LLM provider config, agent registry.

### Priorité 4 — Phase 2B : Figer le socle (flags OFF)
Créer : Agent registry, tenant-aware AI scope, LLM provider config, embedding provider config, RAG document/chunk/vector models, AI run/message logs, tool permission registry, feature flags IDJOR, audit trail IA. **Tout OFF, read-only, aucune décision automatique, aucun calcul score par LLM.**

### Priorité 5 — Construire le Cockpit (première brique vivante)
Cockpit tenant-aware, données réelles uniquement, états LIVE/SOCLE/À VENIR. Branché sur `GET /v1/ai/engines` et `GET /v1/ai/cockpit/stream`.

### Priorité 6 — Activer les 5 moteurs MVP IA
Dans l'ordre : Control Plane → RAG read-only → IBDO minimal → DCA assistant → IRAX explanation. Chaque activation devient visible dans le Cockpit.

### Outil de code
À vérifier avant de s'engager (même rigueur que pour le LLM). Ne pas graver de mémoire.

---

## 14. RÈGLES DE SÉCURITÉ, GOUVERNANCE ET CONFORMITÉ

### Contrôles techniques (par défaut sur tout moteur IA)
MFA, RBAC, ABAC, Least Privilege, Need-to-Know, Prompt Logging, Output Monitoring, Data Loss Prevention, SIEM, Chiffrement (transit + repos), Audit Trail append-only, Guardrails, Human Governance Validation.

### Niveau CIA des actifs IA
Confidentialité : CRITIQUE. Intégrité : CRITIQUE. Disponibilité : Très Élevée. Criticité Cyber : CRITIQUE.

### Référentiels applicables
ISO/IEC 42001 (management IA), ISO/IEC 27001 (sécurité info), ISO/IEC 27701 (vie privée), ISO 30401 (knowledge management), ISO 31000 (risque), ISO 37000 (gouvernance), ISO 22301 (continuité). Réglementaire : ACAPS, DGSSI/IIV DGSSI, CNDP/CNDP-GDPR, Loi 09-08, Loi 05-20, Code des Assurances (CI/UEMOA selon tenant).

### Gouvernance des règles de jeu
```
CEO (vision) → Conseil d'Administration (valide/modifie) → Représentants actionnaires (valident)
→ IBDO (grave/horodate/versionne les règles) → IDJOR (applique les règles pour préparer la décision)
```
Toute modification de règle proposée par le LLM doit être validée humainement avant gravure dans IBDO.

---

## RÈGLE ABSOLUE (à retenir avant toute ligne de code)

**Multi-tenant partout + RAG scopé par tenant + IA non décisionnelle dès le départ.**
**L'IA explique. Le code décide. L'institution tranche.**
**Le Cockpit ne montre que du réel. Feature flags OFF par défaut. Souveraineté totale.**
