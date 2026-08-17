import { api } from "@/lib/eden";
import type { ProductFilters } from "@/lib/filters";

import { unwrap } from "./unwrap";

export const PRODUCTS_PAGE_SIZE = 24;

export const queryKeys = {
  products: (filters: ProductFilters) => ["products", filters] as const,
  colors: () => ["colors"] as const,
  sizes: () => ["sizes"] as const,
};

export async function fetchProducts(filters: ProductFilters, offset: number) {
  return unwrap(
    await api.products.get({
      query: {
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.colorIds.length > 0
          ? { colorIds: filters.colorIds }
          : {}),
        ...(filters.sizeIds.length > 0 ? { sizeIds: filters.sizeIds } : {}),
        ...(filters.minPrice !== undefined
          ? { minPrice: filters.minPrice }
          : {}),
        ...(filters.maxPrice !== undefined
          ? { maxPrice: filters.maxPrice }
          : {}),
        limit: PRODUCTS_PAGE_SIZE,
        offset,
      },
    }),
  );
}

export async function fetchColors() {
  return unwrap(await api.colors.get());
}

export async function fetchSizes() {
  return unwrap(await api.sizes.get());
}
