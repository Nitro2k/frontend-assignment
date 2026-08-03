/* eslint-disable @typescript-eslint/no-explicit-any -- assertions narrow the
   loosely-typed JSON responses. */
import { beforeEach, describe, expect, test } from "bun:test";

import {
  api,
  givenColor,
  givenProduct,
  givenSize,
  resetDatabase,
} from "./helpers";

/** The catalogue the filter tests run against, mirroring the design's facets. */
const givenCatalogue = async () => {
  await givenColor("blue", "Blue", "#063af5");
  await givenColor("red", "Red", "#f50606");
  await givenColor("green", "Green", "#00c12b");
  await givenSize("small", "Small", "S");
  await givenSize("large", "Large", "L");
  await givenSize("x-large", "X-Large", "XL");

  const base = new Date("2026-01-01T00:00:00Z").getTime();

  await givenProduct({
    id: "tee",
    name: "Gradient Graphic T-shirt",
    description: "Soft cotton tee",
    price: 145,
    colorId: "blue",
    sizeId: "large",
    rating: 3.5,
    createdAt: new Date(base + 1_000),
  });
  await givenProduct({
    id: "polo",
    name: "Polo with Tipping Details",
    description: "Pique polo",
    price: 180,
    colorId: "red",
    sizeId: "small",
    rating: 4.5,
    createdAt: new Date(base + 2_000),
  });
  await givenProduct({
    id: "jeans",
    name: "Skinny Fit Jeans",
    description: "Stretch denim",
    price: 240,
    percentageDiscount: 20,
    colorId: "blue",
    sizeId: "x-large",
    rating: 3.5,
    createdAt: new Date(base + 3_000),
  });
  await givenProduct({
    id: "shorts",
    name: "Loose Fit Bermuda Shorts",
    description: "Washed denim shorts",
    price: 80,
    colorId: "green",
    sizeId: "large",
    rating: 3.0,
    createdAt: new Date(base + 4_000),
  });
  await givenProduct({
    id: "shirt",
    name: "Checkered Shirt",
    description: "Brushed flannel",
    price: 180,
    percentageDiscount: 30,
    colorId: "red",
    sizeId: "large",
    rating: 5,
    createdAt: new Date(base + 5_000),
  });
};

const idsOf = (body: any): string[] => body.items.map((p: any) => p.id);

beforeEach(async () => {
  resetDatabase();
  await givenCatalogue();
});

describe("GET /products — envelope", () => {
  test("returns items with pagination metadata", async () => {
    const res = await api("GET", "/products");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.limit).toBe(20);
    expect(res.body.offset).toBe(0);
    expect(res.body.hasMore).toBe(false);
  });

  test("resolves the color and size relations", async () => {
    const res = await api("GET", "/products?q=Gradient");
    const [item] = res.body.items;

    expect(item.color).toMatchObject({
      id: "blue",
      name: "Blue",
      hex: "#063af5",
    });
    expect(item.size).toMatchObject({ id: "large", name: "Large", value: "L" });
  });

  test("a product with no color or size yields nulls, not a dropped row", async () => {
    await givenProduct({ id: "orphan", name: "Unassigned Tee" });
    const res = await api("GET", "/products?q=Unassigned");

    expect(res.body.total).toBe(1);
    expect(res.body.items[0].color).toBeNull();
    expect(res.body.items[0].size).toBeNull();
  });
});

describe("GET /products — price filter (the $50–$200 slider)", () => {
  test("minPrice is inclusive", async () => {
    const res = await api("GET", "/products?minPrice=180");
    expect(idsOf(res.body).sort()).toEqual(["jeans", "polo", "shirt"]);
  });

  test("maxPrice is inclusive", async () => {
    const res = await api("GET", "/products?maxPrice=145");
    expect(idsOf(res.body).sort()).toEqual(["shorts", "tee"]);
  });

  test("a min/max band matches the slider's behaviour", async () => {
    const res = await api("GET", "/products?minPrice=50&maxPrice=200");
    expect(idsOf(res.body).sort()).toEqual(["polo", "shirt", "shorts", "tee"]);
  });

  test("filters on list price, not the discounted price", async () => {
    // 'shirt' lists at 180 and sells at 126; a <=150 band must exclude it.
    const res = await api("GET", "/products?maxPrice=150");
    expect(idsOf(res.body)).not.toContain("shirt");
  });

  test("an impossible band returns an empty page, not an error", async () => {
    const res = await api("GET", "/products?minPrice=500");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.items).toEqual([]);
    expect(res.body.hasMore).toBe(false);
  });
});

