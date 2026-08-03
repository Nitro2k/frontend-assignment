import { prepareDatabase } from "./bootstrap";

const result = await prepareDatabase();

if (!result.seeded) {
  console.log(
    `Database already holds ${result.products} products — nothing to do. ` +
      `Run 'bun run db:reset' to rebuild it from scratch.`,
  );
}
