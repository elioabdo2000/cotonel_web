import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { Product, type ProductDoc } from "@/models/Product";
import { categoryBySlug } from "@/data/categories";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await connectDB();
  const products = (await Product.find().sort({ createdAt: -1 }).lean()) as unknown as ProductDoc[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream-raised transition hover:bg-sage-deep"
        >
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">
          No products yet. Add your first one to get it showing on the site.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-cream-raised">
          {products.map((product) => {
            const category = categoryBySlug(product.category);
            const id = String(product._id);
            return (
              <div key={id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-sage-soft">
                  <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{product.name}</p>
                  <p className="text-xs text-ink-soft">
                    {category?.label ?? product.category}
                    {product.price ? ` · ${product.price}` : ""}
                    {product.gender ? ` · ${product.gender[0].toUpperCase()}${product.gender.slice(1)}` : ""}
                    {product.featured ? " · Featured" : ""}
                    {product.bestseller ? " · Bestseller" : ""}
                    {product.onSale ? " · On Sale" : ""}
                  </p>
                </div>
                <Link
                  href={`/admin/products/${id}/edit`}
                  className="text-sm text-ink-soft transition hover:text-ink"
                >
                  Edit
                </Link>
                <DeleteProductButton id={id} name={product.name} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}