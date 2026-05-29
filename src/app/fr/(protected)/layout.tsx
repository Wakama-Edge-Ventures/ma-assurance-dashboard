"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { DashboardFooter } from "@/components/layout/dashboard-footer";
import { Header } from "@/components/layout/header";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/fr/login");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  useEffect(() => {
    const stored = window.localStorage.getItem("wakama_sidebar_collapsed");
    if (stored === "1") {
      setSidebarCollapsed(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg text-sm text-brand-textMuted">
        Verification de session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-slate-900 dark:text-slate-100 lg:flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => {
          setSidebarCollapsed((prev) => {
            const next = !prev;
            window.localStorage.setItem("wakama_sidebar_collapsed", next ? "1" : "0");
            return next;
          });
        }}
      />
      <div className="min-w-0 flex-1">
        <Header />
        <MobileNav />
        <main className="mx-auto flex w-full max-w-[1240px] flex-col px-4 py-4 md:px-6 md:py-5">
          {children}
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
