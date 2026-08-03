import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { products } from "../../db/schema";
import { colorSchema } from "../colors/colors.schema";
import { sizeSchema } from "../sizes/sizes.schema";

/* ---------------------------------- output --------------------------------- */

/** Derived from the table, so it cannot drift from the schema. */
export const productSchema = createSelectSchema(products);

/** A product with its colour and size resolved. Either may be null. */
export const productWithRelationsSchema = productSchema.extend({
  color: colorSchema.nullable(),
  size: sizeSchema.nullable(),
});

export const productListSchema = z.object({
  items: z.array(productWithRelationsSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  hasMore: z.boolean(),
});

/* ---------------------------------- input ---------------------------------- */

export const productSortSchema = z.enum([
  "name",
  "price",
  "rating",
  "createdAt",
]);
export const sortOrderSchema = z.enum(["asc", "desc"]);

/**
 * The multi-select facets in the filter panel travel as one comma-separated
 * query param: `?colorIds=blue,red&sizeIds=large,x-large`.
 *
 * Elysia's query parser already splits a comma-separated value into an array
 * and hands a lone value through as a string, so both arrive here — and the
 * string branch still splits, so the contract holds however it is parsed.
 */
const idList = z
  .union([z.string().min(1), z.array(z.string())])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split(","))
      .map((part) => part.trim())
      .filter(Boolean),
  );

/**
 * Query strings arrive as text, so numeric filters are coerced. Defaults live
 * here rather than in the controller so the contract is self-describing.
 */
export const listProductsQuerySchema = z.object({
  q: z.string().min(1).optional(),
  colorIds: idList.optional(),
  sizeIds: idList.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: productSortSchema.optional(),
  order: sortOrderSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type ProductSort = z.infer<typeof productSortSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
