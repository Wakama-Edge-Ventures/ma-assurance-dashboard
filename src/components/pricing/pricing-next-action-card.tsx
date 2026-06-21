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
      <div className="space-y-3 rounded-[20px] border border-slate-400/10 bg-[#101726]/92 p-[18px_20px_20px]">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine etape
        </h2>
        <p className="text-[13px] text-brand-textMuted">
          Accord producteur enregistre, passage vers emission potentielle par l&apos;assureur.
        </p>
        <Link
          href="/fr/policies"
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Aller aux polices
        </Link>
      </div>
    );
  }

  if (decision === "REJECTED" || decision === "EXPIRED") {
    return (
      <div className="space-y-3 rounded-[20px] border border-slate-400/10 bg-[#101726]/92 p-[18px_20px_20px]">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Prochaine etape
        </h2>
        <p className="text-[13px] text-brand-textMuted">
          Retour dossier recommande avant nouvelle proposition technique.
        </p>
        <Link
          href={`/fr/applications/${applicationId}`}
          className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Revenir a la demande
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[20px] border border-slate-400/10 bg-[#101726]/92 p-[18px_20px_20px]">
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Prochaine etape
      </h2>
      <p className="text-[13px] text-brand-textMuted">
        Attente accord farmer / validation assureur.
      </p>
      <Link
        href={`/fr/applications/${applicationId}`}
        className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
      >
        Suivre la demande
      </Link>
    </div>
  );
}
