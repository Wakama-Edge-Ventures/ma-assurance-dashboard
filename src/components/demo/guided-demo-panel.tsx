"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_SCENARIO } from "@/lib/demo-scenario";
import {
  getDemoScenarioState,
  getNextDemoStep,
  getPreviousDemoStep,
  markDemoStepPreviewed,
  resetDemoScenario,
  setDemoCurrentStep,
} from "@/lib/demo-scenario-state";

interface GuidedDemoPanelProps {
  currentStepId: string;
}

export function GuidedDemoPanel({ currentStepId }: GuidedDemoPanelProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [previewedIds, setPreviewedIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    markDemoStepPreviewed(currentStepId);
    setDemoCurrentStep(currentStepId);
    const s = getDemoScenarioState();
    setPreviewedIds(s.previewedStepIds);
  }, [currentStepId]);

  if (!mounted) return null;

  const step = DEMO_SCENARIO.steps.find((s) => s.id === currentStepId);
  if (!step) return null;

  const nextStep = getNextDemoStep(currentStepId);
  const prevStep = getPreviousDemoStep(currentStepId);
  const totalSteps = DEMO_SCENARIO.steps.length;

  function handleReset() {
    resetDemoScenario();
    router.push("/fr/dashboard");
  }

  return (
    <div className="space-y-3 rounded-[20px] border border-violet-400/15 bg-[#0d0f1e]/90 p-[18px_20px_20px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
              Parcours démo — Étape {step.stepNumber}/{totalSteps}
            </span>
            <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] text-amber-300/80">
              SEED_DEMO
            </span>
          </div>
          <p className="font-mono text-[13px] font-semibold text-violet-200">
            {step.label}
          </p>
        </div>

        {/* Step progress dots */}
        <div className="flex items-center gap-1">
          {DEMO_SCENARIO.steps.map((s) => {
            const isCurrent = s.id === currentStepId;
            const isPreviewed = previewedIds.includes(s.id);
            return (
              <div
                key={s.id}
                className={
                  isCurrent
                    ? "h-2 w-2 rounded-full bg-violet-400"
                    : isPreviewed
                    ? "h-1.5 w-1.5 rounded-full bg-cyan-500/60"
                    : "h-1.5 w-1.5 rounded-full bg-slate-700"
                }
              />
            );
          })}
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-slate-300">{step.description}</p>

      {/* Evidence summary */}
      <div className="rounded-[10px] border border-slate-400/10 bg-slate-900/50 px-3 py-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-slate-500">
          Résumé preuve
        </span>
        <p className="mt-0.5 font-mono text-[11.5px] text-slate-300">
          {step.evidenceSummary}
        </p>
      </div>

      {/* Compliance note */}
      <p className="font-mono text-[10.5px] text-slate-500 italic">
        {step.complianceNote}
      </p>

      {/* Navigation */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {prevStep && (
          <Link
            href={prevStep.route}
            className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3 py-1.5 font-mono text-[12px] text-slate-400 transition-colors hover:border-slate-400/35 hover:text-white"
          >
            ← {prevStep.label}
          </Link>
        )}

        {nextStep && (
          <Link
            href={nextStep.route}
            className="inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-3.5 py-1.5 font-mono text-[12.5px] text-violet-200 transition-colors hover:bg-violet-500/24"
          >
            {step.nextActionLabel}
          </Link>
        )}

        {!nextStep && (
          <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3.5 py-1.5 font-mono text-[12px] text-cyan-300">
            Parcours démo complet ✓
          </span>
        )}

        <button
          onClick={handleReset}
          className="ml-auto inline-flex items-center rounded-full border border-slate-400/12 bg-transparent px-3 py-1.5 font-mono text-[11px] text-slate-600 transition-colors hover:border-slate-400/25 hover:text-slate-400"
        >
          Réinitialiser démo
        </button>
      </div>

      {/* Disclosure */}
      <p className="font-mono text-[9.5px] text-slate-600">
        {DEMO_SCENARIO.disclosureText}
      </p>
    </div>
  );
}
