"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_SCENARIO } from "@/lib/demo-scenario";
import {
  getCurrentDemoStep,
  getDemoScenarioState,
  isDemoActive,
  resetDemoScenario,
  setDemoCurrentStep,
} from "@/lib/demo-scenario-state";

export function DashboardDemoSection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [previewedCount, setPreviewedCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setActive(isDemoActive());
    const s = getDemoScenarioState();
    setPreviewedCount(s.previewedStepIds.length);
  }, []);

  if (!mounted) return null;

  const currentStep = getCurrentDemoStep();
  const totalSteps = DEMO_SCENARIO.steps.length;
  const progressPct = Math.round((previewedCount / totalSteps) * 100);

  function handleStart() {
    const firstStep = DEMO_SCENARIO.steps[0];
    setDemoCurrentStep(firstStep.id);
    router.push(firstStep.route);
  }

  function handleReset() {
    resetDemoScenario();
    setActive(false);
    setPreviewedCount(0);
  }

  return (
    <div className="rounded-[20px] border border-violet-400/15 bg-[#0d0f1e]/90 p-[18px_20px_20px]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Parcours de démonstration
          </span>
          <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] text-amber-300/80">
            SEED_DEMO
          </span>
        </div>
        {active && (
          <button
            onClick={handleReset}
            className="font-mono text-[10.5px] text-slate-600 transition-colors hover:text-slate-400"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Scenario title */}
      <p className="mb-1 text-[13px] font-semibold text-white">{DEMO_SCENARIO.title}</p>
      <p className="mb-4 text-[12px] text-slate-400">{DEMO_SCENARIO.subtitle}</p>

      {/* Progress bar */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10.5px] text-slate-500">
          {previewedCount}/{totalSteps} étapes visitées
        </span>
        <span className="font-mono text-[10.5px] text-violet-300">{progressPct}%</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-800/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Pipeline steps mini list */}
      <div className="mb-4 space-y-1">
        {DEMO_SCENARIO.steps.map((step) => {
          const isCurrent = active && step.id === currentStep.id;
          return (
            <Link
              key={step.id}
              href={step.route}
              className={`flex items-center gap-2 rounded-[10px] px-2 py-1.5 transition-colors ${
                isCurrent
                  ? "bg-violet-500/12 text-violet-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="font-mono text-[10px] w-4 text-center">{step.stepNumber}</span>
              <span className="font-mono text-[11.5px]">{step.label}</span>
              {isCurrent && (
                <span className="ml-auto rounded-full bg-violet-500/20 px-2 py-0.5 font-mono text-[9px] text-violet-300">
                  Actif
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-2">
        {!active ? (
          <button
            onClick={handleStart}
            className="inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-3.5 py-1.5 font-mono text-[12.5px] text-violet-200 transition-colors hover:bg-violet-500/24"
          >
            Démarrer la démo →
          </button>
        ) : (
          <Link
            href={currentStep.route}
            className="inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-3.5 py-1.5 font-mono text-[12.5px] text-violet-200 transition-colors hover:bg-violet-500/24"
          >
            Continuer → {currentStep.label}
          </Link>
        )}
      </div>

      {/* Disclosure */}
      <p className="mt-3 font-mono text-[9.5px] text-slate-600">
        {DEMO_SCENARIO.disclosureText}
      </p>
    </div>
  );
}
