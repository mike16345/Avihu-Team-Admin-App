import type {
  DietV2CatalogCategory,
  DietV2Meal,
  DietV2MealCategory,
  IMacros,
  IDietPlanV2,
} from "@/interfaces/IDietPlanV2";
import { DIET_V2_MEAL_CATEGORIES } from "@/interfaces/IDietPlanV2";

export const CATEGORY_LABELS: Record<DietV2CatalogCategory, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
  vegetables: "ירקות",
  addon: "תוסף תזונה",
  freeCalories: "קלוריות חופשיות",
};

export const CATEGORY_TONES: Record<
  DietV2CatalogCategory,
  { ring: string; chip: string; chipText: string }
> = {
  protein: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-blue-50 dark:bg-blue-950/40",
    chipText: "text-blue-700 dark:text-blue-300",
  },
  carbs: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-sky-50 dark:bg-sky-950/40",
    chipText: "text-sky-700 dark:text-sky-300",
  },
  fat: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-indigo-50 dark:bg-indigo-950/40",
    chipText: "text-indigo-700 dark:text-indigo-300",
  },
  vegetables: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-cyan-50 dark:bg-cyan-950/40",
    chipText: "text-cyan-700 dark:text-cyan-300",
  },
  addon: {
    ring: "border-slate-200 dark:border-slate-800/60",
    chip: "bg-slate-100 dark:bg-slate-800/50",
    chipText: "text-slate-700 dark:text-slate-300",
  },
  freeCalories: {
    ring: "border-emerald-100 dark:border-emerald-900/40",
    chip: "bg-emerald-50 dark:bg-emerald-950/30",
    chipText: "text-emerald-700 dark:text-emerald-300",
  },
};

let idCounter = 0;

export const makeLocalId = (prefix: string): string =>
  `${prefix}-${++idCounter}-${Math.floor(Date.now() / 1000)}`;

export const DIET_V2_DEFAULT_CATEGORIES: DietV2MealCategory[] = [...DIET_V2_MEAL_CATEGORIES];

export const EMPTY_MEAL_MACROS: IMacros = {
  calories: Number.NaN,
  protein: Number.NaN,
  carbs: Number.NaN,
  fat: Number.NaN,
};

const ZERO_MEAL_MACROS: IMacros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export const buildEmptyMeal = (index: number): DietV2Meal => ({
  name: `ארוחה ${index}`,
  categories: DIET_V2_DEFAULT_CATEGORIES.map((category) => ({ category, items: [] })),
  addOns: [],
  macros: { ...ZERO_MEAL_MACROS },
});

export interface DietV2PlanTotals {
  macros: IMacros;
  freeCalories: number;
}

const finiteOrZero = (value: number | undefined): number =>
  Number.isFinite(value) ? (value as number) : 0;

export const deriveMealMacros = (meal: Pick<DietV2Meal, "categories">): IMacros =>
  meal.categories.reduce<IMacros>(
    (totals, category) => {
      if (category.items.length === 0) return totals;

      return {
        calories: totals.calories + finiteOrZero(category.macros?.calories),
        protein: totals.protein + finiteOrZero(category.macros?.protein),
        carbs: totals.carbs + finiteOrZero(category.macros?.carbs),
        fat: totals.fat + finiteOrZero(category.macros?.fat),
      };
    },
    { ...ZERO_MEAL_MACROS }
  );

export const computePlanMacroTotals = (plan: IDietPlanV2): DietV2PlanTotals =>
  plan.meals.reduce<DietV2PlanTotals>(
    (totals, meal) => {
      const mealMacros = deriveMealMacros(meal);
      return {
        macros: {
          calories: totals.macros.calories + mealMacros.calories,
          protein: totals.macros.protein + mealMacros.protein,
          carbs: totals.macros.carbs + mealMacros.carbs,
          fat: totals.macros.fat + mealMacros.fat,
        },
        freeCalories: totals.freeCalories + finiteOrZero(meal.freeCalories?.calories),
      };
    },
    { macros: { ...ZERO_MEAL_MACROS }, freeCalories: 0 }
  );

export const normalizeDietPlanV2 = (plan: IDietPlanV2): IDietPlanV2 => ({
  ...plan,
  meals: plan.meals.map((meal) => {
    const rawCategories = meal.categories as Array<
      DietV2Meal["categories"][number] & { category: string }
    >;
    const legacyAddOns = rawCategories
      .filter((category) => (category.category as string) === "addon")
      .flatMap((category) => category.items);
    const categories = DIET_V2_DEFAULT_CATEGORIES.map((categoryName) => {
      const category = rawCategories.find((candidate) => candidate.category === categoryName);
      if (!category) return { category: categoryName, items: [] };

      return {
        category: categoryName,
        items: category.items.map((item) => ({ ...item })),
        macros: category.items.length > 0 ? category.macros : undefined,
      };
    });

    return {
      ...meal,
      categories,
      addOns: [...(meal.addOns ?? []), ...legacyAddOns].map((item) => ({ ...item })),
      macros: deriveMealMacros({ categories }),
    };
  }),
});
