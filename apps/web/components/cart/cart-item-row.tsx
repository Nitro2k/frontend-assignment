"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import { useColors } from "@/hooks/use-colors";
import { useSizes } from "@/hooks/use-sizes";
import type { CartItem } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

export function CartItemRow({ item }: { item: CartItem }) {
  const { data: colors } = useColors();
  const { data: sizes } = useSizes();
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const isRemoving = useCartStore((state) =>
    state.pendingItemIds.has(item.id),
  );

  if (!item.product) return null;

  const colorName = colors?.find((c) => c.id === item.product?.colorId)?.name;
  const sizeName = sizes?.find((s) => s.id === item.product?.sizeId)?.name;

  return (
    <div className="flex gap-4 border-b border-border py-4 last:border-0">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-24">
        <Image
          src={item.product.imageUrl}
          alt={item.product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium sm:text-base">
              {item.product.name}
            </h3>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {sizeName && <p>Size: {sizeName}</p>}
              {colorName && <p>Color: {colorName}</p>}
            </div>
          </div>
          <button
            type="button"
            aria-label="Remove item"
            disabled={isRemoving}
            onClick={() => removeItem(item.id)}
            className="text-red-500 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {formatCurrency(item.product.discountedPrice)}
          </span>
          <div className="flex items-center gap-3 rounded-full bg-secondary px-2 py-1">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setItemQuantity(item.id, item.quantity - 1)}
              className="flex size-6 items-center justify-center"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-3 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setItemQuantity(item.id, item.quantity + 1)}
              className="flex size-6 items-center justify-center"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
