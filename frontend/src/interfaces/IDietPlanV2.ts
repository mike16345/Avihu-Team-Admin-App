export const DIET_V2_MEAL_CATEGORIES = ["protein", "carbs", "fat", "vegetables"] as const;

export type DietV2MealCategory = (typeof DIET_V2_MEAL_CATEGORIES)[number];
export type DietV2CatalogCategory = DietV2MealCategory | "addon" | "freeCalories";

export interface DietV2PlanItem {
  name: string;
  catalogItemId?: string;
}

export interface DietV2Category {
  category: DietV2MealCategory;
  items: DietV2PlanItem[];
  macros?: IMacros;
}

export interface IMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietV2FreeCalories {
  calories: number;
  description: string;
}

export interface DietV2Meal {
  _id?: string;
  name: string;
  categories: DietV2Category[];
  addOns: DietV2PlanItem[];
  macros: IMacros;
  freeCalories?: DietV2FreeCalories;
  supplements?: string[];
}

export interface IDietPlanV2 {
  _id?: string;
  userId?: string;
  trainerId?: string;
  version: 2;
  meals: DietV2Meal[];
  highlights: string;
}

export interface DietV2CatalogItem {
  _id: string;
  trainerId: string;
  category: DietV2CatalogCategory;
  name: string;
  normalizedName: string;
  usageCount: number;
  lastUsedAt: string;
}

export interface DietV2CatalogCandidate {
  name: string;
  category: DietV2CatalogCategory;
  catalogItemId?: string;
}

export type DietV2PopularItemsByCategory = Partial<
  Record<DietV2CatalogCategory, DietV2CatalogItem[]>
>;

export type DietV2TemplateGoal = "cutting" | "maintain" | "bulking";
export type DietV2TemplateGender = "women" | "men" | "both";

export type DietV2DietTag =
  | "vegan"
  | "vegetarian"
  | "no_dairy"
  | "no_fish"
  | "no_gluten"
  | "no_lactose"
  | "no_meat"
  | "no_nuts"
  | "kosher";

export interface IDietPlanV2Preset extends IDietPlanV2 {
  name: string;
  goal?: DietV2TemplateGoal;
  targetGender?: DietV2TemplateGender;
  dietTags?: DietV2DietTag[];
  builtByTrainerId?: string;
  createdAt?: string;
  updatedAt?: string;
}
