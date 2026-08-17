"use client";

import { CartItemRow } from "@/components/cart/cart-item-row";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCartStore } from "@/store/cart-store";

export function CartContent() {
  const items = useCartStore((state) => state.items);
  const status = useCartStore((state) => state.status);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {status === "loading" && items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Loading your cart...
          </p>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Your cart is empty.
          </p>
        ) : (
          items.map((item) => <CartItemRow key={item.id} item={item} />)
        )}
      </div>
      <OrderSummary />
    </div>
  );
}
