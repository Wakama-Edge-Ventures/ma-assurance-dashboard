"use client";

import Link from "next/link";

import { useTenant } from "@/components/tenant/useTenant";
import { useTenantSessionConsistency } from "@/hooks/useTenantSessionConsistency";

const FOOTER_LINKS = [
  { label: "Documentation", href: "/fr/docs" },
  { label: "Support", href: "/fr/support" },
  { label: "Securite & confidentialite", href: "/fr/privacy" },
  { label: "Verification blockchain", href: "/fr/blockchain" },
] as const;

export function DashboardFooter() {
  const { tenant } = useTenant();
  const tenantConsistency = useTenantSessionConsistency();
  const sessionMismatch = !tenantConsistency.checking && tenantConsistency.state !== "MATCH";
  const governanceLabel = tenant.featureFlags.showInsuranceNavigation
    ? "Gouvernance IA non decisionnelle"
    : "Gouvernance documentaire";

  return (
    <footer className="w-full border-t border-wk-border bg-[linear-gradient(180deg,var(--wk-surface)_0%,var(--wk-surface-2)_100%)]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="font-display text-[15px] font-extrabold tracking-[-0.02em] text-wk-text">
            Wakama Edge Ventures
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-wk-faint">
            {[tenant.countryLabel, tenant.vertical].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-wk-border bg-wk-surface px-4 py-2 text-[12px] font-semibold text-wk-muted shadow-wk-sm">
          <span className="h-2 w-2 rounded-full bg-wk-live" />
          <span>
            {governanceLabel} · {sessionMismatch ? "Audit active" : "Service nominal"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[12px] font-semibold text-wk-muted transition-colors hover:text-wk-text"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-wk-border bg-wk-surface/70">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-2 px-6 py-3 text-[11px] font-medium text-wk-faint">
          <span>Plateforme institutionnelle en lecture encadree</span>
          <span>{sessionMismatch ? "Contexte live masque par garde-fou tenant" : "Tracabilite d'audit conservee"}</span>
        </div>
      </div>
    </footer>
  );
}
