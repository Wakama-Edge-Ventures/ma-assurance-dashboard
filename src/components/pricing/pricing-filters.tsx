"use client";

import { DataSource, RiskTier } from "@/types";

import { AppTableFilters } from "@/components/ui/app-table";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { getRiskTierLabel } from "@/lib/workflow";

export interface PricingFiltersState {
  search: string;
  decision: "ALL" | "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  riskTier: "ALL" | RiskTier;
  source: "ALL" | DataSource;
}

interface PricingFiltersProps {
  value: PricingFiltersState;
  onChange: (next: PricingFiltersState) => void;
  onReset: () => void;
}

export function PricingFilters({ value, onChange, onReset }: PricingFiltersProps) {
  return (
    <AppTableFilters className="md:grid-cols-5">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="Recherche: offre, demande, agriculteur, culture..."
        className={`${DESIGN_TOKENS.controls.input} md:col-span-2`}
      />
      <select
        value={value.decision}
        onChange={(event) =>
          onChange({ ...value, decision: event.target.value as PricingFiltersState["decision"] })
        }
        className={DESIGN_TOKENS.controls.select}
      >
        <option value="ALL">Toutes decisions</option>
        <option value="PENDING">En attente</option>
        <option value="ACCEPTED">Acceptee</option>
        <option value="REJECTED">Refusee</option>
        <option value="EXPIRED">Expiree</option>
      </select>
      <select
        value={value.riskTier}
        onChange={(event) =>
          onChange({ ...value, riskTier: event.target.value as PricingFiltersState["riskTier"] })
        }
        className={DESIGN_TOKENS.controls.select}
      >
        <option value="ALL">Tous tiers risque</option>
        <option value="LOW_RISK">{getRiskTierLabel("LOW_RISK")}</option>
        <option value="MEDIUM_RISK">{getRiskTierLabel("MEDIUM_RISK")}</option>
        <option value="HIGH_RISK">{getRiskTierLabel("HIGH_RISK")}</option>
        <option value="UNINSURABLE">{getRiskTierLabel("UNINSURABLE")}</option>
      </select>
      <select
        value={value.source}
        onChange={(event) =>
          onChange({ ...value, source: event.target.value as PricingFiltersState["source"] })
        }
        className={DESIGN_TOKENS.controls.select}
      >
        <option value="ALL">Toutes sources</option>
        <option value="LIVE">LIVE</option>
        <option value="SEED_DEMO">SEED_DEMO</option>
      </select>
      <button
        type="button"
        onClick={onReset}
        className={DESIGN_TOKENS.controls.resetButton}
      >
        Reinitialiser filtres
      </button>
    </AppTableFilters>
  );
}
