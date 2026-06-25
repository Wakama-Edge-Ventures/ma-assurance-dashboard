/**
 * analytics/page.tsx
 * Rich server-rendered analytics center for Wakama Assurance.
 * Computes portfolio analytics from all available data sources and renders
 * a comprehensive multi-section view: risk, regional, culture, alerts,
 * IRAX-D, missions, and claims intelligence.
 */

import {
  type LucideIcon,
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  ClipboardCheck,
  MapPin,
  Shield,
  TrendingDown,
  Users,
} from "lucide-react";

import { AppSection } from "@/components/ui/app-section";
import { AppTable, APP_TABLE_CLASSNAMES } from "@/components/ui/app-table";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import {
  buildAlertTypeStats,
  buildCultureStats,
  buildMissionStats,
  buildRegionStats,
  buildRiskTierDist,
} from "@/lib/analytics";
import {
  getFarmers,
  getInsuranceApplications,
  getInsuranceClaims,
  getInsuranceMissions,
  getInsurancePolicies,
  getParcelles,
  getRaxEvaluations,
  getSharedWakamaDataOverview,
  getWakamaAlerts,
} from "@/lib/insurance-service";
import { cn } from "@/lib/utils";
import {
  formatMAD,
  getClaimTypeLabel,
  getMissionStatusLabel,
  getRiskTierLabel,
} from "@/lib/workflow";
import { type RiskTier } from "@/types";

export const dynamic = "force-dynamic";

// ─── Local helper components ──────────────────────────────────────────────────

type AccentColor = "cyan" | "emerald" | "violet" | "amber" | "red";

const ACCENT_COLORS: Record<
  AccentColor,
  { bg: string; text: string; border: string }
> = {
  cyan: {
    bg: "bg-cyan-400/8",
    text: "text-cyan-400",
    border: "border-cyan-400/14",
  },
  emerald: {
    bg: "bg-emerald-400/8",
    text: "text-emerald-400",
    border: "border-emerald-400/14",
  },
  violet: {
    bg: "bg-violet-500/8",
    text: "text-violet-400",
    border: "border-violet-500/14",
  },
  amber: {
    bg: "bg-amber-400/8",
    text: "text-amber-400",
    border: "border-amber-400/14",
  },
  red: {
    bg: "bg-red-400/8",
    text: "text-red-400",
    border: "border-red-400/14",
  },
};

function StatPill({
  label,
  value,
  sub,
  icon: Icon,
  accent = "cyan",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: AccentColor;
}) {
  const colors = ACCENT_COLORS[accent];
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-[#101726]/92 p-3.5">
      <span
        className={cn(
          "grid h-9 w-9 flex-none place-items-center rounded-[10px] border",
          colors.bg,
          colors.border,
        )}
      >
        <Icon className={cn("h-4 w-4", colors.text)} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "font-mono text-[22px] font-semibold leading-none tabular-nums",
            colors.text,
          )}
        >
          {value}
        </div>
        <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.10em] text-slate-500">
          {label}
        </div>
        {sub && (
          <div className="font-mono text-[10px] text-slate-600">{sub}</div>
        )}
      </div>
    </div>
  );
}

function NdviBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  const color =
    value >= 0.6
      ? "bg-emerald-400"
      : value >= 0.4
        ? "bg-amber-400"
        : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700/50">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

// Inline horizontal fill bar used in alert type / severity breakdowns
function FillBar({
  pct,
  color = "bg-cyan-400",
}: {
  pct: number;
  color?: string;
}) {
  const width = Math.min(100, Math.max(0, pct));
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700/40">
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// Badge helpers used in AppSection
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/28 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-400">
      <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
      live
    </span>
  );
}

function SeedBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-400/26 bg-amber-400/9 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-400">
      seed_demo
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  // ── Fetch ──────────────────────────────────────────────────────────────────
  const [
    farmers,
    parcelles,
    wakamaAlerts,
    applications,
    policies,
    claims,
    missions,
    raxEvaluations,
    sharedOverview,
  ] = await Promise.all([
    getFarmers(),
    getParcelles(),
    getWakamaAlerts(),
    getInsuranceApplications(),
    getInsurancePolicies(),
    getInsuranceClaims(),
    getInsuranceMissions(),
    getRaxEvaluations(),
    getSharedWakamaDataOverview(),
  ]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const sharedMode: "LIVE" | "SEED_DEMO" =
    sharedOverview.liveCount > 0 ? "LIVE" : "SEED_DEMO";

  const criticalAlerts = wakamaAlerts.filter(
    (a) => a.severity === "CRITICAL",
  ).length;

  const avgWrs =
    raxEvaluations.reduce((s, e) => s + e.wrsScore, 0) /
    Math.max(raxEvaluations.length, 1);
  const wrsPercent = Math.min(100, Math.max(0, avgWrs));

  const tierDist = buildRiskTierDist(raxEvaluations);
  const regionStats = buildRegionStats(
    farmers,
    wakamaAlerts,
    raxEvaluations,
    applications,
  );
  const cultureStats = buildCultureStats(farmers, parcelles, wakamaAlerts);
  const alertTypeStats = buildAlertTypeStats(wakamaAlerts);
  const missionStats = buildMissionStats(missions);

  const activePolicies = policies.filter((p) => p.status === "ACTIVE").length;
  const totalCoverage = policies.reduce((s, p) => s + p.coverageMad, 0);
  const openClaims = claims.filter((c) =>
    ["OPEN", "DECLARED", "UNDER_REVIEW"].includes(c.status),
  ).length;
  const estimatedLoss = claims.reduce((s, c) => s + c.estimatedLossMad, 0);

  // Risk tier percentages for conic-gradient
  const totalEvals = raxEvaluations.length;
  const lowPct = totalEvals > 0 ? (tierDist.LOW_RISK / totalEvals) * 100 : 0;
  const medPct =
    totalEvals > 0 ? (tierDist.MEDIUM_RISK / totalEvals) * 100 : 0;
  const highPct =
    totalEvals > 0 ? (tierDist.HIGH_RISK / totalEvals) * 100 : 0;
  // UNINSURABLE takes remaining

  const totalAlerts = wakamaAlerts.length;
  const warnCount = wakamaAlerts.filter((a) => a.severity === "WARNING").length;
  const infoCount = wakamaAlerts.filter((a) => a.severity === "INFO").length;

  // Top 3 highest-risk evaluations
  const topRiskEvals = [...raxEvaluations]
    .sort((a, b) => b.wrsScore - a.wrsScore)
    .slice(0, 3);

  // Dominant risk tier
  const dominantTier = (
    Object.entries(tierDist) as [RiskTier, number][]
  ).sort((a, b) => b[1] - a[1])[0]?.[0] as RiskTier | undefined;

  // Claims grouped by type
  const claimsByType = new Map<string, number>();
  for (const claim of claims) {
    claimsByType.set(claim.claimType, (claimsByType.get(claim.claimType) ?? 0) + 1);
  }

  // Mission status order for display
  const missionStatusOrder = [
    "CONFIG_PENDING",
    "PLANNED",
    "SENT",
    "IN_PROGRESS",
    "AUDIT_COMPLETE",
    "REVIEW_COMPLETE",
    "DONE",
  ];

  return (
    <div className="space-y-8">
      {/* ── Page title ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] font-semibold text-white">
            Analytics
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Analyse du portefeuille agricole, distribution du risque et signaux
            opérationnels.
          </p>
        </div>
        <DataSourceBadge source={sharedMode} />
      </div>

      {/* ── Section A: KPI command header ──────────────────────────────────── */}
      <AppSection title="Indicateurs clés">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatPill
            label="Farmers analysés"
            value={String(farmers.length)}
            icon={Users}
            accent="cyan"
          />
          <StatPill
            label="Alertes actives"
            value={String(wakamaAlerts.length)}
            icon={Bell}
            accent="violet"
          />
          <StatPill
            label="Alertes critiques"
            value={String(criticalAlerts)}
            icon={AlertTriangle}
            accent={criticalAlerts > 0 ? "amber" : "cyan"}
          />
          <StatPill
            label="Indice IRAX-D moyen"
            value={avgWrs.toFixed(1)}
            icon={Activity}
            accent="emerald"
          />
          <StatPill
            label="Parcelles suivies"
            value={String(parcelles.length)}
            icon={MapPin}
            accent="cyan"
          />
          <StatPill
            label="Polices actives"
            value={String(activePolicies)}
            icon={Shield}
            accent="emerald"
          />
        </div>
      </AppSection>

      {/* ── Section B: Risk tier distribution ─────────────────────────────── */}
      <AppSection title="Distribution du risque (IRAX-D)" badge={<SeedBadge />}>
        <div className="flex flex-col gap-4 rounded-[20px] bg-[#101726]/92 p-5 sm:flex-row sm:items-center sm:gap-8">
          {/* Conic ring */}
          <div
            className="relative mx-auto grid h-[100px] w-[100px] flex-none place-items-center rounded-full sm:mx-0"
            style={{
              background: `conic-gradient(#22D3EE 0% ${lowPct}%, #34D399 ${lowPct}% ${lowPct + medPct}%, #F59E0B ${lowPct + medPct}% ${lowPct + medPct + highPct}%, #EF4444 ${lowPct + medPct + highPct}% 100%)`,
            }}
          >
            <div className="absolute inset-[8px] rounded-full bg-[#101726] shadow-[inset_0_0_18px_rgba(0,0,0,0.5)]" />
            <div className="relative text-center font-mono text-[11px] text-slate-400">
              {raxEvaluations.length}
              <br />
              <span className="text-[9px]">évals</span>
            </div>
          </div>

          {/* Tier rows */}
          <div className="flex-1 space-y-3">
            {(
              [
                {
                  tier: "LOW_RISK" as RiskTier,
                  label: "Risque faible",
                  range: "Indice 0–20",
                  color: "bg-cyan-400",
                  textColor: "text-cyan-400",
                },
                {
                  tier: "MEDIUM_RISK" as RiskTier,
                  label: "Risque moyen",
                  range: "Indice 21–50",
                  color: "bg-amber-400",
                  textColor: "text-amber-400",
                },
                {
                  tier: "HIGH_RISK" as RiskTier,
                  label: "Risque élevé",
                  range: "Indice 51–75",
                  color: "bg-orange-400",
                  textColor: "text-orange-400",
                },
                {
                  tier: "UNINSURABLE" as RiskTier,
                  label: "Non assurable",
                  range: "Indice 76–100",
                  color: "bg-red-400",
                  textColor: "text-red-400",
                },
              ] as const
            ).map(({ tier, label, range, color, textColor }) => {
              const count = tierDist[tier];
              const pct =
                totalEvals > 0 ? (count / totalEvals) * 100 : 0;
              return (
                <div key={tier} className="flex items-center gap-3">
                  <div className="w-[100px] flex-none">
                    <div className={cn("font-mono text-[12px]", textColor)}>
                      {label}
                    </div>
                    <div className="font-mono text-[10px] text-slate-600">
                      {range}
                    </div>
                  </div>
                  <FillBar pct={pct} color={color} />
                  <div className="w-12 flex-none text-right font-mono text-[11px] tabular-nums text-slate-400">
                    {count}{" "}
                    <span className="text-slate-600">
                      ({pct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppSection>

      {/* ── Section C: Regional risk heatmap ──────────────────────────────── */}
      <AppSection
        title="Répartition régionale"
        badge={sharedMode === "LIVE" ? <LiveBadge /> : <SeedBadge />}
      >
        <AppTable>
          <table className={APP_TABLE_CLASSNAMES.table}>
            <thead className={APP_TABLE_CLASSNAMES.head}>
              <tr>
                {[
                  "Région",
                  "Farmers",
                  "Alertes",
                  "Critiques",
                  "Indice moy.",
                  "Culture dominante",
                  "Niveau",
                ].map((h) => (
                  <th key={h} className={APP_TABLE_CLASSNAMES.headCell}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regionStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={APP_TABLE_CLASSNAMES.emptyState}
                  >
                    <p className="text-[13px] text-slate-500">
                      Données insuffisantes pour calculer la répartition
                      régionale.
                    </p>
                  </td>
                </tr>
              ) : (
                regionStats.map((r) => {
                  // Risk level
                  let riskLabel = "Faible";
                  let riskColor = "text-emerald-400";
                  if (r.criticalCount > 0 || r.avgWrs > 50) {
                    riskLabel = "Élevé";
                    riskColor = "text-red-400";
                  } else if (r.avgWrs > 20) {
                    riskLabel = "Moyen";
                    riskColor = "text-amber-400";
                  }

                  return (
                    <tr key={r.region} className={APP_TABLE_CLASSNAMES.row}>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-medium text-white">
                          {r.region}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums">
                          {r.farmersCount}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums">
                          {r.alertsCount}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span
                          className={cn(
                            "font-mono tabular-nums",
                            r.criticalCount > 0
                              ? "text-red-400"
                              : "text-slate-400",
                          )}
                        >
                          {r.criticalCount}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums">
                          {r.avgWrs.toFixed(1)}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        {r.dominantCrop}
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className={cn("font-mono text-[11px]", riskColor)}>
                          {riskLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </AppTable>
      </AppSection>

      {/* ── Section D: Culture exposure ────────────────────────────────────── */}
      <AppSection
        title="Exposition par culture"
        badge={sharedMode === "LIVE" ? <LiveBadge /> : <SeedBadge />}
      >
        <AppTable>
          <table className={APP_TABLE_CLASSNAMES.table}>
            <thead className={APP_TABLE_CLASSNAMES.head}>
              <tr>
                {[
                  "Culture",
                  "Farmers",
                  "Parcelles",
                  "NDVI moy.",
                  "Alertes",
                  "Risque",
                ].map((h) => (
                  <th key={h} className={APP_TABLE_CLASSNAMES.headCell}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cultureStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={APP_TABLE_CLASSNAMES.emptyState}
                  >
                    <p className="text-[13px] text-slate-500">
                      Aucune donnée de culture disponible.
                    </p>
                  </td>
                </tr>
              ) : (
                cultureStats.map((c) => {
                  // Simple risk signal from alertsCount relative to farmers
                  const alertRatio =
                    c.farmersCount > 0
                      ? c.alertsCount / c.farmersCount
                      : 0;
                  let riskLabel = "Faible";
                  let riskColor = "text-emerald-400";
                  if (alertRatio > 1) {
                    riskLabel = "Élevé";
                    riskColor = "text-red-400";
                  } else if (alertRatio > 0.3) {
                    riskLabel = "Moyen";
                    riskColor = "text-amber-400";
                  }

                  return (
                    <tr key={c.culture} className={APP_TABLE_CLASSNAMES.row}>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-medium text-white">
                          {c.culture}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums">
                          {c.farmersCount}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums">
                          {c.parcellesCount}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <NdviBar value={c.avgNdvi} />
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums">
                          {c.alertsCount}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className={cn("font-mono text-[11px]", riskColor)}>
                          {riskLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </AppTable>
      </AppSection>

      {/* ── Section E: Alert intelligence ──────────────────────────────────── */}
      <AppSection
        title="Intelligence alertes"
        badge={sharedMode === "LIVE" ? <LiveBadge /> : <SeedBadge />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Left: by type */}
          <div className="space-y-3 rounded-[20px] bg-[#101726]/92 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              Par type
            </p>
            {alertTypeStats.length === 0 ? (
              <p className="text-[12.5px] text-slate-500">Aucune alerte.</p>
            ) : (
              alertTypeStats.map((stat) => {
                const pct =
                  totalAlerts > 0 ? (stat.count / totalAlerts) * 100 : 0;
                return (
                  <div key={stat.type} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-300">
                        {stat.label}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-slate-500">
                        {stat.count}
                      </span>
                    </div>
                    <FillBar pct={pct} color="bg-cyan-400" />
                  </div>
                );
              })
            )}
          </div>

          {/* Right: by severity */}
          <div className="space-y-3 rounded-[20px] bg-[#101726]/92 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              Par sévérité
            </p>
            {(
              [
                {
                  label: "CRITICAL",
                  count: criticalAlerts,
                  color: "bg-red-400",
                  textColor: "text-red-400",
                },
                {
                  label: "WARNING",
                  count: warnCount,
                  color: "bg-amber-400",
                  textColor: "text-amber-400",
                },
                {
                  label: "INFO",
                  count: infoCount,
                  color: "bg-cyan-400",
                  textColor: "text-cyan-400",
                },
              ] as const
            ).map(({ label, count, color, textColor }) => {
              const pct =
                totalAlerts > 0 ? (count / totalAlerts) * 100 : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn("font-mono text-[11px]", textColor)}
                    >
                      {label}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-slate-500">
                      {count}
                    </span>
                  </div>
                  <FillBar pct={pct} color={color} />
                </div>
              );
            })}
          </div>
        </div>
      </AppSection>

      {/* ── Section F: IRAX-D intelligence ───────────────────────────────── */}
      <AppSection title="Intelligence IRAX-D" badge={<SeedBadge />}>
        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[16px] bg-[#101726]/92 p-4">
              <div className="font-mono text-[24px] font-semibold tabular-nums text-cyan-400">
                {avgWrs.toFixed(1)}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-slate-500">
                Indice IRAX-D moyen portfolio
              </div>
              {/* Mini fill bar */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-700/40">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${wrsPercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-[16px] bg-[#101726]/92 p-4">
              <div className="font-mono text-[24px] font-semibold tabular-nums text-emerald-400">
                {raxEvaluations.length}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-slate-500">
                Évaluations totales
              </div>
            </div>
            <div className="rounded-[16px] bg-[#101726]/92 p-4">
              <div className="font-mono text-[24px] font-semibold tabular-nums text-violet-400">
                91%
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-slate-500">
                Score qualité données
              </div>
            </div>
            <div className="rounded-[16px] bg-[#101726]/92 p-4">
              <div className="font-mono text-[24px] font-semibold tabular-nums text-amber-400 truncate">
                {dominantTier ? getRiskTierLabel(dominantTier) : "—"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-slate-500">
                Tier dominant
              </div>
            </div>
          </div>

          {/* Top 3 highest-risk evaluations */}
          {topRiskEvals.length > 0 && (
            <AppTable>
              <table className={APP_TABLE_CLASSNAMES.table}>
                <thead className={APP_TABLE_CLASSNAMES.head}>
                  <tr>
                    {["ID", "Application", "Indice", "RAX Brut", "Tier"].map(
                      (h) => (
                        <th
                          key={h}
                          className={APP_TABLE_CLASSNAMES.headCell}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {topRiskEvals.map((e) => (
                    <tr key={e.id} className={APP_TABLE_CLASSNAMES.row}>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono text-[11px] text-slate-500">
                          {e.id.slice(0, 8)}…
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono text-[11px] text-slate-400">
                          {e.applicationId.slice(0, 8)}…
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums text-red-400">
                          {e.wrsScore.toFixed(1)}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono tabular-nums">
                          {e.raxScore.toFixed(1)}
                        </span>
                      </td>
                      <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                        <span className="font-mono text-[11px] text-amber-400">
                          {getRiskTierLabel(e.riskTier)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AppTable>
          )}
        </div>
      </AppSection>

      {/* ── Section G: Mission performance ────────────────────────────────── */}
      <AppSection title="Performance missions terrain" badge={<SeedBadge />}>
        <div className="space-y-4">
          {/* Mini stat pills row */}
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill
              label="Missions configurées"
              value={String(missions.length)}
              icon={ClipboardCheck}
              accent="emerald"
            />
            <StatPill
              label="Missions terminées"
              value={String(missionStats["DONE"] ?? 0)}
              icon={CheckCircle}
              accent="cyan"
            />
          </div>

          {/* Status breakdown */}
          <AppTable>
            <table className={APP_TABLE_CLASSNAMES.table}>
              <thead className={APP_TABLE_CLASSNAMES.head}>
                <tr>
                  {["Statut", "Count", "%"].map((h) => (
                    <th key={h} className={APP_TABLE_CLASSNAMES.headCell}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {missionStatusOrder
                  .filter((s) => (missionStats[s] ?? 0) > 0)
                  .map((status) => {
                    const count = missionStats[status] ?? 0;
                    const pct =
                      missions.length > 0
                        ? ((count / missions.length) * 100).toFixed(0)
                        : "0";
                    return (
                      <tr
                        key={status}
                        className={APP_TABLE_CLASSNAMES.row}
                      >
                        <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                          {getMissionStatusLabel(
                            status as Parameters<
                              typeof getMissionStatusLabel
                            >[0],
                          )}
                        </td>
                        <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                          <span className="font-mono tabular-nums">
                            {count}
                          </span>
                        </td>
                        <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                          <span className="font-mono tabular-nums text-slate-500">
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                {missions.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className={APP_TABLE_CLASSNAMES.emptyState}
                    >
                      <p className="text-[13px] text-slate-500">
                        Aucune mission disponible.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </AppTable>
        </div>
      </AppSection>

      {/* ── Section H: Polices & sinistres ─────────────────────────────────── */}
      <AppSection title="Polices & sinistres" badge={<SeedBadge />}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatPill
              label="Polices actives"
              value={String(activePolicies)}
              icon={Shield}
              accent="emerald"
            />
            <StatPill
              label="Sinistres ouverts"
              value={String(openClaims)}
              icon={AlertTriangle}
              accent="amber"
            />
            <StatPill
              label="Exposition estimée"
              value={formatMAD(estimatedLoss)}
              icon={TrendingDown}
              accent="violet"
            />
            <StatPill
              label="Total couverture"
              value={formatMAD(totalCoverage)}
              icon={BarChart3}
              accent="cyan"
            />
          </div>

          {/* Claims by type */}
          {claimsByType.size > 0 && (
            <AppTable>
              <table className={APP_TABLE_CLASSNAMES.table}>
                <thead className={APP_TABLE_CLASSNAMES.head}>
                  <tr>
                    {["Type sinistre", "Count", "%"].map((h) => (
                      <th
                        key={h}
                        className={APP_TABLE_CLASSNAMES.headCell}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(claimsByType.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const pct =
                        claims.length > 0
                          ? ((count / claims.length) * 100).toFixed(0)
                          : "0";
                      return (
                        <tr
                          key={type}
                          className={APP_TABLE_CLASSNAMES.row}
                        >
                          <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                            {getClaimTypeLabel(type)}
                          </td>
                          <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                            <span className="font-mono tabular-nums">
                              {count}
                            </span>
                          </td>
                          <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                            <span className="font-mono tabular-nums text-slate-500">
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </AppTable>
          )}
        </div>
      </AppSection>

      {/* ── Section I: Data transparency ───────────────────────────────────── */}
      <div className="rounded-[16px] border border-cyan-400/12 bg-cyan-400/4 p-4 space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan-400">
          Transparence des données
        </p>
        <div className="grid gap-2 text-[12.5px] text-slate-400 sm:grid-cols-3">
          <div>
            <span className="font-semibold text-white">
              Données Wakama partagées :
            </span>{" "}
            {sharedMode === "LIVE"
              ? "Flux LIVE connecté (api.wakama.farm)"
              : "SEED_DEMO — données de démonstration"}
          </div>
          <div>
            <span className="font-semibold text-white">
              Workflows assurance :
            </span>{" "}
            SEED_DEMO — pipeline technique non encore connecté en production
          </div>
          <div>
            <span className="font-semibold text-white">Méthodologie :</span>{" "}
            Recommandations non décisionnelles. Wakama structure et score ;
            l&apos;assureur valide et décide.
          </div>
        </div>
      </div>
    </div>
  );
}
