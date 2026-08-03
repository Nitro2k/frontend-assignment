import { z } from "zod";

/** Shape returned by every non-2xx response the API produces. */
export const errorResponseSchema = z.object({
  message: z.string(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
