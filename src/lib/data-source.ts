import { DataSource } from "@/types";

const VALID_SOURCES = new Set<DataSource>([
  "LIVE",
  "SEED_DEMO",
  "MANUAL_ESTIMATE",
  "EXCEL_IMPORT",
  "UNAVAILABLE",
  "DEGRADED",
  "MANUAL_ENTRY",
]);

export function normalizeSource(
  value: unknown,
  fallback: DataSource = "SEED_DEMO",
): DataSource {
  if (typeof value === "string" && VALID_SOURCES.has(value as DataSource)) {
    return value as DataSource;
  }
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
