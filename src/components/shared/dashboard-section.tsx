import { Activity } from "lucide-react";

import { PageTitle } from "@/components/ui/page-title";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { StatCard } from "@/components/ui/stat-card";
import { DataSource } from "@/types";

import { ImplementationCard } from "./implementation-card";

interface Kpi {
  title: string;
  value: string;
  hint?: string;
  source?: DataSource;
}

interface DashboardSectionProps {
  title: string;
  description: string;
  kpis: Kpi[];
  nextItems: string[];
  dataSourceNote?: DataSource;
}

export function DashboardSection({
  title,
  description,
  kpis,
  nextItems,
  dataSourceNote = "SEED_DEMO",
}: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      <PageTitle title={title} description={description} />
      <div className="flex items-center gap-2 text-xs text-brand-textMuted">
        <span>Source des donnees affichees:</span>
        <DataSourceBadge source={dataSourceNote} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            hint={kpi.hint}
            source={kpi.source}
            icon={Activity}
          />
        ))}
      </div>
      <ImplementationCard items={nextItems} />
    </div>
  );
}
