import { describe, expect, it } from "vitest";

import type { CartItem, CartProduct } from "@/lib/api/types";

import {
  EMPTY_CART_SUMMARY,
  indexByProductId,
  migrateCartState,
  summarize,
} from "./cart-store";

function makeProduct(overrides: Partial<CartProduct> = {}): CartProduct {
  return {
    id: "prod-1",
    name: "Gradient Graphic T-shirt",
    description: "A t-shirt",
    price: 150,
    discountedPrice: 120,
    percentageDiscount: 20,
    colorId: null,
    sizeId: null,
    imageUrl: "https://images.unsplash.com/x",
    rating: 4.5,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    productId: "prod-1",
    quantity: 1,
    createdAt: new Date("2026-01-01"),
    product: makeProduct(),
    ...overrides,
  };
}

describe("[1] summarize", () => {
  it("[1.1] returns the empty summary for no items", () => {
    expect(summarize([])).toEqual(EMPTY_CART_SUMMARY);
  });

  it("[1.2] sums quantity, list-price subtotal, discounted total, and discount across items", () => {
    const items = [
      makeCartItem({
        id: "item-1",
        quantity: 2,
        product: makeProduct({ price: 100, discountedPrice: 80 }),
      }),
      makeCartItem({
        id: "item-2",
        productId: "prod-2",
        quantity: 1,
        product: makeProduct({ id: "prod-2", price: 50, discountedPrice: 50 }),
      }),
    ];

    expect(summarize(items)).toEqual({
      items,
      totalItems: 3,
      subtotal: 250,
      total: 210,
      totalDiscount: 40,
    });
  });

  it("[1.3] skips rows whose product is null instead of throwing", () => {
    const items = [makeCartItem({ product: null, quantity: 5 })];
    const result = summarize(items);
    expect(result.totalItems).toBe(5);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe("[2] indexByProductId", () => {
  it("[2.1] maps each productId to its cart item id and quantity", () => {
    const items = [
      makeCartItem({ id: "item-1", productId: "prod-1", quantity: 2 }),
      makeCartItem({ id: "item-2", productId: "prod-2", quantity: 1 }),
    ];

    expect(indexByProductId(items)).toEqual({
      "prod-1": { itemId: "item-1", quantity: 2 },
      "prod-2": { itemId: "item-2", quantity: 1 },
    });
  });

  it("[2.2] skips rows without a productId", () => {
    const items = [makeCartItem({ productId: null })];
    expect(indexByProductId(items)).toEqual({});
  });
});

describe("[3] migrateCartState", () => {
  it("[3.1] is the identity function at version 1, the first schema version", () => {
    const persisted = { ...EMPTY_CART_SUMMARY, items: [makeCartItem()] };
    expect(migrateCartState(persisted, 1)).toEqual(persisted);
  });
});
