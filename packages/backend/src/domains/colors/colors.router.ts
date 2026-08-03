import { Elysia } from "elysia";

import { errorResponseSchema, idParamSchema } from "../../common/schemas";
import {
  colorListSchema,
  colorSchema,
  createColorSchema,
  updateColorSchema,
} from "./colors.schema";
import { colorsService } from "./colors.service";

/** Route layer: public HTTP surface, with zod schemas on input and output. */
export const colorsRouter = new Elysia({ prefix: "/colors", tags: ["colors"] })
  .get("/", () => colorsService.list(), {
    response: { 200: colorListSchema },
  })
  .get("/:id", ({ params }) => colorsService.getById(params.id), {
    params: idParamSchema,
    response: { 200: colorSchema, 404: errorResponseSchema },
  })
  .post("/", ({ body }) => colorsService.create(body), {
    body: createColorSchema,
    response: { 201: colorSchema, 409: errorResponseSchema },
  })
  .patch("/:id", ({ params, body }) => colorsService.update(params.id, body), {
    params: idParamSchema,
    body: updateColorSchema,
    response: { 200: colorSchema, 404: errorResponseSchema },
  })
  .delete("/:id", ({ params }) => colorsService.remove(params.id), {
    params: idParamSchema,
    response: {
      200: colorSchema,
      404: errorResponseSchema,
      409: errorResponseSchema,
    },
  });
