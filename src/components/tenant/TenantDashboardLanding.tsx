"use client";

import Link from "next/link";
import { Activity, Bell, FileText, Globe, Landmark, Leaf, LineChart, MapPinned, ShieldCheck, Sprout, Users } from "lucide-react";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { TenantKpiCard } from "@/components/tenant/TenantKpiCard";
import { TenantLogo } from "@/components/tenant/TenantLogo";
import { useTenant } from "@/components/tenant/useTenant";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { withAlpha } from "@/lib/tenant";

interface LandingCard {
  icon: typeof FileText;
  label: string;
  value: string;
  hint: string;
}

interface LandingConfig {
  title: string;
  subtitle: string;
  disclaimer: string;
  spotlight: string;
  actionPrimary: { href: string; label: string };
  actionSecondary: { href: string; label: string };
  cards: LandingCard[];
}

const LANDING_CONFIGS: Record<string, LandingConfig> = {
  "bni-ci": {
    title: "Portefeuille credit agricole",
    subtitle: "Vue institutionnelle des dossiers agricoles, risques et preuves terrain",
    disclaimer:
      "Maquette d'illustration. Les decisions de credit restent sous controle de l'institution.",
    spotlight: "Pilotage banque, lecture du risque portefeuille et preuves terrain consolidees.",
    actionPrimary: { href: "/fr/applications", label: "Voir les dossiers agricoles" },
    actionSecondary: { href: "/fr/monitoring", label: "Ouvrir le monitoring terrain" },
    cards: [
      { icon: FileText, label: "Dossiers agricoles", value: "128", hint: "Pipeline illustre - instruction en cours" },
      { icon: Landmark, label: "Portefeuille suivi", value: "4.8M XOF", hint: "Encours suivi a titre demonstratif" },
      { icon: LineChart, label: "Score Wakama moyen", value: "72/100", hint: "Lecture technique non decisionnelle" },
      { icon: ShieldCheck, label: "Risque portefeuille", value: "Modere", hint: "Concentration contenue sur l'illustration" },
      { icon: MapPinned, label: "Parcelles monitorees", value: "312", hint: "Surfaces suivies dans le parcours demo" },
      { icon: Bell, label: "Alertes terrain", value: "9", hint: "Alertes agronomiques a examiner" },
    ],
  },
  "bad-program": {
    title: "Programme agricole & impact",
    subtitle: "Suivi multi-acteurs des beneficiaires, risques agricoles et preuves de terrain",
    disclaimer:
      "Maquette d'illustration. Le programme et ses partenaires restent seuls decisionnaires.",
    spotlight: "Lecture portefeuille, impact terrain et suivi documentaire pour un programme multi-acteurs.",
    actionPrimary: { href: "/fr/farmers", label: "Voir les beneficiaires suivis" },
    actionSecondary: { href: "/fr/reports", label: "Consulter les indicateurs" },
    cards: [
      { icon: Users, label: "Beneficiaires suivis", value: "840", hint: "Base illustrative multi-acteurs" },
      { icon: FileText, label: "Dossiers programme", value: "126", hint: "Instruction et suivi de dossiers demo" },
      { icon: Leaf, label: "Surface monitoree", value: "1 840 ha", hint: "Surface consolidee a titre d'illustration" },
      { icon: Globe, label: "Risque climatique", value: "Maitrise", hint: "Lecture portefeuille a affiner par partenaire" },
      { icon: Activity, label: "Preuves terrain", value: "96", hint: "Lots documentaires et constats de terrain" },
      { icon: Sprout, label: "Indicateurs impact", value: "14", hint: "Indicateurs demo de pilotage programme" },
    ],
  },
  wakama: {
    title: "Infrastructure de confiance agricole",
    subtitle: "Scoring, monitoring, preuves terrain et pilotage institutionnel",
    disclaimer:
      "Maquette d'illustration. Wakama structure les signaux et les preuves, sans se substituer aux institutions.",
    spotlight: "Vue neutre d'orchestration pour les institutions, les dossiers agricoles et les preuves terrain.",
    actionPrimary: { href: "/fr/dashboard", label: "Rester sur la vue infrastructure" },
    actionSecondary: { href: "/fr/alerts", label: "Explorer les alertes" },
    cards: [
      { icon: FileText, label: "Dossiers agricoles", value: "214", hint: "Corpus demonstratif multi-institutions" },
      { icon: MapPinned, label: "Parcelles monitorees", value: "538", hint: "Monitoring continu sur maquette" },
      { icon: Bell, label: "Alertes", value: "17", hint: "Signaux NDVI, meteo et terrain" },
      { icon: LineChart, label: "Score moyen", value: "74/100", hint: "Lecture technique transverse" },
      { icon: Landmark, label: "Institutions", value: "4", hint: "Espaces demo institutionnels" },
      { icon: Activity, label: "Preuves", value: "132", hint: "Pieces et constats structures" },
    ],
  },
};

