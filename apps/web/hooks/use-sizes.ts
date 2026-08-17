"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSizes, queryKeys } from "@/lib/api/queries";

export function useSizes() {
  return useQuery({
    queryKey: queryKeys.sizes(),
    queryFn: fetchSizes,
    staleTime: Infinity,
  });
}
