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
        "sticky top-0 z-20 flex items-center gap-[18px] px-[28px] py-[14px]",
        DESIGN_TOKENS.header.shell,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <Activity className="h-3.5 w-3.5 flex-none" style={{ color: tenant.colors.primary }} />
          <h2
            className={cn(
              "truncate font-display text-[17px] font-extrabold tracking-[-0.01em]",
              DESIGN_TOKENS.header.title,
            )}
          >
            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
          </h2>
          <span className="rounded-md bg-wk-surface2 px-1.5 py-0.5 font-mono text-[11px] font-medium text-wk-faint">
            {pathname}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12px] font-semibold text-wk-muted">
          {titlePrefix} · {tenantScopeLabel}
        </p>
      </div>

      <div
        className={cn(
          "hidden items-center gap-2.5 rounded-[11px] px-3.5 py-2 md:flex md:w-[260px]",
          DESIGN_TOKENS.header.searchShell,
        )}
      >
        <Search className="h-4 w-4 flex-none text-wk-faint" />
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

      <div className="flex items-center gap-2.5">
        <TenantDemoSwitcher />
        <TenantBadge className="hidden md:inline-flex" />

        {isApplicationsPage ? (
          <span
            className={cn(
              "hidden items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] md:inline-flex",
              DESIGN_TOKENS.pill.neutral,
            )}
          >
            Source par dossier
          </span>
        ) : isIdjorPage ? (
          <span className="hidden items-center gap-1.5 rounded-full bg-wk-violetSoft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] text-wk-violetInk md:inline-flex">
            Socle gouverne
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 rounded-full bg-wk-liveSoft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] text-wk-liveInk md:inline-flex">
            {tenant.demoMode ? "Vue demo" : "Vue active"}
          </span>
        )}

        <ThemeToggle />

        <div className="flex items-center gap-2.5 border-l border-wk-border pl-3">
          <div
            className={cn(
              "grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px]",
              "text-[12px] font-extrabold",
              DESIGN_TOKENS.header.avatarText,
            )}
            style={{ background: `linear-gradient(135deg, ${tenant.colors.accent}, ${tenant.colors.primary})` }}
          >
            {initials || "DW"}
          </div>
          <div className="hidden leading-tight xl:block">
            <p className={cn("text-[12.5px] font-bold", DESIGN_TOKENS.header.userName)}>{userName}</p>
            <p className={cn("text-[10.5px] font-semibold", DESIGN_TOKENS.text.faint)}>{tenant.shortName}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            router.push("/fr/login");
          }}
          className="gap-1.5 whitespace-nowrap rounded-[10px] hover:text-wk-coral"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Deconnexion</span>
        </Button>
      </div>
    </header>
  );
}
