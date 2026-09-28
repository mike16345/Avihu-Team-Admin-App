import {
  IWorkoutPlanPreset,
  WorkoutEquipment,
  WorkoutGoal,
  WorkoutLevel,
} from "@/interfaces/IWorkoutPlan";
import {
  EQUIPMENT_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  muscleFocusLabel,
} from "@/lib/workoutMeta";

export type WorkoutPickerPreset = IWorkoutPlanPreset & { _id?: string };
export type WeekFilter = "all" | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type DurationFilter = "all" | "≤30" | "30-45" | "45-60" | "60-75" | "75-90" | "90+";
export type ActiveWeekFilter = Exclude<WeekFilter, "all">;
export type ActiveDurationFilter = Exclude<DurationFilter, "all">;

export type WorkoutPickerFilters = {
  search: string;
  weekFilter: ActiveWeekFilter[];
  durationFilter: ActiveDurationFilter[];
  levelFilter: WorkoutLevel[];
  goalFilter: WorkoutGoal[];
  equipmentFilter: WorkoutEquipment[];
  muscleFilter: string[];
  favoritesOnly: boolean;
};

export const WEEK_OPTIONS: { value: WeekFilter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
];

export const DURATION_OPTIONS: {
  value: DurationFilter;
  label: string;
  min: number;
  max: number;
}[] = [
  { value: "all", label: "הכל", min: 0, max: 9999 },
  { value: "≤30", label: "עד 30 דק׳", min: 0, max: 30 },
  { value: "30-45", label: "30–45 דק׳", min: 30, max: 45 },
  { value: "45-60", label: "45–60 דק׳", min: 45, max: 60 },
  { value: "60-75", label: "60–75 דק׳", min: 60, max: 75 },
  { value: "75-90", label: "75–90 דק׳", min: 75, max: 90 },
  { value: "90+", label: "90+ דק׳", min: 90, max: 9999 },
];

export const toggleIn = <T>(values: T[], value: T): T[] => {
  if (values.includes(value)) return values.filter((item) => item !== value);
  return [...values, value];
};

export const muscleGroupsOf = (preset: WorkoutPickerPreset): string[] => {
  const muscleGroups = new Set<string>();

  preset.workoutPlans?.forEach((plan) =>
    plan.muscleGroups?.forEach((muscleGroup) => {
      if (muscleGroup.muscleGroup) muscleGroups.add(muscleGroup.muscleGroup);
    })
  );

  return Array.from(muscleGroups);
};

export const getPickerTitle = (preview: WorkoutPickerPreset | null) => {
  if (!preview) return "בחירת תבנית אימון";
  return preview.name || "תצוגת תבנית";
};

export const getPickerSubtitle = (preview: WorkoutPickerPreset | null) => {
  if (preview) return "סקור את התוכנית ולחץ 'טען תבנית' כדי להחיל";

  return "סנן לפי תדירות, רמה, דגש או קבוצת שריר ובחר את התבנית המתאימה";
};

export const getFavoritesButtonClassName = (favoritesOnly: boolean) => {
  if (favoritesOnly) {
    return "border-amber-300 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  }

  return "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
};

export const getFavoritesCountClassName = (favoritesOnly: boolean) => {
  if (favoritesOnly) return "bg-amber-500 text-white";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

export const getFilterOptionButtonClassName = (active: boolean) => {
  if (active) return "border-blue-600 bg-blue-600 text-white shadow-sm";

  return "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300";
};

export const getWeekFilterOptionButtonClassName = (active: boolean) =>
  `h-7 min-w-[2.25rem] rounded-md border px-2 text-xs font-bold transition-all ${getFilterOptionButtonClassName(
    active
  )}`;

export const getWorkoutFrequency = (preset: WorkoutPickerPreset) => {
  if (typeof preset.workoutsPerWeek === "number") return preset.workoutsPerWeek;
  return -1;
};

export const getFavoriteSortWeight = (
  preset: WorkoutPickerPreset,
  isFavorite: (presetId?: string) => boolean
) => {
  if (isFavorite(preset._id)) return 1;
  return 0;
};

export const getActiveWorkoutFilterCount = (
  filters: Omit<WorkoutPickerFilters, "search" | "favoritesOnly">
) =>
  filters.weekFilter.length +
  filters.durationFilter.length +
  filters.levelFilter.length +
  filters.goalFilter.length +
  filters.equipmentFilter.length +
  filters.muscleFilter.length;

export const levelLabelOf = (value: WorkoutLevel) =>
  LEVEL_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const goalLabelOf = (value: WorkoutGoal) =>
  GOAL_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const equipmentLabelOf = (value: WorkoutEquipment) =>
  EQUIPMENT_OPTIONS.find((option) => option.value === value)?.label ?? value;

export const muscleLabelOf = (value: string) => muscleFocusLabel(value);

export const durationLabelOf = (value: string) =>
  DURATION_OPTIONS.find((option) => option.value === value)?.label ?? value;

const durationMatches = (duration: number, bands: ActiveDurationFilter[]): boolean => {
  if (bands.length === 0) return true;
  if (duration < 0) return false;

  return bands.some((band) => {
    const range = DURATION_OPTIONS.find((option) => option.value === band);
    if (!range) return false;
    if (band === "≤30") return duration <= 30;
    if (band === "90+") return duration >= 90;

    return duration > range.min && duration <= range.max;
  });
};

export const matchesWorkoutPickerPreset = (
  preset: WorkoutPickerPreset,
  filters: WorkoutPickerFilters,
  isFavorite: (presetId?: string) => boolean
) => {
  const query = filters.search.trim().toLowerCase();

  if (filters.favoritesOnly && !isFavorite(preset._id)) return false;
  if (query && !preset.name?.toLowerCase().includes(query)) return false;
  if (filters.weekFilter.length > 0) {
    const workoutsPerWeek = getWorkoutFrequency(preset);
    const hasMatchingFrequency = filters.weekFilter.some((week) => workoutsPerWeek === week);
    if (!hasMatchingFrequency) return false;
  }
  if (!durationMatches(preset.durationMinutes ?? -1, filters.durationFilter)) return false;
  if (
    filters.levelFilter.length > 0 &&
    (!preset.level || !filters.levelFilter.includes(preset.level))
  ) {
    return false;
  }
  if (
    filters.goalFilter.length > 0 &&
    (!preset.goal || !filters.goalFilter.includes(preset.goal))
  ) {
    return false;
  }
  if (
    filters.equipmentFilter.length > 0 &&
    (!preset.equipment || !filters.equipmentFilter.includes(preset.equipment))
  ) {
    return false;
  }
  if (filters.muscleFilter.length > 0) {
    const muscleTags = preset.muscleFocus ?? [];
    if (!muscleTags.some((tag) => filters.muscleFilter.includes(tag))) return false;
  }

  return true;
};
