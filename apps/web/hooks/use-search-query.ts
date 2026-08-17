"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useSearchQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(urlQuery);
  const debouncedValue = useDebouncedValue(value, 300);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (debouncedValue === urlQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue.trim()) {
      params.set("q", debouncedValue.trim());
    } else {
      params.delete("q");
    }

    const query = params.toString();
    router.replace(pathname + (query ? `?${query}` : ""), { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return { value, setValue };
}
