import { NotFoundError } from "../../common/errors";
import {
  productsRepo,
  type ProductFilters,
  type ProductWithRelations,
} from "./products.repo";

export type ProductListResult = {
  items: ProductWithRelations[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

/**
 * Business layer: rules, invariants and cross-domain orchestration.
 *
 * The catalogue is read-only over HTTP — products are seeded rather than
 * authored through the API — so only queries are exposed here.
 */
export const productsBiz = {
  async list(filters: ProductFilters): Promise<ProductListResult> {
    const [items, total] = await Promise.all([
      productsRepo.findMany(filters),
      productsRepo.countMany(filters),
    ]);

    return {
      items,
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + items.length < total,
    };
  },

  async getById(id: string): Promise<ProductWithRelations> {
    const product = await productsRepo.findById(id);
    if (!product) throw new NotFoundError(`Product '${id}' not found`);

    return product;
  },
};
