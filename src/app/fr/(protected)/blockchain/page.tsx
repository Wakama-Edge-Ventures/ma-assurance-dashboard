import { BlockchainVerifyForm } from "@/components/support/blockchain-verify-form";
import { PageTitle } from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";

export default function BlockchainPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle
        title="Vérification registre Blockchain"
        description="Contrôlez l'intégrité d'un document ou d'un hash d'audit trail ancré par Wakama."
      />

      <div className="rounded-[20px] border border-violet-400/15 bg-violet-500/5 px-5 py-4">
        <p className="font-mono text-[11.5px] text-violet-300/80">
          L&apos;ancrage Solana est asynchrone et non bloquant pour le workflow métier.
          Wakama produit une preuve d&apos;intégrité horodatée ; la vérification on-chain est
          complémentaire et destinée à l&apos;audit interne et aux réassureurs.
        </p>
      </div>

      <BlockchainVerifyForm />

      <Card>
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
          Comment ça fonctionne
        </h2>
        <ol className="mt-3 space-y-2 text-[13px] text-slate-300">
          <li className="flex gap-2">
            <span className="font-mono text-[11px] text-violet-400">01.</span>
            Wakama génère un hash SHA-256 de chaque audit terrain complété.
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-[11px] text-violet-400">02.</span>
            Le hash est horodaté et ancré de manière asynchrone sur la blockchain Solana.
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-[11px] text-violet-400">03.</span>
            Saisissez le hash ci-dessus pour vérifier son authenticité et son horodatage.
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-[11px] text-violet-400">04.</span>
            La vérification est non décisionnelle — l&apos;assureur reste seul décideur.
          </li>
        </ol>
      </Card>
    </div>
  );
}
