import { FileSearch } from "lucide-react";

import type { IdjorRagLlmPreviewCitation } from "@/types";

export function IdjorSourceList({ citations }: { citations: IdjorRagLlmPreviewCitation[] }) {
  if (citations.length === 0) {
    return (
      <p className="mt-2 rounded-xl bg-wk-surface3 px-3 py-2 text-xs font-medium text-wk-muted">
        Aucune source disponible.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      {citations.map((citation) => (
        <div key={citation.id} className="flex items-start gap-2 rounded-xl bg-wk-surface3 px-3 py-2">
          <FileSearch className="mt-0.5 h-3.5 w-3.5 flex-none text-wk-tealInk" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-wk-tealInk">
              {citation.citationLabel} — {citation.documentKey}
            </p>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-wk-muted">{citation.excerptText}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
