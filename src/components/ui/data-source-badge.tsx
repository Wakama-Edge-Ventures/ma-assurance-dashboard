import { DataSource } from "@/types";

interface DataSourceBadgeProps {
  source: DataSource;
}

export function DataSourceBadge({ source }: DataSourceBadgeProps) {
  if (source === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10.5px] font-medium text-emerald-400">
        <span className="oracle-live-dot h-1.5 w-1.5 flex-none rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]" />
        LIVE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/8 px-2 py-0.5 font-mono text-[10.5px] font-medium text-amber-400">
      SEED_DEMO
    </span>
  );
}
