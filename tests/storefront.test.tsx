import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartProvider, isValidCartLine, MAX_CART_QUANTITY } from "@/components/cart-provider";
import { ProductCard } from "@/components/product-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { SiteHeader } from "@/components/site-header";
import { formatPrice, products } from "@/data/development-fixtures";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("development storefront fixtures", () => {
  it("renders a product card with its name, category, price, and detail link", () => {
    const product = products[0];
    render(<ProductCard product={product} />);

    expect(screen.getByRole("heading", { name: product.name })).toBeInTheDocument();
    expect(screen.getByText(product.category)).toBeInTheDocument();
    expect(screen.getByText((_, element) =>
      element?.textContent?.replace(/\u00a0/g, " ") === formatPrice(product.price).replace(/\u00a0/g, " "),
    )).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `View ${product.name}` })).toHaveAttribute(
      "href",
      `/products/${product.handle}`,
    );
  });

  it("formats fixture prices in Pakistani rupees without decimal fractions", () => {
    expect(formatPrice(28900)).toContain("28,900");
    expect(formatPrice(28900)).toMatch(/Rs|PKR/);
  });
});

describe("preview bag validation", () => {
  it("accepts only positive safe-integer quantities and non-empty handles", () => {
    expect(isValidCartLine({ handle: "the-sculpted-trench", quantity: 2 })).toBe(true);
    expect(isValidCartLine({ handle: "item", quantity: 0 })).toBe(false);
    expect(isValidCartLine({ handle: "item", quantity: 1.5 })).toBe(false);
    expect(isValidCartLine({ handle: "", quantity: 1 })).toBe(false);
    expect(isValidCartLine(null)).toBe(false);
  });

  it("exposes the primary navigation and shopping bag accessibly", () => {
    render(<CartProvider><SiteHeader /></CartProvider>);

    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shopping bag, 0 items" })).toHaveAttribute("href", "/cart");
  });

  it("clearly reports that preview newsletter sign-ups are not saved", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({
      message: "Newsletter sign-up is not configured; your email was not saved.",
    }), { status: 503 }));
    render(<NewsletterForm />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "reader@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join us/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("your email was not saved"));
  });

  it("rejects quantities outside positive safe integers", () => {
    expect(isValidCartLine({ handle: "item", quantity: Number.MAX_SAFE_INTEGER + 1 })).toBe(false);
    expect(isValidCartLine({ handle: "item", quantity: MAX_CART_QUANTITY + 1 })).toBe(false);
    expect(isValidCartLine({ handle: "item", quantity: "2" })).toBe(false);
  });
});