describe("GET /products — colour swatches (multi-select)", () => {
  test("a single colour narrows the list", async () => {
    const res = await api("GET", "/products?colorIds=blue");
    expect(idsOf(res.body).sort()).toEqual(["jeans", "tee"]);
  });

  test("several colours widen it (OR within the facet)", async () => {
    const res = await api("GET", "/products?colorIds=blue,red");
    expect(idsOf(res.body).sort()).toEqual(["jeans", "polo", "shirt", "tee"]);
  });

  test("whitespace around ids is tolerated", async () => {
    const res = await api("GET", "/products?colorIds=blue,%20red");
    expect(res.body.total).toBe(4);
  });

  test("an unknown colour matches nothing", async () => {
    const res = await api("GET", "/products?colorIds=chartreuse");
    expect(res.body.total).toBe(0);
  });
});

describe("GET /products — size pills (multi-select)", () => {
  test("a single size narrows the list", async () => {
    const res = await api("GET", "/products?sizeIds=large");
    expect(idsOf(res.body).sort()).toEqual(["shirt", "shorts", "tee"]);
  });

  test("several sizes widen it", async () => {
    const res = await api("GET", "/products?sizeIds=small,x-large");
    expect(idsOf(res.body).sort()).toEqual(["jeans", "polo"]);
  });
});

describe("GET /products — combining facets", () => {
  test("colour AND size intersect", async () => {
    const res = await api("GET", "/products?colorIds=blue,red&sizeIds=large");
    expect(idsOf(res.body).sort()).toEqual(["shirt", "tee"]);
  });

  test("colour AND size AND price all apply together", async () => {
    const res = await api(
      "GET",
      "/products?colorIds=blue,red&sizeIds=large&maxPrice=150",
    );
    expect(idsOf(res.body)).toEqual(["tee"]);
  });

  test("a contradictory combination is empty", async () => {
    const res = await api("GET", "/products?colorIds=green&sizeIds=small");
    expect(res.body.total).toBe(0);
  });
});

describe("GET /products — search", () => {
  test("matches the product name", async () => {
    const res = await api("GET", "/products?q=Bermuda");
    expect(idsOf(res.body)).toEqual(["shorts"]);
  });

  test("matches the description too", async () => {
    const res = await api("GET", "/products?q=flannel");
    expect(idsOf(res.body)).toEqual(["shirt"]);
  });

  test("is case-insensitive", async () => {
    const res = await api("GET", "/products?q=CHECKERED");
    expect(idsOf(res.body)).toEqual(["shirt"]);
  });

  test("matches partial words", async () => {
    const res = await api("GET", "/products?q=denim");
    expect(idsOf(res.body).sort()).toEqual(["jeans", "shorts"]);
  });

  test("combines with the other facets", async () => {
    const res = await api("GET", "/products?q=denim&colorIds=blue");
    expect(idsOf(res.body)).toEqual(["jeans"]);
  });

  test("no match returns an empty page", async () => {
    const res = await api("GET", "/products?q=zzzzz");
    expect(res.body.total).toBe(0);
  });
});

describe("GET /products — rating", () => {
  test("minRating is inclusive", async () => {
    const res = await api("GET", "/products?minRating=4.5");
    expect(idsOf(res.body).sort()).toEqual(["polo", "shirt"]);
  });

  test("accepts fractional ratings", async () => {
    const res = await api("GET", "/products?minRating=3.5");
    expect(res.body.total).toBe(4);
  });
});

