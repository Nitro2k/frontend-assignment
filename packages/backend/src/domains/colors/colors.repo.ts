import { eq } from "drizzle-orm";

import { db } from "../../db";
import { colors, type Color, type NewColor } from "../../db/schema";

export type ColorPatch = Partial<Omit<NewColor, "id">>;

/** Repository layer: data access only, no business rules. */
export const colorsRepo = {
  async findAll(): Promise<Color[]> {
    return db.select().from(colors).orderBy(colors.name).all();
  },

  async findById(id: string): Promise<Color | undefined> {
    return db.select().from(colors).where(eq(colors.id, id)).get();
  },

  async create(value: NewColor): Promise<Color> {
    return db.insert(colors).values(value).returning().get();
  },

  async update(id: string, patch: ColorPatch): Promise<Color | undefined> {
    return db
      .update(colors)
      .set(patch)
      .where(eq(colors.id, id))
      .returning()
      .get();
  },

  async remove(id: string): Promise<Color | undefined> {
    return db.delete(colors).where(eq(colors.id, id)).returning().get();
  },
};
