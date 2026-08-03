import { Elysia } from "elysia";

import { errorResponseSchema, idParamSchema } from "../../common/schemas";
import {
  listProductsQuerySchema,
  productListSchema,
  productWithRelationsSchema,
} from "./products.schema";
import { productsService } from "./products.service";

/**
 * Route layer: public HTTP surface, with zod schemas on input and output.
 *
 * Read-only — the catalogue is seeded, not authored over HTTP.
 */
export const productsRouter = new Elysia({
  prefix: "/products",
  tags: ["products"],
})
  .get("/", ({ query }) => productsService.list(query), {
    query: listProductsQuerySchema,
    response: { 200: productListSchema },
  })
  .get("/:id", ({ params }) => productsService.getById(params.id), {
    params: idParamSchema,
    response: { 200: productWithRelationsSchema, 404: errorResponseSchema },
  });
