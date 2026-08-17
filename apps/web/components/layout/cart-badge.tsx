"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useCartStore } from "@/store/cart-store";

export function CartBadge() {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <Link href="/cart" aria-label="View cart" className="relative">
      <ShoppingCart className="size-6" />
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
