import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

import * as schema from "./schema";

export const DATABASE_URL = process.env.DATABASE_URL ?? "./sqlite.db";

const sqlite = new Database(DATABASE_URL, { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle({ client: sqlite, schema });

export { schema };
export * from "./schema";
