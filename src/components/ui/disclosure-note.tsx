"use client";

import { useTenant } from "@/components/tenant/useTenant";

type DisclosureVariant = "general" | "blockchain";

interface DisclosureNoteProps {
  variant?: DisclosureVariant;
  className?: string;
}

export function DisclosureNote({ variant = "general", className }: DisclosureNoteProps) {
  const { tenant } = useTenant();

  const message =
    variant === "blockchain"
      ? "L'ancrage blockchain constitue une preuve d'integrite horodatee. Il ne remplace pas la decision reglementaire ou contractuelle de l'institution."
      : tenant.demoMode
        ? `Demo institutionnelle - maquette d'illustration. Les donnees et decisions restent sous controle de l'institution. ${tenant.terminology.decisionDisclaimer}`
        : tenant.terminology.decisionDisclaimer;

  return (
    <p
      className={`rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-xs leading-relaxed text-slate-300 ${className ?? ""}`}
    >
      {message}
    </p>
  );
}
