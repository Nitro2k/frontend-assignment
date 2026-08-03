import { eq } from "drizzle-orm";

import { db } from "../../db";
import { sizes, type NewSize, type Size } from "../../db/schema";

export type SizePatch = Partial<Omit<NewSize, "id">>;

/** Repository layer: data access only, no business rules. */
export const sizesRepo = {
  async findAll(): Promise<Size[]> {
    return db.select().from(sizes).orderBy(sizes.name).all();
  },

  async findById(id: string): Promise<Size | undefined> {
    return db.select().from(sizes).where(eq(sizes.id, id)).get();
  },

  async create(value: NewSize): Promise<Size> {
    return db.insert(sizes).values(value).returning().get();
  },

  async update(id: string, patch: SizePatch): Promise<Size | undefined> {
    return db
      .update(sizes)
      .set(patch)
      .where(eq(sizes.id, id))
      .returning()
      .get();
  },

  async remove(id: string): Promise<Size | undefined> {
    return db.delete(sizes).where(eq(sizes.id, id)).returning().get();
  },
};
