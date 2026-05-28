export function LiveApiStatusNote() {
  const isLive = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  return (
    <p className="text-xs text-brand-textMuted">
      {isLive
        ? "Mode API live active - fallback demo si indisponible."
        : "Mode demo - donnees SEED_DEMO."}
    </p>
  );
}
