import { CalorieBucket, calorieBucketFor, matchesFreeCal, matchesServings } from "@/lib/dietMeta";
import { DietaryRestriction, DietGoal, IDietPlanPreset } from "@/interfaces/IDietPlan";

export type DietPresetItem = IDietPlanPreset & { _id?: string };

export type DietPresetFilters = {
  search: string;
  goals: DietGoal[];
  buckets: CalorieBucket[];
  proteinServings: string[];
  carbServings: string[];
  fatServings: string[];
  freeCalories: string[];
  restrictions: DietaryRestriction[];
  mealCounts: string[];
  favoritesOnly: boolean;
};

export type BuilderOption = {
  value: string;
  label: string;
};

export const MEAL_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((count) => ({
  value: String(count),
  label: String(count),
}));

export const toggleSelection = <T>(values: T[], value: T): T[] => {
  if (values.includes(value)) return values.filter((item) => item !== value);
  return [...values, value];
};

export const getPresetCountLabel = (count: number) => {
  if (count === 1) return "תפריט";
  return "תפריטים";
};

export const getEmptyStateLabel = (totalCount: number) => {
  if (totalCount === 0) return "עדיין לא נוצרו תפריטים";
  return "לא נמצאו תוצאות";
};

export const getFavoriteButtonClassName = (favoritesOnly: boolean) => {
  if (favoritesOnly) {
    return "border-amber-300 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  }

  return "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
};

export const getFavoriteCountClassName = (favoritesOnly: boolean) => {
  if (favoritesOnly) return "bg-amber-500 text-white";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

const matchesSearch = (preset: DietPresetItem, search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return (preset.name || "").toLowerCase().includes(query);
};

const matchesGoals = (preset: DietPresetItem, goals: DietGoal[]) => {
  if (!goals.length) return true;
  return Boolean(preset.goal && goals.includes(preset.goal));
};

const matchesCalories = (preset: DietPresetItem, buckets: CalorieBucket[]) => {
  if (!buckets.length) return true;

  const bucket = calorieBucketFor(preset.calories);
  return Boolean(bucket && buckets.includes(bucket));
};

const matchesRestrictions = (preset: DietPresetItem, restrictions: DietaryRestriction[]) => {
  if (!restrictions.length) return true;

  const presetRestrictions = preset.dietaryRestrictions || [];
  return restrictions.every((restriction) => presetRestrictions.includes(restriction));
};

const matchesMealCount = (preset: DietPresetItem, mealCounts: string[]) => {
  if (!mealCounts.length) return true;

  const mealCount = preset.meals?.length ?? 0;
  return mealCounts.includes(String(mealCount));
};

export const matchesDietPreset = (
  preset: DietPresetItem,
  filters: DietPresetFilters,
  isFavorite: (presetId?: string) => boolean
) => {
  if (filters.favoritesOnly && !isFavorite(preset._id)) return false;
  if (!matchesSearch(preset, filters.search)) return false;
  if (!matchesGoals(preset, filters.goals)) return false;
  if (!matchesCalories(preset, filters.buckets)) return false;
  if (!matchesServings(preset.proteinServings, filters.proteinServings)) return false;
  if (!matchesServings(preset.carbServings, filters.carbServings)) return false;
  if (!matchesServings(preset.fatServings, filters.fatServings)) return false;
  if (!matchesFreeCal(preset.freeCalories, filters.freeCalories)) return false;
  if (!matchesRestrictions(preset, filters.restrictions)) return false;
  if (!matchesMealCount(preset, filters.mealCounts)) return false;

  return true;
};

export const getFavoriteSortWeight = (
  preset: DietPresetItem,
  isFavorite: (presetId?: string) => boolean
) => {
  if (isFavorite(preset._id)) return 1;
  return 0;
};
