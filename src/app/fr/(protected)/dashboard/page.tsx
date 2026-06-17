import { cookies, headers } from "next/headers";
import { type ReactNode } from "react";
import { type LucideIcon, AlertTriangle, Bell, Cpu, FileText, MapPin, Shield, Users } from "lucide-react";

import { DashboardDemoSection } from "@/components/demo/dashboard-demo-section";
import { LiveHealthPanel } from "@/components/insurance/live-health-panel";
import { WakamaAlertSeverityBadge } from "@/components/shared/wakama-alert-severity-badge";
import { TenantDashboardLanding } from "@/components/tenant/TenantDashboardLanding";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
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

function alertDotClass(severity?: string) {
  const s = severity?.toUpperCase();
  if (s === "CRITICAL") return "bg-red-400/12 text-red-400 shadow-[0_0_16px_rgba(251,113,133,0.18)]";
  if (s === "WARNING") return "bg-amber-400/10 text-amber-400";
  return "bg-cyan-400/10 text-cyan-400";
}

interface KpiCardProps {
  value: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  iconVariant?: "cyan" | "emerald" | "violet";
  numVariant?: "cyan" | "emerald" | "violet";
  badge?: ReactNode;
  size?: "default" | "sm";
}

function KpiCard({ value, label, hint, icon: Icon, iconVariant = "cyan", numVariant = "cyan", badge, size = "default" }: KpiCardProps) {
  const iconBg = {
    cyan: "bg-cyan-400/10 border-cyan-400/14 text-cyan-400",
    emerald: "bg-emerald-400/10 border-emerald-400/22 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/24 text-violet-400",
  }[iconVariant];

  const numGrad = {
    cyan: "from-cyan-400 to-emerald-400",
    emerald: "from-emerald-400 to-cyan-400",
    violet: "from-violet-400 to-cyan-400",
  }[numVariant];

  const sm = size === "sm";

  return (
    <div className={cn("group relative overflow-hidden rounded-[20px] bg-[#101726]/92 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(34,211,238,0.3)]", sm ? "p-3.5" : "p-[18px_20px_20px]")}>
      {/* top-right glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(160px_90px_at_88%_-10%,rgba(34,211,238,0.12),transparent_70%)] opacity-90" />

      <div className={cn("relative flex items-center justify-between", sm ? "mb-2.5" : "mb-3.5")}>
        <span className={cn("grid place-items-center rounded-[10px] border", iconBg, sm ? "h-7 w-7" : "h-[34px] w-[34px]")}>
          <Icon className={sm ? "h-3.5 w-3.5" : "h-[17px] w-[17px]"} />
        </span>
        {badge}
      </div>

      <div
        className={cn("bg-gradient-to-br font-mono font-semibold leading-none tracking-[-0.02em] tabular-nums bg-clip-text text-transparent", numGrad, sm ? "text-[28px]" : "text-[40px]")}
        style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.25))" }}
      >
        {value}
      </div>

      <div className={cn("font-medium text-white", sm ? "mt-2 text-[12px]" : "mt-3 text-[13px]")}>{label}</div>
      {hint && <div className="mt-0.5 font-mono text-[11.5px] text-[#5B6B86]">{hint}</div>}
    </div>
  );
}

function SectionHeader({ label, badge, children }: { label: string; badge?: ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center gap-3">
      <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      {badge}
      <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/14 to-transparent" />
      {children}
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

  const [applications, policies, claims, raxEvaluations, sharedOverview] = await Promise.all([
    getInsuranceApplications(),
    getInsurancePolicies(),
    getInsuranceClaims(),
    getRaxEvaluations(),
    getSharedWakamaDataOverview(),
  ]);

  const sharedMode = sharedOverview.liveCount > 0 ? "LIVE" : "SEED_DEMO";
  const insuranceMode = "SEED_DEMO";
  const activeWakamaAlerts = sharedOverview.criticalAlertsCount + sharedOverview.warningAlertsCount;
  const avgWrs =
    raxEvaluations.reduce((sum, item) => sum + item.wrsScore, 0) /
    Math.max(raxEvaluations.length, 1);
  const streamAlerts = sharedOverview.recentAlerts.slice(0, 8);
  const wrsPercent = Math.min(100, Math.max(0, avgWrs));

  return (
    <div className="space-y-6">
      <LiveHealthPanel />

      {/* ── Hero ── */}
      {/* gradient border wrapper */}
      <div
        className="rounded-[26px] p-[1px]"
        style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.28) 0%, rgba(34,211,238,0.08) 35%, rgba(139,92,246,0.10) 70%, rgba(11,16,30,0.15) 100%)" }}
      >
      <section
        className={cn(
          "relative grid gap-[30px] overflow-hidden rounded-[25px] p-8 md:grid-cols-[1fr_312px] md:p-[34px_36px]",
          "shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(248,250,252,0.04)]",
        )}
        style={{
          background:
            "radial-gradient(560px 320px at 8% 0%, rgba(34,211,238,0.18), transparent 62%), radial-gradient(620px 420px at 100% 120%, rgba(139,92,246,0.20), transparent 60%), linear-gradient(135deg, rgba(16,23,38,0.96), rgba(11,16,30,0.92))",
        }}
      >
        {/* emerald top-right accent */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_200px_at_92%_-10%,rgba(52,211,153,0.16),transparent_70%)]" />

        {/* Left: copy */}
        <div className="relative flex flex-col gap-4">
          {/* Pill */}
          <span className="inline-flex w-fit items-center gap-2 self-start rounded-full border border-cyan-400/14 bg-[#080c17]/60 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-white shadow-[0_0_24px_rgba(34,211,238,0.10)]">
            <span className="oracle-live-dot h-2 w-2 flex-none rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />
            Wakama Assurance · Risk Oracle
          </span>

          {/* h1 */}
          <h1 className="max-w-[16ch] font-display text-[32px] font-semibold leading-[1.04] tracking-[-0.02em] text-white md:text-[38px]">
            Live{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text font-bold text-transparent">
              agricultural risk
            </span>{" "}
            intelligence
          </h1>

          <p className="max-w-[52ch] text-[15px] leading-[1.5] text-slate-400">
            Scoring, preuve terrain et monitoring agricole continu, structurés pour les assureurs et leurs coopératives partenaires.
          </p>

          <p className="max-w-[56ch] border-l-2 border-emerald-400/22 pl-3 text-[12.5px] leading-[1.5] text-[#5B6B86]">
            Wakama structure et documente le risque ; la décision finale d&apos;indemnisation reste réservée à l&apos;assureur.
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-700/60 bg-[#0a0f1c]/80 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
              Conçu pour le cadre ACAPS / CNDP
            </span>
            <DataSourceBadge source={sharedMode} />
            <DataSourceBadge source={insuranceMode} />
          </div>
        </div>

        {/* Right: telemetry panel */}
        <div className="self-center rounded-[20px] border border-slate-400/10 bg-[#070b17]/55 p-[18px] backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#5B6B86]">
            <span>Telemetry</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/28 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-400">
              <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              live
            </span>
          </div>

          {[
            {
              label: "Shared data",
              value: sharedMode as string,
              cls: sharedMode === "LIVE" ? "text-emerald-400" : "text-amber-400",
              isNum: false,
            },
            {
              label: "Insurance workflows",
              value: insuranceMode as string,
              cls: "text-amber-400",
              isNum: false,
            },
            {
              label: "Farmers",
              value: String(sharedOverview.farmersCount),
              cls: "",
              isNum: true,
            },
            {
              label: "Alerts",
              value: String(sharedOverview.wakamaAlertsCount),
              cls: "",
              isNum: true,
            },
          ].map(({ label, value, cls, isNum }) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-slate-400/10 py-[11px] last:border-0"
            >
              <span className="text-[13px] text-slate-400">{label}</span>
              <span
                className={cn(
                  "font-mono text-[15px] font-semibold tabular-nums",
                  isNum ? "bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent" : cls,
                )}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* ── Shared Wakama data KPIs ── */}
      <div>
        <SectionHeader
          label="Shared Wakama data"
          badge={
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/28 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-400">
              <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              live
            </span>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            size="sm"
            value={String(sharedOverview.farmersCount)}
            label="Agriculteurs"
            hint={`LIVE ${sharedOverview.farmersLiveCount} · SEED_DEMO ${sharedOverview.farmersSeedDemoCount}`}
            icon={Users}
            iconVariant="cyan"
          />
          <KpiCard
            size="sm"
            value={String(sharedOverview.cooperativesCount)}
            label="Coopératives"
            hint={`LIVE ${sharedOverview.cooperativesLiveCount} · SEED_DEMO ${sharedOverview.cooperativesSeedDemoCount}`}
            icon={Users}
            iconVariant="emerald"
            numVariant="emerald"
          />
          <KpiCard
            size="sm"
            value={String(sharedOverview.parcellesCount)}
            label="Parcelles"
            hint={`LIVE ${sharedOverview.parcellesLiveCount} · SEED_DEMO ${sharedOverview.parcellesSeedDemoCount}`}
            icon={MapPin}
            iconVariant="cyan"
          />
          <KpiCard
            size="sm"
            value={String(sharedOverview.wakamaAlertsCount)}
            label="Alertes Wakama"
            hint={`Actives ${activeWakamaAlerts} · Critiques ${sharedOverview.criticalAlertsCount}`}
            icon={Bell}
            iconVariant="violet"
            numVariant="violet"
          />
        </div>
      </div>

      {/* ── Insurance workflow KPIs ── */}
      <div>
        <SectionHeader
          label="Insurance workflow"
          badge={
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/26 bg-amber-400/9 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-400">
              seed_demo
            </span>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            value={String(applications.length)}
            label="Demandes"
            hint="Pipeline technique assurance"
            icon={FileText}
            iconVariant="cyan"
          />
          <KpiCard
            value={String(policies.length)}
            label="Polices"
            hint="Polices communiquées par l'assureur"
            icon={Shield}
            iconVariant="emerald"
            numVariant="emerald"
          />
          <KpiCard
            value={String(claims.length)}
            label="Sinistres"
            hint="Suivi sinistre non décisionnel"
            icon={AlertTriangle}
            iconVariant="cyan"
          />
          <KpiCard
            value={avgWrs.toFixed(1)}
            label="WRS moyen"
            hint="Framework RAX/WRS v1"
            icon={Cpu}
            iconVariant="violet"
            numVariant="violet"
          />
        </div>
      </div>

      {/* ── Alert stream + RAX panel ── */}
      <div className="grid gap-[22px] xl:grid-cols-[1fr_372px]">

        {/* Alert stream */}
        <div className="overflow-hidden rounded-[20px] border border-slate-400/10 bg-[#101726]/92">
          <div className="flex items-center gap-3 border-b border-slate-400/10 px-[22px] py-[18px]">
            <span className="font-display text-[15px] font-semibold text-white">
              Live Wakama alert stream
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/28 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-400">
              <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              live
            </span>
            <div className="ml-auto">
              <Badge variant="muted">NDVI · METEO · IOT</Badge>
            </div>
          </div>

          <div>
            {streamAlerts.length === 0 ? (
              <p className="px-[22px] py-4 text-[13px] text-slate-500">
                Aucune alerte contextuelle disponible.
              </p>
            ) : (
              streamAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="grid grid-cols-[30px_1fr_auto] items-start gap-3.5 border-b border-slate-400/10 px-[22px] py-4 transition-colors last:border-0 hover:bg-slate-400/[0.03]"
                >
                  {/* Severity dot */}
                  <div
                    className={cn(
                      "mt-0.5 grid h-[30px] w-[30px] place-items-center rounded-[9px]",
                      alertDotClass(alert.severity),
                    )}
                  >
                    <AlertTriangle className="h-[15px] w-[15px]" />
                  </div>

                  {/* Main content */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-white">
                      <span className="truncate">{alert.title ?? alert.message}</span>
                      {alert.type && <Badge variant="muted">{alert.type}</Badge>}
                    </div>
                    {alert.title && (
                      <p className="mt-1 text-[12.5px] leading-[1.45] text-slate-400 line-clamp-2">
                        {alert.message}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {[
                        alert.farmerName ?? alert.farmerId,
                        alert.cooperativeName ?? alert.cooperativeId,
                        alert.parcelleName ?? alert.parcelleId,
                      ]
                        .filter(Boolean)
                        .map((v, i) => (
                          <span
                            key={i}
                            className="font-mono text-[11px] text-[#5B6B86]"
                          >
                            {v}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Right: badges + date */}
                  <div className="flex flex-col items-end gap-1.5 text-right">
                    <WakamaAlertSeverityBadge severity={alert.severity} />
                    <DataSourceBadge source={alert.source} />
                    <span className="font-mono text-[11px] tabular-nums text-[#5B6B86]">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-400/10 bg-[#070b17]/40 px-[22px] py-3.5">
            <span className="font-mono text-[11.5px] text-slate-400">
              {sharedOverview.wakamaAlertsCount} signaux disponibles · {streamAlerts.length} affichés
            </span>
          </div>
        </div>

        {/* RAX / WRS panel */}
        <div className="self-start overflow-hidden rounded-[20px] border border-slate-400/10 bg-[#101726]/92">
          <div className="flex items-center gap-3 border-b border-slate-400/10 px-[22px] py-[18px]">
            <span className="font-display text-[15px] font-semibold text-white">
              RAX / WRS synthesis
            </span>
            <Badge variant="muted">rax</Badge>
          </div>

          <div className="flex flex-col gap-5 p-[22px]">
            {/* Ring gauge */}
            <div className="flex items-center gap-5">
              <div
                className="relative grid h-[116px] w-[116px] flex-none place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#22D3EE 0%, #34D399 ${wrsPercent}%, rgba(148,163,184,0.12) ${wrsPercent}% 100%)`,
                }}
              >
                <div className="absolute inset-[9px] rounded-full bg-[#101726] shadow-[inset_0_0_18px_rgba(0,0,0,0.5)]" />
                <div className="relative text-center">
                  <div
                    className="bg-gradient-to-br from-cyan-400 to-emerald-400 bg-clip-text font-mono text-[30px] font-semibold leading-none text-transparent"
                    style={{ filter: "drop-shadow(0 0 14px rgba(34,211,238,0.3))" }}
                  >
                    {avgWrs.toFixed(1)}
                  </div>
                  <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#5B6B86]">
                    WRS moy.
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5B6B86]">
                  Niveau de risque
                </span>
                <Badge variant="warning">Risque moyen</Badge>
                <span className="font-display text-[17px] font-semibold text-white">
                  Portefeuille stable
                </span>
              </div>
            </div>

            {/* RAX evaluation rows */}
            <div className="overflow-hidden rounded-[14px] border border-slate-400/10">
              {raxEvaluations.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-slate-400/10 bg-[#070b17]/40 px-3.5 py-3 last:border-0"
                >
                  <div>
                    <p className="font-mono text-[11px] text-[#5B6B86]">{item.id}</p>
                    <p className="mt-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text font-mono text-[13px] font-semibold text-transparent">
                      WRS {item.wrsScore.toFixed(1)}
                    </p>
                  </div>
                  <RiskTierBadge tier={item.riskTier} />
                </div>
              ))}
            </div>

            {/* Data quality bar */}
            {raxEvaluations.length > 0 && (
              <div>
                <div className="mb-1.5 flex justify-between font-mono text-[11px] text-[#5B6B86]">
                  <span>Qualité de la donnée</span>
                  <span>91%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-400/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: "91%" }}
                  />
                </div>
              </div>
            )}

            {/* Disclaimer note */}
            <div className="rounded-[14px] border border-cyan-400/14 bg-cyan-400/5 p-3.5 text-[12px] leading-[1.5] text-slate-400">
              <span className="font-semibold text-cyan-400">Recommandation non décisionnelle</span>{" "}
              — à calibrer avec la sinistralité observée par l&apos;assureur. Wakama documente et score ; l&apos;arbitrage final reste assureur.
            </div>
          </div>
        </div>

      </div>

      {/* Demo section */}
      <DashboardDemoSection />

    </div>
  );
}
