// demo-scenario-state.ts — localStorage state management for guided demo flow
// Client-safe: all functions check typeof window before accessing localStorage.
// No backend writes. Pure frontend demo state.

import { DEMO_SCENARIO, DEMO_SCENARIO_ID, DemoStep } from "./demo-scenario";

const SCENARIO_KEY = "wakama_assurance_demo_scenario_v1";
const CURRENT_STEP_KEY = "wakama_assurance_demo_current_step_v1";

export interface DemoScenarioState {
  scenarioId: string;
  currentStepId: string;
  previewedStepIds: string[];
  startedAt: string;
  lastUpdatedAt: string;
}

function defaultState(): DemoScenarioState {
  const firstStep = DEMO_SCENARIO.steps[0];
  return {
    scenarioId: DEMO_SCENARIO_ID,
    currentStepId: firstStep.id,
    previewedStepIds: [],
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function getDemoScenarioState(): DemoScenarioState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(SCENARIO_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as DemoScenarioState;
    if (parsed.scenarioId !== DEMO_SCENARIO_ID) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

function saveState(state: DemoScenarioState): void {
  if (typeof window === "undefined") return;
  try {
    state.lastUpdatedAt = new Date().toISOString();
    localStorage.setItem(SCENARIO_KEY, JSON.stringify(state));
    localStorage.setItem(CURRENT_STEP_KEY, state.currentStepId);
  } catch {
    // localStorage unavailable (private browsing quota) — fail silently
  }
}

export function setDemoCurrentStep(stepId: string): void {
  const state = getDemoScenarioState();
  state.currentStepId = stepId;
  saveState(state);
}

export function resetDemoScenario(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SCENARIO_KEY);
    localStorage.removeItem(CURRENT_STEP_KEY);
  } catch {
    // fail silently
  }
}

export function markDemoStepPreviewed(stepId: string): void {
  const state = getDemoScenarioState();
  if (!state.previewedStepIds.includes(stepId)) {
    state.previewedStepIds = [...state.previewedStepIds, stepId];
    saveState(state);
  }
}

export function getNextDemoStep(stepId: string): DemoStep | undefined {
  const steps = DEMO_SCENARIO.steps;
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx === -1 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getPreviousDemoStep(stepId: string): DemoStep | undefined {
  const steps = DEMO_SCENARIO.steps;
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx <= 0) return undefined;
  return steps[idx - 1];
}

export function getCurrentDemoStep(): DemoStep {
  const state = getDemoScenarioState();
  return (
    DEMO_SCENARIO.steps.find((s) => s.id === state.currentStepId) ??
    DEMO_SCENARIO.steps[0]
  );
}

export function isDemoActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SCENARIO_KEY) !== null;
  } catch {
    return false;
  }
}
