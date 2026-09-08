import type { NextAuthConfig } from "next-auth";

// Middleware runs on the Edge runtime, which can't bundle Node-only modules
// like mongoose or bcryptjs. This file has to stay free of those imports —
// the real Credentials provider (which needs both) lives in auth.ts and is
// only pulled in by route handlers / server components, never by
// middleware.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {},
} satisfies NextAuthConfig;
