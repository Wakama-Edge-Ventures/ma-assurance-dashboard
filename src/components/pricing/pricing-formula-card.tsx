import { Card } from "@/components/ui/card";

export function PricingFormulaCard() {
  return (
    <Card className="space-y-3">
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Formule de lecture
      </h2>
      <p className="text-[13px] text-slate-200">
        Prime TTC = Prime pure + Frais de gestion + Taxes
      </p>
      <p className="text-xs text-brand-textMuted">
        Les parametres commerciaux, taxes, exclusions et conditions finales restent sous
        controle de l&apos;assureur.
      </p>
    </Card>
  );
}
