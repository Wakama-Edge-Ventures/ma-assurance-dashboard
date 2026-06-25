import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { PageTitle } from "@/components/ui/page-title";

const DOCS_SECTIONS = [
  {
    title: "Parcours dossiers",
    items: [
      { label: "Tableau de bord institutionnel", href: "/fr/dashboard" },
      { label: "Dossiers et file de travail", href: "/fr/applications" },
      { label: "Missions et revue terrain", href: "/fr/missions" },
    ],
  },
  {
    title: "Terrain & preuves",
    items: [
      { label: "Agriculteurs et cooperatives", href: "/fr/farmers" },
      { label: "Carte terrain", href: "/fr/field-map" },
      { label: "Documents, preuves & gouvernance", href: "/fr/idjor" },
    ],
  },
  {
    title: "Risque & contrat",
    items: [
      { label: "Score risque", href: "/fr/rax" },
      { label: "Tarification", href: "/fr/pricing" },
      { label: "Polices et sinistres", href: "/fr/policies" },
    ],
  },
  {
    title: "Support & controle",
    items: [
      { label: "Support", href: "/fr/support" },
      { label: "Securite & confidentialite", href: "/fr/privacy" },
      { label: "Verification blockchain", href: "/fr/blockchain" },
    ],
  },
] as const;

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Documentation"
        description="Repere de parcours et de pages utilitaires pour le dashboard institutionnel Wakama."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {DOCS_SECTIONS.map((section) => (
          <AppCard key={section.title} className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-wk-primarySoft text-wk-primaryInk">
                <BookOpenText className="h-5 w-5" />
              </span>
              <h2 className="font-display text-[18px] font-extrabold tracking-[-0.02em] text-wk-text">
                {section.title}
              </h2>
            </div>

            <div className="space-y-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-[14px] border border-wk-border bg-wk-surface2 px-4 py-3 text-[13px] font-semibold text-wk-text transition-colors hover:bg-wk-surface3"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-wk-primaryInk" />
                </Link>
              ))}
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
