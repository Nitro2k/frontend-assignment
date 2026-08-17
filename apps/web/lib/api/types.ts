import type { api } from "@/lib/eden";

type DataOf<T extends Promise<{ data: unknown }>> = NonNullable<
  Awaited<T>["data"]
>;

export type ProductListResponse = DataOf<ReturnType<typeof api.products.get>>;
export type Product = ProductListResponse["items"][number];

export type ColorListResponse = DataOf<ReturnType<typeof api.colors.get>>;
export type Color = ColorListResponse[number];

export type SizeListResponse = DataOf<ReturnType<typeof api.sizes.get>>;
export type Size = SizeListResponse[number];

export type CartSummary = DataOf<ReturnType<typeof api.cart.get>>;
export type CartItem = CartSummary["items"][number];
export type CartProduct = NonNullable<CartItem["product"]>;
