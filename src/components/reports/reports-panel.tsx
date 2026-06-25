"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Filter, Printer, RefreshCw, X } from "lucide-react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { AppSection } from "@/components/ui/app-section";
import { APP_TABLE_CLASSNAMES, AppTable } from "@/components/ui/app-table";
import { buildCsvFromRows, REPORT_TEMPLATES } from "@/lib/reporting";
import { cn } from "@/lib/utils";
import { formatDate, formatMAD, getClaimTypeLabel } from "@/lib/workflow";
import type {
  Cooperative,
  DataSource,
  Farmer,
  InsuranceApplication,
  InsuranceClaim,
  InsurancePolicy,
  WakamaAlert,
} from "@/types";

// ---------------------------------------------------------------------------
// Static demo data for report history table
// ---------------------------------------------------------------------------
const DEMO_HISTORY = [
  {
    id: "RPT-2025-0042",
    template: "Rapport Direction des Risques",
    period: "Jan–Mar 2025",
    by: "A. Benali",
    at: "2025-04-01",
    source: "MIXED",
    status: "Livré",
  },
  {
    id: "RPT-2025-0038",
    template: "Rapport Portefeuille Agricole",
    period: "Q4 2024",
    by: "M. El Idrissi",
    at: "2025-01-15",
    source: "LIVE",
    status: "Livré",
  },
  {
    id: "RPT-2025-0031",
    template: "Rapport ACAPS Readiness",
    period: "2024 annuel",
    by: "Direction",
    at: "2025-01-03",
    source: "MIXED",
    status: "Archivé",
  },
  {
    id: "RPT-2024-0028",
    template: "Rapport Réassureur",
    period: "Sem. 2 2024",
    by: "A. Benali",
    at: "2024-12-10",
    source: "SEED_DEMO",
    status: "Livré",
  },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ReportsPanelProps {
  farmers: Farmer[];
  cooperatives: Cooperative[];
  applications: InsuranceApplication[];
  policies: InsurancePolicy[];
  claims: InsuranceClaim[];
  alerts: WakamaAlert[];
  sharedMode: DataSource;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Severity badge helper
// ---------------------------------------------------------------------------
function SeverityPill({ severity }: { severity: string }) {
  const s = severity.toUpperCase();
  const cls =
    s === "CRITICAL"
      ? "border border-red-400/25 bg-red-400/10 text-red-400"
      : s === "WARNING"
        ? "border border-amber-400/25 bg-amber-400/10 text-amber-400"
        : "border border-cyan-400/20 bg-cyan-400/10 text-cyan-400";
  return (
    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em]", cls)}>
      {severity}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Source pill for history table
// ---------------------------------------------------------------------------
function SourcePill({ source }: { source: string }) {
  const cls =
    source === "LIVE"
      ? "border border-emerald-400/28 bg-emerald-400/10 text-emerald-400"
      : source === "MIXED"
        ? "border border-cyan-400/20 bg-cyan-400/8 text-cyan-400"
        : "border border-amber-400/26 bg-amber-400/8 text-amber-400";
  return (
    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em]", cls)}>
      {source}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ReportsPanel({
  farmers,
  cooperatives,
  applications,
  policies,
  claims,
  alerts,
  sharedMode,
  generatedAt,
}: ReportsPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filters, setFilters] = useState({
    reportType: "all",
    periodStart: "2025-01-01",
    periodEnd: new Date().toISOString().slice(0, 10),
    region: "all",
    culture: "all",
    riskTier: "all",
    dataSource: "all" as "all" | "LIVE" | "SEED_DEMO",
    includeAuditTrail: false,
    includeRaxDetails: true,
    includeAlertStream: true,
  });

  // Derived unique regions and cultures from farmers
  const regions = useMemo(
    () => Array.from(new Set(farmers.map((f) => f.region).filter(Boolean))).sort(),
    [farmers],
  );
  const cultures = useMemo(
    () =>
      Array.from(new Set(farmers.map((f) => f.primaryCrop).filter(Boolean))).sort(),
    [farmers],
  );

  // Claim type summary for preview
  const claimSummary = useMemo(() => {
    const map: Record<string, { count: number; totalLoss: number }> = {};
    for (const c of claims) {
      if (!map[c.claimType]) map[c.claimType] = { count: 0, totalLoss: 0 };
      map[c.claimType].count += 1;
      map[c.claimType].totalLoss += c.estimatedLossMad;
    }
    return Object.entries(map);
  }, [claims]);

  // ---------------------------------------------------------------------------
  // Export handlers
  // ---------------------------------------------------------------------------
  function handleExportCsv() {
    const headers = [
      "Référence",
      "Agriculteur ID",
      "Culture",
      "Surface (ha)",
      "Couverture (MAD)",
      "Statut",
      "Niveau risque",
      "Source",
    ];
    const rows = applications.map((a) => [
      a.reference,
      a.farmerId,
      a.cropType,
      a.areaHa.toFixed(2),
      formatMAD(a.requestedCoverageMad),
      a.status,
      a.riskTier,
      a.source,
    ]);
    const csv = buildCsvFromRows(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wakama-rapport-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleExportJson() {
    const data = {
      generatedAt: new Date().toISOString(),
      source: sharedMode,
      filters,
      portfolio: {
        farmers: farmers.length,
        cooperatives: cooperatives.length,
        applications: applications.length,
        policies: policies.length,
        claims: claims.length,
        alerts: alerts.length,
      },
      applications: applications.slice(0, 50),
      claims: claims.slice(0, 50),
      alerts: alerts.slice(0, 50),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wakama-rapport-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // Common select / input className
  const selectCls =
    "rounded-full border border-slate-700/50 bg-[#0b1422]/75 px-3 py-2 font-mono text-[12px] text-slate-300 outline-none";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* ── Header info row ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-slate-400">
          <FileText className="h-3.5 w-3.5 text-cyan-400" />
          8 modèles disponibles
        </span>
        <span className="h-3.5 w-px bg-slate-700/60" />
        <span className="font-mono text-[12px] text-slate-500">
          Dernière génération&nbsp;: {formatDate(generatedAt)}
        </span>
        <span className="h-3.5 w-px bg-slate-700/60" />
        <DataSourceBadge source={sharedMode} />
        <span className="rounded-full border border-amber-400/25 bg-amber-400/8 px-2 py-0.5 font-mono text-[10.5px] font-medium text-amber-400">
          SEED_DEMO
        </span>
        <span className="font-mono text-[10.5px] text-slate-500">Insurance workflows</span>
      </div>

      {/* ── Template library ── */}
      <AppSection title="Bibliothèque de rapports">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {REPORT_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className={cn(
                "cursor-pointer rounded-[16px] bg-[#101726]/92 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(34,211,238,0.2)]",
                selectedTemplate === tpl.id && "ring-1 ring-cyan-400/40",
              )}
              onClick={() => {
                setSelectedTemplate(tpl.id);
                setShowPreview(false);
              }}
            >
              {/* Title + source label */}
              <div className="mb-2.5 flex items-start justify-between gap-2">
                <span className="font-display text-[13.5px] font-semibold text-white">
                  {tpl.title}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em]",
                    tpl.sourceLabel === "LIVE"
                      ? "border border-emerald-400/28 bg-emerald-400/10 text-emerald-400"
                      : tpl.sourceLabel === "MIXED"
                        ? "border border-cyan-400/20 bg-cyan-400/8 text-cyan-400"
                        : "border border-amber-400/26 bg-amber-400/8 text-amber-400",
                  )}
                >
                  {tpl.sourceLabel}
                </span>
              </div>

              {/* Description */}
              <p className="mb-3 text-[12px] leading-[1.5] text-slate-400">
                {tpl.description}
              </p>

              {/* Recipient */}
              <p className="mb-2 font-mono text-[10px] text-slate-500">
                Destinataire&nbsp;: {tpl.recipient}
              </p>

              {/* Format badges */}
              <div className="flex flex-wrap gap-1">
                {tpl.formats.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 font-mono text-[9.5px] text-slate-400"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AppSection>

      {/* ── Advanced generator ── */}
      <AppSection
        title="Générateur avancé"
        badge={
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/40 bg-slate-800/40 px-2 py-0.5 font-mono text-[9.5px] text-slate-500">
            <Filter className="h-2.5 w-2.5" />
            Filtres
          </span>
        }
      >
        <div className="rounded-[16px] bg-[#0d1525]/80 p-4">
          {/* Filter grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Report type */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Type de rapport
              </label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters((f) => ({ ...f, reportType: e.target.value }))}
                className={selectCls}
              >
                <option value="all">Tous les types</option>
                {REPORT_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Period start */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Période du
              </label>
              <input
                type="date"
                value={filters.periodStart}
                onChange={(e) => setFilters((f) => ({ ...f, periodStart: e.target.value }))}
                className={selectCls}
              />
            </div>

            {/* Period end */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Au
              </label>
              <input
                type="date"
                value={filters.periodEnd}
                onChange={(e) => setFilters((f) => ({ ...f, periodEnd: e.target.value }))}
                className={selectCls}
              />
            </div>

            {/* Region */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Région
              </label>
              <select
                value={filters.region}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
                className={selectCls}
              >
                <option value="all">Toutes</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Culture */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Filière / culture
              </label>
              <select
                value={filters.culture}
                onChange={(e) => setFilters((f) => ({ ...f, culture: e.target.value }))}
                className={selectCls}
              >
                <option value="all">Toutes</option>
                {cultures.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk tier */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Niveau de risque
              </label>
              <select
                value={filters.riskTier}
                onChange={(e) => setFilters((f) => ({ ...f, riskTier: e.target.value }))}
                className={selectCls}
              >
                <option value="all">Tous</option>
                <option value="LOW_RISK">LOW_RISK</option>
                <option value="MEDIUM_RISK">MEDIUM_RISK</option>
                <option value="HIGH_RISK">HIGH_RISK</option>
                <option value="UNINSURABLE">UNINSURABLE</option>
              </select>
            </div>

            {/* Data source */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Source données
              </label>
              <select
                value={filters.dataSource}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    dataSource: e.target.value as "all" | "LIVE" | "SEED_DEMO",
                  }))
                }
                className={selectCls}
              >
                <option value="all">Toutes</option>
                <option value="LIVE">LIVE</option>
                <option value="SEED_DEMO">SEED_DEMO</option>
              </select>
            </div>

            {/* Checkboxes column */}
            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.includeAuditTrail}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, includeAuditTrail: e.target.checked }))
                  }
                  className="accent-cyan-400"
                />
                <span className="font-mono text-[12px] text-slate-400">
                  Inclure audit trail
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.includeRaxDetails}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, includeRaxDetails: e.target.checked }))
                  }
                  className="accent-cyan-400"
                />
                <span className="font-mono text-[12px] text-slate-400">
                  Inclure détails IRAX-D
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.includeAlertStream}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, includeAlertStream: e.target.checked }))
                  }
                  className="accent-cyan-400"
                />
                <span className="font-mono text-[12px] text-slate-400">
                  Inclure flux alertes
                </span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/15 px-4 py-2 font-mono text-[12px] text-cyan-400 transition-colors hover:bg-cyan-400/25"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Générer prévisualisation
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/40 bg-slate-800/50 px-4 py-2 font-mono text-[12px] text-slate-400 transition-colors hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/40 bg-slate-800/50 px-4 py-2 font-mono text-[12px] text-slate-400 transition-colors hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/40 bg-slate-800/50 px-4 py-2 font-mono text-[12px] text-slate-400 transition-colors hover:text-white"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer / PDF
            </button>
          </div>
        </div>
      </AppSection>

      {/* ── Preview ── */}
      {showPreview && (
        <AppSection title="Prévisualisation rapport">
          <div className="rounded-[20px] bg-[#0a0f1c]/80 p-6 space-y-5">
            {/* Preview header */}
            <div className="border-b border-slate-700/40 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    WAKAMA ASSURANCE — RAPPORT TECHNIQUE
                  </p>
                  <h2 className="mt-1 font-display text-[18px] font-semibold text-white">
                    {selectedTemplate
                      ? REPORT_TEMPLATES.find((t) => t.id === selectedTemplate)?.title
                      : "Rapport Portefeuille Complet"}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Généré le {formatDate(new Date().toISOString())} &middot; Période&nbsp;:{" "}
                    {filters.periodStart} &rarr; {filters.periodEnd}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 border-l-2 border-amber-400/30 pl-3 text-[12px] text-amber-400">
                Recommandation non décisionnelle. Ce rapport structure les données Wakama à
                titre informatif. L&apos;assureur conserve la responsabilité de la décision
                d&apos;éligibilité, d&apos;émission de police et d&apos;indemnisation.
              </p>
            </div>

            {/* Synthèse exécutive */}
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Synthèse exécutive
              </p>
              <div className="space-y-1.5">
                {(
                  [
                    ["Farmers portefeuille", farmers.length],
                    ["Applications", applications.length],
                    [
                      "Polices actives",
                      policies.filter((p) => p.status === "ACTIVE").length,
                    ],
                    [
                      "Sinistres ouverts",
                      claims.filter((c) =>
                        ["OPEN", "DECLARED", "UNDER_REVIEW"].includes(c.status),
                      ).length,
                    ],
                  ] as [string, number][]
                ).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[12.5px] text-slate-400">{label}</span>
                    <span className="bg-gradient-to-br from-cyan-400 to-emerald-400 bg-clip-text font-mono text-[13px] font-semibold text-transparent">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertes récentes */}
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Alertes récentes
              </p>
              {alerts.length === 0 ? (
                <p className="text-[12px] text-slate-600">Aucune alerte disponible.</p>
              ) : (
                <div className="space-y-2">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-2">
                      <SeverityPill severity={alert.severity} />
                      {alert.type && (
                        <span className="font-mono text-[10px] text-slate-500">
                          [{alert.type}]
                        </span>
                      )}
                      <span className="flex-1 truncate text-[12px] text-slate-300">
                        {alert.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Synthèse sinistres */}
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                Synthèse sinistres
              </p>
              {claimSummary.length === 0 ? (
                <p className="text-[12px] text-slate-600">Aucun sinistre enregistré.</p>
              ) : (
                <AppTable>
                  <table className={APP_TABLE_CLASSNAMES.table}>
                    <thead className={APP_TABLE_CLASSNAMES.head}>
                      <tr>
                        <th className={APP_TABLE_CLASSNAMES.headCell}>Type</th>
                        <th className={APP_TABLE_CLASSNAMES.headCell}>Nb sinistres</th>
                        <th className={APP_TABLE_CLASSNAMES.headCell}>Total perte estimée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimSummary.map(([type, { count, totalLoss }]) => (
                        <tr key={type} className={APP_TABLE_CLASSNAMES.row}>
                          <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                            {getClaimTypeLabel(type)}
                          </td>
                          <td className={APP_TABLE_CLASSNAMES.bodyCell}>{count}</td>
                          <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                            {formatMAD(totalLoss)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AppTable>
              )}
            </div>

            {/* Compliance note */}
            <p className="border-l-2 border-cyan-400/20 pl-3 text-[11.5px] leading-[1.65] text-slate-500">
              Les données Wakama sont collectées, structurées et horodatées à titre de preuve
              d&apos;intégrité. Elles ne constituent pas une décision d&apos;assurance, une
              politique officielle, ni un acte réglementaire. Conçu pour le cadre ACAPS/CNDP.
            </p>
          </div>
        </AppSection>
      )}

      {/* ── Report history ── */}
      <AppSection title="Historique des rapports générés">
        <AppTable>
          <table className={APP_TABLE_CLASSNAMES.table}>
            <thead className={APP_TABLE_CLASSNAMES.head}>
              <tr>
                <th className={APP_TABLE_CLASSNAMES.headCell}>ID</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Modèle</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Période</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Généré par</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Date</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Source</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Statut</th>
                <th className={APP_TABLE_CLASSNAMES.headCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_HISTORY.map((row) => (
                <tr key={row.id} className={APP_TABLE_CLASSNAMES.row}>
                  <td className={cn(APP_TABLE_CLASSNAMES.bodyCell, "font-mono text-[11.5px] text-cyan-400/80")}>
                    {row.id}
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.template}</td>
                  <td className={cn(APP_TABLE_CLASSNAMES.bodyCell, "font-mono text-[11.5px] text-slate-400")}>
                    {row.period}
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>{row.by}</td>
                  <td className={cn(APP_TABLE_CLASSNAMES.bodyCell, "font-mono text-[11.5px] text-slate-400")}>
                    {row.at}
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                    <SourcePill source={row.source} />
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[9.5px]",
                        row.status === "Livré"
                          ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-400"
                          : "border border-slate-600/40 bg-slate-800/40 text-slate-500",
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className={APP_TABLE_CLASSNAMES.bodyCell}>
                    <button className="font-mono text-[11px] text-cyan-400/70 transition-colors hover:text-cyan-400">
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AppTable>
      </AppSection>

      {/* ── Compliance block ── */}
      <div className="rounded-[16px] bg-slate-800/30 p-4 text-[12px] leading-[1.65] text-slate-500">
        <span className="font-semibold text-slate-300">Conformité&nbsp;:</span> Les rapports
        Wakama structurent les données et éléments de preuve. Ils ne remplacent pas
        l&apos;analyse finale, la décision d&apos;éligibilité, l&apos;émission de police ou
        l&apos;indemnisation par l&apos;assureur. Conçu pour le cadre ACAPS/CNDP.
      </div>
    </div>
  );
}
