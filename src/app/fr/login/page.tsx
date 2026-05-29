"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import logo from "@/img/wakama_logo.png";
import {
  DEMO_CREDENTIALS,
  isAuthenticated,
  signInWithDemoCredentials,
} from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/fr/dashboard");
    }
  }, [router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const ok = signInWithDemoCredentials(email.trim(), password.trim());
    if (!ok) {
      setError("Identifiants de demo invalides.");
      return;
    }
    router.push("/fr/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <div className="pointer-events-none absolute left-[-80px] top-[-110px] h-64 w-64 rounded-full bg-cyan-400/16 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-60px] h-72 w-72 rounded-full bg-violet-500/18 blur-3xl" />
      <Card className="w-full max-w-md p-5">
        <div className="mb-5 flex items-center justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-5 space-y-3">
          <Image src={logo} alt="Wakama" className="h-9 w-auto" priority />
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-cyan-300" />
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Connexion Wakama Assurance
            </h1>
          </div>
          <p className="text-sm text-brand-textMuted">
            Espace de demonstration MVP pour les workflows assurance et les donnees Wakama.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-sm text-brand-textMuted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-brand-border/22 bg-brand-surfaceRaised/75 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/20 dark:border-brand-border/28 dark:text-slate-100"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-brand-textMuted">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-brand-border/22 bg-brand-surfaceRaised/75 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/20 dark:border-brand-border/28 dark:text-slate-100"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}

          <Button className="w-full" type="submit">
            Se connecter
          </Button>
        </form>

        <div className="mt-4 space-y-2 rounded-xl border border-brand-border/18 bg-brand-surfaceRaised/60 p-3 text-xs text-brand-textMuted dark:border-brand-border/24">
          <p>
            Compte de demo: <code>demo@wakama.farm / demo</code>
          </p>
          <div className="flex items-center gap-2">
            <span>Jeu de donnees:</span>
            <DataSourceBadge source="SEED_DEMO" />
          </div>
        </div>
      </Card>
    </main>
  );
}
