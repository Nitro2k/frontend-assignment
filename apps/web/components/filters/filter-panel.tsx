"use client";

import { useState } from "react";

import { ColorSwatches } from "@/components/filters/color-swatches";
import { FilterSection } from "@/components/filters/filter-section";
import { PriceRangeSlider } from "@/components/filters/price-range-slider";
import { SizePills } from "@/components/filters/size-pills";
import type { Color, Size } from "@/lib/api/types";
import { PRICE_MAX, PRICE_MIN, type PanelFilters } from "@/lib/filters";

export function FilterPanel({
  committedFilters,
  colors,
  sizes,
  onApply,
}: {
  committedFilters: PanelFilters;
  colors: Color[];
  sizes: Size[];
  onApply: (filters: PanelFilters) => void;
}) {
  const [pending, setPending] = useState<PanelFilters>(committedFilters);

  return (
    <div className="space-y-6">
      <FilterSection title="Price">
        <PriceRangeSlider
          minPrice={pending.minPrice ?? PRICE_MIN}
          maxPrice={pending.maxPrice ?? PRICE_MAX}
          onChange={(minPrice, maxPrice) =>
            setPending((prev) => ({ ...prev, minPrice, maxPrice }))
          }
        />
      </FilterSection>

      <FilterSection title="Colors">
        <ColorSwatches
          colors={colors}
          selectedIds={pending.colorIds}
          onToggle={(id) =>
            setPending((prev) => ({
              ...prev,
              colorIds: prev.colorIds.includes(id)
                ? prev.colorIds.filter((c) => c !== id)
                : [...prev.colorIds, id],
            }))
          }
        />
      </FilterSection>

      <FilterSection title="Size">
        <SizePills
          sizes={sizes}
          selectedIds={pending.sizeIds}
          onToggle={(id) =>
            setPending((prev) => ({
              ...prev,
              sizeIds: prev.sizeIds.includes(id)
                ? prev.sizeIds.filter((s) => s !== id)
                : [...prev.sizeIds, id],
            }))
          }
        />
      </FilterSection>

      <button
        type="button"
        onClick={() => onApply(pending)}
        className="w-full rounded-full bg-black py-3 text-sm font-medium text-white"
      >
        Apply Filter
      </button>
    </div>
  );
}
