import { count } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { db, DATABASE_URL } from "./index";
import { migrationsFolder } from "./paths";
import { products } from "./schema";
import { seed } from "./seed";

export type PrepareResult = {
  seeded: boolean;
  products: number;
};

/**
 * Brings the database up to date and seeds it the first time only. Called on
 * boot, so `bun dev` against a fresh checkout yields a populated catalogue
 * without a manual step. An already-populated database is left alone.
 */
export const prepareDatabase = async (): Promise<PrepareResult> => {
  migrate(db, { migrationsFolder });

  const existing = (await db.select({ value: count() }).from(products).get())
    ?.value;

  if (existing && existing > 0) {
    return { seeded: false, products: existing };
  }

  console.log(`Fresh database at ${DATABASE_URL} — seeding...`);
  const result = await seed();
  console.log(
    `Seeded ${result.products} products, ${result.colors} colors, ${result.sizes} sizes`,
  );

  return { seeded: true, products: result.products };
};
