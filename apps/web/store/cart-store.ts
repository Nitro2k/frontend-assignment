import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, CartProduct } from "@/lib/api/types";
import { unwrap } from "@/lib/api/unwrap";
import { api } from "@/lib/eden";

const MAX_QUANTITY = 99;
const PATCH_DEBOUNCE_MS = 300;

export type CartSummaryFields = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  totalDiscount: number;
};

export const EMPTY_CART_SUMMARY: CartSummaryFields = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  total: 0,
  totalDiscount: 0,
};

export function summarize(items: CartItem[]): CartSummaryFields {
  let totalItems = 0;
  let subtotal = 0;
  let total = 0;

  for (const item of items) {
    totalItems += item.quantity;
    if (!item.product) continue;
    subtotal += item.product.price * item.quantity;
    total += item.product.discountedPrice * item.quantity;
  }

  return {
    items,
    totalItems,
    subtotal,
    total,
    totalDiscount: subtotal - total,
  };
}

export type CartIndex = Record<string, { itemId: string; quantity: number }>;

export function indexByProductId(items: CartItem[]): CartIndex {
  const index: CartIndex = {};
  for (const item of items) {
    if (!item.productId) continue;
    index[item.productId] = { itemId: item.id, quantity: item.quantity };
  }
  return index;
}

function deriveState(items: CartItem[]) {
  return { ...summarize(items), itemsByProductId: indexByProductId(items) };
}

export function migrateCartState(
  persistedState: unknown,
  version: number,
): CartSummaryFields {
  void version;
  return persistedState as CartSummaryFields;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const noopStorage: Storage = {
  length: 0,
  clear() {},
  getItem: () => null,
  key: () => null,
  removeItem() {},
  setItem() {},
};

function getSafeStorage(): Storage {
  if (typeof window === "undefined") return noopStorage;
  try {
    const probeKey = "__cart_storage_probe__";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return noopStorage;
  }
}

function withId(ids: Set<string>, id: string): Set<string> {
  return new Set(ids).add(id);
}

function withoutId(ids: Set<string>, id: string): Set<string> {
  const next = new Set(ids);
  next.delete(id);
  return next;
}

const patchTimers = new Map<string, ReturnType<typeof setTimeout>>();

type CartState = CartSummaryFields & {
  itemsByProductId: CartIndex;
  status: "idle" | "loading" | "error";
  checkoutError: string | null;
  pendingProductIds: Set<string>;
  pendingItemIds: Set<string>;
  isCheckingOut: boolean;
  fetch: () => Promise<void>;
  addItem: (product: CartProduct) => Promise<void>;
  setItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => Promise<void>;
  checkout: () => Promise<{ orderId: string } | undefined>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...EMPTY_CART_SUMMARY,
      itemsByProductId: {},
      status: "idle",
      checkoutError: null,
      pendingProductIds: new Set(),
      pendingItemIds: new Set(),
      isCheckingOut: false,

      fetch: async () => {
        const { pendingProductIds, pendingItemIds, isCheckingOut } = get();
        if (pendingProductIds.size > 0 || pendingItemIds.size > 0 || isCheckingOut) {
          return;
        }

        set({ status: "loading" });
        try {
          const summary = unwrap(await api.cart.get());
          set({ ...deriveState(summary.items), status: "idle" });
        } catch (error) {
          set({ status: "error" });
          toast.error(errorMessage(error, "Could not load your cart"));
        }
      },

      addItem: async (product) => {
        if (get().pendingProductIds.has(product.id)) return;
        set((state) => ({
          pendingProductIds: withId(state.pendingProductIds, product.id),
        }));

        try {
          const row = unwrap(
            await api.cart.items.post({ productId: product.id, quantity: 1 }),
          );
          const items = get().items;
          const alreadyPresent = items.some((item) => item.id === row.id);
          const nextItems = alreadyPresent
            ? items.map((item) =>
                item.id === row.id
                  ? { ...item, quantity: row.quantity }
                  : item,
              )
            : [...items, { ...row, product }];
          set(deriveState(nextItems));
        } catch (error) {
          toast.error(errorMessage(error, "Could not add item to cart"));
        } finally {
          set((state) => ({
            pendingProductIds: withoutId(state.pendingProductIds, product.id),
          }));
        }
      },

      setItemQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          void get().removeItem(itemId);
          return;
        }

        const clamped = Math.min(quantity, MAX_QUANTITY);
        const previousItems = get().items;
        const nextItems = previousItems.map((item) =>
          item.id === itemId ? { ...item, quantity: clamped } : item,
        );
        set(deriveState(nextItems));

        const existingTimer = patchTimers.get(itemId);
        if (existingTimer) clearTimeout(existingTimer);

        patchTimers.set(
          itemId,
          setTimeout(async () => {
            patchTimers.delete(itemId);
            try {
              unwrap(
                await api.cart
                  .items({ id: itemId })
                  .patch({ quantity: clamped }),
              );
            } catch (error) {
              set(deriveState(previousItems));
              toast.error(errorMessage(error, "Could not update quantity"));
            }
          }, PATCH_DEBOUNCE_MS),
        );
      },

      removeItem: async (itemId) => {
        if (get().pendingItemIds.has(itemId)) return;
        set((state) => ({
          pendingItemIds: withId(state.pendingItemIds, itemId),
        }));

        const previousItems = get().items;
        set(deriveState(previousItems.filter((item) => item.id !== itemId)));

        try {
          unwrap(await api.cart.items({ id: itemId }).delete());
        } catch (error) {
          set(deriveState(previousItems));
          toast.error(errorMessage(error, "Could not remove item"));
        } finally {
          set((state) => ({
            pendingItemIds: withoutId(state.pendingItemIds, itemId),
          }));
        }
      },

      checkout: async () => {
        if (get().isCheckingOut) return undefined;
        set({ checkoutError: null, isCheckingOut: true });

        try {
          const result = unwrap(await api.cart.checkout.post());
          set(deriveState([]));
          return result;
        } catch (error) {
          const message = errorMessage(error, "Checkout failed");
          set({ checkoutError: message });
          return undefined;
        } finally {
          set({ isCheckingOut: false });
        }
      },
    }),
    {
      name: "cart-storage",
      version: 1,
      storage: createJSONStorage(() => getSafeStorage()),
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        total: state.total,
        totalDiscount: state.totalDiscount,
      }),
      merge: (persisted, current) => {
        const persistedItems =
          (persisted as Partial<CartSummaryFields> | undefined)?.items ?? [];
        return { ...current, ...deriveState(persistedItems) };
      },
      migrate: migrateCartState,
    },
  ),
);
