export const PRODUCT_SOURCE = "development-fixture" as const;

export type Product = {
  handle: string;
  name: string;
  category: string;
  price: number;
  image: string;
  color: string;
  departments: string[];
  sizes?: string[];
  isNew?: boolean;
};

export const products: Product[] = [
  {
    handle: "the-sculpted-trench",
    name: "The Sculpted Trench",
    category: "Outerwear",
    price: 28900,
    image: "photo-1539109136881-3be0616acf4b",
    color: "Sand",
    departments: ["women"],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
  },
  {
    handle: "soft-structure-shirt",
    name: "Soft Structure Shirt",
    category: "Ready to wear",
    price: 14500,
    image: "photo-1598554747436-c9293d6a588f",
    color: "Chalk",
    departments: ["men"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    handle: "the-everyday-loafer",
    name: "The Everyday Loafer",
    category: "Footwear",
    price: 21900,
    image: "photo-1543163521-1bf539c55dd2",
    color: "Espresso",
    departments: ["shoes"],
    sizes: ["36", "37", "38", "39", "40", "41"],
    isNew: true,
  },
  {
    handle: "relaxed-cotton-knit",
    name: "Relaxed Cotton Knit",
    category: "Knitwear",
    price: 17900,
    image: "photo-1620799140408-edc6dcb6d633",
    color: "Oat",
    departments: ["women", "men"],
    sizes: ["S", "M", "L"],
  },
];

export const imageUrl = (photoId: string, width = 1000) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
