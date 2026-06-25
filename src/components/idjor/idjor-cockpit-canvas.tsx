import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Brain,
  Calculator,
  CheckCircle,
  ClipboardList,
  Eye,
  Fingerprint,
  Network,
  Scale,
  ShieldCheck,
  Target,
  Umbrella,
  Vault,
  Workflow,
} from "lucide-react";

import type { IdjorOrganigram, OrganigramAccent, OrganigramIconKey, OrganigramNode } from "@/lib/idjor-cockpit";
import { STATUS_META } from "@/lib/idjor-cockpit";

const ICONS: Record<OrganigramIconKey, LucideIcon> = {
  scale: Scale,
  shield: ShieldCheck,
  fingerprint: Fingerprint,
  network: Network,
  clipboard: ClipboardList,
  target: Target,
  chart: BarChart3,
  activity: Activity,
  check: CheckCircle,
  calculator: Calculator,
  eye: Eye,
  umbrella: Umbrella,
  brain: Brain,
  vault: Vault,
};

const ACCENT: Record<
  OrganigramAccent,
  { border: string; top: string; text: string; glow: string; chip: string }
> = {
  emerald: {
    border: "border-emerald-300/35",
    top: "border-t-emerald-300",
    text: "text-emerald-200",
    glow: "shadow-[0_0_28px_rgba(52,211,153,0.16)]",
    chip: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  },
  cyan: {
    border: "border-cyan-300/35",
    top: "border-t-cyan-300",
    text: "text-cyan-100",
    glow: "shadow-[0_0_28px_rgba(103,232,249,0.14)]",
    chip: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  },
  violet: {
    border: "border-violet-300/35",
    top: "border-t-violet-300",
    text: "text-violet-100",
    glow: "shadow-[0_0_28px_rgba(196,181,253,0.14)]",
    chip: "border-violet-300/20 bg-violet-300/10 text-violet-100",
  },
  amber: {
    border: "border-amber-300/35",
    top: "border-t-amber-300",
    text: "text-amber-100",
    glow: "shadow-[0_0_28px_rgba(252,211,77,0.14)]",
    chip: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  },
  coral: {
    border: "border-rose-300/35",
    top: "border-t-rose-300",
    text: "text-rose-100",
    glow: "shadow-[0_0_28px_rgba(251,113,133,0.14)]",
    chip: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  },
};

function mappingTitle(node: OrganigramNode): string {
  return node.mappings.map((mapping) => `${mapping.type}: ${mapping.name}`).join("\n");
}

