import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaimNextActionCard } from "@/components/claims/claim-next-action-card";
import { ClaimReviewChecklist } from "@/components/claims/claim-review-checklist";
import { ClaimSeverityBadge } from "@/components/claims/claim-severity-badge";
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";
import { Card } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PageTitle } from "@/components/ui/page-title";
import { PolicyStatusBadge } from "@/components/policies/policy-status-badge";
import {
  getFarmers,
  getInsuranceApplications,
  getInsuranceClaimById,
  getInsuranceClaims,
  getInsurancePolicies,
  getMonitoringAlerts,
} from "@/lib/insurance-service";
import { formatDate, formatMAD, getClaimTypeLabel, getMonitoringSignalTypeLabel } from "@/lib/workflow";

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>;
}

function resolveSeverity(input: { severity?: string; monitoringSeverity?: string }) {
  if (input.severity === "CRITICAL" || input.monitoringSeverity === "CRITICAL") {
    return "CRITICAL";
  }
  if (input.severity === "WARNING" || input.monitoringSeverity === "WARNING") {
    return "WARNING";
  }
  return "INFO";
}

export const dynamic = "force-dynamic";

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params;
  const [claim, claims, policies, alerts, applications, farmers] = await Promise.all([
    getInsuranceClaimById(id),
    getInsuranceClaims(),
    getInsurancePolicies(),
    getMonitoringAlerts(),
    getInsuranceApplications(),
    getFarmers(),
  ]);
  if (!claim) notFound();

  const claimMap = new Map(claims.map((item) => [item.id, item]));
  const currentClaim = claimMap.get(claim.id) ?? claim;

  const policy = policies.find((item) => item.id === currentClaim.policyId) ?? null;
  const application =
    (currentClaim.applicationId
      ? applications.find((item) => item.id === currentClaim.applicationId)
      : null) ?? (policy ? applications.find((item) => item.id === policy.applicationId) : null);
  const farmer =
    (currentClaim.farmerId ? farmers.find((item) => item.id === currentClaim.farmerId) : null) ??
    (application ? farmers.find((item) => item.id === application.farmerId) : null);

  const linkedAlert =
    (currentClaim.monitoringAlertId
      ? alerts.find((item) => item.id === currentClaim.monitoringAlertId)
      : null) ?? alerts.find((item) => item.policyId === currentClaim.policyId) ?? null;

  const severity = resolveSeverity({
    severity: currentClaim.severity,
    monitoringSeverity: linkedAlert?.severity ?? linkedAlert?.level,
  });

  const checklistItems: Array<{ label: string; state: "done" | "warning" | "pending" }> = [
    {
      label: "Police active au moment du signal",
      state: policy?.status === "ACTIVE" || policy?.status === "CLAIM_OPEN" ? "done" : "warning",
    },
    {
      label: "Signal monitoring disponible",
      state: linkedAlert ? "done" : "pending",
    },
    {
      label: "Donnees NDVI/meteo/IoT a consolider",
      state: linkedAlert && linkedAlert.type !== "SYSTEM" ? "warning" : "pending",
    },
    {
      label: "Preuves terrain a verifier",
      state: severity === "CRITICAL" || severity === "WARNING" ? "warning" : "pending",
    },
    {
      label: "Revue assureur requise",
      state:
        currentClaim.status === "CLOSED" ||
        currentClaim.status === "APPROVED" ||
        currentClaim.status === "REJECTED" ||
        currentClaim.status === "APPROVED_BY_INSURER" ||
        currentClaim.status === "REJECTED_BY_INSURER"
          ? "done"
          : "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Sinistre ${currentClaim.claimNumber}`}
        description="Detail dossier de suivi sinistre."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-textMuted">Claim ID</p>
            <p className="text-lg font-semibold text-slate-100">{currentClaim.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <ClaimStatusBadge status={currentClaim.status} />
            <ClaimSeverityBadge severity={severity} />
            <DataSourceBadge source={currentClaim.source} />
          </div>
        </div>
        <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-3">
          <p>Police liee: {policy?.policyNumber ?? currentClaim.policyId}</p>
          <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
          <p>Type: {getClaimTypeLabel(currentClaim.claimType)}</p>
        </div>
        <p className="text-xs text-brand-textMuted">
          Dossier de suivi non decisionnel - decision sinistre et indemnisation reservees a
          l&apos;assureur.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Contexte signalement
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <p>Type: {getClaimTypeLabel(currentClaim.claimType)}</p>
            <p>Statut: {currentClaim.status}</p>
            <p>Cree le: {currentClaim.createdAt ? formatDate(currentClaim.createdAt) : "N/A"}</p>
            <p>
              Mis a jour le:{" "}
              {currentClaim.updatedAt ? formatDate(currentClaim.updatedAt) : "N/A"}
            </p>
            <p>
              Estimation indicative:{" "}
              {formatMAD(currentClaim.estimatedAmount ?? currentClaim.estimatedLossMad)}
            </p>
            <p>Description: {currentClaim.description ?? "N/A"}</p>
            <p className="flex items-center gap-2">
              Source:
              <DataSourceBadge source={currentClaim.source} />
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Police liee
          </h2>
          {policy ? (
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <p>
                Police: {policy.policyNumber} ({policy.id})
              </p>
              <div className="flex items-center gap-2">
                <PolicyStatusBadge status={policy.status} />
              </div>
              <p>
                Couverture: {formatDate(policy.coverageStartDate ?? policy.effectiveDate)} -{" "}
                {formatDate(policy.coverageEndDate ?? policy.expiryDate)}
              </p>
              <p>Capital assure: {formatMAD(policy.totalInsuredCapital ?? policy.coverageMad)}</p>
              <Link
                href={`/fr/policies/${policy.id}`}
                className="inline-flex rounded-md border border-brand-border px-3 py-2 text-xs text-slate-100 transition-colors hover:bg-slate-900"
              >
                Ouvrir la police
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-brand-textMuted">Police non disponible.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Evidence monitoring
          </h2>
          {linkedAlert ? (
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <p>Alerte: {linkedAlert.id}</p>
              <p>Type: {getMonitoringSignalTypeLabel(linkedAlert.type ?? "SYSTEM")}</p>
              <p>Severite: {linkedAlert.severity ?? linkedAlert.level}</p>
              <p>Message: {linkedAlert.message ?? linkedAlert.title}</p>
              <p>Cree le: {formatDate(linkedAlert.createdAt)}</p>
              <Link
                href={`/fr/monitoring/${linkedAlert.id}`}
                className="inline-flex rounded-md border border-brand-border px-3 py-2 text-xs text-slate-100 transition-colors hover:bg-slate-900"
              >
                Ouvrir monitoring
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-brand-textMuted">
              Aucune alerte monitoring liee a ce signalement pour le moment.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Contexte agriculteur / demande
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <p>Agriculteur: {farmer?.fullName ?? "N/A"}</p>
            <p>Telephone: {farmer?.phone ?? "N/A"}</p>
            <p>Region: {farmer?.region ?? "N/A"}</p>
            <p>
              Culture/surface: {application?.cropType ?? "N/A"} / {application?.areaHa ?? 0} ha
            </p>
            {application ? (
              <Link
                href={`/fr/applications/${application.id}`}
                className="inline-flex rounded-md border border-brand-border px-3 py-2 text-xs text-slate-100 transition-colors hover:bg-slate-900"
              >
                Ouvrir la demande
              </Link>
            ) : null}
          </div>
        </Card>
      </div>

      <ClaimReviewChecklist items={checklistItems} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Integrite
          </h2>
          <p className="mt-3 text-sm text-slate-200">
            Le hash du dossier de suivi pourra etre ancre de maniere asynchrone.
            L&apos;ancrage Solana ne bloque pas le workflow metier.
          </p>
        </Card>

        <ClaimNextActionCard status={currentClaim.status} policyId={currentClaim.policyId} />
      </div>
    </div>
  );
}
