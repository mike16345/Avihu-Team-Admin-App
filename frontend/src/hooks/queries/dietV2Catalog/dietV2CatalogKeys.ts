import type { DietV2CatalogCategory } from "@/interfaces/IDietPlanV2";

export const dietV2CatalogKeys = {
  all: ["diet-v2-catalog"] as const,
  popular: () => [...dietV2CatalogKeys.all, "popular"] as const,
  searches: () => [...dietV2CatalogKeys.all, "search"] as const,
  search: (category: DietV2CatalogCategory, query: string) =>
    [...dietV2CatalogKeys.searches(), category, query.trim().toLocaleLowerCase()] as const,
};
