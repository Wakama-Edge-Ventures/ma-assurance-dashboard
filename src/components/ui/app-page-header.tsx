"use client";

import { ReactNode } from "react";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { useTenant } from "@/components/tenant/useTenant";
import { withAlpha } from "@/lib/tenant";
import { cn } from "@/lib/utils";

interface AppPageHeaderProps {
  title: string;
  description?: string;
  note?: string;
  action?: ReactNode;
  /**
   * Overrides the generic "Parcours assurance LIVE/SEED_DEMO" badge with the
   * real source label of the document being viewed (e.g. a single DCA).
   * Avoids implying SEED_DEMO on a dossier that came from a real submission.
   */
  workflowBadgeOverride?: { label: string; live: boolean } | null;
  /**
   * Forces both status chips into a clearly non-live state. Used when the
   * requested tenant does not match the backend-resolved session scope, so
   * the env-driven LIVE badges never imply live data for the wrong tenant.
   */
  forceNonLive?: boolean;
}

export function AppPageHeader({
  title,
  description,
  note,
  action,
  workflowBadgeOverride,
  forceNonLive = false,
}: AppPageHeaderProps) {
  const { tenant } = useTenant();
  const sharedLive = !forceNonLive && process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  const insuranceLiveDefault = process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";
  const insuranceLive = forceNonLive
    ? false
    : workflowBadgeOverride
      ? workflowBadgeOverride.live
      : insuranceLiveDefault;
  const scopeLabel = [tenant.countryLabel, tenant.institutionType].filter(Boolean).join(" · ");
  const workflowLabel = tenant.featureFlags.showInsuranceNavigation
    ? "Parcours assurance"
    : "Portefeuille agricole";
  const kicker =
    tenant.id === "assurance-ma"
      ? "Assurance agricole"
      : `${tenant.shortName} · ${tenant.vertical}`;

  return (
    <div
      className="relative mb-4 overflow-hidden rounded-[26px] p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(248,250,252,0.04)] md:p-8"
      style={{
        border: `1px solid ${withAlpha(tenant.colors.primary, "24")}`,
        background:
          "radial-gradient(560px 320px at 8% 0%, rgba(34,211,238,0.14), transparent 62%), radial-gradient(620px 420px at 100% 120%, rgba(139,92,246,0.16), transparent 60%), linear-gradient(135deg, rgba(16,23,38,0.96), rgba(11,16,30,0.92))",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_200px_at_92%_-10%,rgba(52,211,153,0.12),transparent_70%)]" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: tenant.colors.primary }}
          >
            {kicker}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.01em] text-white md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-[14px] leading-relaxed text-slate-400">{description}</p>
          ) : null}
          {note ? (
            <p className="max-w-2xl border-l-2 pl-3 text-[12px] text-[#5B6B86]" style={{ borderColor: withAlpha(tenant.colors.secondary, "45") }}>
              {note}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase"
              style={{
                borderColor: withAlpha(tenant.colors.primary, "45"),
                backgroundColor: withAlpha(tenant.colors.primary, "12"),
                color: tenant.colors.primary,
              }}
            >
              {scopeLabel}
            </span>
            <TenantBadge />
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase",
                sharedLive
                  ? "border-emerald-400/28 bg-emerald-400/10 text-emerald-400"
                  : "border-amber-400/26 bg-amber-400/9 text-amber-400",
              )}
            >
              {sharedLive && (
                <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
              {forceNonLive
                ? "Mode demo — donnees live masquees"
                : `Donnees partagees ${sharedLive ? "LIVE" : "SEED_DEMO"}`}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase",
                insuranceLive
                  ? "border-emerald-400/28 bg-emerald-400/10 text-emerald-400"
                  : "border-amber-400/26 bg-amber-400/9 text-amber-400",
              )}
            >
              {forceNonLive
                ? "Session incompatible — live desactive"
                : workflowBadgeOverride
                  ? workflowBadgeOverride.label
                  : `${workflowLabel} ${insuranceLive ? "LIVE" : "SEED_DEMO"}`}
            </span>
          </div>
        </div>
        {action ? <div className="flex-none">{action}</div> : null}
      </div>
    </div>
  );
}
