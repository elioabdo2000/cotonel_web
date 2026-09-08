"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ProductDoc } from "@/models/Product";
import ProductModal from "./ProductModal";

interface ProductModalContextValue {
  open: (product: ProductDoc) => void;
}

const ProductModalContext = createContext<ProductModalContextValue | null>(null);

export function useProductModal() {
  const ctx = useContext(ProductModalContext);
  if (!ctx) {
    throw new Error("useProductModal must be used within a ProductModalProvider");
  }
  return ctx;
}

// Wraps the shop so any ProductCard, anywhere, can pop the same details
// modal open without each section having to manage its own state.
export default function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<ProductDoc | null>(null);

  const value = useMemo(() => ({ open: setProduct }), []);

  return (
    <ProductModalContext.Provider value={value}>
      {children}
      <ProductModal product={product} onClose={() => setProduct(null)} />
    </ProductModalContext.Provider>
  );
}
