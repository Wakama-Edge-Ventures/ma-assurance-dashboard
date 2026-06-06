"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import logo from "@/img/wakama_logo.png";
import {
  clearAuth,
  consumeAuthNotice,
  establishDashboardSession,
  restoreAuthSession,
} from "@/lib/auth";
import { ApiError, institutionLogin } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const authenticated = await restoreAuthSession();
      if (!cancelled && authenticated) {
        router.replace("/fr/dashboard");
      }
    }

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "session_expired") {
      setNotice("Session expirée ou invalide. Reconnectez-vous.");
    } else if (reason === "access_denied") {
      setNotice("Accès refusé pour ce compte.");
    }

    const storedNotice = consumeAuthNotice();
    if (storedNotice?.message) {
      setNotice(storedNotice.message);
    }
  }, []);

  function extractIdentity(payload: unknown): { fullName?: string; email?: string } {
    if (!payload || typeof payload !== "object") return {};

    const asOptionalString = (value: unknown): string | undefined =>
      typeof value === "string" && value.trim() ? value.trim() : undefined;

    const root = payload as Record<string, unknown>;
    const data =
      root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
    const user =
      data?.user && typeof data.user === "object"
        ? (data.user as Record<string, unknown>)
        : null;

    const fullNameCandidate =
      asOptionalString(user?.fullName) ??
      asOptionalString(user?.name) ??
      asOptionalString(data?.fullName) ??
      asOptionalString(data?.name);
    const emailCandidate = asOptionalString(user?.email) ?? asOptionalString(data?.email);

    return {
      fullName: fullNameCandidate,
      email: emailCandidate,
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanedEmail = email.trim();
    const cleanedPassword = password.trim();

    try {
      const result = await institutionLogin(cleanedEmail, cleanedPassword);
      const identity = extractIdentity(result.payload);
      establishDashboardSession({
        email: identity.email ?? cleanedEmail,
        fullName: identity.fullName,
      });

      const authenticated = await restoreAuthSession();
      if (!authenticated) {
        throw new ApiError(
          502,
          "Connexion backend incomplète: cookie de session introuvable après login.",
        );
      }

      router.replace("/fr/dashboard");
    } catch (submitError) {
      clearAuth();

      if (submitError instanceof ApiError) {
        if (submitError.status === 401) {
          setError("Identifiants invalides pour le backend assurance.");
        } else if (submitError.status === 403) {
          setError("Accès refusé pour ce compte côté backend assurance.");
        } else {
          setError(
            submitError.message || "Échec de connexion backend. Réessayez dans un instant.",
          );
        }
      } else {
        setError("Impossible de contacter le backend assurance. Vérifiez votre connexion.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
            Connexion institutionnelle au backend assurance Wakama Maroc.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {notice ? (
            <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
              {notice}
            </p>
          ) : null}

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

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-4 space-y-2 rounded-xl border border-brand-border/18 bg-brand-surfaceRaised/60 p-3 text-xs text-brand-textMuted dark:border-brand-border/24">
          <p>Les routes assurance protégées requièrent un JWT backend valide.</p>
          <div className="flex items-center gap-2">
            <span>Source attendue:</span>
            <DataSourceBadge source="LIVE" />
          </div>
        </div>
      </Card>
    </main>
  );
}
