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

describe("GET /sizes", () => {
  test("is empty on a clean database", async () => {
    expect((await api("GET", "/sizes")).body).toEqual([]);
  });

  test("lists sizes", async () => {
    await givenSize("large", "Large", "L");
    await givenSize("small", "Small", "S");
    const res = await api("GET", "/sizes");

    expect(res.body).toHaveLength(2);
    expect(res.body.map((s: any) => s.value).sort()).toEqual(["L", "S"]);
  });
});

describe("POST /sizes", () => {
  test("creates and returns 201", async () => {
    const res = await givenSize("large", "Large", "L");

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "large", name: "Large", value: "L" });
  });

  test("mints a uuid v7 when no id is given", async () => {
    const res = await api("POST", "/sizes", { name: "Medium", value: "M" });
    expect(res.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  test("rejects a blank value with 422", async () => {
    expect((await api("POST", "/sizes", { name: "X", value: "" })).status).toBe(
      422,
    );
  });

  test("a duplicate id is a 409", async () => {
    await givenSize("large");
    const res = await api("POST", "/sizes", {
      id: "large",
      name: "Other",
      value: "L",
    });

    expect(res.status).toBe(409);
  });
});

describe("GET /sizes/:id", () => {
  test("returns the size", async () => {
    await givenSize("large");
    expect((await api("GET", "/sizes/large")).body.name).toBe("Large");
  });

  test("unknown id is a 404", async () => {
    const res = await api("GET", "/sizes/ghost");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Size 'ghost' not found");
  });
});

describe("PATCH /sizes/:id", () => {
  test("updates a field", async () => {
    await givenSize("large", "Large", "L");
    const res = await api("PATCH", "/sizes/large", { name: "L (Large)" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "large", name: "L (Large)", value: "L" });
  });

  test("an empty patch is a no-op, not an error", async () => {
    await givenSize("large", "Large", "L");
    const res = await api("PATCH", "/sizes/large", {});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "large", name: "Large", value: "L" });
  });

  test("patching an unknown size is a 404", async () => {
    expect((await api("PATCH", "/sizes/ghost", { name: "X" })).status).toBe(
      404,
    );
  });
});

describe("DELETE /sizes/:id", () => {
  test("removes the size", async () => {
    await givenSize("large");

    expect((await api("DELETE", "/sizes/large")).status).toBe(200);
    expect((await api("GET", "/sizes/large")).status).toBe(404);
  });

  test("a size still used by a product is a 409", async () => {
    await givenColor("blue");
    await givenSize("large");
    await givenProduct({ colorId: "blue", sizeId: "large" });

    const res = await api("DELETE", "/sizes/large");

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("used by 1 product");
  });

  test("deleting an unknown size is a 404", async () => {
    expect((await api("DELETE", "/sizes/ghost")).status).toBe(404);
  });
});
