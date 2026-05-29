import { Card } from "@/components/ui/card";

export function PricingFormulaCard() {
  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        Formule de lecture
      </h2>
      <p className="text-sm text-slate-900 dark:text-slate-100">
        Prime TTC = Prime pure + Frais de gestion + Taxes
      </p>
      <p className="text-xs text-brand-textMuted">
        Les parametres commerciaux, taxes, exclusions et conditions finales restent sous
        controle de l&apos;assureur.
      </p>
    </Card>
  );
}
