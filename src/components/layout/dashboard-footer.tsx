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
    <footer className="w-full border-t border-wk-border bg-wk-surface">
      <div className="flex h-[34px] items-center justify-between border-b border-wk-border px-6 text-[11.5px] font-semibold text-wk-faint">
        <span>Wakama · Plateforme institutionnelle · Audit append-only actif</span>
        <span className="flex items-center gap-1.5">
          <span className="h-[7px] w-[7px] rounded-full bg-wk-live" />
          {sessionMismatch ? "Session incompatible · live desactive" : "Service nominal · v3.0"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-wk-border px-8 py-4">
        <div className="flex items-center gap-2.5">
          <TenantLogo
            alt={tenant.displayName}
            className="h-6 w-auto flex-none object-contain"
            width={144}
            height={48}
          />
          <div className="flex flex-col">
            <span className="text-[12.5px] font-bold text-wk-text">{tenant.displayName}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-wk-faint">
              {[tenant.countryLabel, tenant.vertical].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>

        <TenantBadge className="ml-auto" />

        <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold text-wk-muted">
          {sessionMismatch ? (
            <span className="text-wk-amberInk">Session incompatible — live desactive</span>
          ) : (
            <>
              <span className={sharedLive ? "text-wk-liveInk" : ""}>
                Shared data{sharedLive ? " LIVE" : ""}
              </span>
              <span>·</span>
              <span>
                {workflowLabel}
                {insuranceLive && <span className="ml-1 text-wk-liveInk">LIVE</span>}
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
            className="text-[11px] font-semibold text-wk-muted transition-colors hover:text-wk-text"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
