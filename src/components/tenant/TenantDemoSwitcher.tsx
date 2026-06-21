"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { TENANTS, TenantId } from "@/config/tenants";
import { Button } from "@/components/ui/button";
import {
  getTenantPostLoginUrl,
  isTenantId,
  TENANT_COOKIE_NAME,
  withAlpha,
} from "@/lib/tenant";

import { useTenant } from "./useTenant";

const DEMO_TENANT_IDS: readonly TenantId[] = [
  "assurance-ma",
  "bni-ci",
  "bad-program",
  "wakama",
];

function hasTenantCookie() {
  if (typeof document === "undefined") return false;

  const cookiePrefix = `${TENANT_COOKIE_NAME}=`;
  return document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .some((chunk) => {
      const value = chunk.startsWith(cookiePrefix)
        ? chunk.slice(cookiePrefix.length)
        : null;

      return isTenantId(value);
    });
}

export function TenantDemoSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasTenantContext, setHasTenantContext] = useState(false);

  useEffect(() => {
    setHasTenantContext(Boolean(searchParams.get("tenant")) || hasTenantCookie());
  }, [searchParams]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const shouldShow =
    tenant.demoMode || process.env.NODE_ENV !== "production" || hasTenantContext;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="ghost"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="h-9 gap-1.5 rounded-full border border-slate-400/14 bg-slate-950/30 px-2.5 text-[11px] font-medium text-slate-300 hover:border-slate-300/20 hover:bg-slate-900/60 hover:text-white"
      >
        <span className="font-mono uppercase tracking-[0.12em] text-slate-400">
          {"D\u00e9mo"}
        </span>
        <span
          className="hidden max-w-[84px] truncate rounded-full px-1.5 py-0.5 text-[10px] sm:inline"
          style={{
            color: tenant.colors.primary,
            backgroundColor: withAlpha(tenant.colors.primary, "14"),
          }}
        >
          {tenant.shortName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-[220px] rounded-2xl border border-slate-400/12 bg-[#08101d]/96 p-2 shadow-[0_18px_48px_rgba(2,6,23,0.45)] backdrop-blur-xl"
        >
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Operateur demo
          </p>

          {DEMO_TENANT_IDS.map((tenantId) => {
            const option = TENANTS[tenantId];
            const isActive = option.id === tenant.id;

            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setIsOpen(false);
                  router.replace(getTenantPostLoginUrl(option.id));
                }}
                className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
                style={
                  isActive
                    ? {
                        backgroundColor: withAlpha(option.colors.primary, "18"),
                        outline: `1px solid ${withAlpha(option.colors.primary, "36")}`,
                      }
                    : undefined
                }
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-white">
                    {option.displayName}
                  </span>
                  <span className="block truncate text-[10.5px] uppercase tracking-[0.08em] text-slate-500">
                    {option.id}
                  </span>
                </span>
                <span
                  className="ml-3 h-2.5 w-2.5 flex-none rounded-full"
                  style={{ backgroundColor: option.colors.primary }}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
