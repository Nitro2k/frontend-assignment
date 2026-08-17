"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchProducts, PRODUCTS_PAGE_SIZE, queryKeys } from "@/lib/api/queries";
import type { ProductFilters } from "@/lib/filters";

export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.products(filters),
    queryFn: ({ pageParam }) => fetchProducts(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
    staleTime: 60_000,
  });
}

export { PRODUCTS_PAGE_SIZE };
