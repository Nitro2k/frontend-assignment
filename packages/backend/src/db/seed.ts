import { db } from "./index";
import { colors, products, sizes, type NewProduct } from "./schema";
import {
  DETAILS,
  FITS,
  GARMENTS,
  PATTERNS,
  SEED_COLORS,
  SEED_SIZES,
  productImageUrl,
} from "./seed-data";

export const PRODUCT_COUNT = 1000;

/** Price band around the $50–$200 slider in the design, with headroom above. */
const MIN_PRICE = 50;
const MAX_PRICE = 300;

/** The cards show 3.0/5 through 5.0/5 in half steps. */
const MIN_RATING = 25;
const MAX_RATING = 50;

const DISCOUNT_STEPS = [0, 0, 0, 0, 10, 20, 20, 30, 40];

/** SQLite caps bound parameters per statement, so rows go in in chunks. */
const INSERT_CHUNK = 50;

/**
 * Deterministic PRNG — re-seeding an empty database always produces the same
 * catalogue, so screenshots and tests stay stable across machines.
 */
const mulberry32 = (seed: number) => {
  let a = seed;

  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T>(random: () => number, items: readonly T[]): T =>
  items[Math.floor(random() * items.length)]!;

const buildName = (random: () => number, garment: string): string => {
  const roll = random();

  if (roll < 0.4) return `${pick(random, PATTERNS)} ${garment}`;
  if (roll < 0.75) return `${pick(random, FITS)} ${garment}`;

  return `${pick(random, FITS)} ${pick(random, PATTERNS)} ${garment}`;
};

const buildProducts = (): NewProduct[] => {
  const random = mulberry32(20260803);
  const now = Date.now();
  const rows: NewProduct[] = [];

  for (let index = 0; index < PRODUCT_COUNT; index++) {
    const garment = pick(random, GARMENTS);
    const detail = pick(random, DETAILS);
    const name = `${buildName(random, garment)}${detail ? ` ${detail}` : ""}`;

    const price =
      MIN_PRICE + Math.floor(random() * (MAX_PRICE - MIN_PRICE + 1));
    const percentageDiscount = pick(random, DISCOUNT_STEPS);
    const discountedPrice = Math.round(price * (1 - percentageDiscount / 100));

    const rating =
      (MIN_RATING + Math.floor(random() * (MAX_RATING - MIN_RATING + 1))) / 10;

    rows.push({
      // Sequential ids keep the catalogue stable and readable in the client.
      id: `product-${String(index + 1).padStart(4, "0")}`,
      name,
      description: `${name} in a comfortable everyday cut. Crafted from durable fabric with a clean finish, built to hold its shape wash after wash.`,
      price,
      discountedPrice,
      percentageDiscount,
      // Strides are coprime with the facet lengths, so colours and sizes stay
      // evenly spread and uncorrelated with each other.
      colorId: SEED_COLORS[index % SEED_COLORS.length]!.id,
      sizeId: SEED_SIZES[(index * 7) % SEED_SIZES.length]!.id,
      imageUrl: productImageUrl(index),
      rating: Math.round(rating * 10) / 10,
      // Spread an hour apart so `sort=createdAt` has something to order by.
      createdAt: new Date(now - index * 3_600_000),
      updatedAt: new Date(now - index * 3_600_000),
    });
  }

  return rows;
};

export type SeedResult = {
  colors: number;
  sizes: number;
  products: number;
};

/** Inserts the reference data and the generated catalogue. */
export const seed = async (): Promise<SeedResult> => {
  await db.insert(colors).values(SEED_COLORS.map((color) => ({ ...color })));
  await db.insert(sizes).values(SEED_SIZES.map((size) => ({ ...size })));

  const rows = buildProducts();
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    await db.insert(products).values(rows.slice(i, i + INSERT_CHUNK));
  }

  return {
    colors: SEED_COLORS.length,
    sizes: SEED_SIZES.length,
    products: rows.length,
  };
};
