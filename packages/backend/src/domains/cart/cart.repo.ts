import { eq, getTableColumns } from "drizzle-orm";

import { db } from "../../db";
import {
  cartItems,
  products,
  type CartItem,
  type NewCartItem,
  type Product,
} from "../../db/schema";

/** A cart row joined to the product it points at. */
export type CartItemWithProduct = CartItem & {
  product: Product | null;
};

const withProduct = {
  ...getTableColumns(cartItems),
  product: products,
};

/** Repository layer: data access only, no business rules. */
export const cartRepo = {
  async findAll(): Promise<CartItemWithProduct[]> {
    return db
      .select(withProduct)
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .orderBy(cartItems.createdAt)
      .all();
  },

  async findById(id: string): Promise<CartItemWithProduct | undefined> {
    return db
      .select(withProduct)
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.id, id))
      .get();
  },

  async findByProductId(productId: string): Promise<CartItem | undefined> {
    return db
      .select()
      .from(cartItems)
      .where(eq(cartItems.productId, productId))
      .get();
  },

  async create(value: NewCartItem): Promise<CartItem> {
    return db.insert(cartItems).values(value).returning().get();
  },

  async updateQuantity(
    id: string,
    quantity: number,
  ): Promise<CartItem | undefined> {
    return db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning()
      .get();
  },

  async remove(id: string): Promise<CartItem | undefined> {
    return db.delete(cartItems).where(eq(cartItems.id, id)).returning().get();
  },

  async removeByProductId(productId: string): Promise<CartItem[]> {
    return db
      .delete(cartItems)
      .where(eq(cartItems.productId, productId))
      .returning()
      .all();
  },

  async clear(): Promise<CartItem[]> {
    return db.delete(cartItems).returning().all();
  },
};
