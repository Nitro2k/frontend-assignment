"use client";

import { Minus, Plus } from "lucide-react";
import Image from "next/image";

import { RatingStars } from "@/components/product/rating-stars";
import type { Product } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const cartEntry = useCartStore(
    (state) => state.itemsByProductId[product.id],
  );
  const isPending = useCartStore((state) =>
    state.pendingProductIds.has(product.id),
  );
  const addItem = useCartStore((state) => state.addItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);

  const isDiscounted = product.percentageDiscount > 0;

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover"
        />

        <div className="absolute bottom-3 right-3">
          {cartEntry ? (
            <div className="flex items-center gap-3 rounded-full bg-white px-2 py-1.5 shadow">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() =>
                  setItemQuantity(cartEntry.itemId, cartEntry.quantity - 1)
                }
                className="flex size-6 items-center justify-center"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-3 text-center text-sm font-medium">
                {cartEntry.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setItemQuantity(cartEntry.itemId, cartEntry.quantity + 1)
                }
                className="flex size-6 items-center justify-center"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Add to cart"
              disabled={isPending}
              onClick={() => addItem(product)}
              className="flex size-9 items-center justify-center rounded-full bg-white shadow disabled:opacity-50"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="truncate text-sm font-medium">{product.name}</h3>

        <div className="flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            {product.rating.toFixed(1)}/5
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {formatCurrency(product.discountedPrice)}
          </span>
          {isDiscounted && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                -{product.percentageDiscount}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
