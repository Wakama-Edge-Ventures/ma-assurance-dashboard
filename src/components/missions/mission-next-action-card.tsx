import Link from "next/link";

import { Card } from "@/components/ui/card";
import { InsuranceMission } from "@/types";

interface MissionNextActionCardProps {
  mission: InsuranceMission;
}

function nextAction(mission: InsuranceMission) {
  if (mission.status === "CONFIG_PENDING") {
    return { label: "Retour a la configuration mission", href: "/fr/missions" };
  }
  if (mission.status === "SENT" || mission.status === "IN_PROGRESS" || mission.status === "PLANNED") {
    return { label: "Suivre la mission", href: "/fr/missions" };
  }
  if (mission.status === "AUDIT_COMPLETE" || mission.status === "DONE") {
    return { label: "Passer a l'arbitrage", href: "/fr/arbitrage" };
  }
  if (mission.status === "REVIEW_COMPLETE") {
    return { label: "Consulter RAX/WRS", href: "/fr/rax" };
  }
  return { label: "Consulter la demande", href: `/fr/applications/${mission.applicationId}` };
}

export function MissionNextActionCard({ mission }: MissionNextActionCardProps) {
  const action = nextAction(mission);
  return (
    <Card>
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Prochaine action
      </h2>
      <p className="mt-2 text-[13px] text-brand-textMuted">
        Navigation rapide selon l&apos;etat operationnel de la mission.
      </p>
      <Link
        href={action.href}
        className="mt-4 inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-3.5 py-1.5 font-mono text-[12.5px] text-violet-200 transition-colors hover:bg-violet-500/24"
      >
        {action.label}
      </Link>
    </Card>
  );
}
