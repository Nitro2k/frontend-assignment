"use client";

import type { Size } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function SizePills({
  sizes,
  selectedIds,
  onToggle,
}: {
  sizes: Size[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const selected = selectedIds.includes(size.id);
        return (
          <button
            key={size.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(size.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              selected
                ? "border-black bg-black text-white"
                : "border-border bg-secondary text-foreground",
            )}
          >
            {size.name}
          </button>
        );
      })}
    </div>
  );
}
