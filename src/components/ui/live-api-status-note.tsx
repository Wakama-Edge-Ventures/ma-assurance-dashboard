export function LiveApiStatusNote() {
  const isLive = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  const isInsuranceLive = process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";
  return (
    <p className="text-xs text-brand-textMuted">
      {isLive
        ? `Mode API live active - fallback demo si indisponible. Le token demo local n'est pas envoye au backend.${isInsuranceLive ? " Endpoints assurance live actives." : " Endpoints assurance en SEED_DEMO."}`
        : "Mode demo - donnees SEED_DEMO."}
    </p>
  );
}
