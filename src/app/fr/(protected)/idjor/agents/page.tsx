import { cookies, headers } from "next/headers";
import { ShieldCheck } from "lucide-react";

import { IdjorEngineOrgChart } from "@/components/idjor/idjor-engine-org-chart";
import { TENANTS } from "@/config/tenants";
import {
  getIdjorFoundationHealth,
  getIdjorFoundationRegistry,
  getIdjorRagHealth,
} from "@/lib/api";
import {
  buildLocalPreparatoryIdjorRegistry,
  hasRenderableIdjorRegistry,
} from "@/lib/idjor-registry-fallback";
import { resolveTenantId, TENANT_COOKIE_NAME } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function IdjorAgentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const tenantId = resolveTenantId(
    (typeof params?.tenant === "string" ? params.tenant : undefined) ??
      headerStore.get("x-wakama-tenant") ??
      cookieStore.get(TENANT_COOKIE_NAME)?.value,
  );
  const tenant = TENANTS[tenantId];

  let health = null;
  let registry = null;
  let ragHealth = null;
  let registryError = false;

  try {
    [health, registry, ragHealth] = await Promise.all([
      getIdjorFoundationHealth({ tenantKey: tenant.id }),
      getIdjorFoundationRegistry({ tenantKey: tenant.id }),
      getIdjorRagHealth({ tenantKey: tenant.id }),
    ]);
  } catch {
    registryError = true;
    health = null;
    registry = null;
    ragHealth = null;
  }

  const backendRegistry = hasRenderableIdjorRegistry(registry) ? registry : null;
  const usingBackendRegistry = backendRegistry !== null;
  const displayRegistry = backendRegistry ?? buildLocalPreparatoryIdjorRegistry(tenant);
  const registryLabel = usingBackendRegistry ? "Registre backend gouverné" : "Registre local préparatoire";

  const sourceNote = usingBackendRegistry
    ? "Les éléments affichés proviennent du registre backend IDJOR en lecture gouvernée."
    : registryError
      ? "Le registre backend IDJOR n'a pas pu être chargé pour ce tenant. Cette vue affiche un registre local préparatoire documenté."
      : "Le registre backend IDJOR de ce tenant est vide. Cette vue affiche un registre local préparatoire documenté.";

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[690px] w-full flex-1 flex-col gap-3 overflow-hidden bg-[#fdfcf9] p-3 md:p-4">
      <div className="flex w-full shrink-0 items-start gap-2 rounded border border-amber-300/35 bg-amber-100/65 px-3 py-2 text-amber-950 shadow-wk-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-[12px] font-semibold leading-relaxed">{sourceNote}</p>
      </div>

      <IdjorEngineOrgChart
        health={health}
        ragHealth={ragHealth}
        registry={displayRegistry}
        registryLabel={registryLabel}
      />
    </div>
  );
}
