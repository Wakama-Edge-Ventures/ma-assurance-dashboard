"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, LogOut, Search } from "lucide-react";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { TenantDemoSwitcher } from "@/components/tenant/TenantDemoSwitcher";
import { useTenant } from "@/components/tenant/useTenant";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AUTH_CHANGED_EVENT, getAuthenticatedUser, signOut } from "@/lib/auth";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
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
  const isIdjorPage = pathname.startsWith("/fr/idjor");
  const titlePrefix = isIdjorPage
    ? `${tenant.terminology.idjorLabel} gouverne`
    : tenant.id === "assurance-ma"
      ? "Assurance agricole"
      : "Vue institutionnelle";
  const tenantScopeLabel = [tenant.countryLabel, tenant.institutionType].filter(Boolean).join(" · ");
  const searchPlaceholder =
    tenant.id === "assurance-ma"
      ? "Rechercher agriculteur, parcelle, alerte..."
      : "Rechercher dossier, portefeuille, alerte...";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center gap-[18px] px-[30px] py-[18px] backdrop-blur-lg",
        DESIGN_TOKENS.header.shell,
      )}
    >
      <div className="flex flex-col leading-[1.15]">
        <span
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: tenant.colors.primary }}
        >
          <Activity className="h-3 w-3" />
          {titlePrefix}
        </span>
        <span
          className={cn(
            "mt-0.5 font-display text-[20px] font-semibold tracking-[-0.01em]",
            DESIGN_TOKENS.header.title,
          )}
        >
          {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
        </span>
      </div>

      <div
        className={cn(
          "hidden items-center gap-2.5 rounded-full px-4 py-2.5 md:flex md:w-[360px]",
          DESIGN_TOKENS.header.searchShell,
        )}
      >
        <Search className="h-[15px] w-[15px] flex-none text-brand-textMuted" />
        <input
          placeholder={searchPlaceholder}
          className={cn(
            "w-full border-0 bg-transparent text-[13px] outline-none",
            DESIGN_TOKENS.header.searchInput,
          )}
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

        <TenantDemoSwitcher />
        <TenantBadge className="hidden md:inline-flex" />
        <ThemeToggle />

        {isApplicationsPage ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.04em]",
              DESIGN_TOKENS.pill.neutral,
            )}
          >
            Source par dossier
          </span>
        ) : isIdjorPage ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.04em] text-amber-700 dark:border-amber-400/28 dark:text-amber-300">
            Socle gouverne
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.04em] text-emerald-700 dark:border-emerald-400/28 dark:text-emerald-400">
            {tenant.demoMode ? "Vue demo" : "Vue active"}
          </span>
        )}

        <div className="flex items-center gap-2.5 border-l border-brand-border/10 pl-3.5">
          <div
            className={cn(
              "grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px]",
              "font-mono text-[12px] font-semibold",
              DESIGN_TOKENS.header.avatarText,
            )}
            style={{
              background: `linear-gradient(135deg, ${tenant.colors.accent}, ${tenant.colors.primary})`,
              boxShadow: `0 0 16px ${withAlpha(tenant.colors.accent, "4D")}`,
            }}
          >
            {initials || "DW"}
          </div>
          <div className="hidden leading-tight xl:block">
            <p className={cn("text-[12.5px] font-medium", DESIGN_TOKENS.header.userName)}>{userName}</p>
            <p className={cn("text-[10.5px] uppercase tracking-[0.08em]", DESIGN_TOKENS.text.faint)}>
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
          className="gap-1.5 whitespace-nowrap rounded-[10px] border border-brand-border/10 text-brand-textMuted hover:border-red-400/30 hover:text-red-500 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Deconnexion</span>
        </Button>
      </div>
    </header>
  );
}
