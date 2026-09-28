"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Archive = hide from the site but keep everything (photos, sizes, quantities) so it can be
// restored later. Delete removes it for good.
export default function ArchiveProductButton({
  id,
  name,
  archived,
}: {
  id: string;
  name: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!archived && !confirm(`Archive "${name}"? It will disappear from the site, and you can restore it any time from the Archived tab.`)) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !archived }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert(archived ? "Couldn't restore that product — try again." : "Couldn't archive that product — try again.");
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="text-sm text-ink-soft transition hover:text-ink disabled:opacity-60"
    >
      {loading ? "…" : archived ? "Restore" : "Archive"}
    </button>
  );
}
