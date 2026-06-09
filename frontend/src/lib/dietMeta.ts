/**
 * dietMeta — small lookup helpers for the optional trainer-tagged
 * diet-plan meta fields. Mirrors `workoutMeta` so the two preset
 * areas feel like one design system.
 */
import { DietGoal, DietaryRestriction } from "@/interfaces/IDietPlan";

export type Tone = { bg: string; text: string; border: string };

export const dietGoalOptions: { value: DietGoal; label: string }[] = [
  { value: "cutting", label: "חיטוב" },
  { value: "mass", label: "מסה" },
];

export const dietGoalLabel = (g?: DietGoal) =>
  g ? dietGoalOptions.find((o) => o.value === g)?.label : undefined;

export const dietGoalTone = (g?: DietGoal): Tone | undefined => {
  if (g === "cutting")
    return {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      text: "text-sky-700 dark:text-sky-300",
      border: "border-sky-200 dark:border-sky-900/60",
    };
  if (g === "mass")
    return {
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      text: "text-fuchsia-700 dark:text-fuchsia-300",
      border: "border-fuchsia-200 dark:border-fuchsia-900/60",
    };
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

export const dietaryRestrictionLabel = (r: DietaryRestriction) =>
  dietaryRestrictionOptions.find((o) => o.value === r)?.label ?? r;

export const dietaryRestrictionTone: Tone = {
  bg: "bg-rose-50 dark:bg-rose-950/40",
  text: "text-rose-700 dark:text-rose-300",
  border: "border-rose-200 dark:border-rose-900/60",
};

/** Rounded calorie buckets for filter pills. */
export const CALORIE_BUCKETS = [
  { value: "lt1200", label: "<1200", min: 0, max: 1199 },
  { value: "1200-1600", label: "1200–1600", min: 1200, max: 1600 },
  { value: "1600-2000", label: "1600–2000", min: 1600, max: 2000 },
  { value: "2000-2500", label: "2000–2500", min: 2000, max: 2500 },
  { value: "gt2500", label: ">2500", min: 2501, max: Infinity },
] as const;

export type CalorieBucket = (typeof CALORIE_BUCKETS)[number]["value"];

export const calorieBucketFor = (cals?: number): CalorieBucket | undefined => {
  if (typeof cals !== "number") return undefined;
  const found = CALORIE_BUCKETS.find((b) => cals >= b.min && cals <= b.max);
  return found?.value;
};

/**
 * Per-macro discrete servings options. The trainer picks the exact
 * count(s) they want, and the filter rounds the preset's value to
 * the nearest integer before matching — so a preset with 6.5 protein
 * servings matches both "6" and "7" in the dropdown.
 *
 * Ranges: protein 1–10, carbs 1–30, fats 1–15.
 */
const rangeOptions = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => {
    const n = from + i;
    return { value: String(n), label: String(n) };
  });

export const PROTEIN_OPTIONS = rangeOptions(1, 10);
export const CARB_OPTIONS = rangeOptions(1, 30);
export const FAT_OPTIONS = rangeOptions(1, 15);

/**
 * Filter helper for macro servings. Empty selection = match all;
 * otherwise match if the preset's rounded value is among the picks.
 */
export const matchesServings = (value: number | undefined, selected: string[]): boolean => {
  if (!selected.length) return true;
  if (typeof value !== "number") return false;
  return selected.includes(String(Math.round(value)));
};

/**
 * Free-calorie options in 100-cal increments, 100 to 1000. Match
 * rounds the preset's `freeCalories` to the nearest 100.
 */
export const FREE_CAL_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const n = (i + 1) * 100;
  return { value: String(n), label: String(n) };
});

export const matchesFreeCal = (value: number | undefined, selected: string[]): boolean => {
  if (!selected.length) return true;
  if (typeof value !== "number") return false;
  const rounded = Math.round(value / 100) * 100;
  return selected.includes(String(rounded));
};
