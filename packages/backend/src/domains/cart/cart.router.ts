import { Elysia } from "elysia";

import { errorResponseSchema, idParamSchema } from "../../common/schemas";
import {
  addToCartSchema,
  cartItemSchema,
  cartItemWithProductSchema,
  cartSummarySchema,
  checkoutSchema,
  clearCartSchema,
  updateCartItemSchema,
} from "./cart.schema";
import { cartService } from "./cart.service";

/**
 * Route layer: public HTTP surface, with zod schemas on input and output.
 *
 * There is no auth on this API, so the cart is a single global cart backed by
 * the shared database rather than one cart per user.
 */
export const cartRouter = new Elysia({ prefix: "/cart", tags: ["cart"] })
  .get("/", () => cartService.get(), {
    response: { 200: cartSummarySchema },
  })
  .delete("/", () => cartService.clear(), {
    response: { 200: clearCartSchema },
  })
  .post("/checkout", () => cartService.checkout(), {
    response: { 200: checkoutSchema, 409: errorResponseSchema },
  })
  .get("/items/:id", ({ params }) => cartService.getItem(params.id), {
    params: idParamSchema,
    response: { 200: cartItemWithProductSchema, 404: errorResponseSchema },
  })
  .post("/items", ({ body }) => cartService.addItem(body), {
    body: addToCartSchema,
    response: {
      201: cartItemSchema,
      400: errorResponseSchema,
      404: errorResponseSchema,
    },
  })
  .patch(
    "/items/:id",
    ({ params, body }) => cartService.updateQuantity(params.id, body.quantity),
    {
      params: idParamSchema,
      body: updateCartItemSchema,
      response: {
        200: cartItemSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
  )
  .delete("/items/:id", ({ params }) => cartService.removeItem(params.id), {
    params: idParamSchema,
    response: { 200: cartItemSchema, 404: errorResponseSchema },
  });
