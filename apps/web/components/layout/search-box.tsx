"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { useSearchQuery } from "@/hooks/use-search-query";

export function SearchBox({ variant }: { variant: "full" | "icon" }) {
  const { value, setValue } = useSearchQuery();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (variant === "full") {
    return (
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search for products..."
          aria-label="Search for products"
          className="h-11 w-full rounded-full border-0 bg-secondary pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>
    );
  }

  if (!mobileOpen) {
    return (
      <button
        type="button"
        aria-label="Open search"
        onClick={() => setMobileOpen(true)}
      >
        <Search className="size-5" />
      </button>
    );
  }

  return (
    <input
      type="search"
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => setMobileOpen(false)}
      placeholder="Search for products..."
      aria-label="Search for products"
      className="h-9 w-40 rounded-full border-0 bg-secondary px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
    />
  );
}
