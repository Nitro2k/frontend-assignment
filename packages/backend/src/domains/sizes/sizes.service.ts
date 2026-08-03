import { status } from "elysia";

import { toHttpError } from "../../common/http";
import { sizesBiz } from "./sizes.biz";
import type { CreateSizeInput, UpdateSizeInput } from "./sizes.schema";

/** Controller layer: turns business results and domain errors into HTTP. */
export const sizesService = {
  async list() {
    return sizesBiz.list();
  },

  async getById(id: string) {
    try {
      return await sizesBiz.getById(id);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND");
    }
  },

  async create(input: CreateSizeInput) {
    try {
      return status(201, await sizesBiz.create(input));
    } catch (error) {
      return toHttpError(error, "CONFLICT");
    }
  },

  async update(id: string, patch: UpdateSizeInput) {
    try {
      return await sizesBiz.update(id, patch);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND");
    }
  },

  async remove(id: string) {
    try {
      return await sizesBiz.remove(id);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND", "CONFLICT");
    }
  },
};
