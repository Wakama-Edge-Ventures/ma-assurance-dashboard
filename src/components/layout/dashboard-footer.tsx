"use client";

import Link from "next/link";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { TenantLogo } from "@/components/tenant/TenantLogo";
import { useTenant } from "@/components/tenant/useTenant";

const FOOTER_LINKS = [
  { label: "Reporter un bug", href: "/fr/bug" },
  { label: "Contacter la HotLine", href: "/fr/hotline" },
  { label: "Documentation", href: "/fr/docs" },
  { label: "Verification registre Blockchain", href: "/fr/blockchain" },
  { label: "Politique de confidentialite et securite", href: "/fr/privacy" },
] as const;

export function DashboardFooter() {
  const { tenant } = useTenant();
  const sharedLive = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  const insuranceLive = process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";
  const workflowLabel =
    tenant.id === "assurance-ma" ? "Workflows assurance" : tenant.terminology.portfolioLabel;

  return (
    <footer className="w-full border-t border-slate-400/10 bg-[#070b17]/60">
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-400/6 px-8 py-4">
        <div className="flex items-center gap-2.5">
          <TenantLogo
            alt={tenant.displayName}
            className="h-6 w-auto flex-none object-contain"
            width={144}
            height={48}
          />
          <div className="flex flex-col">
            <span className="text-[12.5px] font-medium text-slate-400">{tenant.displayName}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
              {[tenant.countryLabel, tenant.vertical].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>

        <TenantBadge className="ml-auto" />

        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-[#5B6B86]">
          <span className={sharedLive ? "text-emerald-400" : ""}>
            Shared data{sharedLive ? " LIVE" : ""}
          </span>
          <span>·</span>
          <span>
            {workflowLabel}
            {insuranceLive && <span className="ml-1 text-emerald-400">LIVE</span>}
          </span>
          <span>·</span>
          <span>© 2026 Wakama Edge Ventures Inc.</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-8 py-3">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-[11px] text-slate-500 transition-colors hover:text-slate-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
