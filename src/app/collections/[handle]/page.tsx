import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/development-fixtures";

const collectionNames: Record<string, string> = {
  all: "All pieces",
  women: "Women",
  men: "Men",
  shoes: "Shoes",
  kids: "Kids",
  essentials: "The essentials",
  "new-arrivals": "New arrivals",
};

export function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  return params.then(({ handle }) => ({ title: collectionNames[handle] ?? "Collection" }));
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; category?: string }>;
}) {
  const { handle } = await params;
  const { sort, category } = await searchParams;
  const title = collectionNames[handle];
  if (!title) {
    return (
      <section className="simple-page">
        <span className="eyebrow">Collection unavailable</span>
        <h1>We couldn&apos;t find that collection.</h1>
        <Link className="text-link" href="/collections/all">Browse all pieces</Link>
      </section>
    );
  }

  const departmentFiltered = handle === "new-arrivals"
    ? products.filter((product) => product.isNew)
    : ["women", "men", "shoes", "kids"].includes(handle)
      ? products.filter((product) => product.departments.includes(handle))
      : products;
  const filtered = category
    ? departmentFiltered.filter((product) => product.category === category)
    : departmentFiltered;
  const sorted = [...filtered];
  if (sort === "price-ascending") sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-descending") sorted.sort((a, b) => b.price - a.price);

  return (
    <div className="collection-page">
      <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>{title}</span></div>
      <header className="collection-heading">
        <span className="eyebrow">Avenoir / The collection</span>
        <h1>{title}<em>.</em></h1>
        <p>Considered forms and familiar comforts, made to find their place in your everyday.</p>
        <small>Development preview — these are sample products, not live Shopify inventory.</small>
      </header>
      <form className="collection-tools" method="get">
        <span>{sorted.length} pieces</span>
        <div className="collection-filters">
          <label htmlFor="sort">Sort by</label>
          <select defaultValue={sort ?? "featured"} id="sort" name="sort">
            <option value="featured">Featured</option>
            <option value="price-ascending">Price: low to high</option>
            <option value="price-descending">Price: high to low</option>
          </select>
          <label htmlFor="category">Category</label>
          <select defaultValue={category ?? ""} id="category" name="category">
            <option value="">All categories</option>
            {[...new Set(departmentFiltered.map((product) => product.category))].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <button className="sort-submit" type="submit">Apply</button>
        </div>
      </form>
      {sorted.length ? (
        <div className="product-grid">
          {sorted.map((product) => <ProductCard key={product.handle} product={product} />)}
        </div>
      ) : (
        <div className="empty-state"><h2>Nothing here just yet.</h2><p>We&apos;re working on what comes next.</p></div>
      )}
    </div>
  );
}
