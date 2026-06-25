"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { DashboardFooter } from "@/components/layout/dashboard-footer";
import { Header } from "@/components/layout/header";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { IdjorCompanionLauncher } from "@/components/idjor/idjor-companion-launcher";
import { IdjorCompanionPanel } from "@/components/idjor/idjor-companion-panel";
import { IdjorCompanionProvider } from "@/components/idjor/idjor-companion-provider";
import { restoreAuthSession } from "@/lib/auth";

// Full-bleed workspace pages (visual cockpits) opt out of the centered, max-width
// content column so they can use the full area between the sidebar and the viewport edge.
const FULL_BLEED_ROUTE_PREFIXES = ["/fr/idjor/agents"];

export function ProtectedShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const isFullBleed = FULL_BLEED_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  const [ready, setReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const authenticated = await restoreAuthSession();
      if (cancelled) return;

      if (!authenticated) {
        router.replace("/fr/login");
        return;
      }

      setReady(true);
    }

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const stored = window.localStorage.getItem("wakama_sidebar_collapsed");
    if (stored === "1") {
      setSidebarCollapsed(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wk-bg text-sm font-medium text-wk-muted">
        Verification de session...
      </div>
    );
  }

  return (
    <IdjorCompanionProvider>
      <div className="flex min-h-screen flex-col bg-wk-bg text-wk-text">
        <div className="flex flex-1 lg:flex-row">
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
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <MobileNav />
            <main
              className={
                isFullBleed
                  ? "flex w-full flex-1 flex-col"
                  : "mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-5 md:px-6 md:py-6"
              }
            >
              {children}
            </main>
          </div>
        </div>

        <DashboardFooter />
      </div>

      <IdjorCompanionLauncher />
      <IdjorCompanionPanel />
    </IdjorCompanionProvider>
  );
}
