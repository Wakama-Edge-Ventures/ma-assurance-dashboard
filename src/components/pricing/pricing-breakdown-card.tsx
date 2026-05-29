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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        Breakdown tarification
      </h2>
      <div className="mt-3 grid gap-3 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-2">
        <p>Capital assure total: {formatMAD(totalInsuredCapital)}</p>
        <p>Prime pure: {formatMAD(purePremiumAmount)}</p>
        <p>Frais de gestion: {formatMAD(managementFees)}</p>
        <p>Taux taxes: {formatPercent(taxRateApplied * 100)}</p>
        <p>Montant taxes: {formatMAD(taxAmount)}</p>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          Prime commerciale TTC: {formatMAD(totalCommercialPremiumTtc)}
        </p>
      </div>
    </Card>
  );
}
