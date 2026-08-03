import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { colors } from "../../db/schema";

const hex = z
  .string()
  .regex(
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    "hex must look like #rgb or #rrggbb",
  );

/* ---------------------------------- output --------------------------------- */

/** Derived from the table, so it cannot drift from the schema. */
export const colorSchema = createSelectSchema(colors);
export const colorListSchema = z.array(colorSchema);

/* ---------------------------------- input ---------------------------------- */

export const createColorSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  hex,
});

export const updateColorSchema = z.object({
  name: z.string().min(1).optional(),
  hex: hex.optional(),
});

export type CreateColorInput = z.infer<typeof createColorSchema>;
export type UpdateColorInput = z.infer<typeof updateColorSchema>;
