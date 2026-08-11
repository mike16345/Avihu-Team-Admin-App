import type {
  DietV2Category,
  DietV2CategoryKind,
  DietV2Meal,
  DietV2OptionMacros,
} from "@/interfaces/IDietPlanV2";

export const CATEGORY_LABELS: Record<DietV2CategoryKind, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
  vegetables: "ירקות",
  addon: "תוסף תזונה",
  freeCalories: "קלוריות חופשיות",
};

export const CATEGORY_TONES: Record<
  DietV2CategoryKind,
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

export interface MacroRange {
  min: number;
  max: number;
  avg: number;
}

const round = (value: number): number => Math.round(value * 10) / 10;

export const computeCategoryRange = (
  category: DietV2Category,
  pick: keyof DietV2OptionMacros
): MacroRange | null => {
  if (category.options.length === 0) return null;
  const values = category.options.map((option) => option.macros[pick]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((acc, value) => acc + value, 0) / values.length;

  return { min: round(min), max: round(max), avg: round(avg) };
};

export const computeMealRange = (meal: DietV2Meal, pick: keyof DietV2OptionMacros): MacroRange => {
  const ranges = meal.categories
    .map((category) => computeCategoryRange(category, pick))
    .filter((range): range is MacroRange => range !== null);
  if (ranges.length === 0) return { min: 0, max: 0, avg: 0 };

  return {
    min: round(ranges.reduce((acc, range) => acc + range.min, 0)),
    max: round(ranges.reduce((acc, range) => acc + range.max, 0)),
    avg: round(ranges.reduce((acc, range) => acc + range.avg, 0)),
  };
};

export const computeCategoryAverage = (
  category: DietV2Category,
  pick: keyof DietV2OptionMacros
): number => computeCategoryRange(category, pick)?.avg ?? 0;

export const computeMealAverage = (meal: DietV2Meal, pick: keyof DietV2OptionMacros): number =>
  computeMealRange(meal, pick).avg;

export const computeMealTotalsFromCategories = (
  categories: DietV2Category[]
): DietV2OptionMacros => {
  const totals: DietV2OptionMacros = { protein: 0, carbs: 0, fat: 0, calories: 0 };

  for (const category of categories) {
    const primary = primaryMacroForCategory(category.kind);
    if (primary) {
      totals[primary] +=
        category.manualPrimaryGrams ?? Math.round(computeCategoryAverage(category, primary));
    }
    totals.calories +=
      category.manualCalories ?? Math.round(computeCategoryAverage(category, "calories"));
  }

  return totals;
};

export const primaryMacroForCategory = (
  kind: DietV2CategoryKind
): keyof DietV2OptionMacros | null => {
  switch (kind) {
    case "protein":
      return "protein";
    case "carbs":
      return "carbs";
    case "fat":
      return "fat";
    case "vegetables":
    case "addon":
    case "freeCalories":
      return null;
  }
};

let idCounter = 0;

export const makeLocalId = (prefix: string): string =>
  `${prefix}-${++idCounter}-${Math.floor(Date.now() / 1000)}`;

export const DIET_V2_DEFAULT_CATEGORIES: DietV2CategoryKind[] = [
  "protein",
  "carbs",
  "fat",
  "vegetables",
  "addon",
  "freeCalories",
];

export const buildEmptyMeal = (index: number): DietV2Meal => ({
  id: makeLocalId("meal"),
  name: `ארוחה ${index}`,
  categories: DIET_V2_DEFAULT_CATEGORIES.map((kind) => ({ kind, options: [] })),
});
