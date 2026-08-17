import { describe, expect, it } from "vitest";

import {
  EMPTY_FILTERS,
  filtersToSearchParams,
  searchParamsToFilters,
} from "./filters";

describe("[1] filtersToSearchParams", () => {
  it("[1.1] omits every param for empty filters", () => {
    expect(filtersToSearchParams(EMPTY_FILTERS).toString()).toBe("");
  });

  it("[1.2] omits minPrice/maxPrice when at the full 0-300 bounds", () => {
    const params = filtersToSearchParams({
      colorIds: [],
      sizeIds: [],
      minPrice: 0,
      maxPrice: 300,
    });
    expect(params.toString()).toBe("");
  });

  it("[1.3] comma-joins multi-select facets", () => {
    const params = filtersToSearchParams({
      colorIds: ["red", "blue"],
      sizeIds: ["large"],
    });
    expect(params.get("color")).toBe("red,blue");
    expect(params.get("size")).toBe("large");
  });

  it("[1.4] trims and sets q only when non-empty", () => {
    expect(
      filtersToSearchParams({ ...EMPTY_FILTERS, q: "  shirt  " }).get("q"),
    ).toBe("shirt");
    expect(
      filtersToSearchParams({ ...EMPTY_FILTERS, q: "   " }).has("q"),
    ).toBe(false);
  });
});

describe("[2] searchParamsToFilters", () => {
  it("[2.1] round-trips a full filter set", () => {
    const original = {
      q: "shirt",
      colorIds: ["red", "blue"],
      sizeIds: ["large", "x-large"],
      minPrice: 50,
      maxPrice: 200,
    };

    const roundTripped = searchParamsToFilters(
      filtersToSearchParams(original),
    );

    expect(roundTripped).toEqual(original);
  });

  it("[2.2] round-trips empty filters back to the empty shape", () => {
    expect(
      searchParamsToFilters(filtersToSearchParams(EMPTY_FILTERS)),
    ).toEqual(EMPTY_FILTERS);
  });

  it("[2.3] clamps out-of-range prices into 0-300", () => {
    const params = new URLSearchParams({ minPrice: "-10", maxPrice: "9999" });
    const filters = searchParamsToFilters(params);
    expect(filters.minPrice).toBe(0);
    expect(filters.maxPrice).toBe(300);
  });

  it("[2.4] ignores an empty q param", () => {
    const params = new URLSearchParams({ q: "" });
    expect(searchParamsToFilters(params).q).toBeUndefined();
  });
});
