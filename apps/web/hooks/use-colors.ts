"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchColors, queryKeys } from "@/lib/api/queries";

export function useColors() {
  return useQuery({
    queryKey: queryKeys.colors(),
    queryFn: fetchColors,
    staleTime: Infinity,
  });
}
