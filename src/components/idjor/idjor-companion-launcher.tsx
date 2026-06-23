"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { useIdjorCompanion } from "@/components/idjor/idjor-companion-provider";
import { cn } from "@/lib/utils";

export function IdjorCompanionLauncher() {
  const { isOpen, open } = useIdjorCompanion();
  const [showTooltip, setShowTooltip] = useState(false);

  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {showTooltip ? (
        <span className="rounded-full border border-slate-400/14 bg-[#0b0f1a]/95 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-slate-200 shadow-premium-dark">
          Idjor Compagnon
        </span>
      ) : null}

      <div className="idjor-rainbow-border rounded-full p-[1.5px]">
        <button
          type="button"
          onClick={() => open()}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Ouvrir Idjor Compagnon"
          className={cn(
            "idjor-rainbow-border-inner grid h-14 w-14 place-items-center rounded-full bg-[#0b0f1a]",
            "shadow-premium-dark transition-transform duration-150 hover:scale-105 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-cyan-300/60",
          )}
        >
          <Sparkles className="idjor-companion-glow h-6 w-6 text-cyan-200" />
        </button>
      </div>
    </div>
  );
}
