import { Card } from "@/components/ui/card";

export function RaxFormulaCard() {
  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        Formule framework RAX/WRS v1
      </h2>
      <p className="text-sm text-slate-100">RAX brut = Gravite x Frequence x Detection</p>
      <p className="text-sm text-slate-100">WRS = (RAX brut / 25) x 100</p>
      <p className="text-xs text-brand-textMuted">
        Framework v1 a calibrer avec les donnees reelles de sinistralite de l&apos;assureur.
      </p>
    </Card>
  );
}
