import { expect, test } from "@playwright/test";

test("homepage presents the campaign and collection entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /a softer way to arrive/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /shop the collection/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /women/i }).first()).toBeVisible();
});

test("collection and product detail routes are available", async ({ page }) => {
  await page.goto("/collections/new-arrivals");
  await expect(page.getByRole("heading", { name: /new arrivals/i })).toBeVisible();
  await page.getByRole("link", { name: /view the sculpted trench/i }).click();
  await expect(page.getByRole("heading", { name: "The Sculpted Trench" })).toBeVisible();
  await expect(page.getByText(/not live shopify inventory/i)).toBeVisible();
});

test("preview bag updates when a product is added", async ({ page }) => {
  page.on("pageerror", (error) => console.error(`Browser page error: ${error.message}`));
  await page.goto("/products/the-sculpted-trench");
  await page.getByLabel("Size · preview choice").selectOption("L");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: /add to preview bag/i }).click();
  await expect(page.getByRole("link", { name: "Shopping bag, 2 items" })).toBeVisible();
  await page.getByRole("link", { name: "Shopping bag, 2 items" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole("heading", { name: /your bag \(2\)/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "The Sculpted Trench", exact: true })).toBeVisible();
  await expect(page.getByText("Sand · Size L")).toBeVisible();
  await expect(page.getByText("2", { exact: true })).toBeVisible();
});

test("collection sorting submits the selected price order", async ({ page }) => {
  await page.goto("/collections/all");
  await page.getByLabel("Sort by").selectOption("price-ascending");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/sort=price-ascending/);
  await expect(page.getByRole("link", { name: "View Soft Structure Shirt" }).first()).toBeVisible();
});

test("collection category filter narrows the available pieces", async ({ page }) => {
  await page.goto("/collections/all");
  await page.getByLabel("Category").selectOption("Footwear");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/category=Footwear/);
  await expect(page.getByRole("link", { name: "View The Everyday Loafer" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View The Sculpted Trench" })).toHaveCount(0);
});

test("preview bag is clear that checkout is unavailable", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /your bag/i })).toBeVisible();
  await expect(page.getByText(/not connected to shopify checkout/i)).toBeVisible();
  await expect(page.getByText(/your bag is waiting/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /checkout/i })).toHaveCount(0);
});

test("search filters the preview catalogue", async ({ page }) => {
  await page.goto("/search?q=knit");
  await expect(page.getByRole("heading", { name: "Relaxed Cotton Knit" })).toBeVisible();
  await expect(page.getByText("1 result for “knit”")).toBeVisible();
});

test("mobile navigation opens accessibly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Women" })).toBeVisible();
});
