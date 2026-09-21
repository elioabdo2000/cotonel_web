"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteHeroSlideButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Remove this slide from the carousel?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Couldn't delete that slide — try again.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-blush-deep transition hover:brightness-90 disabled:opacity-60"
    >
      {loading ? "Removing…" : "Delete"}
    </button>
  );
}
