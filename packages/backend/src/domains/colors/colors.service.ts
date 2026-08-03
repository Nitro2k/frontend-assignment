import { status } from "elysia";

import { toHttpError } from "../../common/http";
import { colorsBiz } from "./colors.biz";
import type { CreateColorInput, UpdateColorInput } from "./colors.schema";

/** Controller layer: turns business results and domain errors into HTTP. */
export const colorsService = {
  async list() {
    return colorsBiz.list();
  },

  async getById(id: string) {
    try {
      return await colorsBiz.getById(id);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND");
    }
  },

  async create(input: CreateColorInput) {
    try {
      return status(201, await colorsBiz.create(input));
    } catch (error) {
      return toHttpError(error, "CONFLICT");
    }
  },

  async update(id: string, patch: UpdateColorInput) {
    try {
      return await colorsBiz.update(id, patch);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND");
    }
  },

  async remove(id: string) {
    try {
      return await colorsBiz.remove(id);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND", "CONFLICT");
    }
  },
};
