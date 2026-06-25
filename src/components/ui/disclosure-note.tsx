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
    <p className={`rounded-xl bg-wk-surface2 px-3 py-2 text-xs font-medium leading-relaxed text-wk-muted ${className ?? ""}`}>
      {message}
    </p>
  );
}
