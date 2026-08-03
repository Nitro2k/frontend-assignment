import { join } from "node:path";

/**
 * Resolved against this file rather than the process cwd, so migrations are
 * found whether the server is started from the package, the repo root, or a
 * test runner.
 */
export const migrationsFolder = join(import.meta.dir, "../../drizzle");
