export interface FoodCatalogNutrition {
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  saturatedFat: number | null;
  sugars: number | null;
  fiber: number | null;
  sodium: number | null;
  salt: number | null;
}

export interface FoodCatalogServingOption {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  nutrition: FoodCatalogNutrition;
  source: "open_food_facts" | "fallback_100" | "admin";
}

export interface FoodCatalogProduct {
  id: string;
  displayName: string | null;
  names: {
    he: string | null;
    en: string | null;
    original: string | null;
    originalLanguage: string | null;
  };
  brand: string | null;
  servings: FoodCatalogServingOption[];
  hasAdminOverrides: boolean;
  provenance: {
    provider: "open_food_facts" | "admin";
    license: string | null;
    sourceUrl: string | null;
  };
}

export interface FoodCatalogItemInput {
  names: {
    he?: string;
    en?: string;
    original?: string;
  };
  brand?: string;
  aliases?: string[];
  servings: Array<{
    id?: string;
    description: string;
    quantity: number;
    unit: string;
    nutrition: FoodCatalogNutrition;
  }>;
}
