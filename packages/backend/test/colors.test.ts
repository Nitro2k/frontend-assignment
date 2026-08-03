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

beforeEach(resetDatabase);

describe("GET /colors", () => {
  test("is empty on a clean database", async () => {
    const res = await api("GET", "/colors");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("lists colors sorted by name", async () => {
    await givenColor("red", "Red", "#f50606");
    await givenColor("blue", "Blue", "#063af5");
    const res = await api("GET", "/colors");

    expect(res.body.map((c: any) => c.name)).toEqual(["Blue", "Red"]);
  });
});

describe("POST /colors", () => {
  test("creates and returns 201", async () => {
    const res = await givenColor("blue", "Blue", "#063af5");

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "blue", name: "Blue", hex: "#063af5" });
  });

  test("mints a uuid v7 when no id is given", async () => {
    const res = await api("POST", "/colors", { name: "Teal", hex: "#008080" });

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  test("normalizes hex to lowercase", async () => {
    const res = await api("POST", "/colors", { name: "Red", hex: "#F50606" });
    expect(res.body.hex).toBe("#f50606");
  });

  test("accepts three-digit hex", async () => {
    expect(
      (await api("POST", "/colors", { name: "W", hex: "#fff" })).status,
    ).toBe(201);
  });

  test("rejects a malformed hex with 422", async () => {
    const res = await api("POST", "/colors", { name: "Nope", hex: "blue" });
    expect(res.status).toBe(422);
  });

  test("rejects a blank name with 422", async () => {
    expect(
      (await api("POST", "/colors", { name: "", hex: "#fff" })).status,
    ).toBe(422);
  });

  test("rejects a missing hex with 422", async () => {
    expect((await api("POST", "/colors", { name: "X" })).status).toBe(422);
  });

  test("a duplicate id is a 409", async () => {
    await givenColor("blue");
    const res = await api("POST", "/colors", {
      id: "blue",
      name: "Other",
      hex: "#000000",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Color 'blue' already exists");
  });
});

describe("GET /colors/:id", () => {
  test("returns the color", async () => {
    await givenColor("blue");
    const res = await api("GET", "/colors/blue");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Blue");
  });

  test("unknown id is a 404", async () => {
    const res = await api("GET", "/colors/ghost");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Color 'ghost' not found");
  });
});

describe("PATCH /colors/:id", () => {
  test("updates a single field, leaving the rest", async () => {
    await givenColor("blue", "Blue", "#063af5");
    const res = await api("PATCH", "/colors/blue", { name: "Navy" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "blue", name: "Navy", hex: "#063af5" });
  });

  test("normalizes hex on update", async () => {
    await givenColor("blue");
    const res = await api("PATCH", "/colors/blue", { hex: "#ABCDEF" });
    expect(res.body.hex).toBe("#abcdef");
  });

  test("an empty patch is a no-op, not an error", async () => {
    await givenColor("blue", "Blue", "#063af5");
    const res = await api("PATCH", "/colors/blue", {});

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Blue");
  });

  test("patching an unknown color is a 404", async () => {
    expect((await api("PATCH", "/colors/ghost", { name: "X" })).status).toBe(
      404,
    );
  });

  test("an invalid hex is rejected before it reaches the database", async () => {
    await givenColor("blue", "Blue", "#063af5");
    expect((await api("PATCH", "/colors/blue", { hex: "nope" })).status).toBe(
      422,
    );
    expect((await api("GET", "/colors/blue")).body.hex).toBe("#063af5");
  });
});

describe("DELETE /colors/:id", () => {
  test("removes the color and returns it", async () => {
    await givenColor("blue");
    const res = await api("DELETE", "/colors/blue");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("blue");
    expect((await api("GET", "/colors/blue")).status).toBe(404);
  });

  test("a color still used by a product is a 409", async () => {
    await givenColor("blue");
    await givenSize("large");
    await givenProduct({ colorId: "blue", sizeId: "large" });

    const res = await api("DELETE", "/colors/blue");

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("used by 1 product");
    expect((await api("GET", "/colors/blue")).status).toBe(200);
  });

  test("deleting an unknown color is a 404", async () => {
    expect((await api("DELETE", "/colors/ghost")).status).toBe(404);
  });
});
