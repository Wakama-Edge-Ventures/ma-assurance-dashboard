import { notFound } from "next/navigation";

import { RaxBreakdownCard } from "@/components/rax/rax-breakdown-card";
import { RaxNextActionCard } from "@/components/rax/rax-next-action-card";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { RiskTierBadge } from "@/components/ui/risk-tier-badge";
import {
  getFarmers,
  getInsuranceApplicationById,
  getInsuranceFieldAudits,
  getRaxEvaluationById,
} from "@/lib/insurance-service";
import {
  calculateRaxBrut,
  calculateWrs,
  formatDate,
  formatPercent,
  formatScore,
  getAuditModeLabel,
  getRiskTierLabel,
} from "@/lib/workflow";

interface RaxDetailPageProps {
  params: Promise<{ id: string }>;
}

function resolveMetrics(row: {
  gravity?: number;
  frequency?: number;
  detection?: number;
  raxBrut?: number;
  raxScore: number;
  wrsScore: number;
}) {
  const gravity = typeof row.gravity === "number" && Number.isFinite(row.gravity) ? row.gravity : 3;
  const frequency =
    typeof row.frequency === "number" && Number.isFinite(row.frequency) ? row.frequency : 3;
  const detection =
    typeof row.detection === "number" && Number.isFinite(row.detection) ? row.detection : 0.8;
  const computedRaxBrut = calculateRaxBrut(gravity, frequency, detection);
  const raxBrut =
    typeof row.raxBrut === "number" && Number.isFinite(row.raxBrut)
    ? row.raxBrut
    : Number.isFinite(row.raxScore)
      ? row.raxScore
      : computedRaxBrut;
  const wrsRaw = Number.isFinite(row.wrsScore) ? row.wrsScore : calculateWrs(raxBrut);
  const wrs = Math.max(0, Math.min(100, wrsRaw));

  return { gravity, frequency, detection, raxBrut, wrs };
}

export const dynamic = "force-dynamic";

export default async function RaxDetailPage({ params }: RaxDetailPageProps) {
  const { id } = await params;
  const evaluation = await getRaxEvaluationById(id);
  if (!evaluation) notFound();

  const [application, farmers, audits] = await Promise.all([
    getInsuranceApplicationById(evaluation.applicationId),
    getFarmers(),
    getInsuranceFieldAudits(),
  ]);
  const farmer = application ? farmers.find((item) => item.id === application.farmerId) : null;
  const linkedAudit =
    audits.find((audit) => audit.applicationId === evaluation.applicationId) ?? null;
  const metrics = resolveMetrics(evaluation);

  return (
    <div className="space-y-6">
      <PageTitle title={`Evaluation ${evaluation.id}`} description="Detail RAX/WRS technique." />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Evaluation ID</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{evaluation.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <RiskTierBadge tier={evaluation.riskTier} />
            <DataSourceBadge source={evaluation.source} />
          </div>
        </div>
        <div className="grid gap-3 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-3">
          <p>Demande liee: {application?.reference ?? evaluation.applicationId}</p>
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>WRS: {formatScore(metrics.wrs)}</p>
          <p>Tier risque: {getRiskTierLabel(evaluation.riskTier)}</p>
          <p>Source: {evaluation.source}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Score technique non decisionnel - decision finale reservee a l&apos;assureur.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <RaxBreakdownCard
          title="Gravite G"
          value={formatScore(metrics.gravity)}
          description="Impact financier potentiel."
        />
        <RaxBreakdownCard
          title="Frequence F"
          value={formatScore(metrics.frequency)}
          description="Recurrence historique/proxy NDVI et climat."
        />
        <RaxBreakdownCard
          title="Detection D"
          value={formatScore(metrics.detection)}
          description="Capacite de surveillance et mitigation active."
        />
        <RaxBreakdownCard
          title="RAX brut"
          value={formatScore(metrics.raxBrut)}
          description="Produit des composantes."
        />
        <RaxBreakdownCard
          title="WRS normalise"
          value={formatScore(metrics.wrs)}
          description="Normalisation sur une echelle 0-100."
        />
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Lecture du coefficient D
        </h2>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
          Plus la surveillance active est forte, plus le coefficient D diminue.
        </p>
        <p className="mt-2 text-xs text-brand-textMuted">
          Un D plus faible reduit le RAX brut et le WRS, a gravite/frequence constantes.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Evidence liee
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <p>Demande: {application?.reference ?? evaluation.applicationId}</p>
            <p>Statut demande: {application?.status ?? "N/A"}</p>
            <p>Mode audit: {linkedAudit ? getAuditModeLabel(linkedAudit.auditMode) : "N/A"}</p>
            <p>
              Ecart surface:{" "}
              {linkedAudit ? formatPercent(linkedAudit.areaDeltaPercent) : "N/A"}
            </p>
            <p className="truncate">
              Hash integrite: {linkedAudit?.integrityHash ?? "En attente de synchronisation"}
            </p>
            <p className="flex items-center gap-2">
              Source:
              <DataSourceBadge source={linkedAudit?.source ?? evaluation.source} />
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Calibration
          </h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
            Ce score est un framework v1. Il doit etre calibre avec les historiques de
            sinistres, cultures, zones et regles de souscription de l&apos;assureur.
          </p>
          <p className="mt-3 text-xs text-brand-textMuted">
            Derniere actualisation:{" "}
            {linkedAudit?.completedAt
              ? formatDate(linkedAudit.completedAt)
              : application?.updatedAt
                ? formatDate(application.updatedAt)
                : "N/A"}
          </p>
        </Card>
      </div>

      <RaxNextActionCard tier={evaluation.riskTier} applicationId={evaluation.applicationId} />
    </div>
  );
}
