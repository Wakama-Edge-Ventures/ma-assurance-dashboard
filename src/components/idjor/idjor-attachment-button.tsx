"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";

export function IdjorAttachmentButton() {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled
        aria-disabled="true"
        onFocus={() => setShowHint(true)}
        onBlur={() => setShowHint(false)}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        className="grid h-9 w-9 flex-none cursor-not-allowed place-items-center rounded-full border border-slate-400/14 bg-slate-400/5 text-slate-500"
        aria-label="Joindre un fichier (bientôt disponible)"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      {showHint ? (
        <span className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-xl border border-slate-400/14 bg-[#0b0f1a] px-3 py-2 text-[11px] leading-relaxed text-slate-300 shadow-premium-dark">
          Bientôt disponible ici — utilisez le workflow documentaire pour importer un fichier.
        </span>
      ) : null}
    </div>
  );
}
