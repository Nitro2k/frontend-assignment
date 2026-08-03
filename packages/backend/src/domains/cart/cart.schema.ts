import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { cartItems } from "../../db/schema";
import { productSchema } from "../products/products.schema";

const quantity = z.number().int().min(1).max(99);

/* ---------------------------------- output --------------------------------- */

/** Derived from the table, so it cannot drift from the schema. */
export const cartItemSchema = createSelectSchema(cartItems);

/** A cart row joined to the product it points at. */
export const cartItemWithProductSchema = cartItemSchema.extend({
  product: productSchema.nullable(),
});

export const cartSummarySchema = z.object({
  items: z.array(cartItemWithProductSchema),
  totalItems: z.number().int(),
  subtotal: z.number().int(),
  total: z.number().int(),
  totalDiscount: z.number().int(),
});

export const clearCartSchema = z.object({
  removed: z.number().int(),
});

export const checkoutSchema = z.object({
  orderId: z.string(),
});

/* ---------------------------------- input ---------------------------------- */

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: quantity.optional(),
});

export const updateCartItemSchema = z.object({
  quantity,
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
