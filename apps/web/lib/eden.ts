import { treaty, type Treaty } from "@elysiajs/eden";
import type { App } from "@repo/backend";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// The explicit annotation keeps the inferred client type portable across
// packages (avoids TS2742 when web references types from @repo/backend).
export const api: Treaty.Create<App> = treaty<App>(API_URL);
