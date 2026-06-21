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
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[28px] border p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)] md:p-8"
        style={{
          borderColor: withAlpha(tenant.colors.primary, "2E"),
          background: `radial-gradient(520px 260px at 0% 0%, ${withAlpha(tenant.colors.primary, "24")}, transparent 62%), radial-gradient(520px 260px at 100% 100%, ${withAlpha(tenant.colors.accent, "24")}, transparent 60%), linear-gradient(135deg, rgba(16,23,38,0.96), rgba(11,16,30,0.94))`,
        }}
      >
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <TenantBadge />
              <Badge variant="muted">Maquette d&apos;illustration</Badge>
              <DataSourceBadge source="SEED_DEMO" />
            </div>

            <div className="flex items-center gap-4">
              <TenantLogo
                alt={tenant.displayName}
                className="h-12 w-auto object-contain md:h-14"
                width={220}
                height={88}
                priority
              />
              <div className="space-y-1">
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: tenant.colors.primary }}
                >
                  {tenant.shortName} · {tenant.vertical}
                </p>
                <h1 className="font-display text-[30px] font-semibold leading-[1.02] tracking-[-0.02em] text-white md:text-[38px]">
                  {config.title}
                </h1>
              </div>
            </div>

            <p className="max-w-3xl text-[15px] leading-[1.55] text-slate-300">{config.subtitle}</p>
            <p
              className="max-w-3xl rounded-[18px] border px-4 py-3 text-[12.5px] leading-[1.55] text-slate-300"
              style={{
                borderColor: withAlpha(tenant.colors.primary, "36"),
                backgroundColor: withAlpha(tenant.colors.primary, "12"),
              }}
            >
              {config.disclaimer}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={config.actionPrimary.href}
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: tenant.colors.primary }}
              >
                {config.actionPrimary.label}
              </Link>
              <Link
                href={config.actionSecondary.href}
                className="inline-flex items-center rounded-full border px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/5"
                style={{ borderColor: withAlpha(tenant.colors.primary, "45") }}
              >
                {config.actionSecondary.label}
              </Link>
            </div>
          </div>

          <div
            className="rounded-[24px] border p-5"
            style={{
              borderColor: withAlpha(tenant.colors.primary, "22"),
              backgroundColor: "rgba(7,11,23,0.54)",
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Positionnement
            </p>
            <p className="mt-3 text-[18px] font-semibold text-white">{config.spotlight}</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-[16px] border border-slate-400/10 bg-white/[0.03] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                  Donnees affichees
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Indicateurs de demonstration, clairement separes du backend operationnel.
                </p>
              </div>
              <div className="rounded-[16px] border border-slate-400/10 bg-white/[0.03] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                  Gouvernance
                </p>
                <p className="mt-1 text-sm text-slate-300">{tenant.terminology.decisionDisclaimer}</p>
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
    </div>
  );
}
