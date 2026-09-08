import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "@/components/admin/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-cream">
      {session && (
        <header className="border-b border-line bg-cream-raised">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/admin" className="font-display text-lg italic text-ink">
              Cotonel — Admin
            </Link>
            <div className="flex items-center gap-5 text-sm text-ink-soft">
              <Link href="/admin/categories" className="hover:text-ink">
                Category covers
              </Link>
              <Link href="/" target="_blank" className="hover:text-ink">
                View site
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
