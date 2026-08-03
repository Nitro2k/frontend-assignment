import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  like,
  lte,
  or,
  type SQL,
} from "drizzle-orm";

import { db } from "../../db";
import {
  colors,
  products,
  sizes,
  type Color,
  type NewProduct,
  type Product,
  type Size,
} from "../../db/schema";

export type ProductPatch = Partial<Omit<NewProduct, "id">>;

export type ProductSort = "name" | "price" | "rating" | "createdAt";
export type SortOrder = "asc" | "desc";

export type ProductFilters = {
  q?: string;
  /** Multi-select, matching the colour swatches in the filter panel. */
  colorIds?: string[];
  /** Multi-select, matching the size pills in the filter panel. */
  sizeIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: ProductSort;
  order: SortOrder;
  limit: number;
  offset: number;
};

/** A product with its colour and size resolved. Either may be null. */
export type ProductWithRelations = Product & {
  color: Color | null;
  size: Size | null;
};

const sortColumns = {
  name: products.name,
  price: products.price,
  rating: products.rating,
  createdAt: products.createdAt,
} as const;

const buildWhere = (filters: ProductFilters): SQL | undefined => {
  const conditions: SQL[] = [];

  if (filters.q) {
    const term = `%${filters.q}%`;
    const match = or(
      like(products.name, term),
      like(products.description, term),
    );
    if (match) conditions.push(match);
  }
  // Selecting several swatches or pills widens the result set (OR within a
  // facet), while different facets narrow it (AND across facets).
  if (filters.colorIds?.length) {
    conditions.push(inArray(products.colorId, filters.colorIds));
  }
  if (filters.sizeIds?.length) {
    conditions.push(inArray(products.sizeId, filters.sizeIds));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice));
  }
  if (filters.minRating !== undefined) {
    conditions.push(gte(products.rating, filters.minRating));
  }

  return conditions.length ? and(...conditions) : undefined;
};

const withRelations = {
  ...getTableColumns(products),
  color: colors,
  size: sizes,
};

/** Repository layer: data access only, no business rules. */
export const productsRepo = {
  async findMany(filters: ProductFilters): Promise<ProductWithRelations[]> {
    const direction = filters.order === "desc" ? desc : asc;

    return db
      .select(withRelations)
      .from(products)
      .leftJoin(colors, eq(products.colorId, colors.id))
      .leftJoin(sizes, eq(products.sizeId, sizes.id))
      .where(buildWhere(filters))
      .orderBy(direction(sortColumns[filters.sort]))
      .limit(filters.limit)
      .offset(filters.offset)
      .all();
  },

  async countMany(filters: ProductFilters): Promise<number> {
    const row = await db
      .select({ value: count() })
      .from(products)
      .where(buildWhere(filters))
      .get();

    return row?.value ?? 0;
  },

  async findById(id: string): Promise<ProductWithRelations | undefined> {
    return db
      .select(withRelations)
      .from(products)
      .leftJoin(colors, eq(products.colorId, colors.id))
      .leftJoin(sizes, eq(products.sizeId, sizes.id))
      .where(eq(products.id, id))
      .get();
  },

  async exists(id: string): Promise<boolean> {
    const row = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .get();

    return row !== undefined;
  },

  async create(value: NewProduct): Promise<Product> {
    return db.insert(products).values(value).returning().get();
  },

  async update(id: string, patch: ProductPatch): Promise<Product | undefined> {
    return db
      .update(products)
      .set(patch)
      .where(eq(products.id, id))
      .returning()
      .get();
  },

  async remove(id: string): Promise<Product | undefined> {
    return db.delete(products).where(eq(products.id, id)).returning().get();
  },

  async countByColorId(colorId: string): Promise<number> {
    const row = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.colorId, colorId))
      .get();

    return row?.value ?? 0;
  },

  async countBySizeId(sizeId: string): Promise<number> {
    const row = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.sizeId, sizeId))
      .get();

    return row?.value ?? 0;
  },
};
