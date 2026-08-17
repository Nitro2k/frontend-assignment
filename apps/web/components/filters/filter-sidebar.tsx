"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FilterPanel } from "@/components/filters/filter-panel";
import { useColors } from "@/hooks/use-colors";
import { useSizes } from "@/hooks/use-sizes";
import {
  filtersToSearchParams,
  panelFiltersKey,
  searchParamsToFilters,
  type PanelFilters,
} from "@/lib/filters";

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const committedFilters = searchParamsToFilters(searchParams);

  const { data: colors } = useColors();
  const { data: sizes } = useSizes();

  function applyFilters(next: PanelFilters) {
    const params = filtersToSearchParams({
      ...next,
      q: searchParams.get("q") ?? undefined,
    });
    const query = params.toString();
    router.push(pathname + (query ? `?${query}` : ""));
  }

  return (
    <aside className="hidden w-64 shrink-0 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <SlidersHorizontal className="size-5 text-muted-foreground" />
      </div>
      <FilterPanel
        key={panelFiltersKey(committedFilters)}
        committedFilters={committedFilters}
        colors={colors ?? []}
        sizes={sizes ?? []}
        onApply={applyFilters}
      />
    </aside>
  );
}
