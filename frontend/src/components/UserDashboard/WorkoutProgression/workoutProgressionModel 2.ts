export type RecordedSet = {
  weight?: number;
  repsDone?: number;
  date?: string | Date;
  setNumber?: number;
};

export type FlatExercise = {
  name: string;
  group: string;
  sessions: { date: Date; weight: number; reps: number }[];
};

export const groupColors: Record<string, { bg: string; text: string; gradient: string }> = {
  חזה: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    gradient: "from-blue-500 to-blue-600",
  },
  גב: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-emerald-600",
  },
  טרפזים: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-amber-600",
  },
  כתפיים: {
    bg: "bg-purple-50",
    text: "text-purple-700 dark:text-purple-300",
    gradient: "from-purple-500 to-purple-600",
  },
  "יד קידמית": {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    gradient: "from-cyan-500 to-cyan-600",
  },
  "יד אחורית": {
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    gradient: "from-teal-500 to-teal-600",
  },
  רגליים: {
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-300",
    gradient: "from-pink-500 to-pink-600",
  },
  ישבן: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    gradient: "from-orange-500 to-orange-600",
  },
  תאומים: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    gradient: "from-indigo-500 to-indigo-600",
  },
  אמות: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-rose-600",
  },
  בטן: {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    text: "text-yellow-700 dark:text-yellow-300",
    gradient: "from-yellow-500 to-yellow-600",
  },
};

export const defaultColor = {
  bg: "bg-slate-50 dark:bg-slate-800",
  text: "text-slate-700 dark:text-slate-200",
  gradient: "from-slate-500 to-slate-600",
};

export const FALLBACK_GROUPS = [
  "חזה",
  "גב",
  "טרפזים",
  "כתפיים",
  "יד קדמית",
  "יד אחורית",
  "רגליים",
  "ישבן",
  "תאומים",
  "אמות",
  "בטן",
];

export const ALL_GROUP_LABEL = "\u05d4\u05db\u05dc";

export type ExerciseGroupColor = typeof defaultColor;

export type ExerciseDetailSet = {
  setNumber: number;
  weight: number;
  reps: number;
  program?: string;
};

export type ExerciseDetailSession = {
  date: string;
  sets: ExerciseDetailSet[];
};

export const MONTH_NAMES = [
  "\u05d9\u05e0\u05d5\u05d0\u05e8",
  "\u05e4\u05d1\u05e8\u05d5\u05d0\u05e8",
  "\u05de\u05e8\u05e5",
  "\u05d0\u05e4\u05e8\u05d9\u05dc",
  "\u05de\u05d0\u05d9",
  "\u05d9\u05d5\u05e0\u05d9",
  "\u05d9\u05d5\u05dc\u05d9",
  "\u05d0\u05d5\u05d2\u05d5\u05e1\u05d8",
  "\u05e1\u05e4\u05d8\u05de\u05d1\u05e8",
  "\u05d0\u05d5\u05e7\u05d8\u05d5\u05d1\u05e8",
  "\u05e0\u05d5\u05d1\u05de\u05d1\u05e8",
  "\u05d3\u05e6\u05de\u05d1\u05e8",
];
