import { CartContent } from "@/components/cart/cart-content";

export default function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>
      <CartContent />
    </main>
  );
}
