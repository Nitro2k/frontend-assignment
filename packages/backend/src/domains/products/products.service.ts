import { toHttpError } from "../../common/http";
import { productsBiz } from "./products.biz";
import type { ProductFilters } from "./products.repo";
import type { ListProductsQuery } from "./products.schema";

const DEFAULT_LIMIT = 20;

const toFilters = (query: ListProductsQuery): ProductFilters => ({
  q: query.q,
  colorIds: query.colorIds,
  sizeIds: query.sizeIds,
  minPrice: query.minPrice,
  maxPrice: query.maxPrice,
  minRating: query.minRating,
  sort: query.sort ?? "createdAt",
  order: query.order ?? "desc",
  limit: query.limit ?? DEFAULT_LIMIT,
  offset: query.offset ?? 0,
});

/** Controller layer: turns business results and domain errors into HTTP. */
export const productsService = {
  async list(query: ListProductsQuery) {
    return productsBiz.list(toFilters(query));
  },

  async getById(id: string) {
    try {
      return await productsBiz.getById(id);
    } catch (error) {
      return toHttpError(error, "NOT_FOUND");
    }
  },
};
