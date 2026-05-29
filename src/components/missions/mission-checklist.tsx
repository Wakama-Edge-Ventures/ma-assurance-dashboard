import { Card } from "@/components/ui/card";
import { InsuranceFieldAudit, InsuranceMission } from "@/types";

interface MissionChecklistProps {
  mission: InsuranceMission;
  linkedAudit?: InsuranceFieldAudit | null;
}

type ItemState = "done" | "pending" | "future";

function itemClass(state: ItemState) {
  if (state === "done") return "text-green-300";
  if (state === "pending") return "text-orange-300";
  return "text-brand-textMuted";
}

export function MissionChecklist({ mission, linkedAudit }: MissionChecklistProps) {
  const hasAudit = Boolean(linkedAudit);
  const inProgress = mission.status === "IN_PROGRESS" || mission.status === "SENT";
  const reviewDone = mission.status === "REVIEW_COMPLETE" || mission.status === "DONE";

  const rows: Array<{ label: string; state: ItemState }> = [
    { label: "Identite / KYC", state: inProgress || hasAudit ? "done" : "pending" },
    { label: "Polygone GPS", state: hasAudit ? "done" : inProgress ? "pending" : "future" },
    { label: "Surface mesuree", state: hasAudit ? "done" : inProgress ? "pending" : "future" },
    { label: "Photos / preuves terrain", state: hasAudit ? "done" : "pending" },
    { label: "Hash d'integrite", state: hasAudit ? "done" : "future" },
    { label: "Synchronisation", state: hasAudit ? "done" : "future" },
    { label: "Revue back-office", state: reviewDone ? "done" : hasAudit ? "pending" : "future" },
  ];

  return (
    <Card>
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Checklist operationnelle
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.label} className={itemClass(row.state)}>
            - {row.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