describe("GET /products — sorting", () => {
  test("price ascending", async () => {
    const res = await api("GET", "/products?sort=price&order=asc");
    expect(res.body.items.map((p: any) => p.price)).toEqual([
      80, 145, 180, 180, 240,
    ]);
  });

  test("price descending", async () => {
    const res = await api("GET", "/products?sort=price&order=desc");
    expect(res.body.items.map((p: any) => p.price)).toEqual([
      240, 180, 180, 145, 80,
    ]);
  });

  test("rating descending puts the 5.0 first", async () => {
    const res = await api("GET", "/products?sort=rating&order=desc");
    expect(res.body.items[0].id).toBe("shirt");
  });

  test("name ascending is alphabetical", async () => {
    const res = await api("GET", "/products?sort=name&order=asc");
    expect(res.body.items[0].name).toBe("Checkered Shirt");
  });

  test("defaults to newest first", async () => {
    const res = await api("GET", "/products");
    expect(idsOf(res.body)).toEqual([
      "shirt",
      "shorts",
      "jeans",
      "polo",
      "tee",
    ]);
  });

  test("sorting applies across the whole filtered set, not just the page", async () => {
    const res = await api("GET", "/products?sort=price&order=desc&limit=1");
    expect(res.body.items[0].id).toBe("jeans");
    expect(res.body.total).toBe(5);
  });
});

describe("GET /products — pagination", () => {
  test("limit caps the page and flags hasMore", async () => {
    const res = await api("GET", "/products?limit=2&sort=price&order=asc");

    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(5);
    expect(res.body.limit).toBe(2);
    expect(res.body.hasMore).toBe(true);
  });

  test("offset walks the pages without repeats or gaps", async () => {
    const seen: string[] = [];
    for (let offset = 0; offset < 6; offset += 2) {
      const res = await api(
        "GET",
        `/products?limit=2&offset=${offset}&sort=price&order=asc`,
      );
      seen.push(...idsOf(res.body));
    }

    expect(seen).toHaveLength(5);
    expect(new Set(seen).size).toBe(5);
  });

  test("the last page reports hasMore false", async () => {
    const res = await api("GET", "/products?limit=2&offset=4");
    expect(res.body.items).toHaveLength(1);
    expect(res.body.hasMore).toBe(false);
  });

  test("an offset past the end is empty but still reports the total", async () => {
    const res = await api("GET", "/products?offset=99");
    expect(res.body.items).toEqual([]);
    expect(res.body.total).toBe(5);
    expect(res.body.hasMore).toBe(false);
  });

  test("total counts the filtered set, not the whole table", async () => {
    const res = await api("GET", "/products?colorIds=blue&limit=1");
    expect(res.body.total).toBe(2);
  });
});

describe("GET /products — query validation", () => {
  test("rejects an unknown sort key", async () => {
    expect((await api("GET", "/products?sort=colour")).status).toBe(422);
  });

  test("rejects an unknown order", async () => {
    expect((await api("GET", "/products?order=sideways")).status).toBe(422);
  });

  test("rejects a limit above the cap", async () => {
    expect((await api("GET", "/products?limit=101")).status).toBe(422);
  });

  test("rejects a zero limit", async () => {
    expect((await api("GET", "/products?limit=0")).status).toBe(422);
  });

  test("rejects a negative offset", async () => {
    expect((await api("GET", "/products?offset=-1")).status).toBe(422);
  });

  test("rejects a non-numeric price", async () => {
    expect((await api("GET", "/products?minPrice=cheap")).status).toBe(422);
  });

  test("rejects a rating above 5", async () => {
    expect((await api("GET", "/products?minRating=6")).status).toBe(422);
  });
});

describe("GET /products/:id", () => {
  test("returns the product with its relations", async () => {
    const res = await api("GET", "/products/tee");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Gradient Graphic T-shirt");
    expect(res.body.color.id).toBe("blue");
    expect(res.body.size.id).toBe("large");
  });

  test("unknown id is a 404 with a message", async () => {
    const res = await api("GET", "/products/nope");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Product 'nope' not found");
  });
});

describe("the catalogue is read-only", () => {
  test("POST /products is not routed", async () => {
    const res = await api("POST", "/products", { name: "X" });
    expect(res.status).toBe(404);
  });

  test("PATCH /products/:id is not routed", async () => {
    expect((await api("PATCH", "/products/tee", { price: 1 })).status).toBe(
      404,
    );
  });

  test("DELETE /products/:id is not routed", async () => {
    expect((await api("DELETE", "/products/tee")).status).toBe(404);
  });
});
