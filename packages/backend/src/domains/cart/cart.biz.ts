import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../common/errors";
import { newId } from "../../common/id";
import type { CartItem } from "../../db/schema";
import { productsRepo } from "../products/products.repo";
import { cartRepo, type CartItemWithProduct } from "./cart.repo";
import type { AddToCartInput } from "./cart.schema";

export type CartSummary = {
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: number;
  total: number;
  totalDiscount: number;
};

const MAX_QUANTITY = 99;

const assertQuantity = (quantity: number) => {
  if (!Number.isInteger(quantity)) {
    throw new BadRequestError("quantity must be a whole number");
  }
  if (quantity < 1) throw new BadRequestError("quantity must be at least 1");
  if (quantity > MAX_QUANTITY) {
    throw new BadRequestError(`quantity cannot exceed ${MAX_QUANTITY}`);
  }
};

/**
 * Totals are derived from the joined product, never stored. `subtotal` is at
 * list price, `total` is what the shopper actually pays.
 */
const summarize = (items: CartItemWithProduct[]): CartSummary => {
  let totalItems = 0;
  let subtotal = 0;
  let total = 0;

  for (const item of items) {
    totalItems += item.quantity;
    if (!item.product) continue;

    subtotal += item.product.price * item.quantity;
    total += item.product.discountedPrice * item.quantity;
  }

  return {
    items,
    totalItems,
    subtotal,
    total,
    totalDiscount: subtotal - total,
  };
};

/** Business layer: rules, invariants and cross-domain orchestration. */
export const cartBiz = {
  async get(): Promise<CartSummary> {
    return summarize(await cartRepo.findAll());
  },

  async getItem(id: string): Promise<CartItemWithProduct> {
    const item = await cartRepo.findById(id);
    if (!item) throw new NotFoundError(`Cart item '${id}' not found`);

    return item;
  },

  async addItem(input: AddToCartInput): Promise<CartItem> {
    const quantity = input.quantity ?? 1;
    assertQuantity(quantity);

    if (!(await productsRepo.exists(input.productId))) {
      throw new BadRequestError(`Product '${input.productId}' does not exist`);
    }

    // Adding a product already in the cart tops up the existing row rather
    // than creating a duplicate line.
    const existing = await cartRepo.findByProductId(input.productId);
    if (existing) {
      const merged = Math.min(existing.quantity + quantity, MAX_QUANTITY);
      const updated = await cartRepo.updateQuantity(existing.id, merged);
      if (!updated) {
        throw new NotFoundError(`Cart item '${existing.id}' not found`);
      }

      return updated;
    }

    return cartRepo.create({
      id: newId(),
      productId: input.productId,
      quantity,
    });
  },

  async updateQuantity(id: string, quantity: number): Promise<CartItem> {
    assertQuantity(quantity);
    await cartBiz.getItem(id);

    const updated = await cartRepo.updateQuantity(id, quantity);
    if (!updated) throw new NotFoundError(`Cart item '${id}' not found`);

    return updated;
  },

  async removeItem(id: string): Promise<CartItem> {
    await cartBiz.getItem(id);

    const removed = await cartRepo.remove(id);
    if (!removed) throw new NotFoundError(`Cart item '${id}' not found`);

    return removed;
  },

  async clear(): Promise<{ removed: number }> {
    const removed = await cartRepo.clear();

    return { removed: removed.length };
  },

  /**
   * Mock checkout. There is no order table and no payment step — a non-empty
   * cart simply mints an order id. The cart is deliberately left intact so the
   * call can be repeated during development.
   */
  async checkout(): Promise<{ orderId: string }> {
    const items = await cartRepo.findAll();
    if (items.length === 0) throw new ConflictError("Cart is empty");

    await cartRepo.clear();

    return { orderId: newId() };
  },
};
