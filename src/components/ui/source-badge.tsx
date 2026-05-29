import { DataSource } from "@/types";

interface SourceBadgeProps {
  source: DataSource;
}

const BADGE_STYLES: Record<DataSource, string> = {
  LIVE:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  SEED_DEMO:
    "border-amber-400/30 bg-amber-400/10 text-amber-400",
  MANUAL_ESTIMATE:
    "border-sky-400/30 bg-sky-400/10 text-sky-300",
  EXCEL_IMPORT:
    "border-blue-400/30 bg-blue-400/10 text-blue-300",
  UNAVAILABLE:
    "border-rose-400/30 bg-rose-400/10 text-rose-300",
  DEGRADED:
    "border-orange-400/30 bg-orange-400/10 text-orange-300",
  MANUAL_ENTRY:
    "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
};

const BADGE_LABELS: Record<DataSource, string> = {
  LIVE: "LIVE",
  SEED_DEMO: "SEED_DEMO",
  MANUAL_ESTIMATE: "MANUAL_ESTIMATE",
  EXCEL_IMPORT: "EXCEL_IMPORT",
  UNAVAILABLE: "UNAVAILABLE",
  DEGRADED: "DEGRADED",
  MANUAL_ENTRY: "MANUAL_ENTRY",
};

export function SourceBadge({ source }: SourceBadgeProps) {
  const showDot = source === "LIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-medium ${BADGE_STYLES[source]}`}
    >
      {showDot ? (
        <span className="oracle-live-dot h-1.5 w-1.5 flex-none rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]" />
      ) : null}
      {BADGE_LABELS[source]}
    </span>
  );
}
