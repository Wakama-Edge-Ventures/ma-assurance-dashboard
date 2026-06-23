"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, ShieldAlert } from "lucide-react";

import { AppCard } from "@/components/ui/app-card";
import { Button } from "@/components/ui/button";
import { TENANTS, TenantConfig } from "@/config/tenants";
import { signOut } from "@/lib/auth";
import { isTenantId } from "@/lib/tenant";
import { TenantConsistencyResult } from "@/lib/tenant-session-consistency";

interface TenantSessionMismatchCardProps {
  consistency: TenantConsistencyResult;
  requestedTenant: TenantConfig;
  /**
   * When provided, renders a third "continue without live data" action.
   * Only pass this when the page can safely render without live data and
   * clearly labels the result as non-live.
   */
  onContinueDemoMode?: () => void;
  /** Technical resolution mode (e.g. SCOPE_INFERRED), shown only in the discreet diagnostic line. */
  resolutionMode?: string | null;
}

export function TenantSessionMismatchCard({
  consistency,
  requestedTenant,
  onContinueDemoMode,
  resolutionMode,
}: TenantSessionMismatchCardProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const isMismatch = consistency.state === "MISMATCH";
  const backendTenantKey = consistency.backendScope?.tenantKey ?? null;
  const backendTenantConfig =
    backendTenantKey && isTenantId(backendTenantKey) ? TENANTS[backendTenantKey] : null;
  const backendLabel = backendTenantConfig?.displayName ?? backendTenantKey ?? "session inconnue";

  const returnHref = backendTenantConfig
    ? `${backendTenantConfig.postLoginPath}?tenant=${backendTenantConfig.id}`
    : "/fr/applications?tenant=assurance-ma";
  const returnLabel = backendTenantConfig
    ? `Revenir a ${backendTenantConfig.displayName}`
    : "Revenir a mon espace";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.push("/fr/login");
    }
  }

  return (
    <AppCard className="space-y-4 border-amber-400/30 bg-amber-400/5 p-5" tone="soft">
      <div className="flex items-center gap-2">
        {isMismatch ? (
          <ShieldAlert className="h-5 w-5 text-amber-400" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        )}
        <p className="font-display text-base font-semibold text-white">
          {isMismatch
            ? "Contexte demo incompatible"
            : "Verification du contexte de session impossible"}
        </p>
      </div>

      <div className="space-y-2 text-sm text-slate-300">
        {isMismatch ? (
          <>
            <p>Session reelle : {backendLabel}.</p>
            <p>Donnees live masquees pour le mode {requestedTenant.shortName}.</p>
            <p>
              Pour eviter toute confusion ou fuite de contexte, les donnees live de cette session
              ne sont pas affichees comme donnees {requestedTenant.shortName}.
            </p>
            <p>
              Connectez-vous avec un compte compatible {requestedTenant.shortName}, ou revenez au
              tenant {backendLabel}.
            </p>
          </>
        ) : (
          <>
            <p>Contexte session non verifie.</p>
            <p>Donnees live masquees pour le mode {requestedTenant.shortName}.</p>
            <p>
              Par precaution, aucune donnee live n&apos;est affichee comme appartenant a ce
              tenant tant que la correspondance n&apos;est pas confirmee.
            </p>
          </>
        )}
      </div>

      <p className="rounded-xl border border-slate-400/15 bg-slate-900/40 px-3 py-2 font-mono text-[11px] text-slate-400">
        Session backend : {backendTenantKey ?? "inconnue"}
        {resolutionMode ? ` — Resolution : ${resolutionMode}` : ""}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => router.push(returnHref)}>
          {returnLabel}
        </Button>
        <Button variant="secondary" onClick={handleSignOut} disabled={signingOut}>
          <LogOut className="h-4 w-4" />
          Se deconnecter
        </Button>
        {onContinueDemoMode ? (
          <Button variant="ghost" onClick={onContinueDemoMode}>
            Continuer en maquette non-live
          </Button>
        ) : null}
      </div>
    </AppCard>
  );
}
