// One source of truth for how stock is worded, so a product card and the
// details popup can never drift apart and show different messages.
export interface StockState {
  soldOut: boolean;
  urgent: boolean; // 1-2 left — worth calling out prominently
  low: boolean; // 3-5 left — a softer nudge
  label: string | null;
}

export function stockState(stock: number | undefined): StockState {
  if (stock === undefined) {
    return { soldOut: false, urgent: false, low: false, label: null };
  }
  if (stock <= 0) {
    return { soldOut: true, urgent: false, low: false, label: "Sold Out" };
  }
  if (stock === 1) {
    return { soldOut: false, urgent: true, low: false, label: "Last one!" };
  }
  if (stock === 2) {
    return { soldOut: false, urgent: true, low: false, label: "Only 2 left!" };
  }
  if (stock <= 5) {
    return { soldOut: false, urgent: false, low: true, label: `Only ${stock} left` };
  }
  return { soldOut: false, urgent: false, low: false, label: `${stock} in stock` };
}

// Turns whatever the admin typed into a clean list of { size, quantity }:
// trims names, drops blanks and duplicates, and forces whole numbers >= 0.
// Returns null if any row is invalid (so the API can answer with an error).
export function cleanSizeStock(raw: unknown): { size: string; quantity: number }[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const out: { size: string; quantity: number }[] = [];
  for (const row of raw) {
    const size = typeof row?.size === "string" ? row.size.trim() : "";
    const quantity = row?.quantity;
    if (!size) continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) return null;
    const key = size.toLowerCase();
    if (seen.has(key)) return null;
    seen.add(key);
    out.push({ size, quantity });
  }
  return out;
}

export function totalStock(sizeStock: { quantity: number }[]): number {
  return sizeStock.reduce((sum, s) => sum + s.quantity, 0);
}

export interface CleanColorStock {
  color: string;
  sizes?: { size: string; quantity: number }[];
  quantity?: number;
}

// Same idea as cleanSizeStock, one level up: every color needs a unique name and either
// its own sizes (each with a quantity) or — if it has no sizes — a single quantity.
export function cleanColorStock(raw: unknown): CleanColorStock[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const out: CleanColorStock[] = [];
  for (const row of raw) {
    const color = typeof row?.color === "string" ? row.color.trim() : "";
    if (!color) continue;
    const key = color.toLowerCase();
    if (seen.has(key)) return null;
    seen.add(key);

    const sizes = row.sizes === undefined ? [] : cleanSizeStock(row.sizes);
    if (sizes === null) return null;
    if (sizes.length) {
      out.push({ color, sizes });
    } else {
      const q = row.quantity;
      if (typeof q !== "number" || !Number.isInteger(q) || q < 0) return null;
      out.push({ color, quantity: q });
    }
  }
  return out;
}

// Everything the rest of the site already understands (colors, sizes, per-size totals,
// overall stock) worked out from the per-color data, so cards and older code keep working.
export function deriveFromColorStock(colorStock: CleanColorStock[]) {
  const sizeTotals = new Map<string, { size: string; quantity: number }>();
  let stock = 0;
  for (const c of colorStock) {
    if (c.sizes?.length) {
      for (const s of c.sizes) {
        const key = s.size.toLowerCase();
        const existing = sizeTotals.get(key);
        if (existing) existing.quantity += s.quantity;
        else sizeTotals.set(key, { size: s.size, quantity: s.quantity });
        stock += s.quantity;
      }
    } else {
      stock += c.quantity ?? 0;
    }
  }
  const sizeStock = [...sizeTotals.values()];
  return {
    colors: colorStock.map((c) => c.color),
    sizes: sizeStock.length ? sizeStock.map((s) => s.size) : undefined,
    sizeStock: sizeStock.length ? sizeStock : undefined,
    stock,
  };
}
