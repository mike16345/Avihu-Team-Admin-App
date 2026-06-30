/**
 * dietMeta - small lookup helpers for the optional trainer-tagged
 * diet-plan meta fields. Mirrors `workoutMeta` so the two preset
 * areas feel like one design system.
 */
import { DietGoal, DietaryRestriction, IDietPlanPreset, IMeal } from "@/interfaces/IDietPlan";
import { DIET_CALORIES_PER_SERVING } from "@/constants/dietCalories";

export type Tone = { bg: string; text: string; border: string };

export const dietGoalOptions: { value: DietGoal; label: string }[] = [
  { value: "cutting", label: "חיטוב" },
  { value: "mass", label: "מסה" },
];

export const dietGoalLabel = (goal?: DietGoal) =>
  goal ? dietGoalOptions.find((option) => option.value === goal)?.label : undefined;

export const dietGoalTone = (goal?: DietGoal): Tone | undefined => {
  if (goal === "cutting") {
    return {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      text: "text-sky-700 dark:text-sky-300",
      border: "border-sky-200 dark:border-sky-900/60",
    };
  }

  if (goal === "mass") {
    return {
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      text: "text-fuchsia-700 dark:text-fuchsia-300",
      border: "border-fuchsia-200 dark:border-fuchsia-900/60",
    };
  }

  return undefined;
};

export const dietaryRestrictionOptions: { value: DietaryRestriction; label: string }[] = [
  { value: "lactose-free", label: "רגיש לחלב" },
  { value: "vegetarian", label: "צמחוני" },
  { value: "vegan", label: "טבעוני" },
  { value: "no-fish", label: "לא אוכל דגים" },
  { value: "no-meat", label: "לא אוכל בשר" },
  { value: "gluten-free", label: "ללא גלוטן" },
];

export const dietaryRestrictionLabel = (restriction: DietaryRestriction) =>
  dietaryRestrictionOptions.find((option) => option.value === restriction)?.label ?? restriction;

export const dietaryRestrictionTone: Tone = {
  bg: "bg-rose-50 dark:bg-rose-950/40",
  text: "text-rose-700 dark:text-rose-300",
  border: "border-rose-200 dark:border-rose-900/60",
};

export const parseDietNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
};

export const formatDietNumber = (value: unknown) => {
  const parsed = parseDietNumber(value);
  if (parsed === undefined) return undefined;

  return parsed.toLocaleString("he-IL", {
    maximumFractionDigits: 2,
  });
};

const sumMealQuantity = (
  meals: IMeal[] | undefined,
  key: "totalProtein" | "totalCarbs" | "totalFats" | "totalVeggies"
) => {
  if (!meals?.length) return undefined;

  const total = meals.reduce((acc, meal) => acc + (parseDietNumber(meal?.[key]?.quantity) ?? 0), 0);
  return total > 0 ? total : undefined;
};

const firstDefinedDietNumber = (...values: unknown[]) => {
  for (const value of values) {
    const parsed = parseDietNumber(value);
    if (parsed !== undefined) return parsed;
  }

  return undefined;
};

export const resolveDietPresetMeta = (preset: Partial<IDietPlanPreset>) => {
  const proteinServings = firstDefinedDietNumber(
    preset.proteinServings,
    sumMealQuantity(preset.meals, "totalProtein")
  );
  const carbServings = firstDefinedDietNumber(
    preset.carbServings,
    sumMealQuantity(preset.meals, "totalCarbs")
  );
  const fatServings = firstDefinedDietNumber(
    preset.fatServings,
    sumMealQuantity(preset.meals, "totalFats")
  );
  const veggieServings = sumMealQuantity(preset.meals, "totalVeggies");
  const freeCalories = parseDietNumber(preset.freeCalories);
  const hasDerivedValues =
    proteinServings !== undefined ||
    carbServings !== undefined ||
    fatServings !== undefined ||
    veggieServings !== undefined ||
    (freeCalories ?? 0) > 0;

  const derivedCalories = hasDerivedValues
    ? (proteinServings ?? 0) * DIET_CALORIES_PER_SERVING.protein +
      (carbServings ?? 0) * DIET_CALORIES_PER_SERVING.carbs +
      (fatServings ?? 0) * DIET_CALORIES_PER_SERVING.fats +
      (veggieServings ?? 0) * DIET_CALORIES_PER_SERVING.veggies +
      (freeCalories ?? 0)
    : undefined;

  return {
    calories: firstDefinedDietNumber(preset.calories, preset.totalCalories, derivedCalories),
    freeCalories,
    proteinServings,
    carbServings,
    fatServings,
  };
};

const matchesSteppedValue = (value: unknown, selected: string[], step: number): boolean => {
  if (!selected.length) return true;

  const parsedValue = parseDietNumber(value);
  if (parsedValue === undefined) return false;

  const threshold = step / 2;

  return selected.some((entry) => {
    const parsedEntry = Number(entry);
    if (!Number.isFinite(parsedEntry)) return false;

    return Math.abs(parsedValue - parsedEntry) <= threshold;
  });
};

/** Rounded calorie buckets for filter pills. */
export const CALORIE_BUCKETS = [
  { value: "lt1200", label: "<1200", min: 0, max: 1199 },
  { value: "1200-1600", label: "1200-1600", min: 1200, max: 1600 },
  { value: "1600-2000", label: "1600-2000", min: 1600, max: 2000 },
  { value: "2000-2500", label: "2000-2500", min: 2000, max: 2500 },
  { value: "gt2500", label: ">2500", min: 2501, max: Infinity },
] as const;

export type CalorieBucket = (typeof CALORIE_BUCKETS)[number]["value"];

export const calorieBucketFor = (calories?: number): CalorieBucket | undefined => {
  const parsedCalories = parseDietNumber(calories);
  if (parsedCalories === undefined) return undefined;

  const found = CALORIE_BUCKETS.find(
    (bucket) => parsedCalories >= bucket.min && parsedCalories <= bucket.max
  );

  return found?.value;
};

const rangeOptions = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => {
    const value = from + index;
    return { value: String(value), label: String(value) };
  });

export const PROTEIN_OPTIONS = rangeOptions(1, 10);
export const CARB_OPTIONS = rangeOptions(1, 30);
export const FAT_OPTIONS = rangeOptions(1, 15);

export const matchesServings = (value: number | undefined, selected: string[]): boolean => {
  return matchesSteppedValue(value, selected, 1);
};

export const FREE_CAL_OPTIONS = Array.from({ length: 10 }, (_, index) => {
  const value = (index + 1) * 100;
  return { value: String(value), label: String(value) };
});

export const matchesFreeCal = (value: number | undefined, selected: string[]): boolean => {
  return matchesSteppedValue(value, selected, 100);
};
