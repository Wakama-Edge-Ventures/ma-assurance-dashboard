import { DashboardSection } from "@/components/shared/dashboard-section";
import { raxEvaluations } from "@/lib/demo-data";

export default function RaxPage() {
  const avgWrs =
    raxEvaluations.reduce((sum, item) => sum + item.wrsScore, 0) /
    Math.max(raxEvaluations.length, 1);
  const avgRax =
    raxEvaluations.reduce((sum, item) => sum + item.raxScore, 0) /
    Math.max(raxEvaluations.length, 1);

  return (
    <DashboardSection
      title="RAX / WRS"
      description="Cadre v1 de calibration technique pour recommandation non decisionnelle."
      kpis={[
        { title: "Evaluations", value: String(raxEvaluations.length), source: "SEED_DEMO" },
        { title: "WRS moyen", value: avgWrs.toFixed(1), source: "SEED_DEMO" },
        { title: "RAX moyen", value: avgRax.toFixed(1), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Calibration des coefficients avec historique assureur.",
        "Versioning des modeles et hypotheses.",
        "Comparatif recommandations vs decision finale assureur.",
      ]}
    />
  );
}
