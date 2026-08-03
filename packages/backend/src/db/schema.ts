import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// colors options
export const colors = sqliteTable("colors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hex: text("hex").notNull(),
});

export const sizes = sqliteTable("sizes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
});

// clothes products
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  discountedPrice: integer("discounted_price").notNull(),
  percentageDiscount: integer("percentage_discount").notNull().default(0),
  colorId: text("color_id").references(() => colors.id),
  sizeId: text("size_id").references(() => sizes.id),
  imageUrl: text("image_url").notNull(),
  rating: real("rating").notNull().default(0.0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// cart items
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  productId: text("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Color = typeof colors.$inferSelect;
export type Size = typeof sizes.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;

export type NewColor = typeof colors.$inferInsert;
export type NewSize = typeof sizes.$inferInsert;
export type NewProduct = typeof products.$inferInsert;
export type NewCartItem = typeof cartItems.$inferInsert;
