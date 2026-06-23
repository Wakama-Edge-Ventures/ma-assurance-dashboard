"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType } from "react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  Cpu,
  FileChartColumnIncreasing,
  FileCheck2,
  FileWarning,
  Handshake,
  Home,
  Landmark,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Settings,
  Shield,
  Sprout,
  Tractor,
  Users,
} from "lucide-react";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { useTenant } from "@/components/tenant/useTenant";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const BASE_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { key: "dashboard", href: "/fr/dashboard", label: "Tableau de bord", icon: Home },
      { key: "idjor", href: "/fr/idjor", label: "Socle IDJOR", icon: Cpu },
    ],
  },
  {
    label: "Donnees",
    items: [
      { key: "farmers", href: "/fr/farmers", label: "Agriculteurs", icon: Tractor },
      { key: "cooperatives", href: "/fr/cooperatives", label: "Cooperatives", icon: Users },
      { key: "alerts", href: "/fr/alerts", label: "Alertes Wakama", icon: Bell },
    ],
  },
  {
    label: "Parcours",
    items: [
      { key: "applications", href: "/fr/applications", label: "Demandes", icon: BriefcaseBusiness },
      { key: "missions", href: "/fr/missions", label: "Missions", icon: ClipboardCheck },
      { key: "arbitrage", href: "/fr/arbitrage", label: "Arbitrage", icon: Scale },
      { key: "rax", href: "/fr/rax", label: "RAX / WRS", icon: FileWarning },
      { key: "pricing", href: "/fr/pricing", label: "Tarification", icon: Landmark },
      { key: "policies", href: "/fr/policies", label: "Polices", icon: FileCheck2 },
    ],
  },
  {
    label: "Suivi",
    items: [
      { key: "monitoring", href: "/fr/monitoring", label: "Monitoring", icon: Shield },
      { key: "claims", href: "/fr/claims", label: "Sinistres", icon: Handshake },
      { key: "analytics", href: "/fr/analytics", label: "Analytics", icon: BarChart3 },
      { key: "reports", href: "/fr/reports", label: "Rapports", icon: FileChartColumnIncreasing },
      { key: "settings", href: "/fr/settings", label: "Parametres", icon: Settings },
    ],
  },
];

