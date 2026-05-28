import { DashboardSection } from "@/components/shared/dashboard-section";
import { getInsurancePolicies } from "@/lib/insurance-service";
import { formatCurrencyMad } from "@/lib/utils";

export default async function PoliciesPage() {
  const policies = await getInsurancePolicies();
  const active = policies.filter((item) => item.status === "ACTIVE").length;
  const coverage = policies.reduce((sum, item) => sum + item.coverageMad, 0);

  return (
    <DashboardSection
      title="Policies"
      description="Suivi des polices emises et detenues par les assureurs partenaires."
      kpis={[
        { title: "Polices", value: String(policies.length), source: "SEED_DEMO" },
        { title: "Actives", value: String(active), source: "SEED_DEMO" },
        { title: "Couverture totale", value: formatCurrencyMad(coverage), source: "SEED_DEMO" },
      ]}
      nextItems={[
        "Synchronisation d'etat policier depuis assureur.",
        "Rapprochement primes attendues / payees.",
        "Archivage des avenants et versions contractuelles.",
      ]}
    />
  );
}
