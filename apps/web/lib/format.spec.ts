import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDiscountPercent,
  starFillFractions,
} from "./format";

describe("[1] formatCurrency", () => {
  it("[1.1] formats an integer dollar amount with no decimals", () => {
    expect(formatCurrency(145)).toBe("$145");
  });

  it("[1.2] formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("[2] formatDiscountPercent", () => {
  it("[2.1] rounds the discount ratio to the nearest percent", () => {
    expect(formatDiscountPercent(565, 113)).toBe(20);
  });

  it("[2.2] returns 0 for a zero subtotal instead of dividing by zero", () => {
    expect(formatDiscountPercent(0, 0)).toBe(0);
  });

  it("[2.3] returns 0 when there is no discount", () => {
    expect(formatDiscountPercent(180, 0)).toBe(0);
  });
});

describe("[3] starFillFractions", () => {
  it("[3.1] returns five full stars for a perfect rating", () => {
    expect(starFillFractions(5)).toEqual([1, 1, 1, 1, 1]);
  });

  it("[3.2] returns a half-filled star for a .5 rating", () => {
    expect(starFillFractions(3.5)).toEqual([1, 1, 1, 0.5, 0]);
  });

  it("[3.3] returns all empty stars for a zero rating", () => {
    expect(starFillFractions(0)).toEqual([0, 0, 0, 0, 0]);
  });

  it("[3.4] clamps a rating above the star count to full stars", () => {
    expect(starFillFractions(5.7)).toEqual([1, 1, 1, 1, 1]);
  });
});
