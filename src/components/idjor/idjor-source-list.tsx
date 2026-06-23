import { FileSearch } from "lucide-react";

import type { IdjorRagLlmPreviewCitation } from "@/types";

export function IdjorSourceList({ citations }: { citations: IdjorRagLlmPreviewCitation[] }) {
  if (citations.length === 0) {
    return (
      <p className="mt-2 rounded-xl border border-slate-400/14 bg-slate-400/5 px-3 py-2 text-xs text-brand-textMuted">
        Aucune source disponible.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      {citations.map((citation) => (
        <div
          key={citation.id}
          className="flex items-start gap-2 rounded-xl border border-slate-400/14 bg-slate-400/5 px-3 py-2"
        >
          <FileSearch className="mt-0.5 h-3.5 w-3.5 flex-none text-cyan-300" />
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan-200">
              {citation.citationLabel} — {citation.documentKey}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{citation.excerptText}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
