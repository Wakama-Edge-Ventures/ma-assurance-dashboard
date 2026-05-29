import { Card } from "@/components/ui/card";

export function RaxFormulaCard() {
  return (
    <Card className="space-y-3">
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        Formule framework RAX/WRS v1
      </h2>
      <p className="text-[13px] text-slate-200">RAX brut = Gravite x Frequence x Detection</p>
      <p className="text-[13px] text-slate-200">WRS = (RAX brut / 25) x 100</p>
      <p className="text-xs text-brand-textMuted">
        Framework v1 a calibrer avec les donnees reelles de sinistralite de l&apos;assureur.
      </p>
    </Card>
  );
}
