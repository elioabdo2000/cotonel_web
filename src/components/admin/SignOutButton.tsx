"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="hover:text-ink">
      Sign out
    </button>
  );
}
