import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/development-fixtures";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = query
    ? products.filter((product) => `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(query))
    : [];
  return (
    <section className="search-results-page">
      <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Search</span></div>
      <header className="collection-heading"><span className="eyebrow">Avenoir / Search</span><h1>Find your <em>piece.</em></h1><p>Search the development preview collection.</p></header>
      <form action="/search" className="results-search"><label className="sr-only" htmlFor="results-query">Search products</label><input defaultValue={q} id="results-query" name="q" placeholder="Try “knit” or “shoes”" /><button className="button button-dark" type="submit">Search</button></form>
      {query && <p className="result-count">{results.length} {results.length === 1 ? "result" : "results"} for “{q}”</p>}
      {results.length ? <div className="product-grid">{results.map((product) => <ProductCard key={product.handle} product={product} />)}</div> : <div className="empty-state"><h2>{query ? "No pieces found." : "What are you looking for?"}</h2><p>{query ? "Try a different name, colour or category." : "Search names, colours or categories from the preview collection."}</p></div>}
    </section>
  );
}
