import useDietV2CatalogApi from "@/hooks/api/useDietV2CatalogApi";
import type { DietV2CatalogCategory } from "@/interfaces/IDietPlanV2";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { dietV2CatalogKeys } from "./dietV2CatalogKeys";

export const useDietV2CatalogSearchQuery = (category: DietV2CatalogCategory, query: string) => {
  const { searchItems } = useDietV2CatalogApi();
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: dietV2CatalogKeys.search(category, normalizedQuery),
    queryFn: ({ signal }) => searchItems(category, normalizedQuery, signal),
    enabled: normalizedQuery.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};
