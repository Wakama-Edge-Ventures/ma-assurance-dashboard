"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import {
  DEMO_CREDENTIALS,
  isAuthenticated,
  signInWithDemoCredentials,
} from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#312e81_0%,#070b16_45%)] p-4">
      <Card className="w-full max-w-md border-violet-500/30">
        <div className="mb-6 flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-brand-violet" />
          <h1 className="text-lg font-semibold text-slate-100">
            Connexion Wakama Assurance MA
          </h1>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-sm text-brand-textMuted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-brand-textMuted">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-brand-border bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-violet"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <Button className="w-full" type="submit">
            Se connecter
          </Button>
        </form>

        <div className="mt-5 space-y-2 text-xs text-brand-textMuted">
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
