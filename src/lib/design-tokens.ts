export const DESIGN_TOKENS = {
  appShell: {
    page: "bg-wk-bg text-wk-text",
    mutedText: "text-wk-muted",
  },
  surfaces: {
    base: "bg-wk-surface border border-wk-border",
    muted: "bg-wk-surface2 border border-wk-border",
    glass: "bg-wk-surface/95 border border-wk-border backdrop-blur-xl",
  },
  cards: {
    base: "rounded-[18px] border border-wk-border bg-wk-surface p-4 shadow-wk-sm transition-all",
    soft: "rounded-[18px] border border-wk-border bg-wk-surface2 p-5 shadow-wk-sm transition-all",
    subtle: "rounded-2xl border border-wk-border bg-wk-surface2 p-3.5",
    hover: "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-wk",
  },
  table: {
    wrapper: "overflow-x-auto rounded-2xl border border-wk-border bg-wk-surface shadow-wk-sm",
    header: "border-b border-wk-border bg-wk-surface2 text-[11px] uppercase tracking-[0.08em] text-wk-faint",
    row: "border-b border-wk-border transition-colors hover:bg-wk-surface2",
    filterPanel: "grid gap-2.5 rounded-2xl border border-wk-border bg-wk-surface p-3.5 shadow-wk-sm",
  },
  sidebar: {
    shell: "border-r border-wk-border bg-wk-surface",
    brandTitle: "text-wk-text",
    groupLabel: "text-wk-faint",
    toggleButton: "border border-wk-border bg-wk-surface2 text-wk-muted hover:text-wk-text",
    footer: "border-t border-wk-border bg-wk-surface2",
    footerText: "text-wk-muted",
    active: "bg-wk-primarySoft text-wk-primaryInk",
    item: "text-wk-muted hover:bg-wk-surface2 hover:text-wk-text",
    icon: "text-wk-muted",
  },
  header: {
    shell: "border-b border-wk-border bg-wk-surface",
    title: "text-wk-text",
    searchShell: "border border-wk-border bg-wk-surface2",
    searchInput: "text-wk-text placeholder:text-wk-faint",
    avatarText: "text-white",
    userName: "text-wk-text",
  },
  buttons: {
    primary: "bg-wk-primary text-white shadow-wk-sm hover:bg-wk-primaryInk focus-visible:ring-wk-primary",
    secondary:
      "border border-wk-border2 bg-wk-surface text-wk-text hover:bg-wk-surface2 focus-visible:ring-wk-primary",
    ghost: "bg-transparent text-wk-muted hover:bg-wk-surface2 hover:text-wk-text focus-visible:ring-wk-primary",
    danger: "bg-wk-coral text-white hover:bg-wk-coralInk focus-visible:ring-wk-coral",
  },
  status: {
    neutral: "text-wk-text",
    info: "text-wk-tealInk",
    success: "text-wk-primaryInk",
    warning: "text-wk-amberInk",
    danger: "text-wk-coralInk",
  },
  severity: {
    critical: "border border-wk-border bg-wk-coralSoft text-wk-coralInk",
    warning: "border border-wk-border bg-wk-amberSoft text-wk-amberInk",
    info: "border border-wk-border bg-wk-tealSoft text-wk-tealInk",
    unknown: "border border-wk-border bg-wk-surface3 text-wk-muted",
  },
  dataSource: {
    live: "border border-wk-border bg-wk-liveSoft text-wk-liveInk",
    seedDemo: "border border-wk-border bg-wk-violetSoft text-wk-violetInk",
  },
  text: {
    heading: "text-wk-text",
    body: "text-wk-text",
    muted: "text-wk-muted",
    faint: "text-wk-faint",
  },
  pill: {
    neutral: "rounded-full border border-wk-border bg-wk-surface2 text-wk-text",
    accent: "rounded-full border border-wk-border bg-wk-primarySoft text-wk-primaryInk",
  },
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wk-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-wk-bg",
  controls: {
    input:
      "oracle-search-input w-full rounded-full border border-wk-border bg-wk-surface2 px-3 py-2 text-sm text-wk-text outline-none transition focus:border-wk-primary focus:ring-2 focus:ring-wk-primary/18",
    select:
      "w-full rounded-xl border border-wk-border bg-wk-surface2 px-3 py-2 text-sm text-wk-text outline-none transition focus:border-wk-primary focus:ring-2 focus:ring-wk-primary/18",
    resetButton:
      "rounded-full border border-wk-border bg-wk-surface px-3 py-1.5 text-xs text-wk-muted transition-colors hover:bg-wk-surface2 hover:text-wk-text",
    tableAction:
      "inline-flex items-center rounded-full border border-wk-border bg-wk-surface px-2.5 py-1.5 text-xs text-wk-text transition-colors hover:bg-wk-surface2",
  },
  telemetry: {
    value: "font-semibold tabular-nums text-wk-text",
    valueAccent: "font-semibold tabular-nums text-wk-primaryInk",
    frame: "rounded-2xl border border-wk-border bg-wk-surface",
    transparentButton:
      "inline-flex items-center gap-1 rounded-full border border-wk-border bg-wk-surface px-3 py-1.5 text-xs text-wk-muted transition-colors hover:bg-wk-surface2",
  },
  oracle: {
    background: "bg-wk-bg",
    panel: "bg-wk-surface border border-wk-border rounded-2xl",
    panelStrong: "bg-wk-surface2 border border-wk-border rounded-2xl",
    panelSoft: "bg-wk-surface2 border border-wk-border rounded-2xl",
    hero: "bg-wk-surface border border-wk-border rounded-[28px]",
    metricCard: "bg-wk-surface border border-wk-border rounded-2xl hover:shadow-wk transition-shadow",
    tableShell: "bg-wk-surface border border-wk-border rounded-2xl",
    row: "bg-wk-surface2 border border-wk-border rounded-xl hover:bg-wk-surface3 transition-colors",
    search: "bg-wk-surface2 border border-wk-border rounded-full",
    footer: "bg-wk-surface2 border-t border-wk-border",
    buttonGhost: "bg-transparent border border-wk-border rounded-full text-wk-muted hover:bg-wk-surface2",
    buttonPrimary: "bg-wk-primary rounded-full text-white",
    number: "text-wk-text",
    muted: "text-wk-muted",
    badgeLive: "border border-wk-border bg-wk-liveSoft text-wk-liveInk rounded-full",
    badgeSeed: "border border-wk-border bg-wk-amberSoft text-wk-amberInk rounded-full",
    badgeCritical: "border border-wk-border bg-wk-coralSoft text-wk-coralInk rounded-full",
    badgeWarning: "border border-wk-border bg-wk-amberSoft text-wk-amberInk rounded-full",
    badgeInfo: "border border-wk-border bg-wk-tealSoft text-wk-tealInk rounded-full",
  },
} as const;

export const CARD_PRESETS = DESIGN_TOKENS.cards;
export const TABLE_PRESETS = DESIGN_TOKENS.table;
