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
    <div className="rounded-[20px] border border-wk-border bg-wk-surface p-[18px_20px_20px] shadow-wk-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-wk-faint">
            Parcours de démonstration
          </span>
          <span className="rounded-full bg-wk-violetSoft px-2 py-0.5 text-[9.5px] font-extrabold uppercase text-wk-violetInk">
            Exemple
          </span>
        </div>
        {active && (
          <button
            onClick={handleReset}
            className="text-[10.5px] font-bold text-wk-faint transition-colors hover:text-wk-muted"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Scenario title */}
      <p className="mb-1 text-[13px] font-bold text-wk-text">{DEMO_SCENARIO.title}</p>
      <p className="mb-4 text-[12px] font-medium text-wk-muted">{DEMO_SCENARIO.subtitle}</p>

      {/* Progress bar */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10.5px] font-semibold text-wk-faint">
          {previewedCount}/{totalSteps} étapes visitées
        </span>
        <span className="text-[10.5px] font-bold text-wk-violetInk">{progressPct}%</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-wk-surface3">
        <div
          className="h-full rounded-full bg-wk-violet transition-all duration-500"
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
              className={`flex items-center gap-2 rounded-[10px] px-2 py-1.5 text-[11.5px] font-semibold transition-colors ${
                isCurrent ? "bg-wk-violetSoft text-wk-violetInk" : "text-wk-faint hover:bg-wk-surface2 hover:text-wk-muted"
              }`}
            >
              <span className="w-4 text-center font-mono text-[10px]">{step.stepNumber}</span>
              <span>{step.label}</span>
              {isCurrent && (
                <span className="ml-auto rounded-full bg-wk-violet px-2 py-0.5 text-[9px] font-bold text-white">
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
            className="inline-flex items-center rounded-full bg-wk-violetSoft px-3.5 py-1.5 text-[12.5px] font-bold text-wk-violetInk transition-colors hover:bg-wk-violet hover:text-white"
          >
            Démarrer la démo →
          </button>
        ) : (
          <Link
            href={currentStep.route}
            className="inline-flex items-center rounded-full bg-wk-violetSoft px-3.5 py-1.5 text-[12.5px] font-bold text-wk-violetInk transition-colors hover:bg-wk-violet hover:text-white"
          >
            Continuer → {currentStep.label}
          </Link>
        )}
      </div>

      {/* Disclosure */}
      <p className="mt-3 text-[9.5px] font-medium text-wk-faint">{DEMO_SCENARIO.disclosureText}</p>
    </div>
  );
}
