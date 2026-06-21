import { LucideIcon } from "lucide-react";

import { DataSource, RiskTier } from "@/types";

import { AppKpiCard } from "./app-kpi-card";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  source?: DataSource;
  tier?: RiskTier;
  className?: string;
}

export function StatCard(props: StatCardProps) {
  return <AppKpiCard {...props} />;
}
