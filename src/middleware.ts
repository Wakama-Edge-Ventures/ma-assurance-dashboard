import { NextRequest, NextResponse } from "next/server";

import { isTenantId, TENANT_COOKIE_NAME } from "@/lib/tenant";

export function middleware(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant");
  const requestHeaders = new Headers(request.headers);

  if (tenant && isTenantId(tenant)) {
    requestHeaders.set("x-wakama-tenant", tenant);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (tenant && isTenantId(tenant)) {
    response.cookies.set(TENANT_COOKIE_NAME, tenant, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/fr/:path*"],
};
