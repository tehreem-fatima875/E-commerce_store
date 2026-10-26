import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductPurchase } from "@/components/product-purchase";
import { products } from "@/data/development-fixtures";

export function generateStaticParams() {
  return products.map((product) => ({ handle: product.handle }));
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = products.find((item) => item.handle === handle);
  if (!product) notFound();
  return (
    <div className="product-page">
      <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/collections/all">Collection</Link><span>/</span><span>{product.name}</span></div>
      <ProductPurchase product={product} />
    </div>
  );
}
