/**
 * Translation + UI metadata for the optional workout-plan meta fields
 * (level / goal). Centralised here so the editor, the preset card, and
 * the filter chips all share the same labels and palette.
 *
 * The raw values stored in the DB are kept short and stable
 * ("beginner", "fat-loss", …) — only the display labels are Hebrew.
 */
import type { WorkoutEquipment, WorkoutGoal, WorkoutLevel } from "@/interfaces/IWorkoutPlan";

export const LEVEL_OPTIONS: {
  value: WorkoutLevel;
  label: string;
  tone: { bg: string; text: string; border: string };
}[] = [
  {
    value: "beginner",
    label: "מתחיל",
    tone: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-900/60",
    },
  },
  {
    value: "intermediate",
    label: "בינוני",
    tone: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-900/60",
    },
  },
  {
    value: "advanced",
    label: "מתקדם",
    tone: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-200 dark:border-rose-900/60",
    },
  },
  {
    value: "pro",
    label: "מקצוען",
    tone: {
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      text: "text-fuchsia-700 dark:text-fuchsia-300",
      border: "border-fuchsia-200 dark:border-fuchsia-900/60",
    },
  },
];

export const GOAL_OPTIONS: {
  value: WorkoutGoal;
  label: string;
  tone: { bg: string; text: string; border: string };
}[] = [
  {
    value: "fat-loss",
    label: "חיטוב",
    tone: {
      bg: "bg-orange-50 dark:bg-orange-950/40",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-900/60",
    },
  },
  {
    value: "muscle-gain",
    label: "מסה",
    tone: {
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-900/60",
    },
  },
  {
    value: "strength",
    label: "כוח",
    tone: {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-900/60",
    },
  },
  {
    value: "endurance",
    label: "סיבולת",
    tone: {
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-200 dark:border-cyan-900/60",
    },
  },
  {
    value: "toning",
    label: "חיזוק",
    tone: {
      bg: "bg-pink-50 dark:bg-pink-950/40",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-200 dark:border-pink-900/60",
    },
  },
  {
    value: "rehab",
    label: "שיקום",
    tone: {
      bg: "bg-teal-50 dark:bg-teal-950/40",
      text: "text-teal-700 dark:text-teal-300",
      border: "border-teal-200 dark:border-teal-900/60",
    },
  },
];

/**
 * Muscle-focus options. "full-body" is mutually exclusive with the
 * specific groups (selecting it clears any others). Stored as English
 * slugs in the DB; Hebrew labels live here for the UI.
 */
/**
 * Granular muscle-focus list. Mirrors the actual muscle groups that
 * appear inside `workoutPlans[].muscleGroups[]` across the system, so
 * filters here line up with what's actually trained. "full-body" is
 * the only mutually-exclusive option.
 */
export const MUSCLE_FOCUS_OPTIONS: {
  value: string;
  label: string;
  isFullBody?: boolean;
}[] = [
  { value: "full-body", label: "כללי / כל הגוף", isFullBody: true },
  { value: "chest", label: "חזה" },
  { value: "back", label: "גב" },
  { value: "shoulders", label: "כתפיים" },
  { value: "biceps", label: "יד קדמית" },
  { value: "triceps", label: "יד אחורית" },
  { value: "traps", label: "טרפזים" },
  { value: "forearms", label: "אמות" },
  { value: "quads", label: "רגליים" },
  { value: "hamstrings", label: "אחורי ירך" },
  { value: "glutes", label: "ישבן" },
  { value: "calves", label: "תאומים" },
  { value: "core", label: "ליבה / בטן" },
];

/**
 * Equipment required for a plan. Stored as English slugs in the DB;
 * Hebrew labels live here for the UI. Each option gets a distinct tone
 * so the chip is scannable.
 */
export const EQUIPMENT_OPTIONS: {
  value: WorkoutEquipment;
  label: string;
  tone: { bg: string; text: string; border: string };
}[] = [
  {
    value: "gym",
    label: "חדר כושר",
    tone: {
      bg: "bg-slate-50 dark:bg-slate-800/60",
      text: "text-slate-700 dark:text-slate-200",
      border: "border-slate-300 dark:border-slate-700",
    },
  },
  {
    value: "studio",
    label: "סטודיו",
    tone: {
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      text: "text-fuchsia-700 dark:text-fuchsia-300",
      border: "border-fuchsia-200 dark:border-fuchsia-900/60",
    },
  },
  {
    value: "weights",
    label: "משקולות",
    tone: {
      bg: "bg-violet-50 dark:bg-violet-950/40",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-200 dark:border-violet-900/60",
    },
  },
  {
    value: "bodyweight",
    label: "משקל גוף",
    tone: {
      bg: "bg-lime-50 dark:bg-lime-950/40",
      text: "text-lime-700 dark:text-lime-300",
      border: "border-lime-200 dark:border-lime-900/60",
    },
  },
  {
    value: "weights-bodyweight",
    label: "משקולות + משקל גוף",
    tone: {
      bg: "bg-teal-50 dark:bg-teal-950/40",
      text: "text-teal-700 dark:text-teal-300",
      border: "border-teal-200 dark:border-teal-900/60",
    },
  },
];

export const equipmentLabel = (v?: WorkoutEquipment) =>
  EQUIPMENT_OPTIONS.find((o) => o.value === v)?.label;
export const equipmentTone = (v?: WorkoutEquipment) =>
  EQUIPMENT_OPTIONS.find((o) => o.value === v)?.tone;

export const muscleFocusLabel = (v: string) =>
  MUSCLE_FOCUS_OPTIONS.find((o) => o.value === v)?.label ?? v;

export const levelLabel = (v?: WorkoutLevel) =>
  LEVEL_OPTIONS.find((o) => o.value === v)?.label;
export const levelTone = (v?: WorkoutLevel) =>
  LEVEL_OPTIONS.find((o) => o.value === v)?.tone;

export const goalLabel = (v?: WorkoutGoal) =>
  GOAL_OPTIONS.find((o) => o.value === v)?.label;
export const goalTone = (v?: WorkoutGoal) =>
  GOAL_OPTIONS.find((o) => o.value === v)?.tone;
