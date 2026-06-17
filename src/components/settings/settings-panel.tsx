"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { DEMO_SCENARIO } from "@/lib/demo-scenario";
import {
  getCurrentDemoStep,
  getDemoScenarioState,
  isDemoActive,
  resetDemoScenario,
} from "@/lib/demo-scenario-state";
import { cn } from "@/lib/utils";
import {
  calculateRaxBrut,
  calculateWrs,
  getRiskTierFromWrs,
  getRiskTierLabel,
} from "@/lib/workflow";
import type { RiskTier } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsConfig {
  // Company
  companyName: string;
  country: string;
  currency: string;
  insurerType: string;
  operatingMode: string;

  // RAX/WRS simulation
  simGravity: number;
  simFrequency: number;
  simDetection: number;
  thresholdLow: number;
  thresholdMedium: number;
  thresholdHigh: number;
  thresholdUninsurable: number;

  // Pricing
  purePremiumBase: number;
  managementFeesPct: number;
  taxRatePct: number;
  technicalMarginPct: number;
  minCapitalMad: number;
  maxCapitalMad: number;
  offerValidityDays: number;
  majorSensibleCulture: number;
  majorSecheresseZone: number;
  majorHistoriqueSinistre: number;
  majorAbsenceIot: number;
  minorIotActif: number;
  minorNdviStable: number;
  minorCoopCertified: number;
  minorHistoriqueComplet: number;

  // Missions
  kycRequired: boolean;
  gpsPolygonRequired: boolean;
  surfaceDeltaPct: number;
  auditMateriel: boolean;
  auditImmobilier: boolean;
  auditStocks: boolean;
  auditBetail: boolean;
  photosRequired: boolean;
  signatureRequired: boolean;
  iotDensityPerHa: number;
  gpsToleranceM: number;
  maxMissionDays: number;

  // Alert thresholds
  ndviCritical: number;
  ndviFaible: number;
  soilMoistureCritical: number;
  iotOfflineTimeoutH: number;
  extremeTempC: number;
  excessiveRainMm: number;
  droughtDays: number;
  notificationFreqH: number;

  // Governance
  doubleValidation: boolean;
  requireJustification: boolean;
  requireDirectorApproval: boolean;
  lockActiveVersion: boolean;
}

type SetFn = <K extends keyof SettingsConfig>(
  key: K,
  value: SettingsConfig[K],
) => void;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: SettingsConfig = {
  companyName: "Assureur Demo SA",
  country: "Regional",
  currency: "MAD",
  insurerType: "MAMDA",
  operatingMode: "DEMO",

  simGravity: 6,
  simFrequency: 5,
  simDetection: 4,
  thresholdLow: 20,
  thresholdMedium: 50,
  thresholdHigh: 75,
  thresholdUninsurable: 100,

  purePremiumBase: 3.5,
  managementFeesPct: 15,
  taxRatePct: 7,
  technicalMarginPct: 8,
  minCapitalMad: 10000,
  maxCapitalMad: 500000,
  offerValidityDays: 30,
  majorSensibleCulture: 15,
  majorSecheresseZone: 20,
  majorHistoriqueSinistre: 25,
  majorAbsenceIot: 10,
  minorIotActif: 8,
  minorNdviStable: 5,
  minorCoopCertified: 6,
  minorHistoriqueComplet: 4,

  kycRequired: true,
  gpsPolygonRequired: true,
  surfaceDeltaPct: 5,
  auditMateriel: true,
  auditImmobilier: false,
  auditStocks: false,
  auditBetail: false,
  photosRequired: true,
  signatureRequired: true,
  iotDensityPerHa: 1,
  gpsToleranceM: 10,
  maxMissionDays: 30,

  ndviCritical: 0.3,
  ndviFaible: 0.45,
  soilMoistureCritical: 15,
  iotOfflineTimeoutH: 24,
  extremeTempC: 45,
  excessiveRainMm: 80,
  droughtDays: 21,
  notificationFreqH: 6,

  doubleValidation: true,
  requireJustification: true,
  requireDirectorApproval: false,
  lockActiveVersion: false,
};