export function TenantDashboardLanding() {
  const { tenant } = useTenant();
  const config = LANDING_CONFIGS[tenant.id];

  if (!config) {
    return null;
  }

  return (
    <div className="max-w-[1280px] space-y-6">
      <section className="relative overflow-hidden rounded-[20px] border border-wk-border bg-wk-surface p-7 shadow-wk-sm md:p-8">
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <TenantBadge />
              <Badge variant="muted">Maquette d&apos;illustration</Badge>
              <DataSourceBadge source="SEED_DEMO" />
            </div>

            <div className="flex items-center gap-4">
              <TenantLogo
                alt={tenant.displayName}
                className="h-11 w-auto object-contain md:h-12"
                width={220}
                height={88}
                priority
              />
              <div className="space-y-1">
                <p className="text-[12px] font-bold" style={{ color: tenant.colors.primary }}>
                  {tenant.shortName} · {tenant.vertical}
                </p>
                <h1 className="text-[27px] font-extrabold leading-[1.1] tracking-[-0.5px] text-wk-text md:text-[30px]">
                  {config.title}
                </h1>
              </div>
            </div>

            <p className="max-w-3xl text-[14.5px] font-medium leading-relaxed text-wk-muted">{config.subtitle}</p>
            <p
              className="max-w-3xl rounded-[14px] px-4 py-3 text-[12.5px] font-semibold leading-relaxed"
              style={{
                backgroundColor: withAlpha(tenant.colors.primary, "12"),
                color: tenant.colors.primary,
              }}
            >
              {config.disclaimer}
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={config.actionPrimary.href}
                className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: tenant.colors.primary }}
              >
                {config.actionPrimary.label}
              </Link>
              <Link
                href={config.actionSecondary.href}
                className="inline-flex items-center rounded-xl border border-wk-border2 bg-wk-surface px-4 py-2 text-sm font-bold text-wk-text transition-colors hover:bg-wk-surface2"
              >
                {config.actionSecondary.label}
              </Link>
            </div>
          </div>

          <div className="rounded-[16px] border border-wk-border bg-wk-surface2 p-5">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-wk-faint">Positionnement</p>
            <p className="mt-3 text-[16px] font-bold text-wk-text">{config.spotlight}</p>
            <div className="mt-4 space-y-2.5">
              <div className="rounded-[13px] bg-wk-surface px-4 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-wk-faint">
                  Données affichées
                </p>
                <p className="mt-1 text-[13px] font-medium text-wk-muted">
                  Indicateurs de démonstration, clairement séparés du backend opérationnel.
                </p>
              </div>
              <div className="rounded-[13px] bg-wk-surface px-4 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-wk-faint">
                  Gouvernance
                </p>
                <p className="mt-1 text-[13px] font-medium text-wk-muted">{tenant.terminology.decisionDisclaimer}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {config.cards.map((card) => (
          <TenantKpiCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            hint={card.hint}
          />
        ))}
      </section>

      <div className="flex items-center gap-3.5 rounded-[16px] bg-wk-violetSoft px-[18px] py-[15px]">
        <p className="text-[13px] font-semibold leading-relaxed text-wk-violetInk">
          Wakama structure et documente le risque. <b>La décision finale reste réservée à l&apos;institution.</b>
        </p>
      </div>
    </div>
  );
}
