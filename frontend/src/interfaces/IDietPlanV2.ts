/**
 * Diet plan editor v2 — "options" model.
 *
 * A meal is built from categories (protein / carbs / fat / vegetables).
 * Each category contains a list of food options the trainee can choose
 * from. Per the council brief, the meal does NOT carry a typed "target"
 * field — macro figures shown to the trainer are computed live as the
 * range across the category's options.
 */

export const DIET_V2_CATEGORY_KINDS = [
  "protein",
  "carbs",
  "fat",
  "vegetables",
] as const;

export type DietV2CategoryKind = (typeof DIET_V2_CATEGORY_KINDS)[number];

export const DIET_V2_UNITS = [
  "g",
  "spoons",
  "cups",
  "units",
  "slice",
  "piece",
  "piece_medium",
] as const;

export type DietV2Unit = (typeof DIET_V2_UNITS)[number];

export const DIET_V2_UNIT_LABELS: Record<DietV2Unit, string> = {
  g: "גרם",
  spoons: "כפות",
  cups: "כוסות",
  units: "יחידות",
  slice: "פרוסות",
  piece: "חתיכה",
  piece_medium: "חתיכה בינונית",
};

export interface DietV2OptionMacros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface DietV2Option {
  id: string;
  foodName: string;
  quantity: number;
  unit: DietV2Unit;
  macros: DietV2OptionMacros;
  /** True when macros were derived from a category-level fallback
   *  (no exact food match in the library). UI surfaces this as a
   *  "מוערך" badge so the trainer knows to double-check the row. */
  estimated?: boolean;
  /** True when the row's macros came from a remote (Open Food
   *  Facts) lookup — usually after a background upgrade from an
   *  initial estimate. UI surfaces this as a "ענן" badge. */
  cloudSourced?: boolean;
}

export interface DietV2Category {
  kind: DietV2CategoryKind;
  options: DietV2Option[];
  note?: string;
  /** When the parent meal is in manual macro mode, the trainer can
   *  type explicit per-category values that bypass the computed
   *  averages of the options. Only used when meal.macroMode is
   *  "manual"; otherwise ignored. */
  manualPrimaryGrams?: number;
  manualCalories?: number;
}

export type DietV2MealMacroMode = "auto" | "manual";

export interface DietV2Meal {
  id: string;
  name: string;
  categories: DietV2Category[];
  note?: string;
  /** Controls whether the meal-header macros are computed from the
   *  options (auto) or typed by the trainer (manual). Defaults to
   *  auto. Categories below the header always show their computed
   *  averages — only the meal-level summary swaps. */
  macroMode?: DietV2MealMacroMode;
  /** Trainer-entered macros, used when `macroMode === "manual"`. */
  manualMacros?: DietV2OptionMacros;
}

export interface DietV2Plan {
  meals: DietV2Meal[];
}
