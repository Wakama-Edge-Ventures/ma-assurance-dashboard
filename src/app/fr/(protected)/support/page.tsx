import Link from "next/link";
import {
  BookOpenText,
  Bug,
  ExternalLink,
  LifeBuoy,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { PageTitle } from "@/components/ui/page-title";

const SUPPORT_CARDS = [
  {
    title: "Reporter un bug",
    description: "Signalez un incident produit, un blocage ou une anomalie de parcours a l'equipe Wakama.",
    href: "/fr/bug",
    icon: Bug,
    tone: "bg-wk-coralSoft text-wk-coralInk",
  },
  {
    title: "Hotline operationnelle",
    description: "Escaladez une urgence de demonstration, une interruption ou une question critique de supervision.",
    href: "/fr/hotline",
    icon: LifeBuoy,
    tone: "bg-wk-violetSoft text-wk-violetInk",
  },
  {
    title: "Documentation",
    description: "Retrouvez les reperes de parcours, les sources documentaires et les pages de gouvernance associees.",
    href: "/fr/docs",
    icon: BookOpenText,
    tone: "bg-wk-primarySoft text-wk-primaryInk",
  },
  {
    title: "Verification blockchain",
    description: "Controlez l'integrite d'un hash de preuve ou d'un lot d'audit sans presenter cela comme une decision metier.",
    href: "/fr/blockchain",
    icon: ShieldCheck,
    tone: "bg-wk-tealSoft text-wk-tealInk",
  },
  {
    title: "Securite & confidentialite",
    description: "Consultez le cadre de protection des donnees, les garde-fous et les engagements de tracabilite.",
    href: "/fr/privacy",
    icon: LockKeyhole,
    tone: "bg-wk-amberSoft text-wk-amberInk",
  },
] as const;

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Support"
        description="Hub de support, d'assistance et de documentation pour les parcours institutionnels Wakama."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SUPPORT_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.href} href={card.href} className="block">
              <AppCard className="flex h-full flex-col justify-between gap-4 p-5">
                <div className="space-y-3">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1.5">
                    <h2 className="font-display text-[18px] font-extrabold tracking-[-0.02em] text-wk-text">
                      {card.title}
                    </h2>
                    <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
                      {card.description}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-wk-primaryInk">
                  Ouvrir
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </AppCard>
            </Link>
          );
        })}
      </div>

      <DisclosureNote />
    </div>
  );
}
