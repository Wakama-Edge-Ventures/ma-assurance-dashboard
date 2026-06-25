import { IdjorCockpitCanvas } from "@/components/idjor/idjor-cockpit-canvas";
import { IdjorCockpitCatalog } from "@/components/idjor/idjor-cockpit-catalog";
import { IdjorCockpitControlPanel } from "@/components/idjor/idjor-cockpit-control-panel";
import {
  buildBenchmarkRows,
  buildCatalogGroups,
  buildCatalogSections,
  buildGovernanceNodes,
  buildIdjorOrganigram,
} from "@/lib/idjor-cockpit";
import type {
  IdjorFoundationHealth,
  IdjorFoundationRegistry,
  IdjorRagHealth,
} from "@/types";

interface IdjorEngineOrgChartProps {
  health: IdjorFoundationHealth | null;
  ragHealth: IdjorRagHealth | null;
  registry: IdjorFoundationRegistry;
  registryLabel: string;
}

export function IdjorEngineOrgChart({ health, ragHealth, registry, registryLabel }: IdjorEngineOrgChartProps) {
  const catalogSections = buildCatalogSections(registry);
  const domainGroups = buildCatalogGroups(registry);
  const organigram = buildIdjorOrganigram(registry);
  const governanceNodes = buildGovernanceNodes(health, ragHealth, registry.featureFlags ?? []);
  const benchmarkRows = buildBenchmarkRows(registry);
  const readOnly = health?.readOnly ?? registry.readOnly;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-slate-900/15 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
      <div className="grid min-h-0 flex-1 xl:grid-cols-[300px_minmax(680px,1fr)_330px]">
        <IdjorCockpitCatalog sections={catalogSections} domainGroups={domainGroups} />
        <IdjorCockpitCanvas organigram={organigram} />
        <IdjorCockpitControlPanel
          tenantKey={registry.tenant.tenantKey}
          agentsCount={registry.agents.length}
          enginesCount={registry.engines.length}
          toolsCount={registry.tools.length}
          benchmarkRows={benchmarkRows}
          governanceNodes={governanceNodes}
          governanceScope={organigram.governanceScope}
          readOnly={readOnly}
        />
      </div>

      <footer className="shrink-0 border-t border-emerald-300/20 bg-emerald-400 px-5 py-2 text-center text-[11px] font-bold leading-relaxed text-emerald-950">
        Les agents et moteurs IDJOR sont présentés ici à titre de registre visuel. Leur présence n&apos;implique aucune
        décision automatique. Toute décision reste du ressort de l&apos;institution.
      </footer>
    </div>
  );
}
