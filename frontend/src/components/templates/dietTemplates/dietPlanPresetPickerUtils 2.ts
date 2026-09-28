import { DietaryRestriction, DietGoal, IDietPlanPreset } from "@/interfaces/IDietPlan";
import {
  calorieBucketFor,
  CALORIE_BUCKETS,
  CalorieBucket,
  CARB_OPTIONS,
  dietGoalOptions,
  dietaryRestrictionLabel,
  FAT_OPTIONS,
  FREE_CAL_OPTIONS,
  matchesFreeCal,
  matchesServings,
  PROTEIN_OPTIONS,
  resolveDietPresetMeta,
} from "@/lib/dietMeta";

export type DietPickerPreset = IDietPlanPreset & { _id?: string };

export type DietPickerFilters = {
  search: string;
  goals: DietGoal[];
  buckets: CalorieBucket[];
  proteinServings: string[];
  carbServings: string[];
  fatServings: string[];
  freeCalories: string[];
  restrictions: DietaryRestriction[];
  builders: string[];
  mealCounts: string[];
};

export type BuilderOption = {
  value: string;
  label: string;
};

export const MEAL_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((count) => ({
  value: String(count),
  label: String(count),
}));

export const DEFAULT_OPEN_DIET_PICKER_SECTIONS: Record<string, boolean> = {
  mealCount: true,
  goal: true,
  calories: true,
  macros: false,
  freeCal: false,
  restrictions: false,
  builder: false,
};

export const toggleIn = <T>(values: T[], value: T): T[] => {
  if (values.includes(value)) return values.filter((item) => item !== value);
  return [...values, value];
};

export const getBuilderOptions = (
  currentUser?: { _id?: string; firstName?: string; lastName?: string } | null,
  subTrainers: { _id?: string; fullName?: string }[] = []
): BuilderOption[] => {
  const builderOptions: BuilderOption[] = [];

  if (currentUser?._id) {
    builderOptions.push({
      value: currentUser._id,
      label: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "אני",
    });
  }

  subTrainers.forEach((trainer) => {
    if (trainer._id) {
      builderOptions.push({ value: trainer._id, label: trainer.fullName || "ללא שם" });
    }
  });

  return builderOptions;
};

export const getActiveDietFilterCount = (filters: Omit<DietPickerFilters, "search">) =>
  filters.goals.length +
  filters.buckets.length +
  filters.proteinServings.length +
  filters.carbServings.length +
  filters.fatServings.length +
  filters.freeCalories.length +
  filters.restrictions.length +
  filters.builders.length +
  filters.mealCounts.length;

export const goalLabelOf = (value: DietGoal) =>
  dietGoalOptions.find((option) => option.value === value)?.label ?? value;

export const bucketLabelOf = (value: CalorieBucket) =>
  CALORIE_BUCKETS.find((bucket) => bucket.value === value)?.label ?? value;

export const proteinLabelOf = (value: string) =>
  PROTEIN_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const carbLabelOf = (value: string) =>
  CARB_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const fatLabelOf = (value: string) =>
  FAT_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const freeCalorieLabelOf = (value: string) =>
  FREE_CAL_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const restrictionLabelOf = (value: DietaryRestriction) => dietaryRestrictionLabel(value);

const matchesSearch = (preset: DietPickerPreset, search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return (preset.name || "").toLowerCase().includes(query);
};

const matchesGoals = (preset: DietPickerPreset, goals: DietGoal[]) => {
  if (!goals.length) return true;
  return Boolean(preset.goal && goals.includes(preset.goal));
};

const matchesCalories = (preset: DietPickerPreset, buckets: CalorieBucket[]) => {
  if (!buckets.length) return true;

  const bucket = calorieBucketFor(resolveDietPresetMeta(preset).calories);
  return Boolean(bucket && buckets.includes(bucket));
};

const matchesRestrictions = (preset: DietPickerPreset, restrictions: DietaryRestriction[]) => {
  if (!restrictions.length) return true;

  const presetRestrictions = preset.dietaryRestrictions || [];
  return restrictions.every((restriction) => presetRestrictions.includes(restriction));
};

const matchesBuilder = (preset: DietPickerPreset, builders: string[]) => {
  if (!builders.length) return true;
  return Boolean(preset.builtByTrainerId && builders.includes(preset.builtByTrainerId));
};

const matchesMealCount = (preset: DietPickerPreset, mealCounts: string[]) => {
  if (!mealCounts.length) return true;

  const mealCount = preset.meals?.length ?? 0;
  return mealCounts.includes(String(mealCount));
};

export const matchesDietPickerPreset = (preset: DietPickerPreset, filters: DietPickerFilters) => {
  const resolvedMeta = resolveDietPresetMeta(preset);

  if (!matchesSearch(preset, filters.search)) return false;
  if (!matchesGoals(preset, filters.goals)) return false;
  if (!matchesCalories(preset, filters.buckets)) return false;
  if (!matchesServings(resolvedMeta.proteinServings, filters.proteinServings)) return false;
  if (!matchesServings(resolvedMeta.carbServings, filters.carbServings)) return false;
  if (!matchesServings(resolvedMeta.fatServings, filters.fatServings)) return false;
  if (!matchesFreeCal(resolvedMeta.freeCalories, filters.freeCalories)) return false;
  if (!matchesRestrictions(preset, filters.restrictions)) return false;
  if (!matchesBuilder(preset, filters.builders)) return false;
  if (!matchesMealCount(preset, filters.mealCounts)) return false;

  return true;
};
