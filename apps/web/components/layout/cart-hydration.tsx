"use client";

import { useEffect } from "react";

import { useCartStore } from "@/store/cart-store";

export function CartHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    void useCartStore.getState().fetch();

    function handleStorage(event: StorageEvent) {
      if (event.key === "cart-storage") {
        useCartStore.persist.rehydrate();
      }
    }

    function handleFocus() {
      void useCartStore.getState().fetch();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}
