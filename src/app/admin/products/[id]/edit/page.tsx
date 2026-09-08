import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product, type ProductDoc } from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const product = (await Product.findById(id).lean()) as unknown as ProductDoc | null;

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Edit product</h1>
      <ProductForm
        initial={{
          id: product._id.toString(),
          name: product.name,
          price: product.price ?? "",
          description: product.description ?? "",
          category: product.category,
          image: product.image,
          images: product.images ?? [],
          gender: product.gender,
          featured: Boolean(product.featured),
          bestseller: Boolean(product.bestseller),
          onSale: Boolean(product.onSale),
          salePrice: product.salePrice ?? "",
          sizes: product.sizes ?? [],
          colors: product.colors ?? [],
          stock: product.stock,
        }}
      />
    </div>
  );
}
