interface ConfidenceBadgeProps {
  confidence?: string | null;
}

function normalizeConfidence(input?: string | null): "LOW" | "MEDIUM" | "HIGH" | "N/A" {
  if (!input) return "N/A";
  const value = input.trim().toUpperCase();
  if (value === "LOW" || value === "MEDIUM" || value === "HIGH") return value;
  return "N/A";
}

const STYLES: Record<"LOW" | "MEDIUM" | "HIGH" | "N/A", string> = {
  LOW: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  MEDIUM: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  HIGH: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  "N/A": "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const value = normalizeConfidence(confidence);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-medium ${STYLES[value]}`}
    >
      {value}
    </span>
  );
}
