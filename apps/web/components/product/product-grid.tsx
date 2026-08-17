"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useProducts } from "@/hooks/use-products";
import { searchParamsToFilters } from "@/lib/filters";

export function ProductGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = searchParamsToFilters(searchParams);
  const hasActiveFilters = searchParams.size > 0;

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
  } = useProducts(filters);

  const products = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const items = [];
    for (const page of data.pages) {
      for (const item of page.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
    }
    return items;
  }, [data]);

  const sentinelRef = useIntersectionObserver(
    () => fetchNextPage(),
    Boolean(hasNextPage) && !isFetchingNextPage && !isFetching,
  );

  if (status === "pending") {
    return <ProductGridSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Could not load products."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div>
          <p className="font-medium">No products match your filters</p>
          <p className="text-sm text-muted-foreground">
            Try widening the price range or clearing a filter.
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 3}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="mt-8">
          <ProductGridSkeleton count={3} />
        </div>
      )}
    </div>
  );
}
