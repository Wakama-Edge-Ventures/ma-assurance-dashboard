"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, LogOut, Search } from "lucide-react";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { useTenant } from "@/components/tenant/useTenant";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AUTH_CHANGED_EVENT, getAuthenticatedUser, signOut } from "@/lib/auth";
import { withAlpha } from "@/lib/tenant";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { tenant } = useTenant();
  const [userName, setUserName] = useState("Utilisateur");

  useEffect(() => {
    const syncUser = () => {
      const user = getAuthenticatedUser();
      setUserName(user?.fullName ?? "Utilisateur");
    };

    syncUser();
    window.addEventListener(AUTH_CHANGED_EVENT, syncUser);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUser);
    };
  }, []);

  const currentPage =
    pathname.split("/").filter(Boolean)[1]?.replaceAll("-", " ") ?? "dashboard";

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const isApplicationsPage = pathname.startsWith("/fr/applications");
  const titlePrefix = tenant.id === "assurance-ma" ? "Telemetrie en direct" : tenant.shortName;
  const tenantScopeLabel = [tenant.countryLabel, tenant.institutionType].filter(Boolean).join(" · ");
  const searchPlaceholder =
    tenant.id === "assurance-ma"
      ? "Rechercher agriculteur, parcelle, alerte..."
      : "Rechercher dossier, portefeuille, alerte...";

  return (
    <header className="sticky top-0 z-20 flex items-center gap-[18px] border-b border-slate-400/10 bg-[#070b17]/45 px-[30px] py-[18px] backdrop-blur-lg">
      <div className="flex flex-col leading-[1.15]">
        <span
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: tenant.colors.primary }}
        >
          <Activity className="h-3 w-3" />
          {titlePrefix}
        </span>
        <span className="mt-0.5 font-display text-[20px] font-semibold tracking-[-0.01em] text-white">
          {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
        </span>
      </div>

      <div className="hidden items-center gap-2.5 rounded-full border border-slate-400/18 bg-[#0d1525]/70 px-4 py-2.5 md:flex md:w-[360px]">
        <Search className="h-[15px] w-[15px] flex-none text-slate-400" />
        <input
          placeholder={searchPlaceholder}
          className="w-full border-0 bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-slate-500"
          readOnly
          aria-label="Recherche"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.04em] md:inline-flex"
          style={{
            borderColor: withAlpha(tenant.colors.primary, "45"),
            backgroundColor: withAlpha(tenant.colors.primary, "12"),
            color: tenant.colors.primary,
          }}
        >
          {tenantScopeLabel}
        </span>

        <TenantBadge className="hidden md:inline-flex" />
        <ThemeToggle />

        {isApplicationsPage ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/22 bg-slate-400/10 px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.04em] text-slate-300">
            Source par dossier
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/28 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.04em] text-emerald-400">
            <span className="oracle-live-dot inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Live
          </span>
        )}

        <div className="flex items-center gap-2.5 border-l border-slate-400/10 pl-3.5">
          <div
            className={cn(
              "grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px]",
              "font-mono text-[12px] font-semibold text-white",
            )}
            style={{
              background: `linear-gradient(135deg, ${tenant.colors.accent}, ${tenant.colors.primary})`,
              boxShadow: `0 0 16px ${withAlpha(tenant.colors.accent, "4D")}`,
            }}
          >
            {initials || "DW"}
          </div>
          <div className="hidden leading-tight xl:block">
            <p className="text-[12.5px] font-medium text-white">{userName}</p>
            <p className="text-[10.5px] uppercase tracking-[0.08em] text-slate-500">
              {tenant.shortName}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            router.push("/fr/login");
          }}
          className="gap-1.5 whitespace-nowrap rounded-[10px] border border-slate-400/10 text-slate-400 hover:border-red-400/30 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Deconnexion</span>
        </Button>
      </div>
    </header>
  );
}
