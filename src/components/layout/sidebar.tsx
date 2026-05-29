"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType } from "react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
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

import logo from "@/img/wakama_logo.png";
import { cn } from "@/lib/utils";

interface NavItem {
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

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/fr/dashboard", label: "Tableau de bord", icon: Home }],
  },
  {
    label: "Données Wakama",
    items: [
      { href: "/fr/farmers", label: "Agriculteurs", icon: Tractor },
      { href: "/fr/cooperatives", label: "Coopératives", icon: Users },
      { href: "/fr/alerts", label: "Alertes Wakama", icon: Bell },
    ],
  },
  {
    label: "Assurance",
    items: [
      { href: "/fr/applications", label: "Demandes", icon: BriefcaseBusiness },
      { href: "/fr/missions", label: "Missions", icon: ClipboardCheck },
      { href: "/fr/arbitrage", label: "Arbitrage", icon: Scale },
      { href: "/fr/rax", label: "RAX / WRS", icon: FileWarning },
      { href: "/fr/pricing", label: "Tarification", icon: Landmark },
      { href: "/fr/policies", label: "Polices", icon: FileCheck2 },
    ],
  },
  {
    label: "Suivi",
    items: [
      { href: "/fr/monitoring", label: "Monitoring", icon: Shield },
      { href: "/fr/claims", label: "Sinistres", icon: Handshake },
      { href: "/fr/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/fr/reports", label: "Rapports", icon: FileChartColumnIncreasing },
      { href: "/fr/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

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
      {/* Brand */}
      <div className={cn("mb-5 flex items-center", collapsed ? "justify-center" : "gap-3 px-1.5")}>
        <Image
          src={logo}
          alt="Wakama"
          className="h-8 w-auto flex-none object-contain"
          priority
        />
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
              Wakama Assurance
            </span>
            <span className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-cyan-400">
              Risk Oracle
            </span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div className={cn("mb-5", collapsed ? "flex justify-center" : "")}>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/12 bg-[#070b17]/45 px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-cyan-400/30 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <>
              <PanelLeftClose className="h-3.5 w-3.5" />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
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
                          "shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14),0_0_20px_rgba(34,211,238,0.08)]",
                          "border-l-[3px] border-cyan-400/90",
                          collapsed ? "pl-[11px]" : "pl-[9px]",
                        )
                      : cn(
                          "border-l-[3px] border-transparent text-slate-400",
                          "hover:bg-slate-400/6 hover:text-white",
                          collapsed ? "" : "pl-3",
                        ),
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] flex-none",
                      active ? "text-cyan-400" : "text-slate-500",
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer status */}
      <div
        className={cn(
          "mt-auto rounded-[14px] border border-slate-400/10 bg-[#141c2e]/72",
          collapsed ? "flex justify-center p-[11px]" : "flex items-center gap-2.5 px-3 py-3",
        )}
      >
        <span className="h-2 w-2 flex-none rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
        {!collapsed && (
          <span className="text-[12px] text-slate-400">Oracle en ligne · v0.9 MVP</span>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const flatItems = navGroups.flatMap((group) => group.items);

  return (
    <div className="border-b border-slate-400/10 bg-[#070b17]/50 px-3 py-2 backdrop-blur lg:hidden">
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
                  ? "border-cyan-400/35 bg-cyan-400/12 text-white"
                  : "border-slate-400/15 bg-transparent text-slate-400 hover:text-white",
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
