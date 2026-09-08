import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// A separate, edge-safe NextAuth instance built only from the config that
// has no Node-only imports — see auth.config.ts for why. This only needs
// to read/verify the session cookie, not run the Credentials provider.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if ((isAdminRoute || isAdminApiRoute) && !isLoggedIn) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
