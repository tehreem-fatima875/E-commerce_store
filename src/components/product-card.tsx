import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatPrice, imageUrl, type Product } from "@/data/development-fixtures";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link aria-label={`View ${product.name}`} className="product-image-link" href={`/products/${product.handle}`}>
        <div
          aria-label={`${product.name} in ${product.color}`}
          className="product-image"
          role="img"
          style={{ backgroundImage: `url("${imageUrl(product.image)}")` }}
        />
        {product.isNew && <span className="product-tag">Just arrived</span>}
        <span aria-hidden="true" className="product-view"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="product-info">
        <div><h3>{product.name}</h3><span>{product.category}</span></div>
        <p>{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
