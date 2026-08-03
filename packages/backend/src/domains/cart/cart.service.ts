import { status } from "elysia";

import { toHttpError } from "../../common/http";
import { cartBiz } from "./cart.biz";
import type { AddToCartInput } from "./cart.schema";

/** Controller layer: turns business results and domain errors into HTTP. */
export const cartService = {
  async get() {
    return cartBiz.get();
  },

  async getItem(id: string) {
    try {
      return await cartBiz.getItem(id);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND");
    }
  },

  async addItem(input: AddToCartInput) {
    try {
      return status(201, await cartBiz.addItem(input));
    } catch (error) {
      return toHttpError(error, "BAD_REQUEST", "NOT_FOUND");
    }
  },

  async updateQuantity(id: string, quantity: number) {
    try {
      return await cartBiz.updateQuantity(id, quantity);
    } catch (error) {
      return toHttpError(error, "BAD_REQUEST", "NOT_FOUND");
    }
  },

  async removeItem(id: string) {
    try {
      return await cartBiz.removeItem(id);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND");
    }
  },

  async clear() {
    return cartBiz.clear();
  },

  async checkout() {
    try {
      return await cartBiz.checkout();
    } catch (error) {
      return toHttpError(error, "CONFLICT");
    }
  },
};
