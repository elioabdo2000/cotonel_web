"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <p className="font-display text-2xl italic text-ink">Cotonel</p>
      <h1 className="mt-1 text-xl text-ink">Admin sign in</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-sm text-ink-soft">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
        </div>
        <div>
          <label className="text-sm text-ink-soft">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
        </div>

        {error && <p className="text-sm text-blush-deep">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream-raised transition hover:bg-sage-deep disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
