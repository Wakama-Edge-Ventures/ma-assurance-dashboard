"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Laptop },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex h-8 w-[164px] items-center rounded-full border border-brand-border/25 bg-brand-surface px-1" />
    );
  }

  return (
    <div className="inline-flex items-center rounded-full border border-brand-border/25 bg-brand-surfaceRaised/70 p-0.5">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = theme === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => setTheme(option.key)}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition",
              selected
                ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-slate-900 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.28)] dark:text-slate-100"
                : "text-brand-textMuted hover:text-slate-900 dark:text-brand-textMuted dark:hover:text-slate-100",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
