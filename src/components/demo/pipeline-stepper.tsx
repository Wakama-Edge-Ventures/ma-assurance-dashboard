"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEMO_SCENARIO, DemoStep } from "@/lib/demo-scenario";
import {
  getDemoScenarioState,
  markDemoStepPreviewed,
  setDemoCurrentStep,
  DemoScenarioState,
} from "@/lib/demo-scenario-state";

interface PipelineStepperProps {
  activeStepId?: string;
}

export function PipelineStepper({ activeStepId }: PipelineStepperProps) {
  const [state, setState] = useState<DemoScenarioState | null>(null);

  useEffect(() => {
    const s = getDemoScenarioState();
    setState(s);
    if (activeStepId) {
      markDemoStepPreviewed(activeStepId);
      setDemoCurrentStep(activeStepId);
    }
  }, [activeStepId]);

  const steps = DEMO_SCENARIO.steps;
  const currentId = activeStepId ?? state?.currentStepId ?? steps[0].id;
  const previewedIds = state?.previewedStepIds ?? [];

  function getStepStyle(step: DemoStep): string {
    const isCurrent = step.id === currentId;

    if (isCurrent) {
      return "flex flex-col items-center gap-1 min-w-[64px]";
    }
    return "flex flex-col items-center gap-1 min-w-[56px]";
  }

  function getDotStyle(step: DemoStep): string {
    const isCurrent = step.id === currentId;
    const isPreviewed = previewedIds.includes(step.id);

    if (isCurrent) {
      return "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-violet-400 bg-violet-500/30 text-violet-200 font-mono text-[11px] shadow-[0_0_8px_rgba(167,139,250,0.4)]";
    }
    if (isPreviewed) {
      return "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/10 text-cyan-300 font-mono text-[10px]";
    }
    return "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-400/20 bg-slate-800/60 text-slate-500 font-mono text-[10px]";
  }

  function getLabelStyle(step: DemoStep): string {
    const isCurrent = step.id === currentId;
    const isPreviewed = previewedIds.includes(step.id);

    if (isCurrent) return "font-mono text-[10px] text-violet-200 text-center leading-tight";
    if (isPreviewed) return "font-mono text-[10px] text-cyan-400/80 text-center leading-tight";
    return "font-mono text-[10px] text-slate-500 text-center leading-tight";
  }

  return (
    <div className="rounded-[16px] border border-slate-400/10 bg-[#0a1120]/80 px-4 py-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-500">
          Parcours démo · SEED_DEMO
        </span>
        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] text-amber-300/80">
          Simulation
        </span>
      </div>

      {/* Horizontal scrollable stepper */}
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-start gap-0">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-start">
              <Link
                href={step.route}
                className={getStepStyle(step)}
                title={step.description}
              >
                <div className={getDotStyle(step)}>
                  {step.stepNumber}
                </div>
                <span className={getLabelStyle(step)}>
                  {step.label}
                </span>
              </Link>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="mx-1 mt-3 h-px w-6 flex-shrink-0 bg-slate-700/60" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
