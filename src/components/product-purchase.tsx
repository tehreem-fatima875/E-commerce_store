"use client";

import { useState } from "react";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { formatPrice, imageUrl, type Product } from "@/data/development-fixtures";
import { MAX_CART_QUANTITY, useCart } from "@/components/cart-provider";

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const { add, lines } = useCart();
  const existingQuantity = lines.find((line) => line.handle === product.handle && line.size === size)?.quantity ?? 0;
  const quantityLimitReached = existingQuantity + quantity > MAX_CART_QUANTITY;

  return (
    <div className="product-detail">
      <div
        aria-label={product.name}
        className="product-detail-image"
        role="img"
        style={{ backgroundImage: `url("${imageUrl(product.image, 1400)}")` }}
      />
      <div className="product-detail-copy">
        <Link className="back-link" href="/collections/all"><ArrowLeft size={14} /> Back to the collection</Link>
        <span className="eyebrow">{product.category} · Development preview</span>
        <h1>{product.name}</h1>
        <p className="detail-price">{formatPrice(product.price)}</p>
        <p className="fixture-notice">Sample product for design preview. This item is not live Shopify inventory and cannot be checked out.</p>
        <p className="detail-description">An easy, considered piece designed for a little more feeling in the everyday. Thoughtful proportions and a soft, natural palette make it one to reach for often.</p>
        <span className="eyebrow">Colour</span><p className="detail-color">{product.color}</p>
        {product.sizes && (
          <div className="size-picker">
            <label className="eyebrow" htmlFor="product-size">Size · preview choice</label>
            <select id="product-size" onChange={(event) => setSize(event.target.value)} value={size}>
              {product.sizes.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        )}
        <span className="eyebrow">Quantity</span>
        <div aria-label="Quantity" className="quantity-control">
          <button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus size={14} /></button>
          <span aria-live="polite">{quantity}</span>
          <button aria-label="Increase quantity" disabled={quantity >= MAX_CART_QUANTITY} onClick={() => setQuantity((current) => Math.min(MAX_CART_QUANTITY, current + 1))}><Plus size={14} /></button>
        </div>
        <button className="button add-to-bag" disabled={quantityLimitReached} onClick={() => { add(product, quantity, size); setAdded(true); }}>
          {added ? <>Added to preview bag <Check size={15} /></> : <>Add to preview bag <Plus size={15} /></>}
        </button>
        <p className="bag-disclaimer">Preview bag only · No payment or checkout available</p>
        <div className="detail-accordion"><span>Details & care</span><p>A considered everyday piece. Refer to the garment label for care guidance.</p></div>
      </div>
    </div>
  );
}