function OrganigramNodeCard({
  node,
  compact = false,
}: {
  node: OrganigramNode;
  compact?: boolean;
}) {
  const Icon = ICONS[node.icon];
  const accent = ACCENT[node.accent];
  const status = STATUS_META[node.tone];
  const mappingSummary = `${node.mappings.length} élément${node.mappings.length > 1 ? "s" : ""} registre`;

  return (
    <article
      className={`relative z-10 min-w-0 rounded border ${accent.border} ${accent.top} ${accent.glow} border-t-2 bg-slate-900/88 text-slate-100 backdrop-blur-xl ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      }`}
      title={mappingTitle(node)}
    >
      <div className="flex items-start gap-2">
        <span className={`rounded border ${accent.chip} p-1.5`}>
          <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </span>
        <div className="min-w-0 flex-1">
          {node.eyebrow ? (
            <p className={`font-mono text-[8px] font-bold uppercase tracking-[0.12em] ${accent.text}`}>
              {node.eyebrow}
            </p>
          ) : null}
          <h3 className={`${compact ? "text-[11px]" : "text-[13px]"} break-words font-extrabold leading-tight text-white`}>
            {node.title}
          </h3>
          <p className={`${compact ? "text-[8.5px]" : "text-[9.5px]"} mt-1 break-words font-semibold leading-snug text-slate-400`}>
            {node.subtitle}
          </p>
        </div>
        <span className={`mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full ${status.dot}`} title={status.label} />
      </div>

      {node.note && !compact ? (
        <p className="mt-2 rounded border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[9px] font-semibold leading-snug text-amber-100">
          {node.note}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {node.tag ? (
          <span className={`rounded border px-1.5 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.08em] ${accent.chip}`}>
            {node.tag}
          </span>
        ) : null}
        <span className="rounded border border-white/10 bg-slate-950/55 px-1.5 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {mappingSummary}
        </span>
      </div>
    </article>
  );
}

function ConnectorLayer() {
  return (
    <svg className="absolute inset-0 z-0 h-[970px] w-[980px]" viewBox="0 0 980 970" aria-hidden>
      <defs>
        <marker id="arrow-main" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path d="M0,0 L8,4 L0,8 Z" fill="#67e8f9" />
        </marker>
        <marker id="arrow-blue-small" markerHeight="5" markerWidth="5" orient="auto" refX="4.5" refY="2.5">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#67e8f9" />
        </marker>
        <marker id="arrow-emerald" markerHeight="5" markerWidth="5" orient="auto" refX="4.5" refY="2.5">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#6ee7b7" />
        </marker>
        <marker id="arrow-emerald-visible" markerHeight="7" markerWidth="7" orient="auto" refX="6.5" refY="3.5">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#6ee7b7" />
        </marker>
        <marker id="arrow-violet" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path d="M0,0 L8,4 L0,8 Z" fill="#c4b5fd" />
        </marker>
        <marker id="arrow-amber" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path d="M0,0 L8,4 L0,8 Z" fill="#fcd34d" />
        </marker>
        <marker id="arrow-amber-start" markerHeight="8" markerWidth="8" orient="auto" refX="1" refY="4">
          <path d="M8,0 L0,4 L8,8 Z" fill="#fcd34d" />
        </marker>
      </defs>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M490 128 V205 H180 V218" stroke="#6ee7b7" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
        <path d="M490 128 V218" stroke="#6ee7b7" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
        <path d="M490 205 H800 V218" stroke="#6ee7b7" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />

        <path d="M180 276 V346" stroke="#67e8f9" strokeWidth="2.75" markerEnd="url(#arrow-blue-small)" />
        <path d="M490 276 V346" stroke="#67e8f9" strokeWidth="2.75" markerEnd="url(#arrow-blue-small)" />
        <path d="M198 420 H250" stroke="#67e8f9" strokeDasharray="10 8" strokeWidth="3" markerEnd="url(#arrow-main)">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>
        <path d="M338 420 H390" stroke="#67e8f9" strokeDasharray="10 8" strokeWidth="3" markerEnd="url(#arrow-main)">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>
        <path d="M478 420 H530" stroke="#67e8f9" strokeDasharray="10 8" strokeWidth="3" markerEnd="url(#arrow-main)">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>
        <path d="M618 420 H670" stroke="#67e8f9" strokeDasharray="10 8" strokeWidth="3" markerEnd="url(#arrow-main)">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>
        <path d="M758 420 H810" stroke="#67e8f9" strokeDasharray="10 8" strokeWidth="3" markerEnd="url(#arrow-main)">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>

        <path d="M860 390 V315 H820 V300" stroke="#67e8f9" strokeDasharray="10 8" strokeWidth="2.75">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>
        <path d="M490 535 V610" stroke="#6ee7b7" strokeWidth="3.5" />
        <path d="M335 610 H640" stroke="#6ee7b7" strokeWidth="3.5" />
        <path d="M335 610 V638" stroke="#6ee7b7" strokeWidth="3.5" markerEnd="url(#arrow-emerald-visible)" />
        <path d="M640 610 V638" stroke="#6ee7b7" strokeWidth="3.5" markerEnd="url(#arrow-emerald-visible)" />
        <path d="M335 715 V779" stroke="#c4b5fd" strokeDasharray="7 7" strokeWidth="2.6" markerEnd="url(#arrow-violet)" />
        <path d="M640 715 V779" stroke="#c4b5fd" strokeDasharray="7 7" strokeWidth="2.6" markerEnd="url(#arrow-violet)" />
        <path d="M460 746 H520" stroke="#fcd34d" strokeWidth="2.6" markerEnd="url(#arrow-amber)" markerStart="url(#arrow-amber-start)" />

        <path d="M335 865 V916 H490 V940" stroke="#fcd34d" strokeDasharray="10 8" strokeWidth="3" markerEnd="url(#arrow-amber)">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>
        <path d="M640 865 V916 H490 V940" stroke="#fcd34d" strokeDasharray="10 8" strokeWidth="3" markerEnd="url(#arrow-amber)">
          <animate attributeName="stroke-dashoffset" dur="2.1s" from="0" repeatCount="indefinite" to="-36" />
        </path>
      </g>

    </svg>
  );
}

function LayerLabel({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`absolute z-[1] rounded-full border border-white/10 bg-slate-950/90 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-100 ${className}`}>
      {children}
    </span>
  );
}

export function IdjorCockpitCanvas({ organigram }: { organigram: IdjorOrganigram }) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden border-r border-white/10 bg-slate-950">
      <div className="shrink-0 border-b border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-200">
              <Workflow className="h-3.5 w-3.5 text-cyan-200" />
              Canvas visuel d&apos;orchestration
            </h2>
            <p className="mt-1 text-[10.5px] text-slate-400">
              Organigramme IDJOR gouverné, structure officielle sans couche CEO ni bannière des piliers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-100">
              Registre visuel
            </span>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-amber-100">
              Lecture seule
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="relative h-[970px] w-[980px] overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]">
          <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.08),transparent_18%,transparent_82%,rgba(139,92,246,0.08))]" />
          <ConnectorLayer />

          <div className="absolute left-[50px] top-[345px] z-[1] h-[190px] w-[880px] rounded-lg border border-cyan-200/20 bg-white/[0.035] shadow-[inset_0_0_28px_rgba(103,232,249,0.05)]" />
          <div className="absolute left-[50px] top-[345px] z-10 flex h-[190px] w-[880px] items-center justify-center px-7">
            <div className="grid w-full grid-cols-6 gap-3">
              {organigram.irax.map((node) => (
                <OrganigramNodeCard key={node.id} node={node} compact />
              ))}
            </div>
          </div>
          <LayerLabel className="left-[210px] top-[762px] text-violet-100">Knowledge Layer</LayerLabel>
          <LayerLabel className="left-[338px] top-[919px] text-amber-100">Proof Layer</LayerLabel>

          <div className="relative z-10 flex h-full flex-col px-10 py-6">
            <div className="flex h-[146px] items-start justify-center">
              <div className="w-[300px]">
                <OrganigramNodeCard node={organigram.executive} />
              </div>
            </div>

            <div className="grid h-[175px] grid-cols-3 items-start gap-20 pt-[50px]">
              {organigram.operational.map((node) => (
                <OrganigramNodeCard key={node.id} node={node} />
              ))}
            </div>

            <div className="h-[190px]" aria-hidden />

            <div className="h-[94px]" aria-hidden />

            <div className="grid h-[150px] grid-cols-2 items-start gap-[60px] px-[150px] pt-4">
              {organigram.monitoring.map((node) => (
                <OrganigramNodeCard key={node.id} node={node} />
              ))}
            </div>

            <div className="grid h-[156px] grid-cols-2 items-start gap-[60px] px-[150px] pt-4">
              {organigram.knowledge.map((node) => (
                <OrganigramNodeCard key={node.id} node={node} />
              ))}
            </div>

          <div className="flex flex-1 items-start justify-center pt-[46px]">
              <div className="w-[320px]">
                <OrganigramNodeCard node={organigram.proof} compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
