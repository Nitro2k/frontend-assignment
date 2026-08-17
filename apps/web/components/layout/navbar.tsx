import { CircleUserRound, Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { CartBadge } from "@/components/layout/cart-badge";
import { SearchBox } from "@/components/layout/search-box";

export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:flex lg:px-8">
        <button type="button" aria-label="Menu" className="lg:hidden">
          <Menu className="size-6" />
        </button>

        <Link
          href="/"
          className="justify-self-center text-2xl font-bold tracking-tight lg:mr-8 lg:justify-self-auto"
        >
          SHOP.CO
        </Link>

        <div className="hidden flex-1 lg:block">
          <Suspense>
            <SearchBox variant="full" />
          </Suspense>
        </div>

        <div className="flex items-center justify-end gap-4 lg:hidden">
          <Suspense>
            <SearchBox variant="icon" />
          </Suspense>
          <CartBadge />
          <button type="button" aria-label="Account">
            <CircleUserRound className="size-6" />
          </button>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <CartBadge />
          <button type="button" aria-label="Account">
            <CircleUserRound className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
