import { PageTitle } from "@/components/ui/page-title";

const SECTIONS = [
  {
    id: "responsable",
    title: "Responsable du traitement",
    content: `Wakama Edge Ventures Inc. (ci-après « Wakama ») est responsable du traitement des données personnelles collectées via la plateforme Wakama Assurance.

Contact DPO : privacy@wakama.farm`,
  },
  {
    id: "donnees",
    title: "Données collectées",
    content: `La plateforme collecte et traite les catégories de données suivantes :

• Données d'identification des agriculteurs (nom, téléphone, région, statut KYC)
• Données parcellaires (coordonnées GPS, surface, culture, NDVI)
• Données coopératives (nom, région, filière, surface)
• Données d'activité plateforme (logs de connexion, actions opérateurs)
• Données de scoring technique (RAX/WRS — non décisionnel)
• Hash d'intégrité des audits terrain (empreintes SHA-256)

Ces données sont traitées exclusivement à des fins d'analyse de risque agricole non décisionnelle, de structuration de dossiers de souscription et de suivi opérationnel pour le compte de l'assureur partenaire.`,
  },
  {
    id: "base-legale",
    title: "Base légale du traitement",
    content: `Les traitements sont fondés sur :

• L'intérêt légitime de Wakama à fournir un service d'analyse de risque agricole (Art. 5 Loi 09-08)
• L'exécution du contrat de service entre Wakama et l'assureur partenaire
• Le consentement des agriculteurs, collecté lors de l'onboarding KYC

Wakama opère dans le cadre du règlement CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) et des exigences ACAPS.`,
  },
  {
    id: "conservation",
    title: "Durée de conservation",
    content: `• Données agriculteurs et parcelles : durée du contrat + 5 ans (obligations légales assurance)
• Données audit trail et hashes d'intégrité : 10 ans (exigences réglementaires)
• Logs de connexion et d'activité : 12 mois glissants
• Données de scoring RAX/WRS : durée du contrat + 3 ans`,
  },
  {
    id: "droits",
    title: "Vos droits",
    content: `Conformément à la Loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez des droits suivants :

• Droit d'accès à vos données personnelles
• Droit de rectification des données inexactes
• Droit d'opposition au traitement
• Droit à la limitation du traitement
• Droit à la portabilité (données fournies avec consentement)

Pour exercer ces droits : privacy@wakama.farm — réponse sous 30 jours.`,
  },
  {
    id: "securite",
    title: "Sécurité des données",
    content: `Wakama met en œuvre les mesures techniques et organisationnelles suivantes :

• Chiffrement des données en transit (TLS 1.3) et au repos (AES-256)
• Authentification à accès contrôlé — rôles et permissions segmentés
• Audit trail horodaté de toutes les actions opérateurs
• Ancrage cryptographique asynchrone sur blockchain Solana (hashes d'intégrité)
• Accès aux données limité au personnel habilité sur la base du besoin d'en connaître
• Tests de pénétration et revue de sécurité planifiés annuellement
• Procédure de notification de violation de données (72h CNDP)`,
  },
  {
    id: "tiers",
    title: "Partage avec des tiers",
    content: `Les données sont partagées uniquement avec :

• L'assureur partenaire (destinataire principal des analyses de risque)
• Les prestataires techniques sous-traitants (hébergement, monitoring) liés par contrat de sous-traitance
• Les autorités compétentes sur réquisition légale (ACAPS, CNDP, juridictions)

Wakama ne vend ni ne cède les données à des tiers à des fins commerciales.`,
  },
  {
    id: "cookies",
    title: "Cookies et traçabilité",
    content: `La plateforme utilise des cookies de session strictement nécessaires au fonctionnement de l'authentification. Aucun cookie de tracking publicitaire ou analytique tiers n'est déposé.

Les tokens d'authentification sont stockés en mémoire de session et ne sont pas transmis à l'API partagée Wakama (api.wakama.farm) dans la version MVP actuelle.`,
  },
  {
    id: "contact",
    title: "Contact et réclamations",
    content: `DPO Wakama : privacy@wakama.farm
Wakama Edge Ventures Inc.

Pour toute réclamation relative à la protection de vos données, vous pouvez également saisir la CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) — www.cndp.ma`,
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle
        title="Politique de confidentialité et sécurité"
        description="Traitement des données personnelles — Wakama Edge Ventures Inc. · Dernière mise à jour : 2026-05-29"
      />

      <div className="rounded-[20px] border border-slate-400/10 bg-[#0a0f1c]/60 px-5 py-4">
        <p className="font-mono text-[11.5px] text-slate-400">
          Cette politique s&apos;applique à la plateforme Wakama Assurance et à toutes les données
          traitées dans le cadre des services de structuration, scoring et monitoring de risque
          agricole fournis aux assureurs partenaires.
        </p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.id} id={section.id} className="rounded-[20px] border border-slate-400/10 bg-[#0a0f1c]/60 p-5 space-y-3">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
              {section.title}
            </h2>
            <div className="text-[13px] leading-relaxed text-slate-300 whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
