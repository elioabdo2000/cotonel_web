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
