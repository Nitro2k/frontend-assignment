"use client";

import { Check } from "lucide-react";

import type { Color } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function isLightColor(hex: string): boolean {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export function ColorSwatches({
  colors,
  selectedIds,
  onToggle,
}: {
  colors: Color[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const selected = selectedIds.includes(color.id);
        return (
          <button
            key={color.id}
            type="button"
            aria-label={color.name}
            aria-pressed={selected}
            onClick={() => onToggle(color.id)}
            style={{ backgroundColor: color.hex }}
            className="flex size-8 items-center justify-center rounded-full ring-1 ring-inset ring-black/10"
          >
            {selected && (
              <Check
                className={cn(
                  "size-4",
                  isLightColor(color.hex) ? "text-black" : "text-white",
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
