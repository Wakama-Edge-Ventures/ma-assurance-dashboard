import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";

const DOCS_SECTIONS = [
  {
    title: "Démarrage rapide",
    items: [
      { label: "Introduction à la plateforme Wakama Assurance", anchor: "#intro" },
      { label: "Connexion et gestion des sessions", anchor: "#auth" },
      { label: "Navigation et structure du tableau de bord", anchor: "#navigation" },
    ],
  },
  {
    title: "Workflow assurance",
    items: [
      { label: "Demandes de souscription (Applications)", anchor: "#applications" },
      { label: "Missions terrain et revue satellite", anchor: "#missions" },
      { label: "Audit de surface et arbitrage back-office", anchor: "#arbitrage" },
      { label: "Scoring RAX / WRS — framework de risque agricole", anchor: "#rax" },
      { label: "Tarification et suggestions de prime technique", anchor: "#pricing" },
      { label: "Polices — suivi opérationnel post-émission", anchor: "#policies" },
      { label: "Monitoring 360° — signaux NDVI, météo, IoT", anchor: "#monitoring" },
      { label: "Gestion des sinistres", anchor: "#claims" },
    ],
  },
  {
    title: "Données et intégrité",
    items: [
      { label: "Sources LIVE vs SEED_DEMO — transparence des données", anchor: "#sources" },
      { label: "Preuve d'intégrité horodatée et audit trail", anchor: "#integrity" },
      { label: "Vérification registre Blockchain", anchor: "#blockchain" },
      { label: "Export de données — CSV, JSON, PDF", anchor: "#export" },
    ],
  },
  {
    title: "Conformité et gouvernance",
    items: [
      { label: "Positionnement Wakama — non-décisionnel", anchor: "#positioning" },
      { label: "Cadre réglementaire ACAPS / CNDP", anchor: "#compliance" },
      { label: "Politique de confidentialité et sécurité des données", anchor: "#privacy" },
      { label: "Rôles et permissions utilisateurs", anchor: "#roles" },
    ],
  },
  {
    title: "Référence technique",
    items: [
      { label: "API Wakama — endpoints partagés (lecture seule)", anchor: "#api" },
      { label: "Variables d'environnement", anchor: "#env" },
      { label: "Configuration des seuils RAX/WRS", anchor: "#thresholds" },
      { label: "Paramètres de tarification", anchor: "#pricing-config" },
    ],
  },
] as const;

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Documentation"
        description="Guides, références techniques et procédures opérationnelles Wakama Assurance."
      />

      <div className="rounded-[20px] border border-cyan-400/12 bg-cyan-500/5 px-5 py-4">
        <p className="font-mono text-[11.5px] text-cyan-300/80">
          Documentation en cours de rédaction — les sections marquées seront publiées au fil des phases de déploiement.
          Pour toute question urgente, utilisez la{" "}
          <a href="/fr/hotline" className="underline underline-offset-2 hover:text-cyan-200">
            HotLine
          </a>
          .
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {DOCS_SECTIONS.map((section) => (
          <Card key={section.title} className="space-y-3">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
              {section.title}
            </h2>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={item.anchor}>
                  <a
                    href={item.anchor}
                    className="flex items-center gap-2 text-[13px] text-slate-400 transition-colors hover:text-slate-200"
                  >
                    <span className="font-mono text-[10px] text-slate-600">→</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Version et contact
        </h2>
        <div className="mt-3 space-y-1 text-[13px] text-slate-300">
          <p>Version plateforme : MVP Phase 25</p>
          <p>Dernière mise à jour : 2026-05-29</p>
          <p>
            Contact documentation :{" "}
            <a href="mailto:docs@wakama.farm" className="text-cyan-400 hover:text-cyan-300">
              docs@wakama.farm
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
