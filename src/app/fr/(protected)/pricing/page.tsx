import { DashboardSection } from "@/components/shared/dashboard-section";
import { pricingOffers } from "@/lib/demo-data";
import { formatCurrencyMad } from "@/lib/utils";

export default function PricingPage() {
  const technicalTotal = pricingOffers.reduce(
    (sum, item) => sum + item.technicalPremiumMad,
    0,
  );
  const commercialTotal = pricingOffers.reduce(
    (sum, item) => sum + item.suggestedCommercialPremiumMad,
    0,
  );

  return (
    <DashboardSection
      title="Pricing"
      description="Estimation technique Wakama avant validation commerciale par assureur."
      kpis={[
        { title: "Offres preparees", value: String(pricingOffers.length), source: "SEED_DEMO" },
        {
          title: "Prime technique totale",
          value: formatCurrencyMad(technicalTotal),
          source: "SEED_DEMO",
        },
        {
          title: "Prime suggeree totale",
          value: formatCurrencyMad(commercialTotal),
          source: "SEED_DEMO",
        },
      ]}
      nextItems={[
        "Simulation de franchises et plafonds par produit.",
        "Scenario stress climatique et sensibilites.",
        "Trajectoire prix technique vs prix commercial valide.",
      ]}
    />
  );
}
