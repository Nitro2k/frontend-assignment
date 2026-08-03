import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { DATABASE_URL, db } from "./index";
import { migrationsFolder } from "./paths";

migrate(db, { migrationsFolder });

console.log(`Migrations applied to ${DATABASE_URL}`);
