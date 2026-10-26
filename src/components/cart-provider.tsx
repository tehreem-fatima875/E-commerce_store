"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import type { Product } from "@/data/development-fixtures";

type CartLine = { handle: string; quantity: number; size?: string };
export const MAX_CART_QUANTITY = 99;
const quantitySchema = z.number().int().min(1).max(MAX_CART_QUANTITY);
type CartContextValue = {
  count: number;
  lines: CartLine[];
  storageError: boolean;
  add: (product: Product, quantity?: number, size?: string) => void;
  update: (handle: string, quantity: number, size?: string) => void;
  remove: (handle: string, size?: string) => void;
};

export function isValidCartLine(value: unknown): value is CartLine {
  return typeof value === "object" &&
    value !== null &&
    "handle" in value &&
    typeof value.handle === "string" &&
    value.handle.length > 0 &&
    "quantity" in value &&
    typeof value.quantity === "number" &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity <= MAX_CART_QUANTITY &&
    value.quantity > 0 &&
    (!("size" in value) || typeof value.size === "string");
}

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "avenoir-development-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const linesRef = useRef<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const commitLines = (next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
  };

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) commitLines(parsed.filter(isValidCartLine));
        } catch {
          try {
            window.localStorage.removeItem(storageKey);
          } catch {
            setStorageError(true);
          }
        }
      }
    } catch {
      setStorageError(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(lines));
      } catch {
        setStorageError(true);
      }
    }
  }, [hydrated, lines]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    storageError,
    count: lines.reduce((total, line) => total + line.quantity, 0),
    add(product, quantity = 1, size) {
      quantitySchema.parse(quantity);
      if (size && !product.sizes?.includes(size)) {
        throw new RangeError("Choose a valid size for this product.");
      }
      const current = linesRef.current;
      const existing = current.find((line) => line.handle === product.handle && line.size === size);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;
      quantitySchema.parse(nextQuantity);
      commitLines(existing
        ? current.map((line) => line.handle === product.handle && line.size === size ? { ...line, quantity: nextQuantity } : line)
        : [...current, { handle: product.handle, quantity, ...(size ? { size } : {}) }]);
    },
    update(handle, quantity, size) {
      if (quantity === 0) {
        commitLines(linesRef.current.filter((line) => line.handle !== handle || line.size !== size));
        return;
      }
      quantitySchema.parse(quantity);
      commitLines(linesRef.current.map((line) => line.handle === handle && line.size === size ? { ...line, quantity } : line));
    },
    remove(handle, size) {
      commitLines(linesRef.current.filter((line) => line.handle !== handle || line.size !== size));
    },
  }), [lines, storageError]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
