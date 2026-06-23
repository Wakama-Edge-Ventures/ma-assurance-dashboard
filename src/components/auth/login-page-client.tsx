"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Sprout } from "lucide-react";

import { TenantLogo } from "@/components/tenant/TenantLogo";
import {
  clearAuth,
  consumeAuthNotice,
  establishDashboardSession,
  restoreAuthSession,
} from "@/lib/auth";
import { ApiError, institutionLogin } from "@/lib/api";
import {
  getTenantById,
  getTenantPostLoginUrl,
  isTenantId,
  resolveTenantId,
  TENANT_COOKIE_NAME,
  withAlpha,
} from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Audit append-only" },
  { icon: Sprout, label: "Terrain partagé Wakama" },
];

function readTenantIdFromCookie() {
  if (typeof document === "undefined") return null;

  const cookiePrefix = `${TENANT_COOKIE_NAME}=`;
  const cookieValue = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(cookiePrefix))
    ?.slice(cookiePrefix.length);

  return isTenantId(cookieValue) ? cookieValue : null;
}

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const tenantId = useMemo(() => {
    const tenantFromQuery = searchParams.get("tenant");
    if (isTenantId(tenantFromQuery)) {
      return tenantFromQuery;
    }

    return resolveTenantId(readTenantIdFromCookie());
  }, [searchParams]);
  const tenant = getTenantById(tenantId);
  const postLoginUrl = getTenantPostLoginUrl(tenantId);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const authenticated = await restoreAuthSession();
      if (!cancelled && authenticated) {
        router.replace(postLoginUrl);
      }
    }

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [postLoginUrl, router]);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "session_expired") {
      setNotice("Session expiree ou invalide. Reconnectez-vous.");
    } else if (reason === "access_denied") {
      setNotice("Acces refuse pour ce compte.");
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
          "Connexion backend incomplete: cookie de session introuvable apres login.",
        );
      }

      router.replace(postLoginUrl);
    } catch (submitError) {
      clearAuth();

      if (submitError instanceof ApiError) {
        if (submitError.status === 401) {
          setError("Identifiants invalides pour le backend du dashboard.");
        } else if (submitError.status === 403) {
          setError("Acces refuse pour ce compte cote backend du dashboard.");
        } else {
          setError(
            submitError.message || "Echec de connexion backend. Reessayez dans un instant.",
          );
        }
      } else {
        setError("Impossible de contacter le backend du dashboard. Verifiez votre connexion.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const contextualLoginTitle =
    tenant.id === "assurance-ma" ? "Connexion Assurance agricole" : `Connexion ${tenant.displayName}`;
  const contextualLoginDescription =
    tenant.id === "assurance-ma"
      ? "Connexion institutionnelle au parcours assurance agricole."
      : `Acces demo ${tenant.countryLabel} - ${tenant.vertical}. Le backend reste celui du dashboard existant.`;

  return (
    <main className="grid min-h-screen bg-wk-bg lg:grid-cols-[1.05fr_0.95fr]">
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{
          background: `linear-gradient(150deg, ${tenant.colors.accent} 0%, ${tenant.colors.primary} 48%, ${tenant.colors.secondary} 120%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, #fff 0, transparent 38%), repeating-linear-gradient(115deg, rgba(255,255,255,.5) 0 1px, transparent 1px 26px)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="grid h-[42px] w-[42px] place-items-center rounded-[13px] border border-white/28 bg-white/16 backdrop-blur">
            <Sprout className="h-[23px] w-[23px] text-white" />
          </div>
          <div>
            <div className="text-[18px] font-extrabold tracking-[-0.3px]">Wakama</div>
            <div className="-mt-0.5 text-[12px] font-semibold opacity-80">Assurance Dashboard</div>
          </div>
        </div>

        <div className="relative max-w-[430px]">
          <div className="mb-[18px] text-[13px] font-bold uppercase tracking-[0.14em] opacity-80">
            Plateforme institutionnelle
          </div>
          <div className="text-[38px] font-extrabold leading-[1.12] tracking-[-1px]">
            L&apos;assurance agricole, structurée et documentée.
          </div>
          <div className="mt-5 text-[16px] font-normal leading-relaxed opacity-90">
            Idjor assiste, explique, structure et alerte. L&apos;institution garde la décision finale.
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2.5">
          {TRUST_BADGES.map((trust) => (
            <div
              key={trust.label}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3.5 py-2 text-[13px] font-semibold"
            >
              <trust.icon className="h-[15px] w-[15px]" />
              {trust.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[382px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-[7px] text-[12.5px] font-bold"
              style={{ backgroundColor: "var(--wk-primary-soft)", color: "var(--wk-primary-ink)" }}
            >
              <span className="h-2 w-2 rounded-full bg-wk-live" />
              {tenant.displayName} · {tenant.country}
            </span>
            <ThemeToggle />
          </div>

          <div className="mb-2 flex items-center gap-3">
            <TenantLogo
              alt={tenant.displayName}
              className="h-9 w-auto object-contain"
              width={180}
              height={72}
              priority
            />
          </div>
          <h1 className="text-[27px] font-extrabold tracking-[-0.6px] text-wk-text">
            {contextualLoginTitle}
          </h1>
          <p className="mt-[7px] text-[15px] font-medium text-wk-muted">{contextualLoginDescription}</p>
          {tenant.demoMode ? (
            <p
              className="mt-3 rounded-xl px-3 py-2.5 text-xs font-semibold"
              style={{
                backgroundColor: withAlpha(tenant.colors.primary, "12"),
                color: tenant.colors.primary,
              }}
            >
              Demo institutionnelle - maquette d&apos;illustration. Les donnees et decisions
              restent sous controle de l&apos;institution.
            </p>
          ) : null}

          <form className="mt-7 space-y-4" onSubmit={onSubmit}>
            {notice ? (
              <p className="rounded-xl bg-wk-amberSoft px-3 py-2 text-xs font-semibold text-wk-amberInk">
                {notice}
              </p>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-[13px] font-bold text-wk-text">Email professionnel</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-[46px] w-full rounded-xl border border-wk-border2 bg-wk-surface px-[15px] text-[14.5px] text-wk-text outline-none transition focus:border-wk-primary"
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[13px] font-bold text-wk-text">Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-[46px] w-full rounded-xl border border-wk-border2 bg-wk-surface px-[15px] text-[14.5px] text-wk-text outline-none transition focus:border-wk-primary"
                required
              />
            </label>

            {error ? <p className="text-sm font-semibold text-wk-coralInk">{error}</p> : null}

            <Button className="h-[48px] w-full gap-2 rounded-xl text-[15px]" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
              {!isSubmitting && <ArrowRight className="h-[17px] w-[17px]" />}
            </Button>
          </form>

          <div className="mt-[18px] flex items-start gap-2.5 rounded-xl border border-wk-border bg-wk-surface2 p-[13px]">
            <ShieldCheck className="mt-[1px] h-4 w-4 flex-none text-wk-violet" />
            <span className="text-[12.5px] font-medium leading-relaxed text-wk-muted">
              {tenant.terminology.decisionDisclaimer}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
