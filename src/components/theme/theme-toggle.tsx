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
    return <div className="inline-flex h-9 w-[38px] items-center rounded-[11px] border border-wk-border bg-wk-surface2" />;
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-[11px] border border-wk-border bg-wk-surface2 p-0.5">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = theme === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => setTheme(option.key)}
            title={option.label}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-[9px] px-2 text-[11px] font-semibold transition",
              selected ? "bg-wk-primarySoft text-wk-primaryInk" : "text-wk-muted hover:text-wk-text",
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
