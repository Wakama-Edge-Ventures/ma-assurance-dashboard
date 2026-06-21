export const DESIGN_TOKENS = {
  appShell: {
    page: "bg-brand-bg text-slate-900 dark:text-slate-100",
    mutedText: "text-brand-textMuted",
  },
  surfaces: {
    base: "bg-brand-surface/90 border border-brand-border/14 dark:border-cyan-400/14",
    muted: "bg-brand-surfaceRaised/85 border border-brand-border/12 dark:border-cyan-400/12",
    glass:
      "bg-brand-surface/84 border border-brand-border/14 backdrop-blur-xl dark:border-cyan-400/14",
  },
  cards: {
    base:
      "rounded-[20px] border border-brand-border/10 bg-brand-surface/86 p-4 shadow-premium transition-all dark:border-cyan-400/12 dark:bg-[#0d1525]/82 dark:shadow-premium-dark",
    soft:
      "rounded-[20px] border border-brand-border/10 bg-gradient-to-br from-brand-surface via-brand-surface to-brand-surfaceRaised/85 p-5 shadow-premium dark:border-cyan-400/12 dark:from-[#0d1426]/95 dark:via-[#10192d]/90 dark:to-[#111d36]/88 dark:shadow-premium-dark",
    subtle:
      "rounded-2xl border border-brand-border/10 bg-brand-surfaceRaised/72 p-3.5 dark:border-cyan-400/10 dark:bg-[#0b1422]/75",
    hover:
      "transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-[0_14px_28px_rgba(8,145,178,0.15)] dark:hover:shadow-[0_14px_26px_rgba(2,132,199,0.20)]",
  },
  table: {
    wrapper:
      "overflow-x-auto rounded-2xl border border-brand-border/10 bg-brand-surface/92 shadow-premium dark:border-cyan-400/12 dark:bg-[#0f182b]/82 dark:shadow-premium-dark",
    header:
      "border-b border-brand-border/12 bg-brand-surfaceRaised/78 text-[11px] uppercase tracking-[0.08em] text-brand-textMuted dark:border-cyan-400/12 dark:bg-[#111d31]/80",
    row: "border-b border-brand-border/8 transition-colors hover:bg-cyan-400/5 dark:border-cyan-400/8",
    filterPanel:
      "grid gap-2.5 rounded-2xl border border-brand-border/10 bg-brand-surface/86 p-3.5 shadow-premium dark:border-cyan-400/12 dark:bg-brand-surface/74 dark:shadow-premium-dark",
  },
  sidebar: {
    shell:
      "border-r border-brand-border/10 bg-brand-surface/70 dark:bg-gradient-to-b dark:from-[#0a0f1b]/60 dark:to-[#080c17]/30",
    brandTitle: "text-slate-900 dark:text-white",
    groupLabel: "text-brand-textMuted",
    toggleButton:
      "border border-brand-border/16 bg-brand-surfaceRaised/60 text-brand-textMuted hover:text-slate-900 dark:bg-[#070b17]/45 dark:hover:text-white",
    footer: "border border-brand-border/12 bg-brand-surfaceRaised/70 dark:bg-[#141c2e]/72",
    footerText: "text-brand-textMuted",
    active:
      "bg-gradient-to-r from-cyan-500/16 to-violet-500/15 text-slate-900 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)] dark:text-slate-100",
    item:
      "border-l-[3px] border-transparent text-brand-textMuted hover:bg-brand-surfaceRaised/70 hover:text-slate-900 dark:hover:text-slate-100",
    icon: "text-brand-textMuted",
  },
  header: {
    shell:
      "border-b border-brand-border/10 bg-brand-surface/80 backdrop-blur-lg dark:bg-[#070b17]/45",
    title: "text-slate-900 dark:text-white",
    searchShell:
      "border border-brand-border/18 bg-brand-surfaceRaised/70 dark:border-slate-400/18 dark:bg-[#0d1525]/70",
    searchInput: "text-slate-900 placeholder:text-brand-textMuted dark:text-slate-200 dark:placeholder:text-slate-500",
    avatarText: "text-white",
    userName: "text-slate-900 dark:text-white",
  },
  buttons: {
    primary:
      "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:from-cyan-400 hover:to-emerald-400 focus-visible:ring-brand-green",
    secondary:
      "border border-brand-border/18 bg-brand-surfaceRaised/70 text-slate-900 hover:border-cyan-300/45 hover:bg-brand-surfaceRaised/90 focus-visible:ring-brand-violet dark:border-cyan-400/18 dark:text-slate-100",
    ghost:
      "bg-transparent text-brand-textMuted hover:bg-brand-surfaceRaised/70 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-brand-violet",
    danger: "bg-brand-danger text-slate-950 hover:bg-rose-400 focus-visible:ring-brand-danger",
  },
  status: {
    neutral: "text-slate-700 dark:text-slate-200",
    info: "text-sky-700 dark:text-sky-300",
    success: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    danger: "text-rose-700 dark:text-rose-300",
  },
  severity: {
    critical:
      "border border-rose-400/50 bg-rose-500/15 text-rose-200 dark:border-rose-400/50 dark:bg-rose-500/15 dark:text-rose-200",
    warning:
      "border border-amber-400/50 bg-amber-500/16 text-amber-200 dark:border-amber-400/50 dark:bg-amber-500/16 dark:text-amber-200",
    info: "border border-cyan-400/45 bg-cyan-500/14 text-cyan-200 dark:border-cyan-400/45 dark:bg-cyan-500/14 dark:text-cyan-200",
    unknown:
      "border border-slate-400/35 bg-slate-500/18 text-slate-200 dark:border-slate-400/35 dark:bg-slate-500/18 dark:text-slate-200",
  },
  dataSource: {
    live:
      "border border-emerald-400/50 bg-emerald-500/16 text-emerald-200 dark:border-emerald-400/50 dark:bg-emerald-500/16 dark:text-emerald-200",
    seedDemo:
      "border border-amber-400/55 bg-amber-500/16 text-amber-200 dark:border-amber-400/55 dark:bg-amber-500/16 dark:text-amber-200",
  },
  text: {
    heading: "text-slate-900 dark:text-white",
    body: "text-slate-700 dark:text-slate-300",
    muted: "text-brand-textMuted",
    faint: "text-slate-500 dark:text-slate-500",
  },
  pill: {
    neutral:
      "rounded-full border border-brand-border/18 bg-brand-surfaceRaised/70 text-slate-700 dark:border-slate-400/18 dark:bg-slate-400/8 dark:text-slate-300",
    accent:
      "rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/24 dark:bg-cyan-400/10 dark:text-cyan-200",
  },
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg",
  controls: {
    input:
      "oracle-search-input w-full rounded-full border border-brand-border/20 bg-brand-surfaceRaised/72 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/18 dark:border-cyan-400/16 dark:bg-[#0b1422]/75 dark:text-slate-100",
    select:
      "w-full rounded-xl border border-brand-border/18 bg-brand-surfaceRaised/72 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/18 dark:border-cyan-400/14 dark:bg-[#0b1422]/75 dark:text-slate-100",
    resetButton:
      "rounded-full border border-brand-border/22 bg-brand-surface/40 px-3 py-1.5 text-xs text-brand-textMuted transition-colors hover:border-cyan-300/40 hover:bg-brand-surfaceRaised/70 hover:text-slate-900 dark:hover:text-slate-100",
    tableAction:
      "inline-flex items-center rounded-full border border-brand-border/22 bg-brand-surface/45 px-2.5 py-1.5 text-xs text-slate-900 transition-colors hover:border-cyan-300/40 hover:bg-cyan-400/12 dark:text-slate-100",
  },
  telemetry: {
    value:
      "font-semibold tabular-nums text-slate-900 dark:bg-gradient-to-r dark:from-emerald-300 dark:via-cyan-200 dark:to-violet-300 dark:bg-clip-text dark:text-transparent",
    valueAccent:
      "font-semibold tabular-nums text-slate-900 dark:bg-gradient-to-r dark:from-cyan-300 dark:via-emerald-200 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent",
    frame:
      "rounded-2xl border border-brand-border/10 bg-brand-surface/75 dark:border-cyan-400/12 dark:bg-[#0f182b]/80",
    transparentButton:
      "inline-flex items-center gap-1 rounded-full border border-brand-border/20 bg-brand-surface/38 px-3 py-1.5 text-xs text-brand-textMuted transition-colors hover:border-cyan-300/45 hover:bg-cyan-500/10 hover:text-slate-100",
  },
  oracle: {
    background: "bg-[#050816]",
    panel: "bg-[#0d1525]/82 border border-cyan-400/12 rounded-2xl",
    panelStrong: "bg-[#0a1220]/90 border border-cyan-400/16 rounded-2xl",
    panelSoft: "bg-[#0b1422]/70 border border-cyan-400/10 rounded-2xl",
    hero: "bg-gradient-to-br from-[#0a1228]/96 via-[#0e1838]/95 to-[#121f3a]/90 border border-cyan-400/18 rounded-[28px]",
    metricCard: "bg-[#0c1830]/78 border border-cyan-400/12 rounded-2xl hover:border-cyan-400/28 transition-colors",
    tableShell: "bg-[#0d1525]/82 border border-cyan-400/12 rounded-2xl",
    row: "bg-[#0a1428]/70 border border-cyan-400/10 rounded-xl hover:bg-[#0f1c38]/80 transition-colors",
    search: "bg-[#0b1422]/75 border border-cyan-400/16 rounded-full",
    footer: "bg-[#0a1220]/60 border-t border-cyan-300/8",
    buttonGhost: "bg-transparent border border-cyan-400/20 rounded-full text-brand-textMuted hover:border-cyan-300/40 hover:bg-cyan-500/8",
    buttonPrimary: "bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full text-slate-950",
    number: "bg-gradient-to-r from-emerald-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent",
    muted: "text-brand-textMuted",
    badgeLive: "border border-emerald-400/50 bg-emerald-500/14 text-emerald-200 rounded-full",
    badgeSeed: "border border-amber-400/50 bg-amber-500/14 text-amber-200 rounded-full",
    badgeCritical: "border border-rose-400/50 bg-rose-500/14 text-rose-200 rounded-full",
    badgeWarning: "border border-amber-400/45 bg-amber-500/14 text-amber-200 rounded-full",
    badgeInfo: "border border-cyan-400/45 bg-cyan-500/12 text-cyan-200 rounded-full",
  },
} as const;

export const CARD_PRESETS = DESIGN_TOKENS.cards;
export const TABLE_PRESETS = DESIGN_TOKENS.table;
