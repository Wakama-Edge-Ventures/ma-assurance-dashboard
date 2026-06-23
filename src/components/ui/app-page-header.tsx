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
    <div className="relative mb-4 overflow-hidden rounded-[20px] border border-wk-border bg-wk-surface p-6 shadow-wk-sm md:p-8">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: tenant.colors.primary }}
          >
            {kicker}
          </p>
          <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-wk-text md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-[14px] font-medium leading-relaxed text-wk-muted">{description}</p>
          ) : null}
          {note ? (
            <p
              className="max-w-2xl border-l-2 pl-3 text-[12px] font-medium text-wk-faint"
              style={{ borderColor: withAlpha(tenant.colors.secondary, "45") }}
            >
              {note}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase"
              style={{
                backgroundColor: withAlpha(tenant.colors.primary, "14"),
                color: tenant.colors.primary,
              }}
            >
              {scopeLabel}
            </span>
            <TenantBadge />
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase",
                sharedLive ? "bg-wk-liveSoft text-wk-liveInk" : "bg-wk-amberSoft text-wk-amberInk",
              )}
            >
              {sharedLive && <span className="oracle-live-dot h-1.5 w-1.5 rounded-full bg-wk-live" />}
              {forceNonLive
                ? "Mode demo — donnees live masquees"
                : `Donnees partagees ${sharedLive ? "LIVE" : "SEED_DEMO"}`}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase",
                insuranceLive ? "bg-wk-liveSoft text-wk-liveInk" : "bg-wk-amberSoft text-wk-amberInk",
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
