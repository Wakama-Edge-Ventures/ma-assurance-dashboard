import Link from "next/link";

interface PricingNextActionCardProps {
  decision: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  applicationId: string;
}

export function PricingNextActionCard({
  decision,
  applicationId,
}: PricingNextActionCardProps) {
  if (decision === "ACCEPTED") {
    return (
      <div className="space-y-3 rounded-lg border border-brand-border bg-slate-900/40 p-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine etape
        </h2>
        <p className="text-sm text-brand-textMuted">
          Accord producteur enregistre, passage vers emission potentielle par l&apos;assureur.
        </p>
        <Link
          href="/fr/policies"
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Aller aux polices
        </Link>
      </div>
    );
  }

  if (decision === "REJECTED" || decision === "EXPIRED") {
    return (
      <div className="space-y-3 rounded-lg border border-brand-border bg-slate-900/40 p-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          Prochaine etape
        </h2>
        <p className="text-sm text-brand-textMuted">
          Retour dossier recommande avant nouvelle proposition technique.
        </p>
        <Link
          href={`/fr/applications/${applicationId}`}
          className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
        >
          Revenir a la demande
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-brand-border bg-slate-900/40 p-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Prochaine etape
      </h2>
      <p className="text-sm text-brand-textMuted">
        Attente accord farmer / validation assureur.
      </p>
      <Link
        href={`/fr/applications/${applicationId}`}
        className="inline-flex rounded-md border border-brand-border px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
      >
        Suivre la demande
      </Link>
    </div>
  );
}
