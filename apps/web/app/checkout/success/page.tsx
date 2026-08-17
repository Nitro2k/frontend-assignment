import { CircleCheck } from "lucide-react";
import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <CircleCheck className="size-14 text-green-600" />
      <h1 className="mt-6 text-2xl font-bold">Order placed!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thanks for your order. We&apos;ve got it and it&apos;s on the way.
      </p>

      {orderId && (
        <p className="mt-6 rounded-lg bg-secondary px-4 py-2 text-sm">
          Order ID: <span className="font-mono font-medium">{orderId}</span>
        </p>
      )}

      <Link
        href="/"
        className="mt-8 rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
      >
        Continue shopping
      </Link>
    </main>
  );
}
