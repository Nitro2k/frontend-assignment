# SHOP.CO storefront

Implementation notes for the category/cart/checkout build in this app —
the trade-offs and decisions behind the code, for anyone reviewing it.

## Stack

- **Data fetching**: TanStack Query for products/colors/sizes (`useInfiniteQuery`
  for the product grid, plain `useQuery` for the static colors/sizes facet
  lists).
- **Cart state**: Zustand (`store/cart-store.ts`) — see below, not TanStack
  Query. The cart is the one piece of genuinely global client state (needed
  by the header badge, every product card, and the cart page), so it gets
  its own store instead of living in the query cache.
- **UI primitives**: shadcn/ui (Base UI under the hood) for Slider, Sheet,
  Collapsible, Button, Skeleton, Sonner.
- **Filters live in the URL** (`?q=&color=&size=&minPrice=&maxPrice=`) —
  bookmarkable, survives refresh, back/forward works.
- **Icons**: lucide-react.
- **Infinite scroll sentinel**: hand-rolled `IntersectionObserver` hook
  (`hooks/use-intersection-observer.ts`), no dependency.

## Cart architecture

The cart is backed by the API's single global cart (no auth in this
assignment — every client shares one cart), but the frontend treats it as
local-first global state via Zustand for a snappier UI:

- **Persistence**: `zustand/middleware`'s `persist`, storing to
  `localStorage` under the key `cart-storage`. The storage adapter is
  wrapped so a `localStorage` failure (Safari private browsing, storage
  disabled) degrades to in-memory + server-fetch-only instead of crashing
  the app.
- **Cross-tab sync**: a `window` `storage` event listener
  (`components/layout/cart-hydration.tsx`) calls `useCartStore.persist.rehydrate()`
  whenever another tab writes to the same `cart-storage` key, so two tabs of
  the same browser reflect the same cart immediately.
- **Versioned schema**: the persisted shape carries a `version` (currently
  `1`) and a `migrate()` function. Nothing to migrate from yet — it's
  written now so a future change to the cart's persisted shape is a one-line
  `case` addition in `migrate()`, not a retrofit.
- **Server reconciliation**: because the cart is genuinely global
  (unauthenticated, shared across browsers/devices — not just tabs of one
  browser), localStorage/cross-tab sync alone can't be the source of truth.
  The store re-fetches from `GET /cart` on mount and on `window focus`,
  overwriting local state with the server's — this is what catches drift
  from a different browser/device hitting the same shared cart.
- **Optimistic writes**: quantity changes and removals update the UI
  immediately and roll back on a failed request. Quantity changes are
  additionally debounced (~300ms) before the network `PATCH` fires, so rapid
  `+`/`-` clicks send one request for the settled value instead of racing
  several.

## Deliberate deviations from the Figma mock

- **No delivery-fee line in the cart summary.** The mock shows a flat "$15
  Delivery Fee," but the API doesn't compute or return anything like it.
  Subtotal/Discount/Total map exactly to the API's own fields
  (`subtotal`/`totalDiscount`/`total`) rather than inventing a number the
  backend has no concept of.
- **Cart icon shows an item-count badge.** The screenshots show a plain
  cart icon with no badge; added one anyway since it's a near-universal
  e-commerce affordance and a direct, visible proof the cart state is
  working.
- **Mobile filter trigger is a floating button, not inline next to the
  heading.** The reviewed mobile screenshot shows the filter icon inline
  next to "Clothes." It's a fixed bottom-right floating button here instead,
  so it stays reachable while scrolled deep into the product grid rather
  than requiring a scroll back to the top. Judged better UX; easy to revert
  if pixel fidelity to the mock is preferred instead.
- **Desktop filter sidebar is sticky**, following the viewport as the page
  scrolls (`position: sticky`, own internal scroll if it's taller than the
  viewport) rather than scrolling away with the page. Not shown either way
  in the reviewed screenshot; added for the same reachability reason as
  above.
- **Hamburger menu and account icon are visually present but
  non-interactive.** There's no second category or auth flow in scope, so a
  real destination would be fabricated.

## Filter panel behavior

The filter panel (Price/Colors/Size) is **not** live-applied — it matches
the design's explicit "Apply Filter" button. Dragging the slider or toggling
a swatch/pill only updates local pending state; nothing is sent to the
server and the URL doesn't change until "Apply Filter" is clicked. This
avoids firing a request on every slider drag tick. The header **search
box** is the one exception — it's separate from the panel and applies live
(debounced ~300ms) as you type, since it's not part of the "Apply Filter"
grouping in the design.

## Notes

- `color`/`size` are the frontend's own URL query param names (e.g.
  `?color=red,blue`) — deliberately singular even though each is
  multi-select, to keep the address bar readable. These are translated to
  the backend API's own contract (`colorIds`/`sizeIds`, comma-joined) inside
  `lib/api/queries.ts` — the two naming schemes are intentionally decoupled
  since one is a public REST contract and the other is just this app's own
  URL shape.
- Every clickable element gets `cursor: pointer` via a base-layer rule in
  `globals.css` (`button:not(:disabled), [role="button"]`) rather than a
  `cursor-pointer` class on each one — Tailwind's Preflight resets native
  `<button>` cursor to `default`, so this is the one global fix instead of
  per-component patches.

## Testing

Targeted Vitest unit tests for pure logic only (`bun run test`) — currency/
discount-percentage/star-rating formatting, the URL↔filters round-trip
(including the `color`/`size` param naming above), the Eden error-unwrapping
helper, and the cart store's pure `summarize()`/`migrate()` functions. No
component or e2e tests; the backend already has its own full suite and this
assignment's UI was reviewed manually instead.
