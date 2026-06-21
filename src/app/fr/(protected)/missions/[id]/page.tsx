import { notFound } from "next/navigation";

import { GuidedDemoPanel } from "@/components/demo/guided-demo-panel";
import { EvidenceBundlePanel } from "@/components/insurance/evidence-bundle-panel";
import { PipelineStepper } from "@/components/demo/pipeline-stepper";
import { MissionChecklist } from "@/components/missions/mission-checklist";
import { MissionConfigSummary } from "@/components/missions/mission-config-summary";
import { MissionNextActionCard } from "@/components/missions/mission-next-action-card";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { isScenarioEntityId } from "@/lib/demo-scenario";
import {
  getFarmers,
  getInsuranceApplicationById,
  getInsuranceFieldAudits,
  getInsuranceMissionById,
} from "@/lib/insurance-service";
import { formatDate } from "@/lib/workflow";

interface MissionDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  const { id } = await params;
  const mission = await getInsuranceMissionById(id);
  if (!mission) notFound();

  const [application, farmers, audits] = await Promise.all([
    getInsuranceApplicationById(mission.applicationId),
    getFarmers(),
    getInsuranceFieldAudits(),
  ]);

  const farmer = application ? farmers.find((item) => item.id === application.farmerId) : null;
  const linkedAudit =
    audits.find((audit) => audit.missionId === mission.id) ??
    audits.find((audit) => audit.applicationId === mission.applicationId) ??
    null;
  const demoStepId = isScenarioEntityId(mission.id) ? "step-mission" : undefined;

  return (
    <div className="space-y-6">
      <PageTitle title={`Mission ${mission.id}`} description="Detail de mission terrain." />
      {demoStepId && <PipelineStepper activeStepId={demoStepId} />}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">
              Mission ID / Reference
            </p>
            <p className="text-lg font-semibold text-white">{mission.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <MissionStatusBadge status={mission.status} />
            <DataSourceBadge source={mission.source} />
          </div>
        </div>
        <div className="grid gap-3 text-[13px] text-slate-300 md:grid-cols-3">
          <p>Demande liee: {application?.reference ?? mission.applicationId}</p>
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>Agent assigne: {mission.assignedTo}</p>
          <p>Date mission: {formatDate(mission.scheduledFor)}</p>
          <p>Region: {mission.region}</p>
          <p>Type: {mission.missionType}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Mission de collecte et de verification — donnees destinees a l&apos;arbitrage
          assureur.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <MissionConfigSummary mission={mission} linkedAudit={linkedAudit} />
          <MissionChecklist mission={mission} linkedAudit={linkedAudit} />
        </div>
        <MissionNextActionCard mission={mission} />
      </div>

      <Card>
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Apercu audit terrain lie
        </h2>
        {linkedAudit ? (
          <div className="mt-3 grid gap-2 text-[13px] text-slate-300 md:grid-cols-2">
            <p>Surface declaree: {linkedAudit.declaredAreaHa} ha</p>
            <p>Surface mesuree: {linkedAudit.measuredAreaHa} ha</p>
            <p>Delta: {linkedAudit.areaDeltaPercent.toFixed(1)}%</p>
            <p>
              Actifs approuves/rejetes: {linkedAudit.assetsApprovedCount}/
              {linkedAudit.assetsRejectedCount}
            </p>
            <p>Mode audit: {linkedAudit.auditMode}</p>
            <p className="truncate">Hash integrite: {linkedAudit.integrityHash}</p>
            <p className="flex items-center gap-2">
              Source: <DataSourceBadge source={linkedAudit.source} />
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-[13px] text-slate-200">Aucun audit synchronise pour cette mission.</p>
            <p className="text-xs text-brand-textMuted">
              En MVP, un audit WEB_DEMO pourra alimenter ce dossier avant l&apos;Agent App
              native.
            </p>
          </div>
        )}
      </Card>

      <EvidenceBundlePanel
        title="Evidence bundle - mission/audit"
        applicationId={mission.applicationId}
        entityType="MISSION"
        entityId={mission.id}
        payload={
          linkedAudit
            ? {
                missionId: mission.id,
                applicationId: mission.applicationId,
                auditId: linkedAudit.id,
                integrityHash: linkedAudit.integrityHash,
              }
            : {
                missionId: mission.id,
                applicationId: mission.applicationId,
                note: "Aucun audit lié pour le moment",
              }
        }
      />
      {demoStepId && <GuidedDemoPanel currentStepId={demoStepId} />}
    </div>
  );
}