function getTenantNavGroups(tenant: ReturnType<typeof useTenant>["tenant"]): NavGroup[] {
  const groupLabel = tenant.featureFlags.showInsuranceNavigation
    ? "Assurance agricole"
    : tenant.terminology.portfolioLabel;

  return BASE_NAV_GROUPS.map((group) => {
    const nextLabel =
      group.label === "Donnees"
        ? tenant.id === "assurance-ma"
          ? "Donnees Wakama"
          : "Donnees partagees"
        : group.label === "Parcours"
          ? groupLabel
          : group.label;

    const items = group.items
      .filter((item) => {
        if (item.key === "rax") return tenant.featureFlags.showRaxNavigation;
        if (item.key === "claims") return tenant.featureFlags.showClaimsNavigation;
        if (item.key === "policies") return tenant.featureFlags.showPoliciesNavigation;
        return true;
      })
      .map((item) => {
        switch (item.key) {
          case "applications":
            return { ...item, label: tenant.terminology.applicationsLabel };
          case "missions":
            return {
              ...item,
              label: tenant.featureFlags.showInsuranceNavigation ? "Missions" : "Collecte terrain",
            };
          case "arbitrage":
            return {
              ...item,
              label: tenant.featureFlags.showInsuranceNavigation
                ? "Arbitrage"
                : tenant.terminology.committeeLabel,
            };
          case "rax":
            return { ...item, label: tenant.terminology.scoreLabel };
          case "pricing":
            return {
              ...item,
              label: tenant.featureFlags.showInsuranceNavigation ? "Tarification" : "Analyse",
            };
          case "policies":
            return {
              ...item,
              label: tenant.featureFlags.showInsuranceNavigation ? "Polices" : "Accords",
            };
          case "claims":
            return {
              ...item,
              label: tenant.featureFlags.showInsuranceNavigation ? "Sinistres" : "Incidents",
            };
          case "alerts":
            return {
              ...item,
              label: tenant.id === "assurance-ma" ? "Alertes Wakama" : "Alertes terrain",
            };
          case "idjor":
            return { ...item, label: tenant.terminology.idjorLabel };
          default:
            return item;
        }
      });

    return {
      label: nextLabel,
      items,
    };
  });
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const navGroups = getTenantNavGroups(tenant);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen flex-col py-[18px] lg:flex",
        DESIGN_TOKENS.sidebar.shell,
        collapsed ? "w-[76px] items-center px-3" : "w-[252px] px-4",
        "transition-[width] duration-200",
      )}
    >
      <div className={cn("mb-4 flex items-center border-b border-wk-border pb-[14px]", collapsed ? "justify-center" : "gap-2.5 px-0.5")}>
        <div
          className="grid h-9 w-9 flex-none place-items-center rounded-[11px]"
          style={{ background: `linear-gradient(145deg, ${tenant.colors.primary}, ${tenant.colors.secondary})` }}
        >
          <Sprout className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-col leading-tight">
            <span
              className={cn(
                "truncate font-display text-[15px] font-extrabold tracking-[-0.01em]",
                DESIGN_TOKENS.sidebar.brandTitle,
              )}
            >
              {tenant.displayName}
            </span>
            <span className="mt-0.5 truncate text-[11px] font-semibold text-wk-muted">
              {tenant.vertical}
            </span>
          </div>
        )}
      </div>

      {!collapsed && <TenantBadge className="mb-3 self-start" />}

      <div className={cn("mb-3", collapsed ? "flex justify-center" : "")}>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
            DESIGN_TOKENS.sidebar.toggleButton,
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <>
              <PanelLeftClose className="h-3.5 w-3.5" />
              <span>Reduire</span>
            </>
          )}
        </button>
      </div>

      <nav className={cn("flex-1 space-y-3.5 overflow-y-auto", collapsed && "w-full")}>
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!collapsed && (
              <p
                className={cn(
                  "px-2.5 pb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.13em]",
                  DESIGN_TOKENS.sidebar.groupLabel,
                )}
              >
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-[10px] text-[13.5px] font-semibold transition-all duration-150",
                    collapsed ? "justify-center p-[11px]" : "gap-2.5 px-2.5 py-[8.5px]",
                    active ? DESIGN_TOKENS.sidebar.active : DESIGN_TOKENS.sidebar.item,
                  )}
                >
                  <Icon className="h-[17px] w-[17px] flex-none" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "mt-3 rounded-[11px]",
          DESIGN_TOKENS.sidebar.footer,
          "border-t-0",
          collapsed ? "flex justify-center p-[9px]" : "flex items-center gap-2.5 px-2.5 py-2.5",
        )}
      >
        <div
          className="grid h-8 w-8 flex-none place-items-center rounded-[9px] text-[12px] font-extrabold"
          style={{ backgroundColor: "var(--wk-violet-soft)", color: "var(--wk-violet-ink)" }}
        >
          {(tenant.shortName || tenant.displayName).slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[13px] font-bold text-wk-text">
              {tenant.demoMode ? `${tenant.shortName} demo` : "Vue institutionnelle"}
            </span>
            <span className="text-[11px] font-semibold text-wk-muted">v0.9 MVP</span>
          </div>
        )}
        {!collapsed && <LogOut className="h-4 w-4 flex-none text-wk-muted" />}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const flatItems = getTenantNavGroups(tenant).flatMap((group) => group.items);

  return (
    <div className={cn("px-3 py-2 lg:hidden", DESIGN_TOKENS.sidebar.shell)}>
      <div className="mb-2 flex items-center gap-2">
        <TenantBadge />
        <span className={cn("text-[10px] font-bold uppercase tracking-[0.08em]", DESIGN_TOKENS.text.faint)}>
          {tenant.shortName}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {flatItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-colors",
                active ? "bg-wk-primarySoft text-wk-primaryInk" : "bg-wk-surface2 text-wk-muted hover:text-wk-text",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
