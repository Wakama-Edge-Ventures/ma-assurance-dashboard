import { ClipboardCheck, HardDriveUpload, Radar, Settings2, ShieldCheck } from "lucide-react";

import { MissionsLivePanel } from "@/components/insurance/missions-live-panel";
import { MissionsTable } from "@/components/missions/missions-table";
import { AppSection } from "@/components/ui/app-section";
import { PageTitle } from "@/components/ui/page-title";
import { StatCard } from "@/components/ui/stat-card";
import {
  getFarmers,
  getInsuranceApplications,
  getInsuranceFieldAudits,
  getInsuranceMissions,
} from "@/lib/insurance-service";
import { getMissionStatusLabel } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function MissionsPage() {
  const [missions, applications, farmers, audits] = await Promise.all([
    getInsuranceMissions(),
    getInsuranceApplications(),
    getFarmers(),
    getInsuranceFieldAudits(),
  ]);

  const farmerById = new Map(farmers.map((farmer) => [farmer.id, farmer]));
  const applicationById = new Map(applications.map((application) => [application.id, application]));

  const rows = missions.map((mission) => {
    const application = applicationById.get(mission.applicationId);
    const farmer = application ? farmerById.get(application.farmerId) : null;
    return {
      ...mission,
      applicationReference: application?.reference ?? mission.applicationId,
      farmerName: farmer?.fullName ?? "Agriculteur N/A",
      modules: "KYC, GPS, actifs, sync",
    };
  });

  const total = missions.length;
  const toConfigure = missions.filter(
    (mission) => mission.status === "CONFIG_PENDING" || mission.status === "PLANNED",
  ).length;
  const inProgress = missions.filter(
    (mission) => mission.status === "SENT" || mission.status === "IN_PROGRESS",
  ).length;
  const doneAudits = audits.filter((audit) => audit.status === "COMPLETED").length;
  const demoCount = missions.filter((mission) => mission.source === "SEED_DEMO").length;

  const distribution = missions.reduce<Record<string, number>>((acc, mission) => {
    acc[mission.status] = (acc[mission.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageTitle
        title="Missions terrain"
        description="Configuration, assignation et suivi des missions de verification agricole."
      />
      <p className="text-xs text-brand-textMuted">
        La mission produit des preuves verifiables ; l&apos;assureur conserve l&apos;arbitrage et
        la decision finale.
      </p>

      <MissionsLivePanel />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total missions" value={String(total)} source="SEED_DEMO" icon={Radar} />
        <StatCard
          title="Missions a configurer"
          value={String(toConfigure)}
          source="SEED_DEMO"
          icon={Settings2}
        />
        <StatCard
          title="Missions en cours"
          value={String(inProgress)}
          source="SEED_DEMO"
          icon={HardDriveUpload}
        />
        <StatCard
          title="Audits termines"
          value={String(doneAudits)}
          source="SEED_DEMO"
          icon={ShieldCheck}
        />
        <StatCard
          title="Mode demo"
          value={String(demoCount)}
          source="SEED_DEMO"
          icon={ClipboardCheck}
        />
      </div>

      <AppSection title="Distribution des statuts mission">
        <div className="flex flex-wrap gap-2">
          {Object.entries(distribution).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full border border-slate-400/10 bg-slate-800/60 px-3 py-1 font-mono text-[11px] text-slate-400"
            >
              {getMissionStatusLabel(status as (typeof missions)[number]["status"])}: {count}
            </span>
          ))}
        </div>
      </AppSection>

      <MissionsTable rows={rows} />
    </div>
  );
}
