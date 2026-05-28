import { FileCheck2, FileText, Scale, ShieldCheck, Waves } from "lucide-react";

import { ApplicationsTable } from "@/components/applications/applications-table";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getFarmers,
  getInsuranceApplications,
  getInsurancePolicies,
  getRaxEvaluations,
} from "@/lib/insurance-service";

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
        title="Demandes d’assurance"
        description="Pipeline des demandes agricoles, de la saisie initiale jusqu’a l’offre et au contrat."
      />
      <p className="text-xs text-brand-textMuted">
        Wakama prepare le dossier et les preuves ; l&apos;assureur conserve la decision
        finale.
      </p>

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

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Distribution des statuts
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(statusDistribution).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full border border-brand-border bg-slate-900 px-3 py-1 text-xs text-brand-textMuted"
            >
              {status}: {count}
            </span>
          ))}
        </div>
      </Card>

      <ApplicationsTable rows={rows} />
    </div>
  );
}
