"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  FileChartColumnIncreasing,
  FileCheck2,
  FileWarning,
  Handshake,
  Home,
  Landmark,
  Leaf,
  Scale,
  Settings,
  Shield,
  Tractor,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/fr/dashboard", label: "Dashboard", icon: Home },
  { href: "/fr/applications", label: "Applications", icon: BriefcaseBusiness },
  { href: "/fr/missions", label: "Missions", icon: ClipboardCheck },
  { href: "/fr/arbitrage", label: "Arbitrage", icon: Scale },
  { href: "/fr/rax", label: "RAX / WRS", icon: FileWarning },
  { href: "/fr/pricing", label: "Pricing", icon: Landmark },
  { href: "/fr/policies", label: "Policies", icon: FileCheck2 },
  { href: "/fr/monitoring", label: "Monitoring", icon: Shield },
  { href: "/fr/claims", label: "Claims", icon: Handshake },
  { href: "/fr/farmers", label: "Farmers", icon: Tractor },
  { href: "/fr/cooperatives", label: "Cooperatives", icon: Users },
  { href: "/fr/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/fr/reports", label: "Reports", icon: FileChartColumnIncreasing },
  { href: "/fr/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-brand-border bg-[#090f1f] px-4 py-5 lg:flex">
      <div className="mb-7 flex items-center gap-2">
        <Leaf className="h-5 w-5 text-brand-violet" />
        <span className="text-sm font-semibold text-slate-100">
          Wakama Assurance MA
        </span>
      </div>

      <nav className="space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-violet/20 text-violet-100"
                  : "text-brand-textMuted hover:bg-slate-900 hover:text-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-brand-border bg-[#090f1f] px-3 py-2 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs",
                active
                  ? "bg-brand-violet/25 text-violet-100"
                  : "bg-slate-900 text-brand-textMuted",
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
