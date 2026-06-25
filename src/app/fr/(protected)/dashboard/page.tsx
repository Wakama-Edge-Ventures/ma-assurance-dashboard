import { cookies, headers } from "next/headers";
import Link from "next/link";
import { type ReactNode } from "react";
import {
  type LucideIcon,
  AlertTriangle,
  Bell,
  ChevronRight,
  FileText,
  Gavel,
  ListChecks,
  MapPin,
  Scale,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { DashboardDemoSection } from "@/components/demo/dashboard-demo-section";
import { LiveHealthPanel } from "@/components/insurance/live-health-panel";
import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { TenantDashboardLanding } from "@/components/tenant/TenantDashboardLanding";
import { AppCard } from "@/components/ui/app-card";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import { TENANTS } from "@/config/tenants";
import type { DataSource } from "@/types";
import {
  getInsuranceApplications,
  getInsuranceClaims,
  getInsurancePolicies,
  getRaxEvaluations,
  getSharedWakamaDataOverview,
} from "@/lib/insurance-service";
import { resolveTenantId, TENANT_COOKIE_NAME } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/workflow";

export const dynamic = "force-dynamic";

function modeOf(items: Array<{ source: DataSource }>): DataSource {
  return items.some((item) => item.source === "LIVE") ? "LIVE" : "SEED_DEMO";
}

interface KpiCardProps {
  value: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "teal" | "violet" | "amber";
  source?: DataSource;
  demo?: boolean;
}

function KpiCard({ value, label, hint, icon: Icon, tone = "primary", source, demo = false }: KpiCardProps) {
  const iconBg = {
    primary: "bg-wk-primarySoft text-wk-primaryInk",
    teal: "bg-wk-tealSoft text-wk-tealInk",
    violet: "bg-wk-violetSoft text-wk-violetInk",
    amber: "bg-wk-amberSoft text-wk-amberInk",
  }[tone];

  return (
    <div
      className={cn(
        "relative rounded-[16px] border bg-wk-surface p-[17px] shadow-wk-sm",
        demo ? "border-dashed border-wk-border2" : "border-wk-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("grid h-[34px] w-[34px] place-items-center rounded-[10px]", iconBg)}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {demo ? (
          <span className="rounded-md bg-wk-violetSoft px-[7px] py-[3px] text-[10px] font-extrabold uppercase tracking-[0.04em] text-wk-violetInk">
            Exemple
          </span>
        ) : source ? (
          <DataSourceBadge source={source} />
        ) : null}
      </div>
      <div className="mt-3 text-[27px] font-extrabold leading-none tracking-[-0.02em] text-wk-text">{value}</div>
      <div className="mt-1 text-[13px] font-semibold text-wk-muted">{label}</div>
      {hint && <div className="mt-0.5 text-[11.5px] font-medium text-wk-faint">{hint}</div>}
    </div>
  );
}

function SectionLabel({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="h-[7px] w-[7px] flex-none rounded-full bg-wk-primary" />
      <span className="text-[12px] font-extrabold uppercase tracking-[0.06em] text-wk-primaryInk">{children}</span>
      <div className="h-px flex-1 bg-wk-border" />
      {badge}
    </div>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const tenantId = resolveTenantId(
    headerStore.get("x-wakama-tenant") ?? cookieStore.get(TENANT_COOKIE_NAME)?.value,
  );

  if (tenantId !== "assurance-ma") {
    return <TenantDashboardLanding />;
  }

  const tenant = TENANTS["assurance-ma"];

  const [applications, policies, claims, raxEvaluations, sharedOverview] = await Promise.all([
    getInsuranceApplications(),
    getInsurancePolicies(),
    getInsuranceClaims(),
    getRaxEvaluations(),
    getSharedWakamaDataOverview(),
  ]);

  const sharedMode: DataSource = sharedOverview.liveCount > 0 ? "LIVE" : "SEED_DEMO";
  const applicationsMode = modeOf(applications);
  const policiesMode = modeOf(policies);
  const claimsMode = modeOf(claims);
  const raxMode = modeOf(raxEvaluations);
  const activeWakamaAlerts = sharedOverview.criticalAlertsCount + sharedOverview.warningAlertsCount;
  const avgWrs =
    raxEvaluations.reduce((sum, item) => sum + item.wrsScore, 0) / Math.max(raxEvaluations.length, 1);
  const streamAlerts = sharedOverview.recentAlerts.slice(0, 6);
  const wrsPercent = Math.min(100, Math.max(0, avgWrs));
  const wrsTone = avgWrs <= 40 ? "primary" : avgWrs <= 65 ? "amber" : "coral";
  const wrsLabel = avgWrs <= 40 ? "Risque faible" : avgWrs <= 65 ? "Risque modéré" : "Risque élevé";
  const wrsArcColor = wrsTone === "primary" ? "var(--wk-primary)" : wrsTone === "amber" ? "var(--wk-amber)" : "var(--wk-coral)";

  const nextActions = [
    {
      title: "Revoir les dossiers en attente",
      sub: `${applications.length} demande(s) au pipeline`,
      icon: FileText,
      tone: "primary" as const,
      href: "/fr/applications",
    },
    {
      title: "Examiner le score de risque moyen",
      sub: `Indice IRAX-D moyen ${avgWrs.toFixed(1)} / 100`,
      icon: Scale,
      tone: "violet" as const,
      href: "/fr/rax",
    },
    {
      title: "Suivre les alertes terrain actives",
      sub: `${activeWakamaAlerts} alerte(s) active(s)`,
      icon: Bell,
      tone: "amber" as const,
      href: "/fr/alerts",
    },
  ];

  return (
    <div className="max-w-[1280px] space-y-6">
      <LiveHealthPanel />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[20px] border border-wk-border bg-wk-surface p-7 shadow-wk-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-[58ch] space-y-3">
            <p className="text-[13px] font-bold text-wk-primaryInk">
              Vue institutionnelle du portefeuille agricole
            </p>
            <h1 className="text-[27px] font-extrabold leading-[1.1] tracking-[-0.5px] text-wk-text md:text-[30px]">
              Tableau de bord institutionnel
            </h1>
            <p className="text-[14.5px] font-medium leading-relaxed text-wk-muted">
              Vue d&apos;ensemble du portefeuille agricole, des dossiers et des alertes sous gouvernance Wakama.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-wk-surface2 px-3 py-1.5 text-[12px] font-bold text-wk-text">
                {tenant.displayName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-wk-surface2 px-3 py-1.5 text-[12px] font-semibold text-wk-muted">
                {[tenant.countryLabel || tenant.country, tenant.vertical].filter(Boolean).join(" · ")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-wk-liveSoft px-3 py-1.5 text-[12.5px] font-bold text-wk-liveInk">
                <span className="oracle-live-dot h-2 w-2 rounded-full bg-wk-live" />
                {sharedMode === "LIVE" ? "Données réelles · terrain" : "Exemple · terrain"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-wk-violetSoft px-3 py-1.5 text-[12.5px] font-bold text-wk-violetInk">
                <Sparkles className="h-[14px] w-[14px]" />
                Exemple · workflow assurance
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-wk-violetSoft px-3 py-1.5 text-[12.5px] font-bold text-wk-violetInk">
                <Gavel className="h-[14px] w-[14px]" />
                Décision institutionnelle
              </span>
            </div>
          </div>

          <div className="w-full max-w-[300px] flex-none rounded-[16px] border border-wk-border bg-wk-surface2 p-[18px]">
            <div className="mb-3 flex items-center justify-between text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-wk-faint">
              <span>Aperçu rapide</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-wk-liveSoft px-2 py-0.5 text-wk-liveInk">
                <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-wk-live" />
                live
              </span>
            </div>
            {[
              { label: "Agriculteurs", value: String(sharedOverview.farmersCount) },
              { label: "Alertes Wakama", value: String(sharedOverview.wakamaAlertsCount) },
              { label: "Demandes", value: String(applications.length) },
              { label: "Polices actives", value: String(policies.length) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between border-b border-wk-border py-[10px] last:border-0">
                <span className="text-[13px] font-medium text-wk-muted">{label}</span>
                <span className="text-[15px] font-extrabold tabular-nums text-wk-text">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shared Wakama data ── */}
      <div>
        <SectionLabel
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wk-liveSoft px-2.5 py-1 text-[10.5px] font-bold uppercase text-wk-liveInk">
              <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-wk-live" />
              terrain partagé
            </span>
          }
        >
          Données agricoles partagées
        </SectionLabel>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            value={String(sharedOverview.farmersCount)}
            label="Agriculteurs"
            hint={`Réel ${sharedOverview.farmersLiveCount} · Démo ${sharedOverview.farmersSeedDemoCount}`}
            icon={Users}
            tone="primary"
            source={sharedOverview.farmersLiveCount > 0 ? "LIVE" : "SEED_DEMO"}
          />
          <KpiCard
            value={String(sharedOverview.cooperativesCount)}
            label="Coopératives"
            hint={`Réel ${sharedOverview.cooperativesLiveCount} · Démo ${sharedOverview.cooperativesSeedDemoCount}`}
            icon={Users}
            tone="teal"
            source={sharedOverview.cooperativesLiveCount > 0 ? "LIVE" : "SEED_DEMO"}
          />
          <KpiCard
            value={String(sharedOverview.parcellesCount)}
            label="Parcelles"
            hint={`Réel ${sharedOverview.parcellesLiveCount} · Démo ${sharedOverview.parcellesSeedDemoCount}`}
            icon={MapPin}
            tone="primary"
            source={sharedOverview.parcellesLiveCount > 0 ? "LIVE" : "SEED_DEMO"}
          />
          <KpiCard
            value={String(sharedOverview.wakamaAlertsCount)}
            label="Alertes Wakama"
            hint={`Actives ${activeWakamaAlerts} · Critiques ${sharedOverview.criticalAlertsCount}`}
            icon={Bell}
            tone="amber"
            source={sharedOverview.wakamaAlertsCount > 0 && sharedMode === "LIVE" ? "LIVE" : "SEED_DEMO"}
          />
        </div>
      </div>

      {/* ── Insurance workflow ── */}
      <div>
        <SectionLabel
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wk-violetSoft px-2.5 py-1 text-[10.5px] font-bold uppercase text-wk-violetInk">
              <Sparkles className="h-3 w-3" />
              exemples de démonstration
            </span>
          }
        >
          Parcours assurance agricole
        </SectionLabel>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            value={String(applications.length)}
            label="Demandes"
            hint="Pipeline technique assurance"
            icon={FileText}
            tone="primary"
            demo={applicationsMode === "SEED_DEMO"}
            source={applicationsMode === "LIVE" ? "LIVE" : undefined}
          />
          <KpiCard
            value={String(policies.length)}
            label="Polices"
            hint="Couvertures communiquées par l'institution"
            icon={Shield}
            tone="teal"
            demo={policiesMode === "SEED_DEMO"}
            source={policiesMode === "LIVE" ? "LIVE" : undefined}
          />
          <KpiCard
            value={String(claims.length)}
            label="Sinistres"
            hint="Suivi sinistre non décisionnel"
            icon={AlertTriangle}
            tone="amber"
            demo={claimsMode === "SEED_DEMO"}
            source={claimsMode === "LIVE" ? "LIVE" : undefined}
          />
          <KpiCard
            value={avgWrs.toFixed(1)}
            label="Indice IRAX-D moyen"
            hint="Score risque informatif — aide à la lecture"
            icon={Scale}
            tone="violet"
            demo={raxMode === "SEED_DEMO"}
            source={raxMode === "LIVE" ? "LIVE" : undefined}
          />
        </div>
      </div>

      {/* ── Alerts + Risk synthesis ── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Alert stream */}
        <AppCard className="overflow-hidden !p-0">
          <div className="flex items-center gap-3 border-b border-wk-border px-5 py-4">
            <Bell className="h-[17px] w-[17px] text-wk-coral" />
            <span className="text-[15px] font-extrabold text-wk-text">Flux d&apos;alertes</span>
            <span className="ml-auto">
              <Badge variant="muted">NDVI · Météo · IoT</Badge>
            </span>
          </div>

          <div>
            {streamAlerts.length === 0 ? (
              <p className="px-5 py-5 text-[13px] font-medium text-wk-muted">
                Aucune alerte contextuelle disponible.
              </p>
            ) : (
              streamAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="grid grid-cols-[30px_1fr_auto] items-start gap-3 border-b border-wk-border px-5 py-3.5 last:border-0 hover:bg-wk-surface2"
                >
                  <div className="mt-0.5 grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-wk-coralSoft text-wk-coralInk">
                    <AlertTriangle className="h-[15px] w-[15px]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-bold text-wk-text">
                      <span className="truncate">{alert.title ?? alert.message}</span>
                      {alert.type && <Badge variant="muted">{alert.type}</Badge>}
                    </div>
                    {alert.title && (
                      <p className="mt-1 line-clamp-2 text-[12.5px] font-medium leading-[1.45] text-wk-muted">
                        {alert.message}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {[
                        alert.farmerName ?? alert.farmerId,
                        alert.cooperativeName ?? alert.cooperativeId,
                        alert.parcelleName ?? alert.parcelleId,
                      ]
                        .filter(Boolean)
                        .map((v, i) => (
                          <span key={i} className="font-mono text-[11px] text-wk-faint">
                            {v}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 text-right">
                    <WakamaAlertSeverityBadge severity={alert.severity} />
                    <DataSourceBadge source={alert.source} />
                    <span className="text-[11px] font-medium tabular-nums text-wk-faint">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between bg-wk-surface2 px-5 py-3">
            <span className="text-[11.5px] font-semibold text-wk-muted">
              {sharedOverview.wakamaAlertsCount} signaux disponibles · {streamAlerts.length} affichés
            </span>
          </div>
        </AppCard>

        <div className="flex flex-col gap-4">
          {/* IRAX-D synthesis */}
          <AppCard className="!p-5">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold text-wk-text">Synthèse risque contrat</span>
              <span className="rounded-md bg-wk-violetSoft px-[7px] py-[3px] text-[10px] font-extrabold uppercase text-wk-violetInk">
                Exemple
              </span>
            </div>
            <p className="mt-1 text-[12px] font-semibold text-wk-muted">Indice de risque contrat — calcul déterministe (IRAX-D)</p>

            <div className="my-4 flex items-center justify-center">
              <div className="relative h-[140px] w-[140px]">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${wrsArcColor} ${wrsPercent}%, var(--wk-surface-3) ${wrsPercent}% 100%)`,
                  }}
                />
                <div className="absolute inset-[12px] grid place-items-center rounded-full bg-wk-surface">
                  <div className="text-center">
                    <div className="text-[30px] font-extrabold leading-none tracking-[-0.02em] text-wk-text">
                      {avgWrs.toFixed(0)}
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-wk-faint">/ 100</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-bold"
                style={{
                  backgroundColor: wrsTone === "primary" ? "var(--wk-primary-soft)" : wrsTone === "amber" ? "var(--wk-amber-soft)" : "var(--wk-coral-soft)",
                  color: wrsTone === "primary" ? "var(--wk-primary-ink)" : wrsTone === "amber" ? "var(--wk-amber-ink)" : "var(--wk-coral-ink)",
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: wrsArcColor }} />
                Niveau de risque · {wrsLabel}
              </span>
            </div>

            {raxEvaluations.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-[12px] border border-wk-border">
                {raxEvaluations.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-wk-border bg-wk-surface2 px-3 py-2.5 last:border-0"
                  >
                    <div>
                      <p className="font-mono text-[11px] text-wk-faint">{item.id}</p>
                      <p className="mt-0.5 text-[13px] font-bold text-wk-text">Indice {item.wrsScore.toFixed(1)}</p>
                    </div>
                    <RiskTierBadge tier={item.riskTier} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-start gap-2.5 rounded-[13px] bg-wk-violetSoft p-3.5">
              <Gavel className="mt-[1px] h-4 w-4 flex-none text-wk-violetInk" />
              <p className="text-[12px] font-medium leading-relaxed text-wk-violetInk">
                <span className="font-bold">Aide à la lecture, pas une décision.</span> Wakama documente et
                structure le risque ; l&apos;arbitrage final reste réservé à l&apos;institution.
              </p>
            </div>
          </AppCard>

          {/* Next actions */}
          <AppCard className="!p-5">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="h-[17px] w-[17px] text-wk-primary" />
              <span className="text-[15px] font-extrabold text-wk-text">Prochaines actions</span>
            </div>
            <div className="flex flex-col gap-2">
              {nextActions.map((action) => {
                const iconBg = {
                  primary: "bg-wk-primarySoft text-wk-primaryInk",
                  violet: "bg-wk-violetSoft text-wk-violetInk",
                  amber: "bg-wk-amberSoft text-wk-amberInk",
                }[action.tone];
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-center gap-3 rounded-[12px] bg-wk-surface2 px-3 py-2.5 transition-colors hover:bg-wk-surface3"
                  >
                    <span className={cn("grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px]", iconBg)}>
                      <action.icon className="h-[17px] w-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-bold text-wk-text">{action.title}</span>
                      <span className="block text-[12px] font-medium text-wk-muted">{action.sub}</span>
                    </span>
                    <ChevronRight className="h-[17px] w-[17px] flex-none text-wk-faint" />
                  </Link>
                );
              })}
            </div>
          </AppCard>
        </div>
      </div>

      {/* ── Governance notice ── */}
      <div className="flex items-center gap-3.5 rounded-[16px] bg-wk-violetSoft px-[18px] py-[15px]">
        <Gavel className="h-5 w-5 flex-none text-wk-violetInk" />
        <p className="text-[13px] font-semibold leading-relaxed text-wk-violetInk">
          Wakama structure et documente le risque. <b>La décision finale reste réservée à l&apos;institution.</b>{" "}
          Idjor assiste, explique et alerte — il ne décide jamais.
        </p>
      </div>

      {/* Demo section */}
      <DashboardDemoSection />
    </div>
  );
}
