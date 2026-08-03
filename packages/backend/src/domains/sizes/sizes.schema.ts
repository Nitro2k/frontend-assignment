import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { sizes } from "../../db/schema";

/* ---------------------------------- output --------------------------------- */

/** Derived from the table, so it cannot drift from the schema. */
export const sizeSchema = createSelectSchema(sizes);
export const sizeListSchema = z.array(sizeSchema);

/* ---------------------------------- input ---------------------------------- */

export const createSizeSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  value: z.string().min(1),
});

export const updateSizeSchema = z.object({
  name: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
});

export type CreateSizeInput = z.infer<typeof createSizeSchema>;
export type UpdateSizeInput = z.infer<typeof updateSizeSchema>;
