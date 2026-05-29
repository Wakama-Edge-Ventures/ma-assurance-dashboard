import { notFound } from "next/navigation";

import { ArbitrageChecklist } from "@/components/arbitrage/arbitrage-checklist";
import { ArbitrageNextActionCard } from "@/components/arbitrage/arbitrage-next-action-card";
import { AreaComparisonCard } from "@/components/arbitrage/area-comparison-card";
import { AreaDeltaBadge } from "@/components/arbitrage/area-delta-badge";
import { GuidedDemoPanel } from "@/components/demo/guided-demo-panel";
import { PipelineStepper } from "@/components/demo/pipeline-stepper";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { isScenarioEntityId } from "@/lib/demo-scenario";
import {
  getFarmers,
  getInsuranceApplicationById,
  getInsuranceFieldAuditById,
  getInsuranceMissions,
} from "@/lib/insurance-service";
import { formatDate, getAreaDeltaSeverity, getAuditModeLabel } from "@/lib/workflow";

interface ArbitrageDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ArbitrageDetailPage({ params }: ArbitrageDetailPageProps) {
  const { id } = await params;
  const audit = await getInsuranceFieldAuditById(id);
  if (!audit) notFound();

  const [application, missions, farmers] = await Promise.all([
    getInsuranceApplicationById(audit.applicationId),
    getInsuranceMissions(),
    getFarmers(),
  ]);

  const mission = missions.find((item) => item.id === audit.missionId) ?? null;
  const farmer = farmers.find((item) => item.id === audit.farmerId) ?? null;
  const severity = getAreaDeltaSeverity(audit.areaDeltaPercent);
  const totalAssets = audit.assetsApprovedCount + audit.assetsRejectedCount;
  const demoStepId = isScenarioEntityId(audit.id) ? "step-arbitrage" : undefined;

  return (
    <div className="space-y-6">
      <PageTitle title={`Arbitrage ${audit.id}`} description="Detail de revue back-office." />
      {demoStepId && <PipelineStepper activeStepId={demoStepId} />}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Audit ID</p>
            <p className="text-lg font-semibold text-white">{audit.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <AreaDeltaBadge deltaPercent={audit.areaDeltaPercent} />
            <DataSourceBadge source={audit.source} />
          </div>
        </div>
        <div className="grid gap-3 text-[13px] text-slate-300 md:grid-cols-3">
          <p>Demande liee: {application?.reference ?? audit.applicationId}</p>
          <p>Mission liee: {mission?.id ?? audit.missionId ?? "N/A"}</p>
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>Statut audit: {audit.status}</p>
          <p>Mode audit: {getAuditModeLabel(audit.auditMode)}</p>
          <p>Severite: {severity}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Revue technique non decisionnelle — validation finale reservee a l&apos;assureur.
        </p>
      </Card>

      <AreaComparisonCard audit={audit} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Resume arbitrage actifs
          </h2>
          <div className="mt-3 grid gap-3 text-[13px] text-slate-300 md:grid-cols-3">
            <p>Actifs approuves: {audit.assetsApprovedCount}</p>
            <p>Actifs rejetes: {audit.assetsRejectedCount}</p>
            <p>Total actifs: {totalAssets}</p>
          </div>
          <p className="mt-3 text-xs text-brand-textMuted">
            Motifs de rejet standardises (qualite photo, non-conformite, doublons) a integrer
            dans une prochaine iteration.
          </p>
        </Card>

        <ArbitrageNextActionCard audit={audit} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Integrite et preuves
          </h2>
          <div className="mt-3 space-y-2 text-[13px] text-slate-300">
            <p className="truncate">Hash integrite: {audit.integrityHash}</p>
            <p>Mode audit: {getAuditModeLabel(audit.auditMode)}</p>
            <p className="flex items-center gap-2">
              Source: <DataSourceBadge source={audit.source} />
            </p>
            <p>Cree le: {formatDate(audit.createdAt)}</p>
            <p>Termine le: {audit.completedAt ? formatDate(audit.completedAt) : "N/A"}</p>
            <p className="text-xs text-brand-textMuted">
              Ancrage Solana asynchrone — non bloquant pour le workflow metier.
            </p>
          </div>
        </Card>

        <ArbitrageChecklist audit={audit} />
      </div>
      {demoStepId && <GuidedDemoPanel currentStepId={demoStepId} />}
    </div>
  );
}
