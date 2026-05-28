import Link from "next/link";

import { Card } from "@/components/ui/card";
import { ApplicationStatus } from "@/types";

function getNextAction(status: ApplicationStatus) {
  if (status === "DRAFT" || status === "MFA_VERIFIED") {
    return { label: "Configurer la mission terrain", href: "/fr/missions" };
  }
  if (status === "MISSION_CONFIGURED" || status === "MISSION_SENT") {
    return { label: "Suivre la mission", href: "/fr/missions" };
  }
  if (status === "FIELD_AUDIT_COMPLETE" || status === "BACK_OFFICE_REVIEW") {
    return { label: "Passer a l'arbitrage", href: "/fr/arbitrage" };
  }
  if (status === "READY_FOR_SCORING" || status === "SCORED") {
    return { label: "Consulter RAX/WRS", href: "/fr/rax" };
  }
  if (status === "OFFER_SENT" || status === "FARMER_ACCEPTED" || status === "PRICED") {
    return { label: "Consulter la tarification", href: "/fr/pricing" };
  }
  if (
    status === "CONTRACT_SIGNED" ||
    status === "ACTIVE" ||
    status === "APPROVED_BY_INSURER"
  ) {
    return { label: "Voir la police / monitoring", href: "/fr/monitoring" };
  }
  return { label: "Consulter le dossier", href: "/fr/applications" };
}

interface ApplicationNextActionCardProps {
  status: ApplicationStatus;
}

export function ApplicationNextActionCard({ status }: ApplicationNextActionCardProps) {
  const action = getNextAction(status);
  return (
    <Card>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Prochaine action
      </h2>
      <p className="mt-2 text-sm text-brand-textMuted">
        Action operationnelle proposee selon l&apos;etat du dossier.
      </p>
      <Link
        href={action.href}
        className="mt-4 inline-block rounded-md bg-brand-violet px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        {action.label}
      </Link>
    </Card>
  );
}
