import { Card } from "@/components/ui/card";
import { InsuranceFieldAudit, InsuranceMission } from "@/types";

interface MissionConfigSummaryProps {
  mission: InsuranceMission;
  linkedAudit?: InsuranceFieldAudit | null;
}

export function MissionConfigSummary({
  mission,
  linkedAudit,
}: MissionConfigSummaryProps) {
  const modules = [
    "Verification identite / KYC",
    "Mesure polygone GPS",
    "Audit actifs physiques",
    "Capteurs IoT (si disponibles)",
    "Drone / imagerie (si disponibles)",
  ];

  const threshold = linkedAudit ? Math.abs(linkedAudit.areaDeltaPercent) : 5;

  return (
    <Card>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        Configuration mission
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        {modules.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-brand-textMuted">
        Type mission: {mission.missionType}. Seuil max ecart surface: {threshold.toFixed(1)}%.
      </p>
    </Card>
  );
}
