import { Elysia } from "elysia";

import { errorResponseSchema, idParamSchema } from "../../common/schemas";
import {
  createSizeSchema,
  sizeListSchema,
  sizeSchema,
  updateSizeSchema,
} from "./sizes.schema";
import { sizesService } from "./sizes.service";

/** Route layer: public HTTP surface, with zod schemas on input and output. */
export const sizesRouter = new Elysia({ prefix: "/sizes", tags: ["sizes"] })
  .get("/", () => sizesService.list(), {
    response: { 200: sizeListSchema },
  })
  .get("/:id", ({ params }) => sizesService.getById(params.id), {
    params: idParamSchema,
    response: { 200: sizeSchema, 404: errorResponseSchema },
  })
  .post("/", ({ body }) => sizesService.create(body), {
    body: createSizeSchema,
    response: { 201: sizeSchema, 409: errorResponseSchema },
  })
  .patch("/:id", ({ params, body }) => sizesService.update(params.id, body), {
    params: idParamSchema,
    body: updateSizeSchema,
    response: { 200: sizeSchema, 404: errorResponseSchema },
  })
  .delete("/:id", ({ params }) => sizesService.remove(params.id), {
    params: idParamSchema,
    response: {
      200: sizeSchema,
      404: errorResponseSchema,
      409: errorResponseSchema,
    },
  });
