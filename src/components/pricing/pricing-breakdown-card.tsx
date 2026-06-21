import { Card } from "@/components/ui/card";
import { formatMAD, formatPercent } from "@/lib/workflow";

interface PricingBreakdownCardProps {
  totalInsuredCapital: number;
  purePremiumAmount: number;
  managementFees: number;
  taxRateApplied: number;
  taxAmount: number;
  totalCommercialPremiumTtc: number;
}

export function PricingBreakdownCard({
  totalInsuredCapital,
  purePremiumAmount,
  managementFees,
  taxRateApplied,
  taxAmount,
  totalCommercialPremiumTtc,
}: PricingBreakdownCardProps) {
  return (
    <Card>
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Breakdown tarification
      </h2>
      <div className="mt-3 grid gap-3 text-[13px] text-slate-300 md:grid-cols-2">
        <p>Capital assure total: {formatMAD(totalInsuredCapital)}</p>
        <p>Prime pure: {formatMAD(purePremiumAmount)}</p>
        <p>Frais de gestion: {formatMAD(managementFees)}</p>
        <p>Taux taxes: {formatPercent(taxRateApplied * 100)}</p>
        <p>Montant taxes: {formatMAD(taxAmount)}</p>
        <p className="font-semibold text-white">
          Prime commerciale TTC: {formatMAD(totalCommercialPremiumTtc)}
        </p>
      </div>
    </Card>
  );
}
