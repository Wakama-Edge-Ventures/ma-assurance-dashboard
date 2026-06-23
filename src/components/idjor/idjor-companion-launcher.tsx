"use client";

import { Sparkles } from "lucide-react";

import { useIdjorCompanion } from "@/components/idjor/idjor-companion-provider";

export function IdjorCompanionLauncher() {
  const { isOpen, open } = useIdjorCompanion();

  if (isOpen) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => open()}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label="Ouvrir Idjor Compagnon"
      className="fixed bottom-5 right-5 z-50 flex h-[54px] items-center gap-[11px] rounded-2xl bg-gradient-to-br from-wk-violet to-[#8b6ff0] pl-[17px] pr-5 text-white shadow-wk-lg transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wk-violet/60 sm:bottom-6 sm:right-6"
    >
      <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-white/20">
        <Sparkles className="h-[17px] w-[17px]" />
      </span>
      <span className="text-[14.5px] font-bold tracking-[-0.2px]">Idjor</span>
    </button>
  );
}
