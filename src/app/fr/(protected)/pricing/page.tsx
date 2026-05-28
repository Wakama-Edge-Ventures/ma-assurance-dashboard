import { DashboardSection } from "@/components/shared/dashboard-section";
import { getCommercialOffers } from "@/lib/insurance-service";
import { formatMAD } from "@/lib/workflow";

export default async function PricingPage() {
  const pricingOffers = await getCommercialOffers();
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
          value: formatMAD(technicalTotal),
          source: "SEED_DEMO",
        },
        {
          title: "Prime suggeree totale",
          value: formatMAD(commercialTotal),
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
