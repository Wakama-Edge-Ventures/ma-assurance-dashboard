import { DataSource } from "@/types";

interface SourceBadgeProps {
  source: DataSource;
}

const BADGE_STYLES: Record<DataSource, string> = {
  LIVE: "bg-wk-liveSoft text-wk-liveInk",
  SEED_DEMO: "bg-wk-violetSoft text-wk-violetInk",
  MANUAL_ESTIMATE: "bg-wk-tealSoft text-wk-tealInk",
  EXCEL_IMPORT: "bg-wk-tealSoft text-wk-tealInk",
  UNAVAILABLE: "bg-wk-coralSoft text-wk-coralInk",
  DEGRADED: "bg-wk-amberSoft text-wk-amberInk",
  MANUAL_ENTRY: "bg-wk-surface3 text-wk-muted",
};

const DOT_STYLES: Record<DataSource, string> = {
  LIVE: "bg-wk-live",
  SEED_DEMO: "bg-wk-violet",
  MANUAL_ESTIMATE: "bg-wk-teal",
  EXCEL_IMPORT: "bg-wk-teal",
  UNAVAILABLE: "bg-wk-coral",
  DEGRADED: "bg-wk-amber",
  MANUAL_ENTRY: "bg-wk-faint",
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
  const showPulse = source === "LIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold ${BADGE_STYLES[source]}`}
    >
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${DOT_STYLES[source]} ${showPulse ? "oracle-live-dot" : ""}`} />
      {BADGE_LABELS[source]}
    </span>
  );
}
