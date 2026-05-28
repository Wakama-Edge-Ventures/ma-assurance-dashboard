"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/fr/login");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-brand-textMuted">
        Verification de session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <MobileNav />
        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
