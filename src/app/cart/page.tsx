"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { MAX_CART_QUANTITY, useCart } from "@/components/cart-provider";
import { formatPrice, products } from "@/data/development-fixtures";

export default function CartPage() {
  const { lines, update, remove, storageError } = useCart();
  const cartProducts = lines.flatMap((line) => {
    const product = products.find((item) => item.handle === line.handle);
    return product ? [{ ...product, quantity: line.quantity, size: line.size }] : [];
  });
  const subtotal = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);

  return (
    <section className="cart-page">
      <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Preview bag</span></div>
      <div className="cart-title"><span className="eyebrow">Avenoir / Your selection</span><h1>Your bag <em>({cartProducts.reduce((count, line) => count + line.quantity, 0)})</em></h1></div>
      <p className="fixture-notice">Development preview only. This bag is stored in this browser and is not connected to Shopify checkout.</p>
      {storageError && <p aria-live="polite" className="storage-warning" role="status">Browser storage is unavailable. Your preview bag will not persist after you leave.</p>}
      {!cartProducts.length ? (
        <div className="empty-state"><h2>A little room for something.</h2><p>Your bag is waiting for the pieces you love.</p><Link className="button button-dark" href="/collections/all">Explore the collection <ArrowRight size={15} /></Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cartProducts.map((product) => (
              <article className="cart-line" key={`${product.handle}-${product.size ?? ""}`}>
                <Link aria-label={`View ${product.name}`} className="cart-thumb" href={`/products/${product.handle}`} style={{ backgroundImage: `url("${product.image ? `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=400&q=80` : ""}")` }} />
                <div className="cart-line-detail"><Link href={`/products/${product.handle}`}>{product.name}</Link><span>{product.color}{product.size ? ` · Size ${product.size}` : ""}</span><span>{formatPrice(product.price)}</span>
                  <div aria-label={`Quantity for ${product.name}${product.size ? `, size ${product.size}` : ""}`} className="quantity-control quantity-small"><button aria-label="Decrease quantity" onClick={() => update(product.handle, product.quantity - 1, product.size)}><Minus size={12} /></button><span>{product.quantity}</span><button aria-label="Increase quantity" disabled={product.quantity >= MAX_CART_QUANTITY} onClick={() => update(product.handle, product.quantity + 1, product.size)}><Plus size={12} /></button></div>
                </div>
                <button aria-label={`Remove ${product.name}${product.size ? ` size ${product.size}` : ""}`} className="icon-button cart-remove" onClick={() => remove(product.handle, product.size)}><X size={16} /></button>
                <span className="cart-line-total">{formatPrice(product.price * product.quantity)}</span>
              </article>
            ))}
          </div>
          <aside className="cart-summary"><span className="eyebrow">Order preview</span><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Shipping and taxes are not calculated in this preview.</p><button className="button button-dark" disabled>Checkout unavailable <ArrowRight size={15} /></button><Link className="text-link" href="/collections/all">Continue browsing</Link></aside>
        </div>
      )}
    </section>
  );
}
