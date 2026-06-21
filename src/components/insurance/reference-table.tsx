"use client";

import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { SourceBadge } from "@/components/ui/source-badge";
import { DataSource } from "@/types";

interface ReferenceTableProps {
  title: string;
  rows: Array<Record<string, unknown>>;
  maxRows?: number;
}

function toSource(value: unknown): DataSource {
  if (
    value === "LIVE" ||
    value === "SEED_DEMO" ||
    value === "MANUAL_ESTIMATE" ||
    value === "EXCEL_IMPORT" ||
    value === "UNAVAILABLE" ||
    value === "DEGRADED" ||
    value === "MANUAL_ENTRY"
  ) {
    return value;
  }
  return "LIVE";
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function getByKeys(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = asString(row[key]);
    if (value) return value;
  }
  return null;
}

function summarizeDisclosure(input: string | null): string | null {
  if (!input) return null;
  if (input.length <= 120) return input;
  return `${input.slice(0, 117)}...`;
}

function toConfidence(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim().toUpperCase();
}

interface NormalizedReferenceRow {
  label: string;
  code: string;
  category: string;
  source: DataSource;
  confidence: string | null;
  disclosure: string | null;
}

function normalizeRow(row: Record<string, unknown>): NormalizedReferenceRow {
  const label =
    getByKeys(row, ["labelFr", "label", "name", "title", "threatLabel", "vulnerabilityLabel"]) ??
    "N/A";
  const code = getByKeys(row, ["code", "id", "slug", "key", "referenceCode"]) ?? "N/A";
  const category = getByKeys(row, ["category", "type", "group", "segment", "riskType"]) ?? "N/A";
  const confidence = toConfidence(
    row.confidence ?? row.hydroConfidence ?? row.qualityConfidence ?? row.scoreConfidence,
  );
  const disclosure = summarizeDisclosure(
    getByKeys(row, ["disclosure", "sourceDisclosure", "note", "description", "warning"]),
  );

  return {
    label,
    code,
    category,
    source: toSource(row.source),
    confidence,
    disclosure,
  };
}

export function ReferenceTable({ title, rows, maxRows = 6 }: ReferenceTableProps) {
  const visibleRows = rows.slice(0, maxRows).map((row) => normalizeRow(row));

  return (
    <div className="rounded-2xl border border-slate-400/10 bg-[#101726]/92 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
          {title}
        </h3>
        <span className="font-mono text-[11px] text-slate-500">{rows.length} lignes</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-400">Aucune donnée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-400/10 text-slate-500">
                <th className="px-2 py-2 font-mono uppercase tracking-[0.06em]">labelFr</th>
                <th className="px-2 py-2 font-mono uppercase tracking-[0.06em]">code</th>
                <th className="px-2 py-2 font-mono uppercase tracking-[0.06em]">category</th>
                <th className="px-2 py-2 font-mono uppercase tracking-[0.06em]">source</th>
                <th className="px-2 py-2 font-mono uppercase tracking-[0.06em]">confidence</th>
                <th className="px-2 py-2 font-mono uppercase tracking-[0.06em]">disclosure</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-b border-slate-400/6 last:border-0">
                  <td className="px-2 py-2">{row.label}</td>
                  <td className="px-2 py-2 font-mono text-[11px] text-slate-300">{row.code}</td>
                  <td className="px-2 py-2">{row.category}</td>
                  <td className="px-2 py-2">
                    <SourceBadge source={row.source} />
                  </td>
                  <td className="px-2 py-2">
                    <ConfidenceBadge confidence={row.confidence} />
                  </td>
                  <td className="px-2 py-2 text-slate-400">
                    {row.disclosure ? (
                      <details>
                        <summary className="cursor-pointer text-slate-300">Voir note</summary>
                        <p className="mt-1 leading-relaxed">{row.disclosure}</p>
                      </details>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
