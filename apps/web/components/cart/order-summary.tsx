"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { formatCurrency, formatDiscountPercent } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

export function OrderSummary() {
  const router = useRouter();
  const subtotal = useCartStore((state) => state.subtotal);
  const total = useCartStore((state) => state.total);
  const totalDiscount = useCartStore((state) => state.totalDiscount);
  const checkoutError = useCartStore((state) => state.checkoutError);
  const isCheckingOut = useCartStore((state) => state.isCheckingOut);
  const checkout = useCartStore((state) => state.checkout);

  const discountPercent = formatDiscountPercent(subtotal, totalDiscount);

  async function handleCheckout() {
    const result = await checkout();
    if (result) {
      router.push(
        `/checkout/success?orderId=${encodeURIComponent(result.orderId)}`,
      );
    }
  }

  return (
    <div className="h-fit space-y-4 rounded-2xl border border-border p-5">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        {totalDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Discount (-{discountPercent}%)
            </span>
            <span className="font-medium text-red-500">
              -{formatCurrency(totalDiscount)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {checkoutError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {checkoutError}
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={isCheckingOut}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        Go to Checkout
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
