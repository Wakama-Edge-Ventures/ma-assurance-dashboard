import { CheckCheck, CircleAlert, Fingerprint, FolderSearch2, ScanSearch } from "lucide-react";

import { ArbitrageTable } from "@/components/arbitrage/arbitrage-table";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getFarmers,
  getInsuranceApplications,
  getInsuranceFieldAudits,
  getInsuranceMissions,
} from "@/lib/insurance-service";
import { getAreaDeltaSeverity } from "@/lib/workflow";

export default async function ArbitragePage() {
  const [audits, applications, missions, farmers] = await Promise.all([
    getInsuranceFieldAudits(),
    getInsuranceApplications(),
    getInsuranceMissions(),
    getFarmers(),
  ]);

  const applicationById = new Map(applications.map((application) => [application.id, application]));
  const farmerById = new Map(farmers.map((farmer) => [farmer.id, farmer]));

  const rows = audits.map((audit) => {
    const application = applicationById.get(audit.applicationId);
    const farmer = farmerById.get(audit.farmerId);
    return {
      ...audit,
      applicationReference: application?.reference ?? audit.applicationId,
      farmerName: farmer?.fullName ?? "Agriculteur N/A",
    };
  });

  const toReview = audits.filter((audit) => audit.status !== "COMPLETED").length;
  const critical = audits.filter(
    (audit) => getAreaDeltaSeverity(audit.areaDeltaPercent) === "CRITICAL",
  ).length;
  const rejectedAssets = audits.reduce((sum, audit) => sum + audit.assetsRejectedCount, 0);
  const withHash = audits.filter((audit) => Boolean(audit.integrityHash)).length;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Arbitrage back-office"
        description="Revue des audits terrain, ecarts de surface, actifs declares et preuves d'integrite."
      />
      <p className="text-xs text-brand-textMuted">
        Wakama structure les preuves ; l&apos;assureur conserve la validation et la decision
        finale.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Audits synchronises"
          value={String(audits.length)}
          source="SEED_DEMO"
          icon={ScanSearch}
        />
        <StatCard
          title="Dossiers a revoir"
          value={String(toReview)}
          source="SEED_DEMO"
          icon={FolderSearch2}
        />
        <StatCard
          title="Ecarts surface critiques"
          value={String(critical)}
          source="SEED_DEMO"
          icon={CircleAlert}
        />
        <StatCard
          title="Actifs rejetes"
          value={String(rejectedAssets)}
          source="SEED_DEMO"
          icon={CheckCheck}
        />
        <StatCard
          title="Hashs disponibles"
          value={`${withHash}/${audits.length}`}
          source="SEED_DEMO"
          icon={Fingerprint}
        />
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Statuts missions liees
        </h2>
        <p className="mt-2 text-xs text-brand-textMuted">
          {missions.length} missions reliees au pipeline d&apos;arbitrage.
        </p>
      </Card>

      <ArbitrageTable rows={rows} />
    </div>
  );
}
