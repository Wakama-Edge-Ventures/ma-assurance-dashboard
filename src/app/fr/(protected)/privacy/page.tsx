import { LockKeyhole, ShieldCheck, ShieldEllipsis, WalletCards } from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { PageTitle } from "@/components/ui/page-title";

const SECTIONS = [
  {
    title: "Gouvernance",
    icon: ShieldCheck,
    content:
      "Wakama prepare un cadre preparatoire de gouvernance, de tracabilite et de revue documentaire. Aucune decision metier, d'octroi ou d'indemnisation n'est prise automatiquement par la plateforme.",
  },
  {
    title: "Confidentialite",
    icon: LockKeyhole,
    content:
      "Les donnees affichees dans le dashboard sont segmentees par tenant, relues sous garde-fou de session et exposees selon le besoin de connaitre. Les references demo restent signalees comme exemples lorsqu'elles ne sont pas issues du backend operationnel.",
  },
  {
    title: "Audit & tracabilite",
    icon: WalletCards,
    content:
      "Les preuves d'integrite, les historiques d'action et les journaux de traitement servent la verification interne et la preparation d'audit. Les formulations restent prudentes et ne pretendent pas a une certification non documentee dans le depot.",
  },
  {
    title: "Protection des donnees",
    icon: ShieldEllipsis,
    content:
      "Cette page decrit un cadre de protection, de gouvernance et de traçabilite. Toute mention de dispositifs ou d'objectifs de securite doit etre comprise comme preparatoire ou operationnelle selon les preuves documentaires disponibles.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageTitle
        title="Securite & confidentialite"
        description="Cadre preparatoire de gouvernance, de confidentialite et de protection des donnees pour les parcours institutionnels Wakama."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <AppCard key={section.title} className="space-y-4 p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-wk-primarySoft text-wk-primaryInk">
                <Icon className="h-5 w-5" />
              </span>
              <div className="space-y-2">
                <h2 className="font-display text-[18px] font-extrabold tracking-[-0.02em] text-wk-text">
                  {section.title}
                </h2>
                <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
                  {section.content}
                </p>
              </div>
            </AppCard>
          );
        })}
      </div>

      <DisclosureNote />
    </div>
  );
}
