/* eslint-disable @typescript-eslint/no-explicit-any -- test helpers return
   loosely-typed JSON on purpose; assertions do the narrowing. */
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { app } from "../src/app";
import { db } from "../src/db";
import { migrationsFolder } from "../src/db/paths";
import { cartItems, colors, products, sizes } from "../src/db/schema";

if (process.env.DATABASE_URL !== ":memory:") {
  throw new Error(
    "Tests must run against an in-memory database — check test/preload.ts is loaded.",
  );
}

let migrated = false;

/** Truncates every table, migrating first on the very first call. */
export const resetDatabase = () => {
  if (!migrated) {
    migrate(db, { migrationsFolder });
    migrated = true;
  }

  // Child rows first — the foreign keys are enforced.
  db.delete(cartItems).run();
  db.delete(products).run();
  db.delete(colors).run();
  db.delete(sizes).run();
};

export type ApiResponse<T = any> = {
  status: number;
  body: T;
};

/**
 * Drives the real Elysia app in-process. No port is bound, so the full stack
 * — routing, zod input validation, handlers, zod response validation — is
 * exercised exactly as it would be over the network.
 */
export const api = async <T = any>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> => {
  const response = await app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers:
        body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );

  const text = await response.text();
  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* non-JSON body, keep the raw text */
  }

  return { status: response.status, body: parsed as T };
};

/* ------------------------------- fixtures -------------------------------- */

export const givenColor = (id = "blue", name = "Blue", hex = "#063af5") =>
  api("POST", "/colors", { id, name, hex });

export const givenSize = (id = "large", name = "Large", value = "L") =>
  api("POST", "/sizes", { id, name, value });

export type ProductOverrides = Partial<{
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  percentageDiscount: number;
  colorId: string | null;
  sizeId: string | null;
  imageUrl: string;
  rating: number;
  createdAt: Date;
}>;

let productSeq = 0;

/**
 * Products have no write API, so fixtures go in through the repository —
 * the same path the seeder uses.
 */
export const givenProduct = async (overrides: ProductOverrides = {}) => {
  const { productsRepo } =
    await import("../src/domains/products/products.repo");
  productSeq += 1;
  const price = overrides.price ?? 100;
  const percentageDiscount = overrides.percentageDiscount ?? 0;

  return productsRepo.create({
    id: overrides.id ?? `product-${productSeq}`,
    name: overrides.name ?? `Product ${productSeq}`,
    description: overrides.description ?? "A test garment",
    price,
    discountedPrice:
      overrides.discountedPrice ??
      Math.round(price * (1 - percentageDiscount / 100)),
    percentageDiscount,
    colorId: overrides.colorId ?? null,
    sizeId: overrides.sizeId ?? null,
    imageUrl: overrides.imageUrl ?? "https://images.unsplash.com/photo-test",
    rating: overrides.rating ?? 4,
    ...(overrides.createdAt ? { createdAt: overrides.createdAt } : {}),
  });
};
