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
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Settings,
  Shield,
  Tractor,
  Users,
} from "lucide-react";

import { TenantBadge } from "@/components/tenant/TenantBadge";
import { TenantLogo } from "@/components/tenant/TenantLogo";
import { useTenant } from "@/components/tenant/useTenant";
import { withAlpha } from "@/lib/tenant";
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
        "sticky top-0 hidden h-screen flex-col py-[22px] backdrop-blur-md lg:flex",
        "border-r border-slate-400/10",
        "bg-gradient-to-b from-[#0a0f1b]/60 to-[#080c17]/30",
        collapsed ? "w-[76px] items-center px-3" : "w-[252px] px-4",
        "transition-[width] duration-200",
      )}
    >
      <div className={cn("mb-5 flex items-center", collapsed ? "justify-center" : "gap-3 px-1.5")}>
        <TenantLogo
          alt={tenant.displayName}
          className="h-8 w-auto flex-none object-contain"
          width={160}
          height={64}
          priority
        />
        {!collapsed && (
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
              {tenant.displayName}
            </span>
            <span
              className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em]"
              style={{ color: tenant.colors.primary }}
            >
              {tenant.vertical}
            </span>
          </div>
        )}
      </div>

      {!collapsed && <TenantBadge className="mb-4 self-start" />}

      <div className={cn("mb-5", collapsed ? "flex justify-center" : "")}>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/12 bg-[#070b17]/45 px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:text-white"
          style={{ borderColor: withAlpha(tenant.colors.primary, "30") }}
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

      <nav className={cn("flex-1 space-y-5 overflow-y-auto", collapsed && "w-full")}>
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5B6B86]">
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
                    "flex items-center rounded-[10px] text-[13.5px] font-medium transition-all duration-150",
                    collapsed ? "justify-center p-[11px]" : "gap-3 py-[9px]",
                    active
                      ? cn(
                          "text-white",
                          "bg-gradient-to-r from-cyan-400/16 to-emerald-400/6",
                          "border-l-[3px]",
                          collapsed ? "pl-[11px]" : "pl-[9px]",
                        )
                      : cn(
                          "border-l-[3px] border-transparent text-slate-400",
                          "hover:bg-slate-400/6 hover:text-white",
                          collapsed ? "" : "pl-3",
                        ),
                  )}
                  style={
                    active
                      ? {
                          borderLeftColor: tenant.colors.primary,
                          boxShadow: `inset 0 0 0 1px ${withAlpha(tenant.colors.primary, "24")}, 0 0 20px ${withAlpha(tenant.colors.primary, "14")}`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="flex-none"
                    style={active ? { color: tenant.colors.primary } : undefined}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", active ? "" : "text-slate-500")} />
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "mt-auto rounded-[14px] border border-slate-400/10 bg-[#141c2e]/72",
          collapsed ? "flex justify-center p-[11px]" : "flex items-center gap-2.5 px-3 py-3",
        )}
      >
        <span
          className="h-2 w-2 flex-none rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          style={{ backgroundColor: tenant.colors.secondary }}
        />
        {!collapsed && (
          <span className="text-[12px] text-slate-400">
            {tenant.demoMode ? `${tenant.shortName} demo` : "Vue institutionnelle"} · v0.9 MVP
          </span>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const flatItems = getTenantNavGroups(tenant).flatMap((group) => group.items);

  return (
    <div className="border-b border-slate-400/10 bg-[#070b17]/50 px-3 py-2 backdrop-blur lg:hidden">
      <div className="mb-2 flex items-center gap-2">
        <TenantBadge />
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
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
                "whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[11px] transition-colors",
                active
                  ? "bg-cyan-400/12 text-white"
                  : "border-slate-400/15 bg-transparent text-slate-400 hover:text-white",
              )}
              style={active ? { borderColor: withAlpha(tenant.colors.primary, "59") } : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