const TABS = [
  { id: "profile", label: "Profil assureur" },
  { id: "rax", label: "RAX / WRS" },
  { id: "pricing", label: "Tarification" },
  { id: "missions", label: "Missions terrain" },
  { id: "alerts", label: "Seuils alertes" },
  { id: "governance", label: "Gouvernance" },
  { id: "versions", label: "Versions & audit" },
] as const;

const STORAGE_DRAFT = "wakama_assurance_settings_draft_v1";
const STORAGE_DRAFT_SAVED_AT = "wakama_assurance_settings_draft_saved_at";
const STORAGE_ACTIVE = "wakama_assurance_settings_active_v1";

// ---------------------------------------------------------------------------
// Shared style constants
// ---------------------------------------------------------------------------

const INPUT_CLS =
  "w-full rounded-[10px] border border-slate-700/50 bg-[#0b1422]/75 px-3 py-2 text-[13px] text-white outline-none focus:border-cyan-400/40 transition-colors";

const SELECT_CLS = INPUT_CLS;

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
      {children}
    </h3>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[11.5px] text-slate-400">{label}</label>
      {children}
      {hint && <p className="font-mono text-[10px] text-slate-600">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between border-b border-slate-700/30 py-2.5 last:border-0">
      <span className="text-[13px] text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors duration-200",
          value ? "bg-emerald-400/70" : "bg-slate-700/50",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
            value ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="font-mono text-[12px] text-slate-400">{label}</span>
        <span className="font-mono text-[13px] font-semibold text-cyan-400">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Profile
// ---------------------------------------------------------------------------

function TabProfile({
  config,
  set,
}: {
  config: SettingsConfig;
  set: SetFn;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Profil assureur</SectionTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom compagnie">
          <input
            type="text"
            value={config.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Pays / marché">
          <input
            type="text"
            value={config.country}
            onChange={(e) => set("country", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Devise">
          <select
            value={config.currency}
            onChange={(e) => set("currency", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="MAD">MAD</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </Field>

        <Field label="Type assureur">
          <select
            value={config.insurerType}
            onChange={(e) => set("insurerType", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="MAMDA">MAMDA</option>
            <option value="Courtier">Courtier</option>
            <option value="Réassureur">Réassureur</option>
            <option value="Programme">Programme</option>
          </select>
        </Field>

        <Field label="Mode opérationnel">
          <select
            value={config.operatingMode}
            onChange={(e) => set("operatingMode", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="DEMO">DEMO</option>
            <option value="PILOT">PILOT</option>
            <option value="PRODUCTION">PRODUCTION</option>
          </select>
        </Field>
      </div>

      {/* Data source status cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-[14px] bg-[#0a0f1c]/60 px-4 py-3">
          <span className="font-mono text-[12px] text-slate-400">
            Données partagées Wakama
          </span>
          <DataSourceBadge source="LIVE" />
        </div>
        <div className="flex items-center justify-between rounded-[14px] bg-[#0a0f1c]/60 px-4 py-3">
          <span className="font-mono text-[12px] text-slate-400">
            Workflows assurance
          </span>
          <DataSourceBadge source="SEED_DEMO" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: RAX / WRS
// ---------------------------------------------------------------------------

const TIER_ROWS: Array<{
  range: string;
  label: string;
  tier: RiskTier;
  color: string;
}> = [
  {
    range: "WRS 0–20",
    label: "Risque faible",
    tier: "LOW_RISK",
    color: "text-emerald-400",
  },
  {
    range: "WRS 21–50",
    label: "Risque moyen",
    tier: "MEDIUM_RISK",
    color: "text-amber-400",
  },
  {
    range: "WRS 51–75",
    label: "Risque élevé",
    tier: "HIGH_RISK",
    color: "text-orange-400",
  },
  {
    range: "WRS 76–100",
    label: "Non assurable",
    tier: "UNINSURABLE",
    color: "text-red-400",
  },
];

function TabRax({
  config,
  set,
  simRaxBrut,
  simWrs,
  simTier,
}: {
  config: SettingsConfig;
  set: SetFn;
  simRaxBrut: number;
  simWrs: number;
  simTier: RiskTier;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Configuration RAX / WRS</SectionTitle>

      {/* Formula display */}
      <div className="rounded-[14px] bg-[#0a0f1c]/80 p-4 font-mono text-[13px] text-cyan-400">
        <p>RAX brut = G × F × D</p>
        <p className="mt-1 text-slate-500">
          WRS = (RAX brut / 25) × 100
        </p>
      </div>

      {/* Simulation sliders */}
      <div className="space-y-4">
        <SectionTitle>Simulation interactive</SectionTitle>
        <SliderRow
          label="Gravité (G)"
          value={config.simGravity}
          min={1}
          max={10}
          onChange={(v) => set("simGravity", v)}
        />
        <SliderRow
          label="Fréquence (F)"
          value={config.simFrequency}
          min={1}
          max={10}
          onChange={(v) => set("simFrequency", v)}
        />
        <SliderRow
          label="Détectabilité (D)"
          value={config.simDetection}
          min={1}
          max={10}
          onChange={(v) => set("simDetection", v)}
        />
      </div>

      {/* Live simulation result */}
      <div className="space-y-2 rounded-[14px] bg-[#0a0f1c]/80 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
          Résultat simulation
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="font-mono text-[10px] text-slate-500">RAX brut</p>
            <p className="font-mono text-[24px] font-semibold text-white">
              {simRaxBrut}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-500">WRS</p>
            <p className="font-mono text-[24px] font-semibold text-cyan-400">
              {simWrs.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-500">Tier</p>
            <p className="font-mono text-[14px] font-semibold text-white">
              {getRiskTierLabel(simTier)}
            </p>
          </div>
        </div>
        {/* WRS progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
            style={{ width: `${simWrs}%` }}
          />
        </div>
      </div>

      {/* Tier thresholds table */}
      <div>
        <SectionTitle>Paliers de risque</SectionTitle>
        <div className="overflow-hidden rounded-[14px]">
          {TIER_ROWS.map((row, i) => (
            <div
              key={row.tier}
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b border-slate-700/30 last:border-0",
                i % 2 === 0 ? "bg-[#0a0f1c]/60" : "bg-[#0a0f1c]/40",
              )}
            >
              <span className="font-mono text-[11.5px] text-slate-400">
                {row.range}
              </span>
              <span className={cn("font-mono text-[11.5px] font-semibold", row.color)}>
                {row.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer notice */}
      <p className="border-l-2 border-amber-400/30 pl-3 text-[12px] text-amber-400">
        Simulation technique non décisionnelle. L&apos;assureur conserve la
        politique d&apos;acceptation et de tarification.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Pricing
// ---------------------------------------------------------------------------

function TabPricing({
  config,
  set,
  pTtc,
  pFees,
  pTax,
}: {
  config: SettingsConfig;
  set: SetFn;
  pTtc: number;
  pFees: number;
  pTax: number;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Tarification</SectionTitle>

      {/* Formula preview */}
      <div className="rounded-[14px] bg-[#0a0f1c]/80 p-4 font-mono text-[13px]">
        <p className="text-cyan-400">
          P_TTC = P_pure + Frais_Gestion + ((P_pure + Frais_Gestion) × Taux_Taxe)
        </p>
        <p className="mt-2 text-slate-400">
          Frais gestion ={" "}
          <span className="text-white">{pFees.toFixed(2)}%</span> &nbsp;|&nbsp;
          Taxe ={" "}
          <span className="text-white">{pTax.toFixed(2)}%</span>
        </p>
        <p className="mt-1 text-emerald-400">
          P_TTC calculée ={" "}
          <span className="font-semibold text-white">{pTtc.toFixed(2)}%</span>{" "}
          de la valeur assurée
        </p>
      </div>

      {/* Core numeric inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prime pure base (%)" hint="Taux technique de base">
          <input
            type="number"
            min={0.1}
            max={20}
            step={0.1}
            value={config.purePremiumBase}
            onChange={(e) => set("purePremiumBase", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Frais de gestion (%)">
          <input
            type="number"
            min={0}
            max={30}
            step={0.5}
            value={config.managementFeesPct}
            onChange={(e) => set("managementFeesPct", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Taxe assurance (%)">
          <input
            type="number"
            min={0}
            max={15}
            step={0.5}
            value={config.taxRatePct}
            onChange={(e) => set("taxRatePct", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Marge technique (%)">
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={config.technicalMarginPct}
            onChange={(e) =>
              set("technicalMarginPct", Number(e.target.value))
            }
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Capital min (MAD)">
          <input
            type="number"
            min={0}
            step={1000}
            value={config.minCapitalMad}
            onChange={(e) => set("minCapitalMad", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Capital max (MAD)">
          <input
            type="number"
            min={0}
            step={10000}
            value={config.maxCapitalMad}
            onChange={(e) => set("maxCapitalMad", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Durée validité offre (jours)">
          <input
            type="number"
            min={1}
            max={365}
            step={1}
            value={config.offerValidityDays}
            onChange={(e) => set("offerValidityDays", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>
      </div>

      {/* Majorations */}
      <div>
        <SectionTitle>Majorations %</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Culture sensible">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.majorSensibleCulture}
              onChange={(e) =>
                set("majorSensibleCulture", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Zone sécheresse">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.majorSecheresseZone}
              onChange={(e) =>
                set("majorSecheresseZone", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Historique sinistre">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.majorHistoriqueSinistre}
              onChange={(e) =>
                set("majorHistoriqueSinistre", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Absence IoT">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.majorAbsenceIot}
              onChange={(e) =>
                set("majorAbsenceIot", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>
        </div>
      </div>

      {/* Minorations */}
      <div>
        <SectionTitle>Minorations %</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="IoT actif">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.minorIotActif}
              onChange={(e) => set("minorIotActif", Number(e.target.value))}
              className={INPUT_CLS}
            />
          </Field>

          <Field label="NDVI stable">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.minorNdviStable}
              onChange={(e) => set("minorNdviStable", Number(e.target.value))}
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Coopérative certifiée">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.minorCoopCertified}
              onChange={(e) =>
                set("minorCoopCertified", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Historique parcelle complet">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={config.minorHistoriqueComplet}
              onChange={(e) =>
                set("minorHistoriqueComplet", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Missions
// ---------------------------------------------------------------------------

function TabMissions({
  config,
  set,
}: {
  config: SettingsConfig;
  set: SetFn;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Missions terrain</SectionTitle>

      {/* Mandatory elements toggles */}
      <div>
        <SectionTitle>Éléments obligatoires</SectionTitle>
        <div className="rounded-[14px] bg-[#0a0f1c]/60 px-4">
          <ToggleRow
            label="KYC agriculteur"
            value={config.kycRequired}
            onChange={(v) => set("kycRequired", v)}
          />
          <ToggleRow
            label="Polygone GPS parcelle"
            value={config.gpsPolygonRequired}
            onChange={(v) => set("gpsPolygonRequired", v)}
          />
          <ToggleRow
            label="Photos terrain"
            value={config.photosRequired}
            onChange={(v) => set("photosRequired", v)}
          />
          <ToggleRow
            label="Signature tactile / OTP"
            value={config.signatureRequired}
            onChange={(v) => set("signatureRequired", v)}
          />
        </div>
      </div>

      {/* Field parameters */}
      <div>
        <SectionTitle>Paramètres terrain</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Seuil écart surface GPS">
            <select
              value={config.surfaceDeltaPct}
              onChange={(e) =>
                set("surfaceDeltaPct", Number(e.target.value))
              }
              className={SELECT_CLS}
            >
              <option value={1}>1%</option>
              <option value={3}>3%</option>
              <option value={5}>5%</option>
              <option value={10}>10%</option>
            </select>
          </Field>

          <Field label="Densité IoT par ha">
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={config.iotDensityPerHa}
              onChange={(e) =>
                set("iotDensityPerHa", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Tolérance GPS (m)">
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={config.gpsToleranceM}
              onChange={(e) =>
                set("gpsToleranceM", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Délai mission max (jours)">
            <input
              type="number"
              min={1}
              max={180}
              step={1}
              value={config.maxMissionDays}
              onChange={(e) =>
                set("maxMissionDays", Number(e.target.value))
              }
              className={INPUT_CLS}
            />
          </Field>
        </div>
      </div>

      {/* Audit types toggles */}
      <div>
        <SectionTitle>Types d&apos;audit</SectionTitle>
        <div className="rounded-[14px] bg-[#0a0f1c]/60 px-4">
          <ToggleRow
            label="Audit matériel"
            value={config.auditMateriel}
            onChange={(v) => set("auditMateriel", v)}
          />
          <ToggleRow
            label="Audit immobilier"
            value={config.auditImmobilier}
            onChange={(v) => set("auditImmobilier", v)}
          />
          <ToggleRow
            label="Audit stocks"
            value={config.auditStocks}
            onChange={(v) => set("auditStocks", v)}
          />
          <ToggleRow
            label="Audit bétail"
            value={config.auditBetail}
            onChange={(v) => set("auditBetail", v)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Alerts
// ---------------------------------------------------------------------------

const SEVERITY_MAPPING = [
  {
    level: "INFO",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border border-cyan-400/20",
    desc: "Données anormales, surveillance recommandée",
  },
  {
    level: "WARNING",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border border-amber-400/20",
    desc: "Seuil d'alerte franchi, vérification terrain",
  },
  {
    level: "CRITICAL",
    color: "text-red-400",
    bg: "bg-red-400/10 border border-red-400/20",
    desc: "Risque sinistre imminent, intervention requise",
  },
] as const;

function TabAlerts({
  config,
  set,
}: {
  config: SettingsConfig;
  set: SetFn;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Seuils de déclenchement d&apos;alertes</SectionTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="NDVI critique (seuil min)" hint="0.0 – 1.0">
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={config.ndviCritical}
            onChange={(e) => set("ndviCritical", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="NDVI faible (seuil min)" hint="0.0 – 1.0">
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={config.ndviFaible}
            onChange={(e) => set("ndviFaible", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Humidité sol critique (%)">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={config.soilMoistureCritical}
            onChange={(e) =>
              set("soilMoistureCritical", Number(e.target.value))
            }
            className={INPUT_CLS}
          />
        </Field>

        <Field label="IoT offline timeout (h)" hint="1 – 168 h">
          <input
            type="number"
            min={1}
            max={168}
            step={1}
            value={config.iotOfflineTimeoutH}
            onChange={(e) =>
              set("iotOfflineTimeoutH", Number(e.target.value))
            }
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Température extrême (°C)" hint="30 – 60 °C">
          <input
            type="number"
            min={30}
            max={60}
            step={1}
            value={config.extremeTempC}
            onChange={(e) => set("extremeTempC", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Pluie excessive (mm/j)" hint="20 – 200 mm">
          <input
            type="number"
            min={20}
            max={200}
            step={5}
            value={config.excessiveRainMm}
            onChange={(e) =>
              set("excessiveRainMm", Number(e.target.value))
            }
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Sécheresse prolongée (jours)" hint="7 – 90 jours">
          <input
            type="number"
            min={7}
            max={90}
            step={1}
            value={config.droughtDays}
            onChange={(e) => set("droughtDays", Number(e.target.value))}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Fréquence notification (h)" hint="1 – 72 h">
          <input
            type="number"
            min={1}
            max={72}
            step={1}
            value={config.notificationFreqH}
            onChange={(e) =>
              set("notificationFreqH", Number(e.target.value))
            }
            className={INPUT_CLS}
          />
        </Field>
      </div>

      {/* Severity mapping */}
      <div>
        <SectionTitle>Correspondance sévérité</SectionTitle>
        <div className="space-y-2">
          {SEVERITY_MAPPING.map((row) => (
            <div
              key={row.level}
              className="flex items-start gap-3 rounded-[12px] bg-[#0a0f1c]/60 px-4 py-3"
            >
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-semibold",
                  row.bg,
                  row.color,
                )}
              >
                {row.level}
              </span>
              <span className="text-[12.5px] text-slate-400">{row.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Governance
// ---------------------------------------------------------------------------

const ROLES_TABLE = [
  { role: "INSURER_ADMIN", permissions: "Configuration complète", level: "Admin" },
  { role: "RISK_DIRECTOR", permissions: "Approbation seuils", level: "Approbation" },
  { role: "AGENCY_MANAGER", permissions: "Gestion dossiers", level: "Opérationnel" },
  { role: "FIELD_AGENT", permissions: "Missions terrain", level: "Terrain" },
  { role: "READONLY", permissions: "Consultation seule", level: "Lecture" },
] as const;

const WORKFLOW_STATES = [
  "Draft",
  "Simulation",
  "Review",
  "Active",
  "Archived",
] as const;

function TabGovernance({
  config,
  set,
}: {
  config: SettingsConfig;
  set: SetFn;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Gouvernance & approbation</SectionTitle>

      {/* Roles table */}
      <div>
        <SectionTitle>Rôles et permissions</SectionTitle>
        <div className="overflow-hidden rounded-[14px]">
          {/* Header */}
          <div className="grid grid-cols-3 bg-[#0a0f1c]/80 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.10em] text-slate-500">
            <span>Rôle</span>
            <span>Permissions</span>
            <span>Niveau</span>
          </div>
          {/* Rows */}
          {ROLES_TABLE.map((row, i) => (
            <div
              key={row.role}
              className={cn(
                "grid grid-cols-3 items-center px-4 py-3 border-t border-slate-700/30",
                i % 2 === 0 ? "bg-[#0a0f1c]/50" : "bg-[#0a0f1c]/30",
              )}
            >
              <span className="font-mono text-[12px] text-cyan-400">
                {row.role}
              </span>
              <span className="text-[12.5px] text-slate-300">
                {row.permissions}
              </span>
              <span className="text-[12px] text-slate-400">{row.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Governance toggles */}
      <div>
        <SectionTitle>Règles de validation</SectionTitle>
        <div className="rounded-[14px] bg-[#0a0f1c]/60 px-4">
          <ToggleRow
            label="Double validation requise"
            value={config.doubleValidation}
            onChange={(v) => set("doubleValidation", v)}
          />
          <ToggleRow
            label="Justification requise sur changement seuil"
            value={config.requireJustification}
            onChange={(v) => set("requireJustification", v)}
          />
          <ToggleRow
            label="Approbation directeur risques avant activation"
            value={config.requireDirectorApproval}
            onChange={(v) => set("requireDirectorApproval", v)}
          />
          <ToggleRow
            label="Verrouiller version active"
            value={config.lockActiveVersion}
            onChange={(v) => set("lockActiveVersion", v)}
          />
        </div>
      </div>

      {/* Workflow state chain */}
      <div>
        <SectionTitle>Cycle de vie d&apos;une version</SectionTitle>
        <div className="flex flex-wrap items-center gap-1">
          {WORKFLOW_STATES.map((state, i) => (
            <div key={state} className="flex items-center gap-1">
              <span
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[11px]",
                  state === "Active"
                    ? "bg-emerald-400/15 border border-emerald-400/25 text-emerald-400"
                    : state === "Draft"
                      ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-400"
                      : "bg-slate-700/40 border border-slate-600/30 text-slate-400",
                )}
              >
                {state}
              </span>
              {i < WORKFLOW_STATES.length - 1 && (
                <span className="font-mono text-[11px] text-slate-600">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo scenario controls */}
      <DemoScenarioControls />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo scenario controls (governance tab sub-section)
// ---------------------------------------------------------------------------

function DemoScenarioControls() {
  const [active, setActive] = useState(false);
  const [previewedCount, setPreviewedCount] = useState(0);
  const [currentStepLabel, setCurrentStepLabel] = useState("");

  useEffect(() => {
    setActive(isDemoActive());
    const s = getDemoScenarioState();
    setPreviewedCount(s.previewedStepIds.length);
    const step = getCurrentDemoStep();
    setCurrentStepLabel(step.label);
  }, []);

  function handleReset() {
    resetDemoScenario();
    setActive(false);
    setPreviewedCount(0);
    setCurrentStepLabel(DEMO_SCENARIO.steps[0].label);
  }

  return (
    <div>
      <SectionTitle>Contrôles démo scénario</SectionTitle>
      <div className="rounded-[14px] border border-violet-400/12 bg-[#0d0f1e]/80 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Parcours démo
          </span>
          <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] text-amber-300/80">
            SEED_DEMO
          </span>
        </div>
        <p className="text-[12.5px] text-slate-300">
          {DEMO_SCENARIO.subtitle}
        </p>
        <div className="grid grid-cols-2 gap-2 text-[12px] text-slate-400">
          <span>Statut : {active ? "En cours" : "Non démarré"}</span>
          <span>Étapes visitées : {previewedCount}/{DEMO_SCENARIO.steps.length}</span>
          {active && <span className="col-span-2">Étape active : {currentStepLabel}</span>}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/fr/dashboard"
            className="inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-3 py-1.5 font-mono text-[12px] text-violet-200 transition-colors hover:bg-violet-500/24"
          >
            Aller au tableau de bord →
          </Link>
          {active && (
            <button
              onClick={handleReset}
              className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3 py-1.5 font-mono text-[12px] text-slate-400 transition-colors hover:border-slate-400/35 hover:text-white"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <p className="font-mono text-[9.5px] text-slate-600">
          {DEMO_SCENARIO.disclosureText}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Versions & Audit
// ---------------------------------------------------------------------------

const DEMO_VERSIONS = [
  {
    version: "v1.3.0",
    status: "ACTIVE",
    by: "A. Benali",
    date: "2025-05-15",
    summary: "Seuils NDVI ajustés, marge technique +2%",
  },
  {
    version: "v1.2.1",
    status: "ARCHIVED",
    by: "M. El Idrissi",
    date: "2025-04-02",
    summary: "Coefficients RAX calibrés campagne blé",
  },
  {
    version: "v1.2.0",
    status: "ARCHIVED",
    by: "A. Benali",
    date: "2025-03-10",
    summary: "Majorations coopératives certifiées",
  },
  {
    version: "v1.1.0",
    status: "ARCHIVED",
    by: "Direction",
    date: "2025-01-20",
    summary: "Configuration initiale production",
  },
] as const;

function TabVersions({ activeVersion }: { activeVersion: string | null }) {
  return (
    <div className="space-y-6">
      <SectionTitle>Versions & audit</SectionTitle>

      {/* Active version indicator */}
      {activeVersion && (
        <div className="flex items-center gap-2 rounded-[12px] bg-emerald-400/8 border border-emerald-400/15 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="font-mono text-[12px] text-emerald-400">
            Version active locale : {activeVersion}
          </span>
        </div>
      )}

      {/* Version history table */}
      <div className="overflow-hidden rounded-[14px]">
        {/* Header */}
        <div className="grid grid-cols-[90px_90px_1fr_100px_auto] gap-3 bg-[#0a0f1c]/80 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.10em] text-slate-500">
          <span>Version</span>
          <span>Statut</span>
          <span>Résumé</span>
          <span>Modifié par</span>
          <span>Date</span>
        </div>

        {/* Rows */}
        {DEMO_VERSIONS.map((row, i) => (
          <div
            key={row.version}
            className={cn(
              "grid grid-cols-[90px_90px_1fr_100px_auto] gap-3 items-center border-t border-slate-700/30 px-4 py-3",
              i % 2 === 0 ? "bg-[#0a0f1c]/50" : "bg-[#0a0f1c]/30",
            )}
          >
            <span className="font-mono text-[12px] text-white">
              {row.version}
            </span>
            <span
              className={cn(
                "inline-flex w-fit items-center rounded-full px-2 py-0.5 font-mono text-[10.5px]",
                row.status === "ACTIVE"
                  ? "bg-emerald-400/15 border border-emerald-400/25 text-emerald-400"
                  : "bg-slate-700/30 border border-slate-600/30 text-slate-500",
              )}
            >
              {row.status}
            </span>
            <span className="text-[12px] text-slate-400 truncate">
              {row.summary}
            </span>
            <span className="font-mono text-[11.5px] text-slate-500">
              {row.by}
            </span>
            <span className="font-mono text-[11.5px] tabular-nums text-slate-500">
              {row.date}
            </span>
          </div>
        ))}
      </div>

      {/* Audit note */}
      <p className="border-l-2 border-slate-600/40 pl-3 text-[12px] text-slate-500">
        Toute modification de configuration génère une version horodatée.
        L&apos;assureur conserve le contrôle de l&apos;activation.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main SettingsPanel
// ---------------------------------------------------------------------------

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [config, setConfig] = useState<SettingsConfig>(DEFAULT_CONFIG);
  const [isDirty, setIsDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<string | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(STORAGE_DRAFT);
      if (draft) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(draft) });
        setSavedAt(localStorage.getItem(STORAGE_DRAFT_SAVED_AT));
      }
      const active = localStorage.getItem(STORAGE_ACTIVE);
      if (active) {
        const parsed = JSON.parse(active) as { version?: string };
        setActiveVersion(parsed.version ?? null);
      }
    } catch {
      // silently ignore storage errors
    }
  }, []);

  const set = useCallback(
    <K extends keyof SettingsConfig>(key: K, value: SettingsConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const saveDraft = () => {
    try {
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify(config));
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_DRAFT_SAVED_AT, now);
      setSavedAt(now);
      setIsDirty(false);
    } catch {
      // silently ignore storage errors
    }
  };

  const activateVersion = () => {
    try {
      const version = `v${Date.now()}`;
      localStorage.setItem(
        STORAGE_ACTIVE,
        JSON.stringify({
          version,
          config,
          activatedAt: new Date().toISOString(),
        }),
      );
      setActiveVersion(version);
      // also persist draft
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify(config));
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_DRAFT_SAVED_AT, now);
      setSavedAt(now);
      setIsDirty(false);
    } catch {
      // silently ignore storage errors
    }
  };

  const resetDefault = () => {
    setConfig(DEFAULT_CONFIG);
    setIsDirty(true);
  };

  const exportJson = () => {
    const data = {
      version: activeVersion ?? "draft",
      config,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wakama-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Computed RAX/WRS simulation values
  const simRaxBrut = calculateRaxBrut(
    config.simGravity,
    config.simFrequency,
    config.simDetection,
  );
  const simWrs = calculateWrs(simRaxBrut);
  const simTier = getRiskTierFromWrs(simWrs);

  // Pricing formula preview
  const pBase = config.purePremiumBase;
  const pFees = (pBase * config.managementFeesPct) / 100;
  const pTax = ((pBase + pFees) * config.taxRatePct) / 100;
  const pTtc = pBase + pFees + pTax;

  return (
    <div className="space-y-5">
      {/* ── Header: tabs + status ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[11.5px] transition-all",
                activeTab === tab.id
                  ? "border border-cyan-400/20 bg-cyan-400/15 text-white"
                  : "text-slate-400 hover:bg-slate-700/30 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DataSourceBadge source="SEED_DEMO" />

        {isDirty && (
          <span className="font-mono text-[10.5px] text-amber-400">
            ● Non sauvegardé
          </span>
        )}
        {savedAt && !isDirty && (
          <span className="font-mono text-[10.5px] text-slate-500">
            Sauvegardé
          </span>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveDraft}
          className="rounded-full bg-cyan-400/15 border border-cyan-400/25 px-4 py-2 font-mono text-[12px] text-cyan-400 hover:bg-cyan-400/25 transition-colors"
        >
          Sauvegarder brouillon
        </button>
        <button
          type="button"
          onClick={activateVersion}
          className="rounded-full bg-emerald-400/12 border border-emerald-400/25 px-4 py-2 font-mono text-[12px] text-emerald-400 hover:bg-emerald-400/22 transition-colors"
        >
          Activer version
        </button>
        <button
          type="button"
          onClick={resetDefault}
          className="rounded-full border border-slate-600/40 bg-slate-800/40 px-4 py-2 font-mono text-[12px] text-slate-400 hover:text-white transition-colors"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="rounded-full border border-slate-600/40 bg-slate-800/40 px-4 py-2 font-mono text-[12px] text-slate-400 hover:text-white transition-colors"
        >
          Export JSON
        </button>
      </div>

      {/* ── Tab content panel ── */}
      <div className="rounded-[20px] bg-[#101726]/92 p-5 md:p-6">
        {activeTab === "profile" && (
          <TabProfile config={config} set={set} />
        )}
        {activeTab === "rax" && (
          <TabRax
            config={config}
            set={set}
            simRaxBrut={simRaxBrut}
            simWrs={simWrs}
            simTier={simTier}
          />
        )}
        {activeTab === "pricing" && (
          <TabPricing
            config={config}
            set={set}
            pTtc={pTtc}
            pFees={pFees}
            pTax={pTax}
          />
        )}
        {activeTab === "missions" && (
          <TabMissions config={config} set={set} />
        )}
        {activeTab === "alerts" && (
          <TabAlerts config={config} set={set} />
        )}
        {activeTab === "governance" && (
          <TabGovernance config={config} set={set} />
        )}
        {activeTab === "versions" && (
          <TabVersions activeVersion={activeVersion} />
        )}
      </div>
    </div>
  );
}
