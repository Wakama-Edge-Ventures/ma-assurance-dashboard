import { BlockchainVerifyForm } from "@/components/support/blockchain-verify-form";
import { AppCard } from "@/components/ui/app-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { PageTitle } from "@/components/ui/page-title";

export default function BlockchainPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle
        title="Verification blockchain"
        description="Controle d'integrite d'un document ou d'un hash d'audit, dans un cadre d'explication et de verification."
      />

      <AppCard className="space-y-3 p-5">
        <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-wk-faint">
          Role de la verification
        </h2>
        <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
          L&apos;ancrage constitue une preuve d&apos;integrite horodatee et une aide d&apos;audit. Il ne remplace ni la revue documentaire, ni la decision institutionnelle sur un dossier.
        </p>
      </AppCard>

      <AppCard className="p-5">
        <BlockchainVerifyForm />
      </AppCard>

      <DisclosureNote variant="blockchain" />
    </div>
  );
}
