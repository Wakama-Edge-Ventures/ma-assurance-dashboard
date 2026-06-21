import { cookies } from "next/headers";

import { LoginPageClient } from "@/components/auth/login-page-client";
import { TenantProvider } from "@/components/tenant/TenantProvider";
import { resolveTenantId, TENANT_COOKIE_NAME } from "@/lib/tenant";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const searchTenant = resolvedSearchParams?.tenant;
  const initialTenantId = resolveTenantId(
    typeof searchTenant === "string" ? searchTenant : cookieStore.get(TENANT_COOKIE_NAME)?.value,
  );

  return (
    <TenantProvider initialTenantId={initialTenantId}>
      <LoginPageClient />
    </TenantProvider>
  );
}
