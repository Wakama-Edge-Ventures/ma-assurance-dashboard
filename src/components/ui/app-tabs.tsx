"use client";

import { type ReactNode, useId, useState } from "react";

import { cn } from "@/lib/utils";

export interface AppTabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  content: ReactNode;
}

interface AppTabsProps {
  tabs: AppTabItem[];
  defaultTabKey?: string;
  className?: string;
}

export function AppTabs({ tabs, defaultTabKey, className }: AppTabsProps) {
  const baseId = useId();
  const [activeKey, setActiveKey] = useState(defaultTabKey ?? tabs[0]?.key);
  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        role="tablist"
        className="flex flex-wrap gap-1.5 rounded-2xl border border-brand-border/10 bg-brand-surfaceRaised/60 p-1.5 dark:border-cyan-400/10 dark:bg-[#0b1422]/70"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.key}`}
              onClick={() => setActiveKey(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                isActive
                  ? "bg-brand-surface text-slate-900 shadow-premium dark:bg-[#111d31] dark:text-white"
                  : "text-brand-textMuted hover:text-slate-900 dark:hover:text-slate-100",
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${activeTab.key}`}
        aria-labelledby={`${baseId}-tab-${activeTab.key}`}
        className="space-y-4"
      >
        {activeTab.content}
      </div>
    </div>
  );
}
