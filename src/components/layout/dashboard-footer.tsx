export function DashboardFooter() {
  const sharedLive = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  const insuranceLive = process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";

  return (
    <footer className="flex items-center gap-3 border-t border-slate-400/10 bg-[#070b17]/40 px-[30px] py-5">
      <div className="flex items-center gap-2.5">
        <div
          className="h-6 w-6 flex-none rounded-[7px]"
          style={{
            background: "conic-gradient(from 210deg, #22D3EE, #34D399, #8B5CF6)",
          }}
        />
        <span className="text-[12.5px] text-slate-400">Wakama Assurance</span>
      </div>

      <div className="ml-auto font-mono text-[11px] text-[#5B6B86]">
        <span className={sharedLive ? "font-medium text-emerald-400" : "font-medium text-amber-400"}>
          Shared data {sharedLive ? "LIVE" : "SEED_DEMO"}
        </span>
        {" · "}
        Workflows assurance{" "}
        <span className={insuranceLive ? "text-emerald-400" : "text-amber-400"}>
          {insuranceLive ? "LIVE" : "SEED_DEMO"}
        </span>
        {" · "}
        © 2026 Wakama Edge Ventures Inc.
      </div>
    </footer>
  );
}
