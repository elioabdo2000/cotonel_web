import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { Product, type ProductDoc } from "@/models/Product";
import { categories, categoryBySlug } from "@/data/categories";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ArchiveProductButton from "@/components/admin/ArchiveProductButton";
import { availableStock } from "@/lib/stock";
import ProductFilters from "@/components/admin/ProductFilters";

export const dynamic = "force-dynamic";

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; category?: string; gender?: string }>;
}) {
  const { view, q = "", category = "", gender = "" } = await searchParams;
  const showArchived = view === "archived";

  // Search: every word typed must appear in the product's name or description.
  const words = q.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  const filter: Record<string, unknown> = showArchived ? { archived: true } : { archived: { $ne: true } };
  if (words.length) {
    filter.$and = words.map((w) => {
      const rx = new RegExp(escapeRegex(w), "i");
      return { $or: [{ name: rx }, { description: rx }] };
    });
  }

  await connectDB();
  // Older products have no `archived` field at all, so "active" means "not archived".
  const [found, activeCount, archivedCount] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).lean() as unknown as Promise<ProductDoc[]>,
    Product.countDocuments({ archived: { $ne: true } }),
    Product.countDocuments({ archived: true }),
  ]);

  // Gender narrows the list first, so the category chips show how many are left in each.
  const byGender = found.filter((p) =>
    !gender ? true : gender === "notset" ? !p.gender : p.gender === gender
  );
  const categoryChips = categories.map((c) => ({
    slug: c.slug,
    label: c.label,
    count: byGender.filter((p) => p.category === c.slug).length,
  }));
  const products = category ? byGender.filter((p) => p.category === category) : byGender;

  // Active / Archived tabs keep the current search and filters.
  const tabHref = (v: string) => {
    const params = new URLSearchParams();
    if (v) params.set("view", v);
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (gender) params.set("gender", gender);
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };
  const filtering = Boolean(words.length || category || gender);

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

      <div className="mt-6 flex gap-2 text-sm">
        <Link
          href={tabHref("")}
          className={`rounded-full px-4 py-1.5 transition ${
            showArchived ? "border border-line text-ink-soft hover:text-ink" : "bg-ink text-cream-raised"
          }`}
        >
          Active ({activeCount})
        </Link>
        <Link
          href={tabHref("archived")}
          className={`rounded-full px-4 py-1.5 transition ${
            showArchived ? "bg-ink text-cream-raised" : "border border-line text-ink-soft hover:text-ink"
          }`}
        >
          Archived ({archivedCount})
        </Link>
      </div>

      <ProductFilters
        q={q}
        category={category}
        gender={gender}
        view={showArchived ? "archived" : ""}
        categories={categoryChips}
        total={byGender.length}
        shown={products.length}
      />

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">
          {filtering
            ? "No products match your search — try different words or clear the filters."
            : showArchived
            ? "Nothing archived. Use Archive on a product to hide it from the site without deleting it — handy for last season's collection."
            : "No products yet. Add your first one to get it showing on the site."}
        </p>
      ) : (
        <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-cream-raised">
          {products.map((product) => {
            const category = categoryBySlug(product.category);
            const id = String(product._id);
            const total = availableStock(product);
            return (
              <div key={id} className={`flex items-center gap-4 p-4 ${showArchived ? "opacity-75" : ""}`}>
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
                    {total === undefined ? " · Quantities not set" : total <= 0 ? " · Sold out" : ` · ${total} in stock`}
                  </p>
                </div>
                <Link
                  href={`/admin/products/${id}/edit`}
                  className="text-sm text-ink-soft transition hover:text-ink"
                >
                  Edit
                </Link>
                <ArchiveProductButton id={id} name={product.name} archived={Boolean(product.archived)} />
                <DeleteProductButton id={id} name={product.name} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}