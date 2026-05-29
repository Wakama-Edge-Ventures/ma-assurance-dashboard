import { FileCheck2, FileText, Scale, ShieldCheck, Waves } from "lucide-react";

import { ApplicationsLivePanel } from "@/components/insurance/applications-live-panel";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { AppSection } from "@/components/ui/app-section";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getFarmers,
  getInsuranceApplications,
  getInsurancePolicies,
  getRaxEvaluations,
} from "@/lib/insurance-service";
import { getApplicationStatusLabel } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const [applications, farmers, raxEvaluations, policies] = await Promise.all([
    getInsuranceApplications(),
    getFarmers(),
    getRaxEvaluations(),
    getInsurancePolicies(),
  ]);

  const farmerById = new Map(farmers.map((farmer) => [farmer.id, farmer]));
  const wrsByApplicationId = new Map(
    raxEvaluations.map((evaluation) => [evaluation.applicationId, evaluation.wrsScore]),
  );

  const rows = applications.map((application) => ({
    ...application,
    farmerName: farmerById.get(application.farmerId)?.fullName ?? "Agriculteur N/A",
    region: farmerById.get(application.farmerId)?.region,
    wrsScore: wrsByApplicationId.get(application.id),
  }));

  const inReview = applications.filter((item) =>
    ["SUBMITTED", "UNDER_REVIEW", "BACK_OFFICE_REVIEW"].includes(item.status),
  ).length;
  const offersIssued = applications.filter((item) =>
    ["PRICED", "OFFER_SENT", "FARMER_ACCEPTED"].includes(item.status),
  ).length;
  const signedContracts = policies.filter((item) => item.status === "ACTIVE").length;
  const wrsAverage =
    raxEvaluations.reduce((sum, item) => sum + item.wrsScore, 0) /
    Math.max(raxEvaluations.length, 1);

  const statusDistribution = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageTitle
        title="Demandes d'assurance"
        description="Pipeline des demandes agricoles, de la saisie initiale jusqu'a l'offre et au contrat."
      />
      <p className="text-xs text-brand-textMuted">
        Wakama prepare le dossier et les preuves ; l&apos;assureur conserve la decision
        finale.
      </p>

      <ApplicationsLivePanel />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total demandes"
          value={String(applications.length)}
          source="SEED_DEMO"
          icon={FileText}
        />
        <StatCard
          title="En revue / back-office"
          value={String(inReview)}
          source="SEED_DEMO"
          icon={Scale}
        />
        <StatCard
          title="Offres emises"
          value={String(offersIssued)}
          source="SEED_DEMO"
          icon={FileCheck2}
        />
        <StatCard
          title="Polices actives"
          value={String(signedContracts)}
          source="SEED_DEMO"
          icon={ShieldCheck}
        />
        <StatCard
          title="WRS moyen"
          value={wrsAverage.toFixed(1)}
          source="SEED_DEMO"
          icon={Waves}
        />
      </div>

      <AppSection title="Distribution des statuts">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusDistribution).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full border border-slate-400/10 bg-slate-800/60 px-3 py-1 font-mono text-[11px] text-slate-400"
            >
              {getApplicationStatusLabel(status as (typeof applications)[number]["status"])}:{" "}
              {count}
            </span>
          ))}
        </div>
      </AppSection>

      <ApplicationsTable rows={rows} />
    </div>
  );
}
