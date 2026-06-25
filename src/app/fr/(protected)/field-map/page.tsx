import { cookies, headers } from "next/headers";

import { FieldMapClient } from "@/components/maps/field-map-client";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { PageTitle } from "@/components/ui/page-title";
import { TENANTS } from "@/config/tenants";
import { getFieldMapSnapshot } from "@/lib/field-map-data";
import { resolveFieldMapCountryFocus } from "@/lib/field-map-country";
import { resolveTenantId, TENANT_COOKIE_NAME } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function FieldMapPage({
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
  const countryFocus = resolveFieldMapCountryFocus(tenant.country);
  const initialSnapshot = await getFieldMapSnapshot(countryFocus.key);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Carte terrain"
        description={`Vue geographique des parcelles, missions et alertes agricoles pour ${countryFocus.label}.`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-wk-surface2 px-3 py-1.5 text-[12px] font-bold text-wk-text">
          {tenant.displayName}
        </span>
        <span className="rounded-full bg-wk-primarySoft px-3 py-1.5 text-[12px] font-bold text-wk-primaryInk">
          Decision institutionnelle
        </span>
        <span className="rounded-full bg-wk-amberSoft px-3 py-1.5 text-[12px] font-bold text-wk-amberInk">
          {countryFocus.label}
        </span>
      </div>

      <FieldMapClient
        initialSnapshot={initialSnapshot}
        tenantLabel={tenant.displayName}
        tenantCountry={tenant.country}
      />

      <DisclosureNote />
    </div>
  );
}
