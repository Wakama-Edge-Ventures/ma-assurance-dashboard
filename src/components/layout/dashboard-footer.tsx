"use client";

import Link from "next/link";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { TenantLogo } from "@/components/tenant/TenantLogo";
import { useTenant } from "@/components/tenant/useTenant";
import { useTenantSessionConsistency } from "@/hooks/useTenantSessionConsistency";

const FOOTER_LINKS = [
  { label: "Reporter un bug", href: "/fr/bug" },
  { label: "Contacter la HotLine", href: "/fr/hotline" },
  { label: "Documentation", href: "/fr/docs" },
  { label: "Verification registre Blockchain", href: "/fr/blockchain" },
  { label: "Politique de confidentialite et securite", href: "/fr/privacy" },
] as const;

export function DashboardFooter() {
  const { tenant } = useTenant();
  const tenantConsistency = useTenantSessionConsistency();
  const sessionMismatch = !tenantConsistency.checking && tenantConsistency.state !== "MATCH";
  const sharedLive = !sessionMismatch && process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  const insuranceLive = !sessionMismatch && process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";
  const workflowLabel =
    tenant.id === "assurance-ma" ? "Workflows assurance" : tenant.terminology.portfolioLabel;

  return (
    <footer className="w-full border-t border-brand-border/10 bg-brand-surface/80 dark:bg-[#070b17]/60">
      <div className="flex flex-wrap items-center gap-4 border-b border-brand-border/6 px-8 py-4">
        <div className="flex items-center gap-2.5">
          <TenantLogo
            alt={tenant.displayName}
            className="h-6 w-auto flex-none object-contain"
            width={144}
            height={48}
          />
          <div className="flex flex-col">
            <span className="text-[12.5px] font-medium text-brand-textMuted">{tenant.displayName}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-brand-textMuted">
              {[tenant.countryLabel, tenant.vertical].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>

        <TenantBadge className="ml-auto" />

        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-brand-textMuted">
          {sessionMismatch ? (
            <span className="text-amber-600 dark:text-amber-400">
              Session incompatible — live desactive
            </span>
          ) : (
            <>
              <span className={sharedLive ? "text-emerald-600 dark:text-emerald-400" : ""}>
                Shared data{sharedLive ? " LIVE" : ""}
              </span>
              <span>·</span>
              <span>
                {workflowLabel}
                {insuranceLive && <span className="ml-1 text-emerald-600 dark:text-emerald-400">LIVE</span>}
              </span>
            </>
          )}
          <span>·</span>
          <span>© 2026 Wakama Edge Ventures Inc.</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-8 py-3">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-[11px] text-brand-textMuted transition-colors hover:text-slate-900 dark:hover:text-slate-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
