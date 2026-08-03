// Runs before any test module is imported. `src/db/index.ts` reads
// DATABASE_URL at import time, so this has to land first — otherwise tests
// would run against the developer's sqlite.db.
process.env.DATABASE_URL = ":memory:";
