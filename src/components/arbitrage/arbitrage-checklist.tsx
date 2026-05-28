import { Card } from "@/components/ui/card";
import { getAreaDeltaSeverity } from "@/lib/workflow";
import { InsuranceFieldAudit } from "@/types";

type State = "done" | "warning" | "pending";

function stateClass(state: State) {
  if (state === "done") return "text-green-300";
  if (state === "warning") return "text-orange-300";
  return "text-brand-textMuted";
}

interface ArbitrageChecklistProps {
  audit: InsuranceFieldAudit;
}

export function ArbitrageChecklist({ audit }: ArbitrageChecklistProps) {
  const severity = getAreaDeltaSeverity(audit.areaDeltaPercent);
  const rows: Array<{ label: string; state: State }> = [
    { label: "Signature agent / source audit", state: "done" },
    {
      label: "Coherence surface",
      state: severity === "CRITICAL" ? "warning" : "done",
    },
    {
      label: "Actifs physiques",
      state: audit.assetsRejectedCount > 0 ? "warning" : "done",
    },
    { label: "Hash d'integrite", state: audit.integrityHash ? "done" : "pending" },
    {
      label: "Donnees pretes pour RAX/WRS",
      state: severity === "CRITICAL" ? "pending" : "done",
    },
  ];

  return (
    <Card>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Checklist de revue
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.label} className={stateClass(row.state)}>
            - {row.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
