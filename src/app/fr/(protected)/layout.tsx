import { cookies, headers } from "next/headers";

import { ProtectedShell } from "@/components/layout/protected-shell";
import { TenantProvider } from "@/components/tenant/TenantProvider";
import { resolveTenantId, TENANT_COOKIE_NAME } from "@/lib/tenant";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const tenantFromHeader = headerStore.get("x-wakama-tenant");
  const initialTenantId = resolveTenantId(
    tenantFromHeader ?? cookieStore.get(TENANT_COOKIE_NAME)?.value,
  );

  return (
    <TenantProvider initialTenantId={initialTenantId}>
      <ProtectedShell>{children}</ProtectedShell>
    </TenantProvider>
  );
}
