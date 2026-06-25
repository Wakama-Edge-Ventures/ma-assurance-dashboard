import { Bot, Boxes, LayoutGrid, Wrench } from "lucide-react";

import type { CatalogEntry, CatalogGroup, CatalogSection } from "@/lib/idjor-cockpit";
import { CATALOG_GROUP_LABELS, STATUS_META } from "@/lib/idjor-cockpit";

const TYPE_ICON = {
  Agent: Bot,
  Moteur: Boxes,
  Outil: Wrench,
} as const;

function CatalogRow({ entry }: { entry: CatalogEntry }) {
  const Icon = TYPE_ICON[entry.type];
  const status = STATUS_META[entry.tone];
  const group = CATALOG_GROUP_LABELS[entry.groupId];

  return (
    <li
      className="group rounded border border-white/10 bg-white/[0.035] px-2 py-1.5 transition hover:border-cyan-200/30 hover:bg-white/[0.06]"
      title={`${entry.blurb}\n${group.title}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 animate-pulse rounded-full ${status.dot}`} title={status.label} />
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-cyan-100" />
        <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] font-semibold leading-snug text-slate-100">
          {entry.name}
        </span>
        <span className="shrink-0 rounded border border-white/10 bg-slate-950/50 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {entry.type}
        </span>
      </div>
    </li>
  );
}

function InventorySection({ section, openByDefault = false }: { section: CatalogSection; openByDefault?: boolean }) {
  return (
    <details className="rounded border border-white/10 bg-slate-950/35" open={openByDefault}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-2 marker:content-none">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">{section.title}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-300">
            {section.entries.length}
          </span>
        </span>
      </summary>
      <ul className="space-y-1 px-2.5 pb-2.5">
        {section.entries.map((entry) => (
          <CatalogRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </details>
  );
}

export function IdjorCockpitCatalog({
  sections,
  domainGroups,
}: {
  sections: CatalogSection[];
  domainGroups: CatalogGroup[];
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-white/10 bg-slate-950/55">
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-emerald-300" />
          <h2 className="font-mono text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-200">
            Catalogue des briques
          </h2>
        </div>
        <p className="mt-1 text-[10.5px] leading-snug text-slate-400">
          Registre visuel en lecture gouvernée. Tous les éléments proviennent du registre courant.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {sections.map((section, index) => (
          <InventorySection key={section.id} section={section} openByDefault={index === 0} />
        ))}

        <details className="rounded border border-white/10 bg-white/[0.035]">
          <summary className="cursor-pointer list-none px-2.5 py-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-amber-100 marker:content-none">
            Sections secondaires
          </summary>
          <div className="grid gap-1.5 px-2.5 pb-2.5">
            {domainGroups.map((group) => (
              <div key={group.id} className="rounded border border-white/10 bg-slate-950/40 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-200">{group.title}</span>
                  <span className="font-mono text-[9px] text-cyan-100">{group.entries.length}</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </aside>
  );
}
