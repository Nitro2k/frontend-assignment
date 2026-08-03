/* eslint-disable @typescript-eslint/no-explicit-any -- assertions narrow the
   loosely-typed JSON responses. */
import { beforeEach, describe, expect, test } from "bun:test";

import { prepareDatabase } from "../src/db/bootstrap";
import { PRODUCT_COUNT, seed } from "../src/db/seed";
import {
  SEED_COLORS,
  SEED_SIZES,
  UNSPLASH_PHOTO_IDS,
} from "../src/db/seed-data";
import { api, resetDatabase } from "./helpers";

beforeEach(resetDatabase);

describe("seed contents", () => {
  test("inserts the design's ten colours and nine sizes", async () => {
    const result = await seed();

    expect(result.colors).toBe(10);
    expect(result.sizes).toBe(9);
    expect((await api("GET", "/colors")).body).toHaveLength(10);
    expect((await api("GET", "/sizes")).body).toHaveLength(9);
  });

  test("inserts 1000 products", async () => {
    const result = await seed();

    expect(result.products).toBe(1000);
    expect(PRODUCT_COUNT).toBe(1000);
    expect((await api("GET", "/products")).body.total).toBe(1000);
  });

  test("colours match the swatches in the filter panel", async () => {
    await seed();
    const names = (await api("GET", "/colors")).body.map((c: any) => c.name);

    expect(names).toEqual([
      "Black",
      "Blue",
      "Cyan",
      "Green",
      "Orange",
      "Pink",
      "Purple",
      "Red",
      "White",
      "Yellow",
    ]);
  });

  test("sizes match the pills in the filter panel", async () => {
    await seed();
    const ids = (await api("GET", "/sizes")).body.map((s: any) => s.id).sort();

    expect(ids).toEqual([...SEED_SIZES].map((s) => s.id).sort());
    expect(ids).toContain("xx-small");
    expect(ids).toContain("4x-large");
  });

  test("every product carries an Unsplash image at the card's 3:4 crop", async () => {
    await seed();
    const res = await api("GET", "/products?limit=100");

    for (const product of res.body.items) {
      expect(product.imageUrl).toStartWith(
        "https://images.unsplash.com/photo-",
      );
      expect(product.imageUrl).toContain("w=600");
      expect(product.imageUrl).toContain("h=800");
      expect(product.imageUrl).toContain("fit=crop");
    }
  });

  test("images are drawn from the verified photo pool", async () => {
    await seed();
    const res = await api("GET", "/products?limit=100");

    for (const product of res.body.items) {
      const id = product.imageUrl
        .replace("https://images.unsplash.com/", "")
        .split("?")[0];
      expect(UNSPLASH_PHOTO_IDS).toContain(id);
    }
  });

  test("prices and discounts are internally consistent", async () => {
    await seed();
    const res = await api("GET", "/products?limit=100");

    for (const p of res.body.items) {
      expect(p.price).toBeGreaterThanOrEqual(50);
      expect(p.price).toBeLessThanOrEqual(300);
      expect(p.discountedPrice).toBeLessThanOrEqual(p.price);
      expect(p.discountedPrice).toBe(
        Math.round(p.price * (1 - p.percentageDiscount / 100)),
      );
    }
  });

  test("ratings sit in the range the cards render", async () => {
    await seed();
    const res = await api("GET", "/products?limit=100");

    for (const p of res.body.items) {
      expect(p.rating).toBeGreaterThanOrEqual(2.5);
      expect(p.rating).toBeLessThanOrEqual(5);
    }
  });

  test("the catalogue includes both discounted and full-price items", async () => {
    await seed();

    const discounted = (
      await api("GET", "/products?limit=100")
    ).body.items.filter((p: any) => p.percentageDiscount > 0);
    const full = (await api("GET", "/products?limit=100")).body.items.filter(
      (p: any) => p.percentageDiscount === 0,
    );

    expect(discounted.length).toBeGreaterThan(0);
    expect(full.length).toBeGreaterThan(0);
  });

  test("is deterministic — the same seed yields the same first product", async () => {
    await seed();
    const first = (await api("GET", "/products/product-0001")).body;

    resetDatabase();
    await seed();
    const again = (await api("GET", "/products/product-0001")).body;

    expect(again.name).toBe(first.name);
    expect(again.price).toBe(first.price);
    expect(again.imageUrl).toBe(first.imageUrl);
  });
});

describe("seeded data drives every filter facet", () => {
  beforeEach(async () => {
    await seed();
  });

  test("every colour swatch returns products", async () => {
    for (const color of SEED_COLORS) {
      const res = await api("GET", `/products?colorIds=${color.id}&limit=1`);
      expect(res.body.total).toBeGreaterThan(0);
    }
  });

  test("every size pill returns products", async () => {
    for (const size of SEED_SIZES) {
      const res = await api("GET", `/products?sizeIds=${size.id}&limit=1`);
      expect(res.body.total).toBeGreaterThan(0);
    }
  });

  test("colours are spread evenly across the catalogue", async () => {
    for (const color of SEED_COLORS) {
      const { total } = (
        await api("GET", `/products?colorIds=${color.id}&limit=1`)
      ).body;
      expect(total).toBe(100);
    }
  });

  test("the design's $50–$200 band returns a useful slice", async () => {
    const res = await api("GET", "/products?minPrice=50&maxPrice=200&limit=1");

    expect(res.body.total).toBeGreaterThan(100);
    expect(res.body.total).toBeLessThan(1000);
  });

  test("search finds garments by name", async () => {
    const res = await api("GET", "/products?q=T-shirt&limit=1");
    expect(res.body.total).toBeGreaterThan(0);
  });

  test("paging walks the whole catalogue without repeats", async () => {
    const seen = new Set<string>();
    for (let offset = 0; offset < 1000; offset += 100) {
      const res = await api(
        "GET",
        `/products?limit=100&offset=${offset}&sort=name&order=asc`,
      );
      for (const item of res.body.items) seen.add(item.id);
    }

    expect(seen.size).toBe(1000);
  });

  test("combining a colour and a size still returns results", async () => {
    const res = await api(
      "GET",
      "/products?colorIds=blue,red&sizeIds=large&limit=1",
    );
    expect(res.body.total).toBeGreaterThan(0);
  });
});

describe("prepareDatabase — auto-seeding on a fresh database", () => {
  test("seeds when the products table is empty", async () => {
    const result = await prepareDatabase();

    expect(result.seeded).toBe(true);
    expect(result.products).toBe(1000);
    expect((await api("GET", "/products")).body.total).toBe(1000);
  });

  test("is idempotent — a second call does not re-seed or duplicate", async () => {
    await prepareDatabase();
    const second = await prepareDatabase();

    expect(second.seeded).toBe(false);
    expect(second.products).toBe(1000);
    expect((await api("GET", "/products")).body.total).toBe(1000);
  });

  test("leaves an already-populated database alone", async () => {
    await api("POST", "/colors", { id: "solo", name: "Solo", hex: "#123456" });
    const { productsRepo } =
      await import("../src/domains/products/products.repo");
    await productsRepo.create({
      id: "mine",
      name: "My Product",
      description: "d",
      price: 10,
      discountedPrice: 10,
      percentageDiscount: 0,
      colorId: "solo",
      sizeId: null,
      imageUrl: "u",
      rating: 1,
    });

    const result = await prepareDatabase();

    expect(result.seeded).toBe(false);
    expect((await api("GET", "/products")).body.total).toBe(1);
  });
});
