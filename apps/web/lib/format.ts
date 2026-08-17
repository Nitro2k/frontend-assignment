const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDiscountPercent(
  subtotal: number,
  totalDiscount: number,
): number {
  if (subtotal <= 0) return 0;
  return Math.round((totalDiscount / subtotal) * 100);
}

export function starFillFractions(rating: number, starCount = 5): number[] {
  return Array.from({ length: starCount }, (_, index) => {
    const remaining = rating - index;
    return Math.min(Math.max(remaining, 0), 1);
  });
}
