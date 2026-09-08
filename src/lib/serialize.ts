import type { ProductDoc } from "@/models/Product";

// Next.js Server Components can only pass plain objects down to Client
// Components. A mongoose `.lean()` result still has an ObjectId for _id and
// a real Date for createdAt — neither is a plain object — which is exactly
// the "Only plain objects can be passed to Client Components" warning.
// Run every product through this before it reaches a Client Component
// (ProductCard, the product modal, etc).
export function serializeProduct(raw: Record<string, unknown>): ProductDoc {
  return {
    ...raw,
    _id: String(raw._id),
    createdAt:
      raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt ?? ""),
  } as unknown as ProductDoc;
}

export function serializeProducts(raw: Record<string, unknown>[]): ProductDoc[] {
  return raw.map(serializeProduct);
}
