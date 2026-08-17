"use client";

import { Slider } from "@/components/ui/slider";
import { PRICE_MAX, PRICE_MIN } from "@/lib/filters";
import { formatCurrency } from "@/lib/format";

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  onChange,
}: {
  minPrice: number;
  maxPrice: number;
  onChange: (minPrice: number, maxPrice: number) => void;
}) {
  return (
    <div className="space-y-4">
      <Slider
        value={[minPrice, maxPrice]}
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={1}
        onValueChange={(value) => {
          const [next0, next1] = value as [number, number];
          onChange(next0, next1);
        }}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatCurrency(minPrice)}</span>
        <span>{formatCurrency(maxPrice)}</span>
      </div>
    </div>
  );
}
