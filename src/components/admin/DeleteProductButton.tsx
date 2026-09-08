"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove "${name}" from the site?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Couldn't delete that product — try again.");
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
