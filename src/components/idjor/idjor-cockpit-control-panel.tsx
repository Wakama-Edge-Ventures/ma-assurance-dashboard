import type { ReactNode } from "react";
import { BarChart3, Bot, Boxes, GitBranch, ScrollText, ShieldCheck, SlidersHorizontal, Wrench } from "lucide-react";

import { IdjorGovernanceThresholdsPanel } from "@/components/idjor/idjor-governance-thresholds-panel";
import type { BenchmarkRow, GovernanceNode, RegistryMapping } from "@/lib/idjor-cockpit";
import { STATUS_META } from "@/lib/idjor-cockpit";

function PanelBlock({ children }: { children: ReactNode }) {
  return <div className="rounded border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl">{children}</div>;
}

function SectionHeading({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <h3 className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
    </div>
  );
}

function StatusLegend() {
  return (
    <PanelBlock>
      <SectionHeading icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />} title="Légende des états" />
      <ul className="grid grid-cols-1 gap-1.5">
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((tone) => (
          <li key={tone} className="flex items-center gap-2 text-[10.5px] font-semibold text-slate-200">
            <span className={`h-2 w-2 animate-pulse rounded-full ${STATUS_META[tone].dot}`} />
            {STATUS_META[tone].label}
          </li>
        ))}
      </ul>
    </PanelBlock>
  );
}

function CountTiles({ agents, engines, tools }: { agents: number; engines: number; tools: number }) {
  const tiles = [
    { label: "Agents", value: agents, icon: Bot, color: "text-emerald-200" },
    { label: "Moteurs", value: engines, icon: Boxes, color: "text-cyan-100" },
    { label: "Outils", value: tools, icon: Wrench, color: "text-violet-100" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded border border-white/10 bg-white/[0.045] p-2 text-center">
          <Icon className={`mx-auto h-3.5 w-3.5 ${color}`} />
          <p className={`mt-1 text-[18px] font-extrabold tabular-nums ${color}`}>{value}</p>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

function FlowLegend() {
  const rows = [
    { label: "Autorité hiérarchique", line: "h-[3px] bg-emerald-300" },
    { label: "Flux principal", line: "h-[2px] bg-cyan-300" },
    { label: "Flux de connaissance", line: "border-t-2 border-dashed border-violet-300" },
    { label: "Interaction transversale", line: "h-[2px] bg-amber-300" },
  ];

  return (
    <PanelBlock>
      <SectionHeading icon={<GitBranch className="h-3.5 w-3.5 text-cyan-100" />} title="Légende des flux" />
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 text-[10.5px] font-semibold text-slate-200">
            <span className={`w-9 shrink-0 rounded ${row.line}`} />
            {row.label}
          </li>
        ))}
      </ul>
    </PanelBlock>
  );
}

function PrinciplesPanel() {
  const principles = ["Gouvernance", "Connaissance", "Décision", "Preuve", "Intelligence"];

  return (
    <PanelBlock>
      <SectionHeading icon={<ShieldCheck className="h-3.5 w-3.5 text-amber-100" />} title="Principes" />
      <div className="grid grid-cols-2 gap-1.5">
        {principles.map((principle) => (
          <span
            key={principle}
            className="rounded border border-white/10 bg-slate-950/45 px-2 py-1 text-[10px] font-semibold text-slate-200"
          >
            {principle}
          </span>
        ))}
      </div>
    </PanelBlock>
  );
}

function BenchmarkCard({ rows }: { rows: BenchmarkRow[] }) {
  return (
    <PanelBlock>
      <SectionHeading icon={<BarChart3 className="h-3.5 w-3.5 text-violet-100" />} title="Benchmarking" />
      <dl className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 text-[10.5px]">
            <dt className="font-semibold text-slate-500">{row.label}</dt>
            <dd className="min-w-0 break-words text-right font-bold text-slate-200">{row.value}</dd>
          </div>
        ))}
      </dl>
    </PanelBlock>
  );
}

function GovernanceScope({ items }: { items: RegistryMapping[] }) {
  return (
    <PanelBlock>
      <SectionHeading icon={<Wrench className="h-3.5 w-3.5 text-cyan-100" />} title="Gouvernance / outils / scope" />
      <ul className="space-y-1.5">
        {items.map((item) => {
          const status = STATUS_META[item.tone];
          return (
            <li key={item.id} className="flex items-start gap-2 rounded border border-white/10 bg-slate-950/40 px-2 py-1.5">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full ${status.dot}`} />
              <span className="min-w-0 flex-1 break-words font-mono text-[9px] font-semibold leading-snug text-slate-300">
                {item.name}
              </span>
              <span className="rounded border border-white/10 px-1 font-mono text-[7.5px] uppercase tracking-[0.08em] text-slate-500">
                {item.type}
              </span>
            </li>
          );
        })}
      </ul>
    </PanelBlock>
  );
}

function AuditPanel({ nodes }: { nodes: GovernanceNode[] }) {
  return (
    <PanelBlock>
      <SectionHeading icon={<ScrollText className="h-3.5 w-3.5 text-amber-100" />} title="Audit / gouvernance" />
      <ul className="space-y-2">
        {nodes.map((node) => {
          const status = STATUS_META[node.tone];
          return (
            <li key={node.id} className="rounded border border-white/10 bg-slate-950/40 px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-bold text-slate-100">{node.title}</span>
                <span className={`flex items-center gap-1 font-mono text-[8px] font-bold ${status.cockpitText}`}>
                  <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-[9.5px] leading-snug text-slate-400">{node.subtitle}</p>
            </li>
          );
        })}
      </ul>
    </PanelBlock>
  );
}

export function IdjorCockpitControlPanel({
  tenantKey,
  agentsCount,
  enginesCount,
  toolsCount,
  benchmarkRows,
  governanceNodes,
  governanceScope,
  readOnly,
}: {
  tenantKey: string;
  agentsCount: number;
  enginesCount: number;
  toolsCount: number;
  benchmarkRows: BenchmarkRow[];
  governanceNodes: GovernanceNode[];
  governanceScope: RegistryMapping[];
  readOnly: boolean;
}) {
  return (
    <aside className="flex min-h-[520px] flex-col overflow-hidden bg-slate-950/70 xl:min-h-0">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-300" />
          <h2 className="font-mono text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-200">
            Seuils & gouvernance
          </h2>
        </div>
        <p className="mt-1 text-[10.5px] leading-snug text-slate-400">
          Mode {readOnly ? "lecture seule" : "préparatoire"}. Les seuils préparent la revue.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        <CountTiles agents={agentsCount} engines={enginesCount} tools={toolsCount} />
        <StatusLegend />
        <FlowLegend />
        <PrinciplesPanel />
        <IdjorGovernanceThresholdsPanel tenantKey={tenantKey} />
        <BenchmarkCard rows={benchmarkRows} />
        <GovernanceScope items={governanceScope} />
        <AuditPanel nodes={governanceNodes} />
      </div>
    </aside>
  );
}
