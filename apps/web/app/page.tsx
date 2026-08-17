import { Suspense } from "react";

import { FilterSheet } from "@/components/filters/filter-sheet";
import { FilterSidebar } from "@/components/filters/filter-sidebar";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function CategoryPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start gap-8">
        <Suspense>
          <FilterSidebar />
        </Suspense>

        <div className="min-w-0 flex-1">
          <h1 className="mb-6 text-2xl font-bold">Clothes</h1>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </div>

        <Suspense>
          <FilterSheet />
        </Suspense>
      </div>
    </main>
  );
}
