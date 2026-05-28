export function LiveApiStatusNote() {
  const isSharedLive = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  const isInsuranceLive = process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";

  const sharedLabel = isSharedLive ? "LIVE" : "SEED_DEMO";
  const insuranceLabel = isInsuranceLive ? "LIVE" : "SEED_DEMO";

  return (
    <p className="text-xs text-brand-textMuted">
      {`Donnees Wakama partagees: ${sharedLabel}. Workflows assurance: ${insuranceLabel}. Fallback demo actif si API indisponible.`}
    </p>
  );
}
