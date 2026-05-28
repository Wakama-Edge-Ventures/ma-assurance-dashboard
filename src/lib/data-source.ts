import { DataSource } from "@/types";

export function normalizeSource(
  value: unknown,
  fallback: DataSource = "SEED_DEMO",
): DataSource {
  if (value === "LIVE" || value === "SEED_DEMO") return value;
  return fallback;
}

export function isSeedDemo(value: { source?: DataSource }): boolean {
  return normalizeSource(value.source, "SEED_DEMO") === "SEED_DEMO";
}

export function withSource<T extends object>(
  item: T,
  fallback: DataSource,
): T & { source: DataSource } {
  const source =
    "source" in item
      ? normalizeSource((item as { source?: unknown }).source, fallback)
      : fallback;
  return { ...item, source };
}

export function markSeedDemo<T extends object>(item: T): T & { source: "SEED_DEMO" } {
  return { ...item, source: "SEED_DEMO" };
}
