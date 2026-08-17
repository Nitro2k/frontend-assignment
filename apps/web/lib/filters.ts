export const PRICE_MIN = 0;
export const PRICE_MAX = 300;

export type ProductFilters = {
  q?: string;
  colorIds: string[];
  sizeIds: string[];
  minPrice?: number;
  maxPrice?: number;
};

export const EMPTY_FILTERS: ProductFilters = {
  colorIds: [],
  sizeIds: [],
};

// The filter panel never reads/writes `q` — excluding it here prevents stale pending state from reverting a live search on Apply.
export type PanelFilters = Omit<ProductFilters, "q">;

export function panelFiltersKey(filters: PanelFilters): string {
  return JSON.stringify(filters);
}

export function filtersToSearchParams(
  filters: ProductFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.colorIds.length > 0) {
    params.set("color", filters.colorIds.join(","));
  }
  if (filters.sizeIds.length > 0) {
    params.set("size", filters.sizeIds.join(","));
  }
  if (filters.minPrice !== undefined && filters.minPrice > PRICE_MIN) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && filters.maxPrice < PRICE_MAX) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  return params;
}

export function searchParamsToFilters(
  params: URLSearchParams,
): ProductFilters {
  const q = params.get("q")?.trim();
  const colorIds = splitParam(params.get("color"));
  const sizeIds = splitParam(params.get("size"));
  const minPrice = clampToPriceRange(params.get("minPrice"));
  const maxPrice = clampToPriceRange(params.get("maxPrice"));

  return {
    ...(q ? { q } : {}),
    colorIds,
    sizeIds,
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
  };
}

function splitParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function clampToPriceRange(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(Math.max(parsed, PRICE_MIN), PRICE_MAX);
}
