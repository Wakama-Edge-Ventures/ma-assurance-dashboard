type DisclosureVariant = "general" | "blockchain";

interface DisclosureNoteProps {
  variant?: DisclosureVariant;
  className?: string;
}

const MESSAGES: Record<DisclosureVariant, string> = {
  general:
    "Wakama fournit une structuration technique du risque. L’assureur reste seul décisionnaire pour l’éligibilité, la tarification commerciale, l’émission de police et l’indemnisation.",
  blockchain:
    "L’ancrage blockchain constitue une preuve d’intégrité horodatée. Il ne remplace pas la décision réglementaire ou contractuelle de l’assureur.",
};

export function DisclosureNote({ variant = "general", className }: DisclosureNoteProps) {
  return (
    <p
      className={`rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-xs leading-relaxed text-slate-300 ${className ?? ""}`}
    >
      {MESSAGES[variant]}
    </p>
  );
}
