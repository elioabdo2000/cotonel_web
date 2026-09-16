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
