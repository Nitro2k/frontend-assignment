import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";

import { cartRouter } from "./domains/cart/cart.router";
import { colorsRouter } from "./domains/colors/colors.router";
import { productsRouter } from "./domains/products/products.router";
import { sizesRouter } from "./domains/sizes/sizes.router";

/**
 * The app graph with no side effects — it does not bind a port, so tests can
 * drive it through `app.handle(new Request(...))`. `src/index.ts` is the
 * bootstrap that prepares the database and listens.
 */
export const app = new Elysia()
  .use(
    cors({
      origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    }),
  )
  .get("/", () => ({ message: "Hello from Elysia" }))
  .get("/health", () => ({ status: "ok" as const }))
  .use(colorsRouter)
  .use(sizesRouter)
  .use(productsRouter)
  .use(cartRouter);

export type App = typeof app;
