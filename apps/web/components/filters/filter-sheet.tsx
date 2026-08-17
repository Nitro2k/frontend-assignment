"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { FilterPanel } from "@/components/filters/filter-panel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useColors } from "@/hooks/use-colors";
import { useSizes } from "@/hooks/use-sizes";
import {
  filtersToSearchParams,
  panelFiltersKey,
  searchParamsToFilters,
  type PanelFilters,
} from "@/lib/filters";

export function FilterSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const committedFilters = searchParamsToFilters(searchParams);

  const { data: colors } = useColors();
  const { data: sizes } = useSizes();
  const [open, setOpen] = useState(false);

  function applyFilters(next: PanelFilters) {
    const params = filtersToSearchParams({
      ...next,
      q: searchParams.get("q") ?? undefined,
    });
    const query = params.toString();
    router.push(pathname + (query ? `?${query}` : ""));
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open filters"
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-black text-white shadow-lg lg:hidden"
      >
        <SlidersHorizontal className="size-6" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-4"
      >
        <SheetHeader className="p-0">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <FilterPanel
            key={panelFiltersKey(committedFilters)}
            committedFilters={committedFilters}
            colors={colors ?? []}
            sizes={sizes ?? []}
            onApply={applyFilters}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
