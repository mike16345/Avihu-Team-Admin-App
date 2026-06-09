import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowTrendUp,
  FaDumbbell,
  FaAppleWhole,
  FaHeartPulse,
  FaCamera,
  FaArrowDown,
  FaCalendarDays,
  FaCalendarCheck,
  FaBoltLightning,
  FaWeightScale,
  FaPercent,
  FaChevronDown,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
  FaXmark,
  FaShare,
  FaArrowLeft,
  FaArrowRight,
  FaPencil,
  FaFloppyDisk,
  FaTrash,
  FaClipboardList,
  FaMagnifyingGlass,
  FaEye,
  FaFilter,
  FaCheck,
  FaNoteSticky,
  FaArrowRotateRight,
  FaPaperPlane,
  FaCopy,
  FaPlus,
  FaChevronUp,
  FaClipboardCheck,
  FaPersonRunning,
  FaBold,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaIndent,
  FaOutdent,
  FaAlignRight,
  FaAlignLeft,
  FaAlignCenter,
  FaLink,
  FaEraser,
  FaItalic,
} from "react-icons/fa6";

// Metadata per date (weight + body fat) — for the comparison modal
const dateMetadata: Record<string, { weight?: string; bodyFat?: string }> = {
  "15.1.2026": { weight: "75.2 ק״ג", bodyFat: "28.4%" },
  "15.2.2026": { weight: "73.1 ק״ג", bodyFat: "26.8%" },
  "15.3.2026": { weight: "71.5 ק״ג", bodyFat: "25.1%" },
};

const angleLabels = ["מלפנים", "מאחור", "מהצד ימין", "מהצד שמאל"];

// Strength data — per exercise, progression over time
type MuscleGroup =
  | "חזה"
  | "גב"
  | "טרפזים"
  | "כתפיים"
  | "יד קידמית"
  | "יד אחורית"
  | "רגליים"
  | "ישבן"
  | "תאומים"
  | "אמות"
  | "בטן";

type ExerciseSet = {
  setNumber: number;
  weight: number;
  reps: number;
  time: string; // "10:18:46"
  program?: string; // "אימון A"
};

type ExerciseSession = {
  date: string; // "24/05/2026"
  sets: ExerciseSet[];
};

type ExerciseProgress = {
  name: string;
  group: MuscleGroup;
  sessions: { date: string; weight: number; reps: number }[]; // summary (for overview cards)
  detailed?: ExerciseSession[]; // full set-by-set history (for detail modal)
};

// Sample detailed history for לחיצת חזה במוט
const benchPressDetailed: ExerciseSession[] = [
  {
    date: "12/05/2026",
    sets: [
      { setNumber: 1, weight: 22, reps: 12, time: "10:18:00", program: "אימון A" },
      { setNumber: 2, weight: 25, reps: 12, time: "10:19:30", program: "אימון A" },
      { setNumber: 3, weight: 25, reps: 10, time: "10:21:15", program: "אימון A" },
      { setNumber: 4, weight: 25, reps: 8, time: "10:23:00", program: "אימון A" },
    ],
  },
  {
    date: "19/05/2026",
    sets: [
      { setNumber: 1, weight: 25, reps: 12, time: "11:02:00", program: "אימון A" },
      { setNumber: 2, weight: 27.5, reps: 10, time: "11:03:45", program: "אימון A" },
      { setNumber: 3, weight: 27.5, reps: 10, time: "11:05:30", program: "אימון A" },
      { setNumber: 4, weight: 27.5, reps: 8, time: "11:07:15", program: "אימון A" },
    ],
  },
  {
    date: "24/05/2026",
    sets: [
      { setNumber: 1, weight: 22, reps: 12, time: "10:18:46", program: "אימון A" },
      { setNumber: 2, weight: 25, reps: 12, time: "10:19:39", program: "אימון A" },
      { setNumber: 3, weight: 30, reps: 10, time: "10:21:20", program: "אימון A" },
      { setNumber: 4, weight: 30, reps: 8, time: "10:23:05", program: "אימון A" },
    ],
  },
  {
    date: "31/05/2026",
    sets: [
      { setNumber: 1, weight: 25, reps: 12, time: "09:45:00", program: "אימון A" },
      { setNumber: 2, weight: 30, reps: 10, time: "09:47:00", program: "אימון A" },
      { setNumber: 3, weight: 30, reps: 10, time: "09:49:00", program: "אימון A" },
      { setNumber: 4, weight: 32.5, reps: 8, time: "09:51:00", program: "אימון A" },
    ],
  },
];

const strengthData: ExerciseProgress[] = [
  {
    name: "לחיצת חזה עליון עם משקולות חופשי",
    group: "חזה",
    sessions: [
      { date: "12/05", weight: 25, reps: 8 },
      { date: "19/05", weight: 27.5, reps: 8 },
      { date: "24/05", weight: 30, reps: 8 },
      { date: "31/05", weight: 32.5, reps: 8 },
    ],
    detailed: benchPressDetailed,
  },
  {
    name: "סקוואט מוט",
    group: "רגליים",
    sessions: [
      { date: "12/06", weight: 80, reps: 8 },
      { date: "19/06", weight: 85, reps: 8 },
      { date: "26/06", weight: 90, reps: 8 },
      { date: "03/07", weight: 95, reps: 8 },
      { date: "10/07", weight: 100, reps: 8 },
      { date: "17/07", weight: 105, reps: 8 },
    ],
  },
  {
    name: "דדליפט",
    group: "גב",
    sessions: [
      { date: "13/06", weight: 90, reps: 6 },
      { date: "20/06", weight: 95, reps: 6 },
      { date: "27/06", weight: 100, reps: 6 },
      { date: "04/07", weight: 105, reps: 6 },
      { date: "11/07", weight: 110, reps: 6 },
      { date: "18/07", weight: 120, reps: 5 },
    ],
  },
  {
    name: "מתח רחב",
    group: "גב",
    sessions: [
      { date: "13/06", weight: 0, reps: 6 },
      { date: "20/06", weight: 0, reps: 7 },
      { date: "27/06", weight: 5, reps: 6 },
      { date: "04/07", weight: 5, reps: 8 },
      { date: "11/07", weight: 10, reps: 6 },
      { date: "18/07", weight: 10, reps: 8 },
    ],
  },
  {
    name: "משיכות כתפיים (שראגס)",
    group: "טרפזים",
    sessions: [
      { date: "13/06", weight: 30, reps: 12 },
      { date: "20/06", weight: 35, reps: 12 },
      { date: "27/06", weight: 40, reps: 10 },
      { date: "04/07", weight: 40, reps: 12 },
      { date: "11/07", weight: 45, reps: 10 },
      { date: "18/07", weight: 50, reps: 10 },
    ],
  },
  {
    name: "לחיצת כתפיים במוט",
    group: "כתפיים",
    sessions: [
      { date: "14/06", weight: 35, reps: 8 },
      { date: "21/06", weight: 37.5, reps: 8 },
      { date: "28/06", weight: 40, reps: 8 },
      { date: "05/07", weight: 40, reps: 10 },
      { date: "12/07", weight: 42.5, reps: 8 },
      { date: "19/07", weight: 45, reps: 8 },
    ],
  },
  {
    name: "כפיפת מרפק עם משקולות",
    group: "יד קידמית",
    sessions: [
      { date: "14/06", weight: 10, reps: 10 },
      { date: "21/06", weight: 12, reps: 10 },
      { date: "28/06", weight: 12, reps: 12 },
      { date: "05/07", weight: 14, reps: 10 },
      { date: "12/07", weight: 14, reps: 12 },
      { date: "19/07", weight: 16, reps: 10 },
    ],
  },
  {
    name: "פשיטת מרפק בכבל (טריצפס)",
    group: "יד אחורית",
    sessions: [
      { date: "14/06", weight: 25, reps: 12 },
      { date: "21/06", weight: 27.5, reps: 12 },
      { date: "28/06", weight: 30, reps: 10 },
      { date: "05/07", weight: 30, reps: 12 },
      { date: "12/07", weight: 32.5, reps: 10 },
      { date: "19/07", weight: 35, reps: 10 },
    ],
  },
  {
    name: "היפ ת׳ראסט",
    group: "ישבן",
    sessions: [
      { date: "13/06", weight: 60, reps: 10 },
      { date: "20/06", weight: 70, reps: 10 },
      { date: "27/06", weight: 80, reps: 8 },
      { date: "04/07", weight: 85, reps: 10 },
      { date: "11/07", weight: 90, reps: 10 },
      { date: "18/07", weight: 100, reps: 8 },
    ],
  },
  {
    name: "עליות עקבים בעמידה",
    group: "תאומים",
    sessions: [
      { date: "13/06", weight: 40, reps: 15 },
      { date: "20/06", weight: 45, reps: 15 },
      { date: "27/06", weight: 50, reps: 15 },
      { date: "04/07", weight: 55, reps: 12 },
      { date: "11/07", weight: 60, reps: 12 },
      { date: "18/07", weight: 65, reps: 12 },
    ],
  },
  {
    name: "כפיפת אמות עם מוט",
    group: "אמות",
    sessions: [
      { date: "14/06", weight: 15, reps: 12 },
      { date: "21/06", weight: 17.5, reps: 12 },
      { date: "28/06", weight: 17.5, reps: 15 },
      { date: "05/07", weight: 20, reps: 12 },
      { date: "12/07", weight: 22.5, reps: 10 },
      { date: "19/07", weight: 22.5, reps: 12 },
    ],
  },
  {
    name: "פלאנק",
    group: "בטן",
    sessions: [
      { date: "14/06", weight: 0, reps: 30 },
      { date: "21/06", weight: 0, reps: 45 },
      { date: "28/06", weight: 0, reps: 60 },
      { date: "05/07", weight: 0, reps: 75 },
      { date: "12/07", weight: 0, reps: 90 },
      { date: "19/07", weight: 0, reps: 120 },
    ],
  },
  {
    name: "כפיפת בטן עם משקל",
    group: "בטן",
    sessions: [
      { date: "14/06", weight: 5, reps: 15 },
      { date: "21/06", weight: 7.5, reps: 15 },
      { date: "28/06", weight: 10, reps: 12 },
      { date: "05/07", weight: 10, reps: 15 },
      { date: "12/07", weight: 12.5, reps: 12 },
      { date: "19/07", weight: 15, reps: 10 },
    ],
  },
];

// Diet plan data
type MealItem = { amount: number; mode: "קבוע" | "בחירה" };
type DietMeal = {
  id: string;
  name: string;
  protein: MealItem;
  carbs: MealItem;
  fats: MealItem;
  vegetables: MealItem;
};

const initialMeals: DietMeal[] = [
  {
    id: "m-1",
    name: "ארוחה 1 — בוקר",
    protein: { amount: 2, mode: "קבוע" },
    carbs: { amount: 3, mode: "בחירה" },
    fats: { amount: 1, mode: "קבוע" },
    vegetables: { amount: 1, mode: "בחירה" },
  },
  {
    id: "m-2",
    name: "ארוחה 2 — לפני אימון",
    protein: { amount: 1, mode: "קבוע" },
    carbs: { amount: 2, mode: "קבוע" },
    fats: { amount: 0, mode: "קבוע" },
    vegetables: { amount: 0, mode: "קבוע" },
  },
  {
    id: "m-3",
    name: "ארוחה 3 — צהריים",
    protein: { amount: 3, mode: "קבוע" },
    carbs: { amount: 3, mode: "בחירה" },
    fats: { amount: 2, mode: "קבוע" },
    vegetables: { amount: 2, mode: "בחירה" },
  },
  {
    id: "m-4",
    name: "ארוחה 4 — ערב",
    protein: { amount: 2, mode: "קבוע" },
    carbs: { amount: 1, mode: "בחירה" },
    fats: { amount: 1, mode: "קבוע" },
    vegetables: { amount: 2, mode: "בחירה" },
  },
];

// Diet notes templates — common notes a trainer might want to add quickly
type NoteCategory = "שתייה" | "תזמון" | "מומלץ" | "להימנע" | "אורח חיים";

type DietNote = {
  id: string;
  category: NoteCategory;
  text: string;
};

const noteTemplates: { category: NoteCategory; items: string[] }[] = [
  {
    category: "שתייה",
    items: [
      "לשתות 3-4 ליטר מים ביום",
      "להימנע ממשקאות ממותקים וסודה",
      "קפה — עד 3 כוסות ביום, ללא סוכר",
      "תה ירוק מומלץ במהלך היום",
    ],
  },
  {
    category: "תזמון",
    items: [
      "לאכול כל 3-4 שעות",
      "ארוחה אחרונה לא יאוחר משעה 21:00",
      "ארוחה 60-90 דקות לפני אימון",
      "ארוחת התאוששות תוך 30 דקות מסיום אימון",
    ],
  },
  {
    category: "מומלץ",
    items: [
      "לשלב חלבון בכל ארוחה",
      "להעדיף בישול ביתי על אוכל מוכן",
      "ירקות בכמות חופשית בכל ארוחה",
      "להוסיף שמן זית איכותי לסלטים",
    ],
  },
  {
    category: "להימנע",
    items: ["סוכר מעובד וממתקים", "מאפים תעשייתיים", "אלכוהול בכל הימים", "מזון מטוגן ושמן רווי"],
  },
  {
    category: "אורח חיים",
    items: [
      "שינה של 7-9 שעות בלילה",
      "1-2 ימי חופש מהאוכל בשבוע (refeed)",
      "לתעד את הארוחות באפליקציה",
      "להישקל פעם בשבוע, באותו יום ובאותה שעה",
    ],
  },
];

const initialDietNotes: DietNote[] = [
  { id: "dn-1", category: "שתייה", text: "לשתות 3-4 ליטר מים ביום" },
  { id: "dn-2", category: "תזמון", text: "ארוחה 60-90 דקות לפני אימון" },
];

// Supplements catalog and recommendations
type SupplementCategory = "חלבון" | "ויטמינים" | "התאוששות" | "ביצועים" | "פיברים";

type Supplement = {
  id: string;
  name: string;
  category: SupplementCategory;
  dosage: string;
  timing: string;
  notes?: string;
};

const supplementCatalog: {
  id: string;
  name: string;
  category: SupplementCategory;
  defaultDosage: string;
  defaultTiming: string;
  icon: string;
}[] = [
  // חלבון
  {
    id: "sc-1",
    name: "אבקת חלבון Whey",
    category: "חלבון",
    defaultDosage: "30 גרם",
    defaultTiming: "אחרי אימון",
    icon: "🥛",
  },
  {
    id: "sc-2",
    name: "אבקת חלבון קזאין",
    category: "חלבון",
    defaultDosage: "30 גרם",
    defaultTiming: "לפני שינה",
    icon: "🌙",
  },
  {
    id: "sc-3",
    name: "BCAA",
    category: "חלבון",
    defaultDosage: "10 גרם",
    defaultTiming: "במהלך אימון",
    icon: "💪",
  },
  // ויטמינים
  {
    id: "sc-4",
    name: "מולטי-ויטמין",
    category: "ויטמינים",
    defaultDosage: "טבליה אחת",
    defaultTiming: "בוקר עם האוכל",
    icon: "💊",
  },
  {
    id: "sc-5",
    name: "ויטמין D3",
    category: "ויטמינים",
    defaultDosage: "2000 IU",
    defaultTiming: "בוקר",
    icon: "☀️",
  },
  {
    id: "sc-6",
    name: "אומגה 3",
    category: "ויטמינים",
    defaultDosage: "2 קפסולות",
    defaultTiming: "עם ארוחה",
    icon: "🐟",
  },
  {
    id: "sc-7",
    name: "מגנזיום",
    category: "ויטמינים",
    defaultDosage: "300-400 מ״ג",
    defaultTiming: "לפני שינה",
    icon: "🌿",
  },
  // התאוששות
  {
    id: "sc-8",
    name: "גלוטמין",
    category: "התאוששות",
    defaultDosage: "5-10 גרם",
    defaultTiming: "אחרי אימון / לפני שינה",
    icon: "🛌",
  },
  {
    id: "sc-9",
    name: "ZMA",
    category: "התאוששות",
    defaultDosage: "מינון מלא",
    defaultTiming: "לפני שינה",
    icon: "💤",
  },
  // ביצועים
  {
    id: "sc-10",
    name: "קריאטין",
    category: "ביצועים",
    defaultDosage: "5 גרם",
    defaultTiming: "כל יום באותה שעה",
    icon: "⚡",
  },
  {
    id: "sc-11",
    name: "Pre-Workout",
    category: "ביצועים",
    defaultDosage: "מנה אחת",
    defaultTiming: "20-30 דק׳ לפני אימון",
    icon: "🔥",
  },
  {
    id: "sc-12",
    name: "קפאין",
    category: "ביצועים",
    defaultDosage: "200 מ״ג",
    defaultTiming: "לפני אימון",
    icon: "☕",
  },
  // פיברים
  {
    id: "sc-13",
    name: "פיברים תזונתיים",
    category: "פיברים",
    defaultDosage: "5 גרם",
    defaultTiming: "בוקר",
    icon: "🌾",
  },
  {
    id: "sc-14",
    name: "פרוביוטיקה",
    category: "פיברים",
    defaultDosage: "קפסולה אחת",
    defaultTiming: "בוקר על קיבה ריקה",
    icon: "🦠",
  },
];

const initialSupplements: Supplement[] = [
  {
    id: "sup-1",
    name: "אבקת חלבון Whey",
    category: "חלבון",
    dosage: "30 גרם",
    timing: "אחרי אימון",
  },
  {
    id: "sup-2",
    name: "קריאטין",
    category: "ביצועים",
    dosage: "5 גרם",
    timing: "כל יום באותה שעה",
  },
  {
    id: "sup-3",
    name: "אומגה 3",
    category: "ויטמינים",
    dosage: "2 קפסולות",
    timing: "עם ארוחת בוקר",
  },
];

const supplementCategoryColors: Record<
  SupplementCategory,
  { bg: string; text: string; gradient: string }
> = {
  חלבון: { bg: "bg-blue-100", text: "text-blue-700", gradient: "from-blue-500 to-indigo-600" },
  ויטמינים: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    gradient: "from-amber-500 to-orange-600",
  },
  התאוששות: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    gradient: "from-purple-500 to-fuchsia-600",
  },
  ביצועים: { bg: "bg-rose-100", text: "text-rose-700", gradient: "from-rose-500 to-red-600" },
  פיברים: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    gradient: "from-emerald-500 to-teal-600",
  },
};

const noteCategoryColors: Record<
  NoteCategory,
  { bg: string; text: string; gradient: string; emoji: string }
> = {
  שתייה: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    gradient: "from-blue-500 to-indigo-600",
    emoji: "💧",
  },
  תזמון: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    gradient: "from-purple-500 to-fuchsia-600",
    emoji: "⏰",
  },
  מומלץ: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "✅",
  },
  להימנע: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    gradient: "from-rose-500 to-red-600",
    emoji: "🚫",
  },
  "אורח חיים": {
    bg: "bg-amber-100",
    text: "text-amber-700",
    gradient: "from-amber-500 to-orange-600",
    emoji: "🌿",
  },
};

// Approximate calories per "unit" (serving) — for the macro summary
const macrosPerUnit = {
  protein: {
    kcal: 150,
    color: "bg-blue-50 ring-blue-200 text-blue-700",
    barColor: "bg-blue-500",
    icon: "ח",
    label: "חלבון",
  },
  carbs: {
    kcal: 115,
    color: "bg-orange-50 ring-orange-200 text-orange-700",
    barColor: "bg-orange-500",
    icon: "פ",
    label: "פחמימות",
  },
  fats: {
    kcal: 100,
    color: "bg-amber-50 ring-amber-200 text-amber-700",
    barColor: "bg-amber-500",
    icon: "ש",
    label: "שומנים",
  },
  vegetables: {
    kcal: 25,
    color: "bg-emerald-50 ring-emerald-200 text-emerald-700",
    barColor: "bg-emerald-500",
    icon: "י",
    label: "ירקות",
  },
};

// Workout plan data
type WorkoutSet = {
  setNumber: number;
  minReps: number;
  maxReps: number;
};

type WorkoutExercise = {
  id: string;
  catalogId: string;
  method: string;
  restSeconds: number;
  sets: WorkoutSet[];
};

type WorkoutMuscleGroup = {
  id: string;
  group: MuscleGroup;
  exercises: WorkoutExercise[];
};

type Workout = {
  id: string;
  name: string;
  muscleGroups: WorkoutMuscleGroup[];
};

// Exercise catalog (the "library" the trainer picks from)
type CatalogExercise = {
  id: string;
  name: string;
  group: MuscleGroup;
  image: string; // url or data URI
};

// Helper — build a simple SVG illustration with a dumbbell + label, as a data URI
const buildExerciseImage = (label: string, _gradient: [string, string]) => {
  const short = label.length > 16 ? label.slice(0, 14) + "…" : label;
  const dumbbellPath =
    "M104 96V72c0-8.8-7.2-16-16-16H72C63.2 56 56 63.2 56 72v24H40c-8.8 0-16 7.2-16 16v32H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h16v32c0 8.8 7.2 16 16 16h16v24c0 8.8 7.2 16 16 16h16c8.8 0 16-7.2 16-16v-24h208v24c0 8.8 7.2 16 16 16h16c8.8 0 16-7.2 16-16v-24h16c8.8 0 16-7.2 16-16v-32h16c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8h-16v-32c0-8.8-7.2-16-16-16h-16V72c0-8.8-7.2-16-16-16h-16c-8.8 0-16 7.2-16 16v24H104z";
  // Soft neutral background — clean & professional, not loud
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="400" height="240" rx="20" fill="#f1f5f9"/><g transform="translate(110 30) scale(0.45)" opacity="0.5"><path d="${dumbbellPath}" fill="#64748b"/></g><text x="200" y="200" font-family="Heebo, sans-serif" font-size="22" font-weight="600" text-anchor="middle" fill="#475569">${short}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const exerciseCatalog: CatalogExercise[] = [
  // חזה
  {
    id: "ec-1",
    name: "לחיצת חזה עם מוט",
    group: "חזה",
    image: buildExerciseImage("לחיצת חזה", ["#3b82f6", "#6366f1"]),
  },
  {
    id: "ec-2",
    name: "לחיצת חזה עליון עם משקולות חופשי",
    group: "חזה",
    image: buildExerciseImage("לחיצת עליון", ["#3b82f6", "#6366f1"]),
  },
  {
    id: "ec-3",
    name: "פרפר בכבל קרוס בעמידה (דגש אמצעי)",
    group: "חזה",
    image: buildExerciseImage("פרפר כבל", ["#3b82f6", "#6366f1"]),
  },
  {
    id: "ec-4",
    name: "לחיצת חזה במכונה",
    group: "חזה",
    image: buildExerciseImage("לחיצת מכונה", ["#3b82f6", "#6366f1"]),
  },
  {
    id: "ec-5",
    name: "פלייז עם משקולות",
    group: "חזה",
    image: buildExerciseImage("פלייז", ["#3b82f6", "#6366f1"]),
  },
  // גב
  {
    id: "ec-6",
    name: "דדליפט",
    group: "גב",
    image: buildExerciseImage("דדליפט", ["#10b981", "#0d9488"]),
  },
  {
    id: "ec-7",
    name: "מתח רחב",
    group: "גב",
    image: buildExerciseImage("מתח", ["#10b981", "#0d9488"]),
  },
  {
    id: "ec-8",
    name: "פולי עליון",
    group: "גב",
    image: buildExerciseImage("פולי", ["#10b981", "#0d9488"]),
  },
  {
    id: "ec-9",
    name: "חתירה בכבל",
    group: "גב",
    image: buildExerciseImage("חתירה כבל", ["#10b981", "#0d9488"]),
  },
  {
    id: "ec-10",
    name: "חתירה במוט",
    group: "גב",
    image: buildExerciseImage("חתירה מוט", ["#10b981", "#0d9488"]),
  },
  // טרפזים
  {
    id: "ec-11",
    name: "משיכות כתפיים (שראגס)",
    group: "טרפזים",
    image: buildExerciseImage("שראגס", ["#14b8a6", "#0891b2"]),
  },
  {
    id: "ec-12",
    name: "משיכה לסנטר",
    group: "טרפזים",
    image: buildExerciseImage("משיכה", ["#14b8a6", "#0891b2"]),
  },
  // כתפיים
  {
    id: "ec-13",
    name: "לחיצת כתפיים במוט",
    group: "כתפיים",
    image: buildExerciseImage("לחיצת כתף", ["#f97316", "#d97706"]),
  },
  {
    id: "ec-14",
    name: "הרמות צד עם משקולות",
    group: "כתפיים",
    image: buildExerciseImage("הרמות צד", ["#f97316", "#d97706"]),
  },
  {
    id: "ec-15",
    name: "הרמות קדמיות",
    group: "כתפיים",
    image: buildExerciseImage("הרמות קד׳", ["#f97316", "#d97706"]),
  },
  // יד קידמית
  {
    id: "ec-16",
    name: "כפיפת מרפק עם משקולות",
    group: "יד קידמית",
    image: buildExerciseImage("כפיפת מרפק", ["#ec4899", "#e11d48"]),
  },
  {
    id: "ec-17",
    name: "כפיפת מרפק עם מוט",
    group: "יד קידמית",
    image: buildExerciseImage("מרפק מוט", ["#ec4899", "#e11d48"]),
  },
  {
    id: "ec-18",
    name: "פטיש (Hammer Curl)",
    group: "יד קידמית",
    image: buildExerciseImage("פטיש", ["#ec4899", "#e11d48"]),
  },
  // יד אחורית
  {
    id: "ec-19",
    name: "פשיטת מרפק בכבל (טריצפס)",
    group: "יד אחורית",
    image: buildExerciseImage("טריצפס כבל", ["#f43f5e", "#dc2626"]),
  },
  {
    id: "ec-20",
    name: "פשיטה מאחורי הראש",
    group: "יד אחורית",
    image: buildExerciseImage("פשיטה אח׳", ["#f43f5e", "#dc2626"]),
  },
  {
    id: "ec-21",
    name: "מקבילים",
    group: "יד אחורית",
    image: buildExerciseImage("מקבילים", ["#f43f5e", "#dc2626"]),
  },
  // רגליים
  {
    id: "ec-22",
    name: "סקוואט מוט",
    group: "רגליים",
    image: buildExerciseImage("סקוואט", ["#a855f7", "#c026d3"]),
  },
  {
    id: "ec-23",
    name: "פרסה (Leg Press)",
    group: "רגליים",
    image: buildExerciseImage("פרסה", ["#a855f7", "#c026d3"]),
  },
  {
    id: "ec-24",
    name: "פשיטת ברך",
    group: "רגליים",
    image: buildExerciseImage("פשיטת ברך", ["#a855f7", "#c026d3"]),
  },
  {
    id: "ec-25",
    name: "כפיפת ברך",
    group: "רגליים",
    image: buildExerciseImage("כפיפת ברך", ["#a855f7", "#c026d3"]),
  },
  {
    id: "ec-26",
    name: "לאנג'ים",
    group: "רגליים",
    image: buildExerciseImage("לאנג׳ים", ["#a855f7", "#c026d3"]),
  },
  // ישבן
  {
    id: "ec-27",
    name: "היפ ת׳ראסט",
    group: "ישבן",
    image: buildExerciseImage("היפ ת׳", ["#8b5cf6", "#7c3aed"]),
  },
  {
    id: "ec-28",
    name: "סקוואט גביעי",
    group: "ישבן",
    image: buildExerciseImage("גביעי", ["#8b5cf6", "#7c3aed"]),
  },
  {
    id: "ec-29",
    name: "ברידג'",
    group: "ישבן",
    image: buildExerciseImage("ברידג", ["#8b5cf6", "#7c3aed"]),
  },
  // תאומים
  {
    id: "ec-30",
    name: "עליות עקבים בעמידה",
    group: "תאומים",
    image: buildExerciseImage("עקבים עמ׳", ["#06b6d4", "#0284c7"]),
  },
  {
    id: "ec-31",
    name: "עליות עקבים בישיבה",
    group: "תאומים",
    image: buildExerciseImage("עקבים יש׳", ["#06b6d4", "#0284c7"]),
  },
  // אמות
  {
    id: "ec-32",
    name: "כפיפת אמות עם מוט",
    group: "אמות",
    image: buildExerciseImage("אמות מוט", ["#f59e0b", "#ca8a04"]),
  },
  {
    id: "ec-33",
    name: "פשיטת אמות",
    group: "אמות",
    image: buildExerciseImage("אמות פש׳", ["#f59e0b", "#ca8a04"]),
  },
  // בטן
  {
    id: "ec-34",
    name: "פלאנק",
    group: "בטן",
    image: buildExerciseImage("פלאנק", ["#64748b", "#475569"]),
  },
  {
    id: "ec-35",
    name: "כפיפת בטן עם משקל",
    group: "בטן",
    image: buildExerciseImage("כפיפת בטן", ["#64748b", "#475569"]),
  },
  {
    id: "ec-36",
    name: "רגליים תלויות",
    group: "בטן",
    image: buildExerciseImage("רגליים", ["#64748b", "#475569"]),
  },
];

const workoutMethods = [
  "סטנדרטי",
  "אימון פירמידה (Pyramid Training)",
  "סופרסט (Superset)",
  "ג'יאנט סט (Giant Set)",
  "דרופ סט (Drop Set)",
  "Rest Pause",
  "Cluster Sets",
];

const workoutPlan: Workout[] = [
  {
    id: "w-a",
    name: "אימון A",
    muscleGroups: [
      {
        id: "wmg-1",
        group: "חזה",
        exercises: [
          {
            id: "e-1",
            catalogId: "ec-1",
            method: "אימון פירמידה (Pyramid Training)",
            restSeconds: 60,
            sets: [
              { setNumber: 1, minReps: 12, maxReps: 15 },
              { setNumber: 2, minReps: 10, maxReps: 12 },
              { setNumber: 3, minReps: 8, maxReps: 10 },
              { setNumber: 4, minReps: 8, maxReps: 10 },
            ],
          },
          {
            id: "e-2",
            catalogId: "ec-2",
            method: "סטנדרטי",
            restSeconds: 75,
            sets: [
              { setNumber: 1, minReps: 10, maxReps: 12 },
              { setNumber: 2, minReps: 10, maxReps: 12 },
              { setNumber: 3, minReps: 8, maxReps: 10 },
            ],
          },
          {
            id: "e-3",
            catalogId: "ec-3",
            method: "דרופ סט (Drop Set)",
            restSeconds: 45,
            sets: [
              { setNumber: 1, minReps: 12, maxReps: 15 },
              { setNumber: 2, minReps: 10, maxReps: 12 },
              { setNumber: 3, minReps: 10, maxReps: 12 },
            ],
          },
        ],
      },
      {
        id: "wmg-2",
        group: "יד אחורית",
        exercises: [
          {
            id: "e-4",
            catalogId: "ec-19",
            method: "סופרסט (Superset)",
            restSeconds: 60,
            sets: [
              { setNumber: 1, minReps: 10, maxReps: 12 },
              { setNumber: 2, minReps: 10, maxReps: 12 },
              { setNumber: 3, minReps: 8, maxReps: 10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "w-b",
    name: "אימון B",
    muscleGroups: [
      {
        id: "wmg-3",
        group: "גב",
        exercises: [
          {
            id: "e-5",
            catalogId: "ec-6",
            method: "אימון פירמידה (Pyramid Training)",
            restSeconds: 120,
            sets: [
              { setNumber: 1, minReps: 8, maxReps: 10 },
              { setNumber: 2, minReps: 6, maxReps: 8 },
              { setNumber: 3, minReps: 5, maxReps: 6 },
              { setNumber: 4, minReps: 5, maxReps: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "w-c",
    name: "אימון C",
    muscleGroups: [
      {
        id: "wmg-4",
        group: "רגליים",
        exercises: [
          {
            id: "e-6",
            catalogId: "ec-22",
            method: "סטנדרטי",
            restSeconds: 90,
            sets: [
              { setNumber: 1, minReps: 10, maxReps: 12 },
              { setNumber: 2, minReps: 8, maxReps: 10 },
              { setNumber: 3, minReps: 8, maxReps: 10 },
              { setNumber: 4, minReps: 6, maxReps: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "w-d",
    name: "אימון בטן",
    muscleGroups: [
      {
        id: "wmg-5",
        group: "בטן",
        exercises: [
          {
            id: "e-7",
            catalogId: "ec-34",
            method: "סטנדרטי",
            restSeconds: 30,
            sets: [
              { setNumber: 1, minReps: 60, maxReps: 90 },
              { setNumber: 2, minReps: 60, maxReps: 90 },
              { setNumber: 3, minReps: 60, maxReps: 90 },
            ],
          },
        ],
      },
    ],
  },
];

// Forms (questionnaires) data
type FormSection = { title: string; fields: { question: string; answer: string }[] };

type FormResponse = {
  id: string;
  formName: string;
  formType: "התחלה" | "ביניים" | "סיום ליווי" | "התאמה מקצועית";
  respondent: string;
  date: string;
  viewed: boolean;
  sections: FormSection[];
};

const formResponses: FormResponse[] = [
  {
    id: "f1",
    formName: "שאלון התאמה מקצועי למתאמן",
    formType: "התחלה",
    respondent: "שרון אבוחצירה",
    date: "06/05/2026",
    viewed: false,
    sections: [
      {
        title: "פרטי המתאמן",
        fields: [
          { question: "אימייל", answer: "Sharolga@gmail.com" },
          { question: "שם מלא", answer: "שרון אבוחצירא" },
          { question: "גיל", answer: "48" },
          { question: "גובה", answer: "170" },
          { question: "משקל", answer: "90" },
          { question: "מין", answer: "זכר" },
          { question: "עיר", answer: "נדרה" },
        ],
      },
      {
        title: "הגדרת מטרה ספציפית",
        fields: [
          { question: "מה המטרה הראשית שלך?", answer: "ירידה במשקל" },
          { question: "תוך כמה זמן תרצה להגיע אליה?", answer: "6 חודשים" },
          { question: "האם יש לך משקל יעד?", answer: "75 ק״ג" },
        ],
      },
      {
        title: "התאמת תזונה אישית",
        fields: [
          { question: "האם יש לך אלרגיות?", answer: "ללא" },
          { question: "סוג תפריט מועדף", answer: "רגיל" },
          { question: "מספר ארוחות ביום", answer: "4" },
        ],
      },
      {
        title: "התאמה אישית של האימונים",
        fields: [
          { question: "כמה פעמים בשבוע תתאמן?", answer: "4" },
          { question: "האם יש פציעות / מגבלות?", answer: "כאבי ברך קלים" },
          { question: "ניסיון קודם באימונים?", answer: "כן, שנתיים" },
        ],
      },
      {
        title: "מוטיבציה",
        fields: [{ question: "את/ה מרחק נגיעה מלעשות את השינוי המטורף הזה!", answer: "מוכן 100%" }],
      },
    ],
  },
  {
    id: "f2",
    formName: "שאלון ביניים — חודש ראשון",
    formType: "ביניים",
    respondent: "שרון אבוחצירה",
    date: "06/06/2026",
    viewed: true,
    sections: [
      {
        title: "מצב נוכחי",
        fields: [
          { question: "איך אתה מרגיש החודש?", answer: "מצוין, יש אנרגיה" },
          { question: "האם עמדת בתוכנית התזונה?", answer: "85% מהזמן" },
          { question: "כמה אימונים השלמת?", answer: "16 מתוך 16" },
        ],
      },
    ],
  },
];

const muscleGroupColors: Record<MuscleGroup, { bg: string; text: string; gradient: string }> = {
  חזה: { bg: "bg-blue-100", text: "text-blue-700", gradient: "from-blue-500 to-indigo-600" },
  גב: { bg: "bg-emerald-100", text: "text-emerald-700", gradient: "from-emerald-500 to-teal-600" },
  טרפזים: { bg: "bg-teal-100", text: "text-teal-700", gradient: "from-teal-500 to-cyan-600" },
  כתפיים: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    gradient: "from-orange-500 to-amber-600",
  },
  "יד קידמית": { bg: "bg-pink-100", text: "text-pink-700", gradient: "from-pink-500 to-rose-600" },
  "יד אחורית": { bg: "bg-rose-100", text: "text-rose-700", gradient: "from-rose-500 to-red-600" },
  רגליים: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    gradient: "from-purple-500 to-fuchsia-600",
  },
  ישבן: { bg: "bg-violet-100", text: "text-violet-700", gradient: "from-violet-500 to-purple-600" },
  תאומים: { bg: "bg-cyan-100", text: "text-cyan-700", gradient: "from-cyan-500 to-sky-600" },
  אמות: { bg: "bg-amber-100", text: "text-amber-700", gradient: "from-amber-500 to-yellow-600" },
  בטן: { bg: "bg-slate-200", text: "text-slate-700", gradient: "from-slate-500 to-slate-700" },
};

// Body measurements over time (cm)
type Measurement = {
  date: string;
  chest: number;
  arm: number;
  waist: number;
  buttocks: number;
  thigh: number;
  calves: number;
};

const measurementsData: Measurement[] = [
  { date: "12/05/2026", chest: 107, arm: 42, waist: 104, buttocks: 109, thigh: 61, calves: 39 },
  { date: "12/06/2026", chest: 106, arm: 42, waist: 102, buttocks: 108, thigh: 61, calves: 39 },
  { date: "12/07/2026", chest: 105, arm: 43, waist: 100, buttocks: 107, thigh: 60, calves: 39 },
  { date: "12/08/2026", chest: 104, arm: 43, waist: 98, buttocks: 106, thigh: 60, calves: 40 },
  { date: "12/09/2026", chest: 103, arm: 44, waist: 96, buttocks: 105, thigh: 60, calves: 40 },
];

const photoGroups: { date: string; photos: { label: string; url?: string }[] }[] = [
  {
    date: "15.1.2026",
    photos: [
      { label: "מלפנים" },
      { label: "מאחור" },
      { label: "מהצד ימין" },
      { label: "מהצד שמאל" },
    ],
  },
  {
    date: "15.2.2026",
    photos: [
      { label: "מלפנים" },
      { label: "מאחור" },
      { label: "מהצד ימין" },
      { label: "מהצד שמאל" },
    ],
  },
  {
    date: "15.3.2026",
    photos: [
      { label: "מלפנים" },
      { label: "מאחור" },
      { label: "מהצד ימין" },
      { label: "מהצד שמאל" },
    ],
  },
];

const weighings: Record<number, number | "x"> = {
  1: "x",
  2: "x",
  3: "x",
  4: "x",
  5: "x",
  6: 90,
  7: 90,
  8: 90,
  9: 90,
  10: 90,
  11: 90,
  12: 91,
  13: 90,
  14: 89.8,
  15: 90,
  16: 90.6,
  17: 90.6,
  18: 90.4,
  19: "x",
  20: 90.6,
  21: 90.4,
  22: 90.4,
  23: 91,
  24: 92,
  25: 92.1,
  26: 91.6,
  27: "x",
  28: 91.6,
  29: "x",
};
const DAYS_IN_MONTH = 31; // May
const FIRST_WEEKDAY_OFFSET = 5; // May 1, 2026 starts on Friday (Su=0,...,Fr=5)
const SELECTED_DAY = 29;

function WeightChart() {
  const points = Object.entries(weighings)
    .filter(([, v]) => typeof v === "number")
    .map(([d, v]) => ({ day: Number(d), weight: v as number }))
    .sort((a, b) => a.day - b.day);

  const [hover, setHover] = useState<{ x: number; y: number; day: number; weight: number } | null>(
    null
  );

  if (points.length === 0) return null;

  const W = 600;
  const H = 280;
  const padTop = 20;
  const padBottom = 36;
  const padLeft = 36;
  const padRight = 16;

  const weights = points.map((p) => p.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const minD = points[0].day;
  const maxD = points[points.length - 1].day;

  const x = (day: number) =>
    padLeft + ((day - minD) / Math.max(1, maxD - minD)) * (W - padLeft - padRight);
  const y = (w: number) =>
    padTop + (1 - (w - minW) / Math.max(0.1, maxW - minW)) * (H - padTop - padBottom);

  // Smooth cubic-bezier path through points (Catmull-Rom → bezier)
  const coords = points.map((p) => ({ x: x(p.day), y: y(p.weight) }));
  let linePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];
    const smoothing = 0.18;
    const cp1x = p1.x + (p2.x - p0.x) * smoothing;
    const cp1y = p1.y + (p2.y - p0.y) * smoothing;
    const cp2x = p2.x - (p3.x - p1.x) * smoothing;
    const cp2y = p2.y - (p3.y - p1.y) * smoothing;
    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  const areaPath =
    linePath +
    ` L ${x(maxD).toFixed(1)} ${H - padBottom} L ${x(minD).toFixed(1)} ${H - padBottom} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    (minW + ((maxW - minW) * i) / yTicks).toFixed(1)
  );
  const xLabels = points.filter((_, i) => i % Math.ceil(points.length / 8) === 0);

  return (
    <div
      dir="ltr"
      className="relative h-full w-full rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30"
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full">
        <defs>
          <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid lines */}
        {yLabels.map((label, i) => {
          const gy = padTop + ((H - padTop - padBottom) * i) / yTicks;
          return (
            <g key={i}>
              <line
                x1={padLeft}
                x2={W - padRight}
                y1={gy}
                y2={gy}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={padLeft - 6}
                y={gy + 3}
                fontSize="9"
                fill="#94a3b8"
                textAnchor="end"
                fontFamily="Heebo, sans-serif"
              >
                {yLabels[yLabels.length - 1 - i]}
              </text>
            </g>
          );
        })}

        {/* area + smooth line */}
        <path d={areaPath} fill="url(#weightArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* points (with hover) */}
        {points.map((p) => (
          <g
            key={p.day}
            onMouseEnter={() =>
              setHover({ x: x(p.day), y: y(p.weight), day: p.day, weight: p.weight })
            }
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          >
            <circle cx={x(p.day)} cy={y(p.weight)} r="8" fill="transparent" />
            <circle
              cx={x(p.day)}
              cy={y(p.weight)}
              r={hover?.day === p.day ? "4" : "2.8"}
              fill="#fff"
              stroke="#10b981"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* x-axis labels */}
        {xLabels.map((p) => (
          <text
            key={p.day}
            x={x(p.day)}
            y={H - padBottom + 16}
            fontSize="9"
            fill="#94a3b8"
            textAnchor="middle"
            fontFamily="Heebo, sans-serif"
          >
            {String(p.day).padStart(2, "0")}/05
          </text>
        ))}
      </svg>

      {/* Tooltip on hover */}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: `${(hover.y / H) * 100}%`,
            marginTop: "-8px",
          }}
          dir="rtl"
        >
          <p className="font-bold">{hover.weight} ק״ג</p>
          <p className="text-[10px] text-slate-300">{String(hover.day).padStart(2, "0")}/05/2026</p>
          <div
            className="absolute left-1/2 top-full -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "4px solid #0f172a",
            }}
          />
        </div>
      )}
    </div>
  );
}

type MainTab = "profile" | "progress" | "workout" | "diet" | "forms";
type ProgressTab = "weight" | "measurements" | "strength" | "photos";

const mainTabs: {
  id: MainTab;
  label: string;
  description: string;
  icon: JSX.Element;
  accent: string;
}[] = [
  {
    id: "progress",
    label: "התקדמות",
    description: "מעקב שקילה, מדידות, כוח ותמונות",
    icon: <FaArrowTrendUp size={20} />,
    accent: "from-blue-500 to-indigo-600 shadow-blue-500/30",
  },
  {
    id: "workout",
    label: "תוכנית אימונים",
    description: "צפייה ועריכה של תוכנית האימון",
    icon: <FaDumbbell size={20} />,
    accent: "from-purple-500 to-fuchsia-600 shadow-purple-500/30",
  },
  {
    id: "diet",
    label: "תפריט תזונה",
    description: "צפייה ועריכה של תפריט התזונה",
    icon: <FaAppleWhole size={20} />,
    accent: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  },
  {
    id: "forms",
    label: "שאלונים",
    description: "שאלונים שמילא המתאמן",
    icon: <FaClipboardList size={20} />,
    accent: "from-amber-500 to-orange-600 shadow-amber-500/30",
  },
];

const progressTabs: { id: ProgressTab; label: string; icon: JSX.Element }[] = [
  { id: "weight", label: "משקל", icon: <FaWeightScale size={12} /> },
  { id: "measurements", label: "מדידות", icon: <FaHeartPulse size={12} /> },
  { id: "strength", label: "כוח", icon: <FaBoltLightning size={12} /> },
  { id: "photos", label: "תמונות התקדמות", icon: <FaCamera size={12} /> },
];

type StatColor = "blue" | "purple" | "green" | "orange";

const weightStats: {
  label: string;
  value: string;
  trend: null | "down" | "up";
  sub: string;
  icon: JSX.Element;
  color: StatColor;
}[] = [
  {
    label: "משקל נוכחי",
    value: "70.8 ק״ג",
    trend: null,
    sub: "מתעדכן אוטומטית",
    icon: <FaWeightScale size={20} />,
    color: "blue",
  },
  {
    label: "שינוי מההתחלה",
    value: "4.4 ק״ג",
    trend: "down",
    sub: "ירידה מתחילת ליווי",
    icon: <FaArrowDown size={20} />,
    color: "green",
  },
  {
    label: "שינוי 30 יום",
    value: "1.7 ק״ג",
    trend: "down",
    sub: "החודש האחרון",
    icon: <FaArrowTrendUp size={20} />,
    color: "purple",
  },
  {
    label: "אחוז שומן",
    value: "24.5%",
    trend: null,
    sub: "מדידה אחרונה",
    icon: <FaPercent size={20} />,
    color: "orange",
  },
];

const iconColorClasses: Record<StatColor, string> = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
};

const user = {
  firstName: "שרון",
  lastName: "אבוחצירה",
  planType: "חיטוב",
  email: "sharon@example.com",
  phone: "050-1234567",
  dateJoined: "05/05/2026",
  dateFinished: "07/02/2027",
  paymentStatus: "שולם",
};

const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();

// Mock trainees list for the navigation flow
const traineesList = [
  {
    id: "t-1",
    firstName: "שרון",
    lastName: "אבוחצירה",
    planType: "חיטוב",
    status: "פעיל" as const,
    dateJoined: "05/05/2026",
    lastActivity: "היום",
    weight: 70.8,
    weightChange: -4.4,
  },
  {
    id: "t-2",
    firstName: "דניאל",
    lastName: "כהן",
    planType: "במסה",
    status: "פעיל" as const,
    dateJoined: "12/03/2026",
    lastActivity: "לפני יומיים",
    weight: 82.5,
    weightChange: +1.8,
  },
  {
    id: "t-3",
    firstName: "מיכל",
    lastName: "לוי",
    planType: "שמירה",
    status: "פעיל" as const,
    dateJoined: "20/01/2026",
    lastActivity: "השבוע",
    weight: 62.3,
    weightChange: -2.1,
  },
  {
    id: "t-4",
    firstName: "יוסי",
    lastName: "פרץ",
    planType: "חיטוב",
    status: "כבוי" as const,
    dateJoined: "01/09/2025",
    lastActivity: "לפני חודש",
    weight: 95.0,
    weightChange: -8.5,
  },
  {
    id: "t-5",
    firstName: "רונית",
    lastName: "אזולאי",
    planType: "התאוששות",
    status: "משתמש" as const,
    dateJoined: "15/04/2026",
    lastActivity: "אתמול",
    weight: 58.4,
    weightChange: -1.2,
  },
  {
    id: "t-6",
    firstName: "אבי",
    lastName: "מזרחי",
    planType: "במסה",
    status: "פעיל" as const,
    dateJoined: "28/02/2026",
    lastActivity: "היום",
    weight: 78.9,
    weightChange: +3.2,
  },
];

function TraineesListPage({ onSelect }: { onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"הכל" | "פעיל" | "כבוי" | "משתמש">("הכל");

  const filtered = traineesList.filter((t) => {
    const matchesSearch =
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      t.planType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "הכל" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, { dot: string; bg: string; text: string }> = {
    פעיל: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    כבוי: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
    משתמש: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">מתאמנים</h1>
          <p className="text-sm text-slate-500">ניהול ומעקב אחרי כל המתאמנים שלך</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            ייצוא CSV
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            <FaPlus size={11} />
            <span>מתאמן חדש</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">סה״כ מתאמנים</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{traineesList.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">פעילים</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {traineesList.filter((t) => t.status === "פעיל").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">לא פעילים</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {traineesList.filter((t) => t.status !== "פעיל").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">חודש זה — הצטרפו</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">2</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FaMagnifyingGlass
            size={12}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או סוג תוכנית"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["הכל", "פעיל", "כבוי", "משתמש"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const initials = (t.firstName[0] + t.lastName[0]).toUpperCase();
          const sc = statusColors[t.status];
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {t.firstName} {t.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{t.planType}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full ${sc.bg} px-2 py-0.5 text-[10px] font-semibold ${sc.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                  {t.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <p className="text-slate-400">משקל נוכחי</p>
                  <p className="mt-0.5 font-bold text-slate-800">{t.weight} ק״ג</p>
                </div>
                <div>
                  <p className="text-slate-400">שינוי</p>
                  <p
                    className={`mt-0.5 font-bold ${t.weightChange < 0 ? "text-emerald-600" : t.weightChange > 0 ? "text-rose-600" : "text-slate-700"}`}
                  >
                    {t.weightChange > 0 ? "+" : ""}
                    {t.weightChange} ק״ג
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">פעילות אחרונה</p>
                  <p className="mt-0.5 font-bold text-slate-800">{t.lastActivity}</p>
                </div>
                <div>
                  <p className="text-slate-400">הצטרף</p>
                  <p className="mt-0.5 font-bold text-slate-800">{t.dateJoined}</p>
                </div>
              </div>
              <div className="mt-1 text-end text-xs font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                לפרופיל מלא ←
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
          לא נמצאו מתאמנים תואמים
        </div>
      )}
    </div>
  );
}

export default function DesignPreview() {
  const [view, setView] = useState<"list" | "trainee">("list");
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);

  if (view === "list") {
    return (
      <div
        dir="rtl"
        className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 px-16 py-10 lg:px-32 xl:px-40"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      >
        <div className="mb-5 rounded-xl border border-dashed border-blue-300 bg-blue-50/70 p-3 text-center text-sm font-semibold text-blue-700">
          🎨 תצוגה מקדימה (Mock — לא מחובר לשרת)
        </div>
        <TraineesListPage
          onSelect={(id) => {
            setSelectedTraineeId(id);
            setView("trainee");
          }}
        />
      </div>
    );
  }

  return <TraineeDetailPage onBack={() => setView("list")} traineeId={selectedTraineeId} />;
}

function TraineeDetailPage({
  onBack,
  traineeId,
}: {
  onBack: () => void;
  traineeId: string | null;
}) {
  const selectedTrainee = traineesList.find((t) => t.id === traineeId) || traineesList[0];
  const [mainTab, setMainTab] = useState<MainTab>("progress");
  const [progressTab, setProgressTab] = useState<ProgressTab>("weight");
  const [planType, setPlanType] = useState<string>(user.planType);
  const [status, setStatus] = useState<string>("פעיל");
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string>>({});
  const [extraGroups, setExtraGroups] = useState<typeof photoGroups>([]);

  // Comparison modal state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareAngle, setCompareAngle] = useState(0);
  const [compareLeftDate, setCompareLeftDate] = useState<string>("");
  const [compareRightDate, setCompareRightDate] = useState<string>("");

  const handlePhotoUpload = (groupDate: string, slot: number, file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedPhotos((prev) => ({ ...prev, [`${groupDate}-${slot}`]: url }));
  };

  const handleBulkUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const today = new Date().toLocaleDateString("he-IL");
    const labels = ["מלפנים", "מאחור", "מהצד ימין", "מהצד שמאל"];

    // Build the new group with up to 4 photos, attach URLs
    const arr = Array.from(files).slice(0, 4);
    const newGroup = {
      date: today,
      photos: labels.map((label) => ({ label })),
    };

    const updates: Record<string, string> = {};
    arr.forEach((file, i) => {
      updates[`${today}-${i}`] = URL.createObjectURL(file);
    });

    setExtraGroups((prev) => {
      // If today's group already exists, don't duplicate
      const exists = prev.some((g) => g.date === today);
      return exists ? prev : [newGroup, ...prev];
    });
    setUploadedPhotos((prev) => ({ ...prev, ...updates }));
  };

  const allGroups = [...extraGroups, ...photoGroups];

  // Sorted list of dates (oldest first) for navigation
  const sortedDates = useMemo(() => {
    const parse = (d: string) => {
      const [day, month, year] = d.split(".").map(Number);
      return new Date(year, (month || 1) - 1, day || 1).getTime();
    };
    return [...allGroups].sort((a, b) => parse(a.date) - parse(b.date)).map((g) => g.date);
  }, [allGroups]);

  const getPhotoUrl = (date: string, slot: number) => {
    return (
      uploadedPhotos[`${date}-${slot}`] || allGroups.find((g) => g.date === date)?.photos[slot]?.url
    );
  };

  const openCompare = (date: string, slot: number) => {
    setCompareAngle(slot);
    const earliest = sortedDates[0] || date;
    if (date === earliest && sortedDates.length > 1) {
      setCompareRightDate(earliest);
      setCompareLeftDate(sortedDates[sortedDates.length - 1]);
    } else {
      setCompareRightDate(earliest);
      setCompareLeftDate(date);
    }
    setCompareOpen(true);
  };

  useEffect(() => {
    if (!compareOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCompareOpen(false);
        return;
      }
      if (e.key >= "1" && e.key <= "4") {
        setCompareAngle(Number(e.key) - 1);
        return;
      }
      const moveDate = (current: string, dir: 1 | -1) => {
        const idx = sortedDates.indexOf(current);
        if (idx === -1) return current;
        const next = Math.max(0, Math.min(sortedDates.length - 1, idx + dir));
        return sortedDates[next];
      };
      if (e.key === "ArrowLeft") {
        if (e.shiftKey) setCompareRightDate((d) => moveDate(d, 1));
        else setCompareLeftDate((d) => moveDate(d, 1));
      }
      if (e.key === "ArrowRight") {
        if (e.shiftKey) setCompareRightDate((d) => moveDate(d, -1));
        else setCompareLeftDate((d) => moveDate(d, -1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [compareOpen, sortedDates]);

  const statusColor: Record<string, { dot: string; ring: string; text: string }> = {
    פעיל: {
      dot: "bg-emerald-500 shadow-emerald-500/50",
      ring: "border-emerald-200 bg-emerald-50",
      text: "text-emerald-700",
    },
    כבוי: {
      dot: "bg-red-500 shadow-red-500/50",
      ring: "border-red-200 bg-red-50",
      text: "text-red-700",
    },
    משתמש: {
      dot: "bg-blue-500 shadow-blue-500/50",
      ring: "border-blue-200 bg-blue-50",
      text: "text-blue-700",
    },
  };
  const currentStatus = statusColor[status] || statusColor["פעיל"];

  return (
    <div
      dir="rtl"
      className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 px-16 py-10 lg:px-32 xl:px-40"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <div className="flex w-full flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
          >
            <FaArrowRight size={11} />
            <span>חזרה לרשימת המתאמנים</span>
          </button>
          <div className="flex-1 rounded-xl border border-dashed border-blue-300 bg-blue-50/70 px-3 py-2 text-center text-xs font-semibold text-blue-700">
            🎨 תצוגה מקדימה (Mock — לא מחובר לשרת)
          </div>
        </div>

        {/* 1. Top profile header — thick bar with all details */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="absolute inset-y-0 right-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Right: avatar + name + dates */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white ring-4 ring-white">
                {(selectedTrainee.firstName[0] + selectedTrainee.lastName[0]).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">לקוח</p>
                  <h2 className="text-2xl font-bold leading-tight text-slate-900">
                    {selectedTrainee.firstName} {selectedTrainee.lastName}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FaCalendarDays size={12} className="text-blue-500" />
                    <span className="font-semibold">תחילת ליווי:</span>
                    <span className="text-slate-500">{selectedTrainee.dateJoined}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FaCalendarCheck size={12} className="text-indigo-500" />
                    <span className="font-semibold">סיום ליווי:</span>
                    <span className="text-slate-500">{user.dateFinished}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Left: plan dropdown + status toggle */}
            <div className="flex items-center gap-3">
              {/* Plan type dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  סוג תוכנית
                </label>
                <div className="relative">
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pe-9 ps-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="חיטוב">חיטוב</option>
                    <option value="במסה">במסה</option>
                    <option value="שמירה">שמירה</option>
                    <option value="התאוששות">התאוששות</option>
                  </select>
                  <FaChevronDown
                    size={10}
                    className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Status dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  סטטוס
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`cursor-pointer appearance-none rounded-xl border py-2 pe-9 ps-9 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${currentStatus.ring} ${currentStatus.text}`}
                  >
                    <option value="פעיל">פעיל</option>
                    <option value="כבוי">כבוי</option>
                    <option value="משתמש">משתמש</option>
                  </select>
                  <span
                    className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full shadow-sm ${currentStatus.dot}`}
                  />
                  <FaChevronDown
                    size={10}
                    className={`pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 ${currentStatus.text}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main tabs — compact pill bar */}
        <div className="flex flex-wrap items-center justify-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm">
          <button
            onClick={() => setMainTab("profile")}
            className={`inline-flex items-center gap-2 rounded-xl border-l border-slate-200 px-4 py-2 pl-5 text-sm font-semibold transition-all ${
              mainTab === "profile"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FaUser size={14} className={mainTab === "profile" ? "text-white" : "text-slate-500"} />
            <span>פרופיל מתאמן</span>
          </button>
          <div className="flex items-center gap-1">
            {mainTabs.map((t) => {
              const active = mainTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMainTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={active ? "text-white" : "text-slate-500"}>{t.icon}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Sub tabs (only when progress is active) — same compact style */}
        {mainTab === "progress" && (
          <div className="flex items-center justify-start rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center gap-1">
              {progressTabs.map((t) => {
                const active = progressTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setProgressTab(t.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={active ? "text-white" : "text-slate-500"}>{t.icon}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Content */}
        {mainTab === "profile" && <UserProfileForm />}

        {mainTab === "progress" && progressTab === "weight" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {weightStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{s.label}</p>
                      <div
                        className={`mt-2 flex items-center justify-end gap-1.5 text-3xl font-bold ${
                          s.trend === "down" || s.trend === "up"
                            ? "text-emerald-600"
                            : "text-slate-900"
                        }`}
                      >
                        <span>{s.value}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ${iconColorClasses[s.color]}`}
                    >
                      {s.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">מעקב שקילה</h3>
                  <p className="text-sm text-slate-500">כמות שקילות יומית לאורך הזמן</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                  {["7 ימים", "30 ימים", "90 ימים"].map((p, i) => (
                    <button
                      key={p}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                        i === 1
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[320px_1fr]">
                {/* Calendar on the right (in RTL, first DOM child goes to the right) */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100">
                      <FaChevronRight size={11} />
                    </button>
                    <p className="text-sm font-semibold text-slate-800">May 2026</p>
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100">
                      <FaChevronLeft size={11} />
                    </button>
                  </div>

                  <div dir="ltr" className="grid grid-cols-7 gap-x-1 text-center">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div key={d} className="pb-1 text-[10px] font-semibold text-slate-400">
                        {d}
                      </div>
                    ))}
                    {/* leading empty cells before May 1 */}
                    {Array.from({ length: FIRST_WEEKDAY_OFFSET }).map((_, i) => (
                      <div key={`empty-${i}`} className="py-1" />
                    ))}
                    {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
                      const day = i + 1;
                      const value = weighings[day];
                      const isSelected = day === SELECTED_DAY;
                      const isMissed = value === "x";
                      return (
                        <div
                          key={day}
                          className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-colors ${
                            isSelected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-sm font-bold text-slate-800">{day}</span>
                          {isMissed ? (
                            <span className="text-xs font-bold text-red-500">×</span>
                          ) : value !== undefined ? (
                            <span className="text-[11px] font-semibold text-blue-600">{value}</span>
                          ) : (
                            <span className="text-[11px] text-slate-300">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-4 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span>נשקל</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-500 font-bold">×</span>
                      <span>לא נשקל</span>
                    </div>
                  </div>
                </div>

                {/* Chart on the left */}
                <WeightChart />
              </div>
            </div>
          </>
        )}

        {mainTab === "progress" && progressTab === "measurements" && <MeasurementsTable />}

        {mainTab === "progress" && progressTab === "strength" && <StrengthProgress />}

        {mainTab === "progress" && progressTab === "photos" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-900">
                <FaCamera size={16} className="text-blue-600" />
                <span className="text-lg font-bold">תמונות התקדמות</span>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg">
                <FaUpload size={12} />
                <span>העלה תמונות חדשות</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleBulkUpload(e.target.files)}
                />
              </label>
            </div>

            {/* Groups by date */}
            <div className="flex flex-col gap-8">
              {allGroups.map((group) => (
                <div key={group.date}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="px-4 text-sm font-bold text-slate-800">{group.date}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {group.photos.map((p, i) => {
                      const key = `${group.date}-${i}`;
                      const uploadedUrl = uploadedPhotos[key];
                      const displayUrl = uploadedUrl || p.url;
                      if (displayUrl) {
                        return (
                          <button
                            key={key}
                            onClick={() => openCompare(group.date, i)}
                            className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-blue-300 hover:shadow-md"
                          >
                            <img
                              src={displayUrl}
                              alt={p.label}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-3 bottom-3 flex items-center justify-center rounded-lg bg-white/95 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                              {p.label}
                            </div>
                          </button>
                        );
                      }
                      return (
                        <label
                          key={key}
                          className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-blue-300 hover:shadow-md"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(group.date, i, file);
                            }}
                          />
                          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400 transition-colors group-hover:text-blue-500">
                            <FaCamera size={32} />
                            <span className="text-sm font-medium">{p.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mainTab === "workout" && <WorkoutPlanTab />}

        {mainTab === "diet" && <DietPlanTab />}

        {mainTab === "forms" && <FormsTab />}
      </div>

      {/* Photo comparison modal */}
      {compareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-6 backdrop-blur-sm"
          onClick={() => setCompareOpen(false)}
        >
          <div
            className="relative flex h-full w-full max-w-7xl flex-col gap-4 rounded-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar: angle switcher + share + close */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">זווית:</span>
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                  {angleLabels.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => setCompareAngle(i)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        compareAngle === i
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  <FaShare size={12} />
                  <span>שתף עם המתאמן</span>
                </button>
                <button
                  onClick={() => setCompareOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                  aria-label="סגור"
                >
                  <FaXmark size={18} />
                </button>
              </div>
            </div>

            {/* Two panes side by side. In RTL, first child renders on the RIGHT. */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              {/* Right pane = before (oldest date) */}
              <ComparePane
                date={compareRightDate}
                angle={compareAngle}
                badge="לפני"
                badgeColor="bg-slate-700"
                photoUrl={getPhotoUrl(compareRightDate, compareAngle)}
                metadata={dateMetadata[compareRightDate]}
                sortedDates={sortedDates}
                onChangeDate={setCompareRightDate}
              />
              {/* Left pane = after (newest date) */}
              <ComparePane
                date={compareLeftDate}
                angle={compareAngle}
                badge="אחרי"
                badgeColor="bg-slate-900"
                photoUrl={getPhotoUrl(compareLeftDate, compareAngle)}
                metadata={dateMetadata[compareLeftDate]}
                sortedDates={sortedDates}
                onChangeDate={setCompareLeftDate}
              />
            </div>

            {/* Keyboard hints */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-400">
              <span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                  ←/→
                </kbd>{" "}
                החלף תאריך (אחרי)
              </span>
              <span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                  Shift+←/→
                </kbd>{" "}
                החלף תאריך (לפני)
              </span>
              <span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                  1-4
                </kbd>{" "}
                זווית
              </span>
              <span>
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                  Esc
                </kbd>{" "}
                סגור
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DietPlanTab() {
  const [dietTab, setDietTab] = useState<"menu" | "notes" | "supplements">("menu");
  const [meals, setMeals] = useState<DietMeal[]>(initialMeals);
  const [openMeals, setOpenMeals] = useState<Set<string>>(
    new Set([meals[0]?.id].filter(Boolean) as string[])
  );
  const [freeCalories, setFreeCalories] = useState<number>(150);

  const toggleMeal = (id: string) =>
    setOpenMeals((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  // Totals across meals
  const totals = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein.amount,
      carbs: acc.carbs + m.carbs.amount,
      fats: acc.fats + m.fats.amount,
      vegetables: acc.vegetables + m.vegetables.amount,
    }),
    { protein: 0, carbs: 0, fats: 0, vegetables: 0 }
  );

  const macroCalories = {
    protein: totals.protein * macrosPerUnit.protein.kcal,
    carbs: totals.carbs * macrosPerUnit.carbs.kcal,
    fats: totals.fats * macrosPerUnit.fats.kcal,
    vegetables: totals.vegetables * macrosPerUnit.vegetables.kcal,
  };
  const totalCalories =
    macroCalories.protein +
    macroCalories.carbs +
    macroCalories.fats +
    macroCalories.vegetables +
    freeCalories;

  const dietTabs = [
    { id: "menu" as const, label: "תפריט תזונה", icon: <FaAppleWhole size={13} /> },
    { id: "notes" as const, label: "דגשים", icon: <FaClipboardCheck size={13} /> },
    { id: "supplements" as const, label: "תוספים", icon: <FaPlus size={13} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top control row: tabs + save */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1">
          {dietTabs.map((t) => {
            const active = dietTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setDietTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <span>{t.label}</span>
                <span className={active ? "text-white" : "text-slate-500"}>{t.icon}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            שמור תפריט כתבנית
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
            <FaFloppyDisk size={11} />
            שמור תפריט
          </button>
        </div>
      </div>

      {dietTab === "menu" && (
        <>
          {/* Macro summary — top of menu */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FaAppleWhole size={16} className="text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">חלוקת מאקרו יומית</h3>
                <span className="text-xs text-slate-400">(סיכום כל הארוחות)</span>
              </div>
              <div className="text-end">
                <p className="text-xs uppercase tracking-wider text-slate-400">סה״כ קלוריות</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalCalories.toLocaleString()}{" "}
                  <span className="text-sm text-slate-500">קק״ל</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {(Object.keys(macrosPerUnit) as Array<keyof typeof macrosPerUnit>).map((key) => {
                const def = macrosPerUnit[key];
                const units = totals[key];
                const kcal = macroCalories[key];
                const pct = totalCalories > 0 ? Math.round((kcal / totalCalories) * 100) : 0;
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-500">{def.label}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {units}
                          <span className="text-xs text-slate-500 mr-1">מנות</span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {kcal} קק״ל · {pct}%
                        </p>
                      </div>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ring-1 ${def.color}`}
                      >
                        {def.icon}
                      </div>
                    </div>
                    {/* mini progress bar */}
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${def.barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Free calories */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  קלוריות חופשיות
                </p>
                <p className="text-xs text-slate-400">מתווסף לסה״כ הקלוריות מבלי להופיע בארוחות</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={freeCalories}
                  onChange={(e) => setFreeCalories(Number(e.target.value) || 0)}
                  className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-center text-sm font-bold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <span className="text-sm font-semibold text-slate-500">קק״ל</span>
              </div>
            </div>
          </div>

          {/* Template selector */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              בחר תבנית תפריט מוכנה
            </label>
            <div className="relative">
              <select className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pe-10 text-sm text-slate-700 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                <option>— בחר תבנית —</option>
                <option>חיטוב 1800 קק״ל</option>
                <option>במסה 2500 קק״ל</option>
                <option>שמירה 2000 קק״ל</option>
              </select>
              <FaChevronDown
                size={11}
                className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Meals */}
          <div className="flex flex-col gap-3">
            {meals.map((meal, idx) => (
              <MealCard
                key={meal.id}
                meal={meal}
                index={idx}
                isOpen={openMeals.has(meal.id)}
                onToggle={() => toggleMeal(meal.id)}
                onUpdate={(u) => setMeals((p) => p.map((m) => (m.id === meal.id ? u : m)))}
                onDelete={() => setMeals((p) => p.filter((m) => m.id !== meal.id))}
              />
            ))}
            <button
              onClick={() => {
                const newMeal: DietMeal = {
                  id: `m-${Date.now()}`,
                  name: `ארוחה ${meals.length + 1}`,
                  protein: { amount: 1, mode: "קבוע" },
                  carbs: { amount: 1, mode: "קבוע" },
                  fats: { amount: 0, mode: "קבוע" },
                  vegetables: { amount: 0, mode: "קבוע" },
                };
                setMeals((p) => [...p, newMeal]);
                setOpenMeals((p) => new Set([...p, newMeal.id]));
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/40 px-4 py-3.5 text-sm font-semibold text-slate-500 transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
            >
              <FaPlus size={12} />
              <span>הוסף ארוחה</span>
            </button>
          </div>
        </>
      )}

      {dietTab === "notes" && <DietNotesEditor />}
      {dietTab === "supplements" && <SupplementsEditor />}
    </div>
  );
}

function SupplementsEditor() {
  const [supplements, setSupplements] = useState<Supplement[]>(initialSupplements);
  const [filterCat, setFilterCat] = useState<"הכל" | SupplementCategory>("הכל");
  const [customName, setCustomName] = useState("");
  const [customCat, setCustomCat] = useState<SupplementCategory>("חלבון");
  const [customDosage, setCustomDosage] = useState("");
  const [customTiming, setCustomTiming] = useState("");

  const addFromCatalog = (catalogId: string) => {
    const item = supplementCatalog.find((c) => c.id === catalogId);
    if (!item) return;
    if (supplements.some((s) => s.name === item.name)) return;
    setSupplements((p) => [
      ...p,
      {
        id: `sup-${Date.now()}`,
        name: item.name,
        category: item.category,
        dosage: item.defaultDosage,
        timing: item.defaultTiming,
      },
    ]);
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    setSupplements((p) => [
      ...p,
      {
        id: `sup-${Date.now()}`,
        name: customName.trim(),
        category: customCat,
        dosage: customDosage || "—",
        timing: customTiming || "—",
      },
    ]);
    setCustomName("");
    setCustomDosage("");
    setCustomTiming("");
  };

  const updateSup = (id: string, patch: Partial<Supplement>) =>
    setSupplements((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const deleteSup = (id: string) => setSupplements((p) => p.filter((s) => s.id !== id));

  const filteredCatalog =
    filterCat === "הכל"
      ? supplementCatalog
      : supplementCatalog.filter((c) => c.category === filterCat);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h3 className="text-lg font-bold text-slate-900">תוספי תזונה</h3>
          <span className="text-xs text-slate-400">({supplements.length} תוספים מומלצים)</span>
        </div>
        {supplements.length > 0 && (
          <button
            onClick={() => setSupplements([])}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600"
          >
            <FaTrash size={10} />
            <span>נקה הכל</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(0,340px)]">
        {/* Right (main) — Active recommendations */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-slate-900">תוספים מומלצים למתאמן</h4>

          {supplements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center">
              <span className="text-3xl">💊</span>
              <p className="text-sm text-slate-400">לא נוספו תוספים עדיין</p>
              <p className="text-xs text-slate-400">בחר מהקטלוג מימין או הוסף תוסף ידני</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {supplements.map((sup) => {
                const c = supplementCategoryColors[sup.category];
                const catalogItem = supplementCatalog.find((cc) => cc.name === sup.name);
                return (
                  <div
                    key={sup.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-2xl shadow-sm`}
                      >
                        {catalogItem?.icon || "💊"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sup.name}
                            onChange={(e) => updateSup(sup.id, { name: e.target.value })}
                            className="flex-1 rounded-md border-0 bg-transparent px-1 py-0.5 text-sm font-bold text-slate-900 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
                          />
                          <select
                            value={sup.category}
                            onChange={(e) =>
                              updateSup(sup.id, { category: e.target.value as SupplementCategory })
                            }
                            className={`rounded-full ${c.bg} px-2.5 py-0.5 text-[10px] font-bold ${c.text} border-0 focus:outline-none focus:ring-2 focus:ring-amber-200`}
                          >
                            {(Object.keys(supplementCategoryColors) as SupplementCategory[]).map(
                              (cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-slate-400">
                              מינון
                            </p>
                            <input
                              type="text"
                              value={sup.dosage}
                              onChange={(e) => updateSup(sup.id, { dosage: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-slate-400">
                              מתי לקחת
                            </p>
                            <input
                              type="text"
                              value={sup.timing}
                              onChange={(e) => updateSup(sup.id, { timing: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSup(sup.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label="מחק תוסף"
                      >
                        <FaXmark size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom add */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                הוסף תוסף ידני
              </label>
              <select
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value as SupplementCategory)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:border-amber-300 focus:border-amber-500 focus:outline-none"
              >
                {(Object.keys(supplementCategoryColors) as SupplementCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="שם התוסף"
              className="mb-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <div className="mb-2 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                placeholder="מינון (למשל 30 גרם)"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <input
                type="text"
                value={customTiming}
                onChange={(e) => setCustomTiming(e.target.value)}
                placeholder="מתי לקחת"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <button
              onClick={addCustom}
              disabled={!customName.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaPlus size={11} />
              <span>הוסף לרשימה</span>
            </button>
          </div>
        </div>

        {/* Left (sidebar) — Catalog */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-slate-900">קטלוג תוספים</h4>

          {/* Category filter */}
          <div className="mb-4 flex flex-wrap gap-1">
            {(
              ["הכל", ...Object.keys(supplementCategoryColors)] as Array<"הכל" | SupplementCategory>
            ).map((c) => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  filterCat === c
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {filteredCatalog.map((item) => {
              const isAdded = supplements.some((s) => s.name === item.name);
              const c = supplementCategoryColors[item.category];
              return (
                <button
                  key={item.id}
                  onClick={() => addFromCatalog(item.id)}
                  disabled={isAdded}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-right text-xs transition-all ${
                    isAdded
                      ? "bg-emerald-50 text-emerald-700 cursor-not-allowed"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/40 hover:text-amber-800"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} text-base shadow-sm`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 text-right">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {item.defaultDosage} · {item.defaultTiming}
                    </p>
                  </div>
                  {isAdded ? <FaCheck size={10} /> : <FaPlus size={10} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [align, setAlign] = useState<"right" | "center" | "left">("right");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const setAlignment = (a: "right" | "center" | "left") => {
    setAlign(a);
    exec(a === "right" ? "justifyRight" : a === "center" ? "justifyCenter" : "justifyLeft");
  };

  const addLink = () => {
    const url = prompt("הזן קישור (URL):");
    if (url) exec("createLink", url);
  };

  const Btn = ({
    onClick,
    title,
    children,
    active,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/40 px-2 py-1.5">
        <Btn onClick={() => exec("bold")} title="מודגש (B)">
          <FaBold size={11} />
        </Btn>
        <Btn onClick={() => exec("italic")} title="נטוי (I)">
          <FaItalic size={11} />
        </Btn>
        <Btn onClick={() => exec("underline")} title="קו תחתון">
          <FaUnderline size={11} />
        </Btn>
        <Btn onClick={() => exec("strikeThrough")} title="קו חוצה">
          <FaStrikethrough size={11} />
        </Btn>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <Btn onClick={() => exec("insertUnorderedList")} title="רשימה">
          <FaListUl size={11} />
        </Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="רשימה ממוספרת">
          <FaListOl size={11} />
        </Btn>
        <Btn onClick={() => exec("indent")} title="הזחה ימינה">
          <FaIndent size={11} />
        </Btn>
        <Btn onClick={() => exec("outdent")} title="הזחה שמאלה">
          <FaOutdent size={11} />
        </Btn>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <Btn onClick={() => setAlignment("right")} title="יישור לימין" active={align === "right"}>
          <FaAlignRight size={11} />
        </Btn>
        <Btn onClick={() => setAlignment("center")} title="יישור למרכז" active={align === "center"}>
          <FaAlignCenter size={11} />
        </Btn>
        <Btn onClick={() => setAlignment("left")} title="יישור לשמאל" active={align === "left"}>
          <FaAlignLeft size={11} />
        </Btn>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <Btn onClick={addLink} title="הוסף קישור">
          <FaLink size={10} />
        </Btn>
        <Btn onClick={() => exec("removeFormat")} title="נקה עיצוב">
          <FaEraser size={11} />
        </Btn>
        <div className="ms-auto flex items-center gap-1">
          <select
            onChange={(e) => exec("foreColor", e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-700 focus:outline-none"
            title="צבע טקסט"
          >
            <option value="">צבע</option>
            <option value="#1e293b">שחור</option>
            <option value="#2563eb">כחול</option>
            <option value="#dc2626">אדום</option>
            <option value="#16a34a">ירוק</option>
            <option value="#ea580c">כתום</option>
            <option value="#9333ea">סגול</option>
          </select>
          <select
            onChange={(e) => exec("fontSize", e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-700 focus:outline-none"
            title="גודל"
            defaultValue="3"
          >
            <option value="2">קטן</option>
            <option value="3">רגיל</option>
            <option value="4">בינוני</option>
            <option value="5">גדול</option>
            <option value="6">ענק</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dir="rtl"
        data-placeholder={placeholder || "כתוב כאן..."}
        className="rich-editor min-h-[120px] px-3 py-2 text-sm leading-relaxed text-slate-800 focus:outline-none"
        style={{ direction: "rtl" }}
      />
      <style>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .rich-editor ul { list-style: disc; padding-right: 1.25rem; }
        .rich-editor ol { list-style: decimal; padding-right: 1.25rem; }
        .rich-editor a { color: #2563eb; text-decoration: underline; }
      `}</style>
    </div>
  );
}

function DietNotesEditor() {
  const [notes, setNotes] = useState<DietNote[]>(initialDietNotes);
  const [customText, setCustomText] = useState("");
  const [customCategory, setCustomCategory] = useState<NoteCategory>("מומלץ");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<"הכל" | NoteCategory>("הכל");
  const [savedTemplates, setSavedTemplates] = useState<
    { id: string; name: string; notes: DietNote[] }[]
  >([
    {
      id: "tpl-1",
      name: "תבנית חיטוב סטנדרטי",
      notes: [
        { id: "tn-1", category: "שתייה", text: "לשתות 3-4 ליטר מים ביום" },
        { id: "tn-2", category: "תזמון", text: "לאכול כל 3-4 שעות" },
        { id: "tn-3", category: "להימנע", text: "סוכר מעובד וממתקים" },
      ],
    },
  ]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [loadOpen, setLoadOpen] = useState(false);

  const saveAsTemplate = () => {
    if (!templateName.trim() || notes.length === 0) return;
    setSavedTemplates((p) => [
      ...p,
      { id: `tpl-${Date.now()}`, name: templateName.trim(), notes: [...notes] },
    ]);
    setTemplateName("");
    setSaveDialogOpen(false);
  };

  const loadTemplate = (id: string) => {
    const tpl = savedTemplates.find((t) => t.id === id);
    if (!tpl) return;
    setNotes(tpl.notes.map((n) => ({ ...n, id: `dn-${Date.now()}-${Math.random()}` })));
    setLoadOpen(false);
  };

  const deleteTemplate = (id: string) => {
    setSavedTemplates((p) => p.filter((t) => t.id !== id));
  };

  const addTemplateNote = (category: NoteCategory, text: string) => {
    if (notes.some((n) => n.text === text)) return;
    setNotes((p) => [...p, { id: `dn-${Date.now()}-${Math.random()}`, category, text }]);
  };

  const addCustomNote = () => {
    if (!customText.trim()) return;
    setNotes((p) => [
      ...p,
      { id: `dn-${Date.now()}`, category: customCategory, text: customText.trim() },
    ]);
    setCustomText("");
  };

  const updateNote = (id: string, patch: Partial<DietNote>) => {
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const deleteNote = (id: string) => setNotes((p) => p.filter((n) => n.id !== id));

  const filteredTemplates =
    filterCategory === "הכל"
      ? noteTemplates
      : noteTemplates.filter((t) => t.category === filterCategory);

  return (
    <div className="flex flex-col gap-4">
      {/* Top — header with templates + clear buttons */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FaClipboardCheck size={16} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">דגשי תפריט</h3>
          <span className="text-xs text-slate-400">({notes.length} דגשים פעילים)</span>
        </div>
        <div className="flex items-center gap-2">
          {savedTemplates.length > 0 && (
            <button
              onClick={() => setLoadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
            >
              <FaClipboardList size={11} />
              <span>טען תבנית</span>
            </button>
          )}
          {notes.length > 0 && (
            <>
              <button
                onClick={() => setSaveDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
              >
                <FaFloppyDisk size={11} />
                <span>שמור תבנית דגשים</span>
              </button>
              <button
                onClick={() => setNotes([])}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600"
              >
                <FaTrash size={10} />
                <span>נקה הכל</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notes list */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 px-4 py-12 text-center">
            <FaClipboardCheck size={36} className="text-slate-300" />
            <p className="text-sm text-slate-400">לא נוספו דגשים עדיין</p>
            <p className="text-xs text-slate-400">בחר מתוך התבניות למעלה או הוסף דגש ידני למטה</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => {
              const c = noteCategoryColors[note.category];
              return (
                <div
                  key={note.id}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full ${c.bg} px-2.5 py-0.5 text-[10px] font-bold ${c.text}`}
                      >
                        {note.category}
                      </span>
                    </div>
                    <div
                      className="rich-display text-sm leading-relaxed text-slate-800"
                      dangerouslySetInnerHTML={{
                        __html: /<[^>]+>/.test(note.text) ? note.text : `<p>${note.text}</p>`,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label="מחק דגש"
                  >
                    <FaXmark size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom note input — rich text */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            הוסף דגש ידני
          </label>
          <RichTextEditor
            value={customText}
            onChange={setCustomText}
            placeholder="כתוב כאן דגש מותאם אישית לתפריט... (תוכל לעצב את הטקסט)"
          />
          <button
            onClick={addCustomNote}
            disabled={!customText.replace(/<[^>]*>/g, "").trim()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaPlus size={11} />
            <span>הוסף לדגשים</span>
          </button>
        </div>
      </div>

      {/* Save template dialog */}
      {saveDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          onClick={() => setSaveDialogOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <FaFloppyDisk size={14} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">שמור תבנית דגשים</h2>
                <p className="text-xs text-slate-500">תוכל לטעון תבנית זו לתפריטים עתידיים</p>
              </div>
            </div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              שם התבנית
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="לדוגמה: תבנית חיטוב מתחיל"
              autoFocus
              className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-bold">{notes.length} דגשים</span> ייכללו בתבנית
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                onClick={saveAsTemplate}
                disabled={!templateName.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaFloppyDisk size={11} />
                <span>שמור תבנית</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load template dialog */}
      {loadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          onClick={() => setLoadOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                  <FaClipboardList size={14} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">טען תבנית דגשים</h2>
                  <p className="text-xs text-slate-500">בחר תבנית שמורה לטעינה</p>
                </div>
              </div>
              <button
                onClick={() => setLoadOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <FaXmark size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {savedTemplates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-8 text-center text-sm text-slate-400">
                  אין תבניות שמורות עדיין
                </div>
              ) : (
                savedTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-300 hover:bg-blue-50/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <FaClipboardList size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{tpl.name}</p>
                      <p className="text-xs text-slate-500">{tpl.notes.length} דגשים</p>
                    </div>
                    <button
                      onClick={() => loadTemplate(tpl.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      טען
                    </button>
                    <button
                      onClick={() => deleteTemplate(tpl.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates modal */}
      {templatesOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          onClick={() => setTemplatesOpen(false)}
        >
          <div
            className="relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col gap-4 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                  <FaClipboardList size={16} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">תבניות דגשים</h2>
                  <p className="text-xs text-slate-500">בחר דגשים מוכנים והם יתווספו לרשימה</p>
                </div>
              </div>
              <button
                onClick={() => setTemplatesOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <FaXmark size={18} />
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {(["הכל", ...Object.keys(noteCategoryColors)] as Array<"הכל" | NoteCategory>).map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setFilterCategory(c)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      filterCategory === c
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {c !== "הכל" && <span>{noteCategoryColors[c as NoteCategory].emoji}</span>}
                    <span>{c}</span>
                  </button>
                )
              )}
            </div>

            {/* Templates list */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
              {filteredTemplates.map((cat) => {
                const c = noteCategoryColors[cat.category];
                return (
                  <div key={cat.category}>
                    <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${c.text}`}>
                      {c.emoji} {cat.category}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {cat.items.map((item) => {
                        const isAdded = notes.some((n) => n.text === item);
                        return (
                          <button
                            key={item}
                            onClick={() => addTemplateNote(cat.category, item)}
                            disabled={isAdded}
                            className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-right text-sm transition-all ${
                              isAdded
                                ? "bg-emerald-50 text-emerald-700 cursor-not-allowed"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
                            }`}
                          >
                            <span className="flex-1">{item}</span>
                            {isAdded ? <FaCheck size={11} /> : <FaPlus size={11} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setTemplatesOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              סיום
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MealCard({
  meal,
  index,
  isOpen,
  onToggle,
  onUpdate,
  onDelete,
}: {
  meal: DietMeal;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (m: DietMeal) => void;
  onDelete: () => void;
}) {
  const updateMacro = (
    key: "protein" | "carbs" | "fats" | "vegetables",
    patch: Partial<MealItem>
  ) => {
    onUpdate({ ...meal, [key]: { ...meal[key], ...patch } });
  };

  const totalKcal =
    meal.protein.amount * macrosPerUnit.protein.kcal +
    meal.carbs.amount * macrosPerUnit.carbs.kcal +
    meal.fats.amount * macrosPerUnit.fats.kcal +
    meal.vegetables.amount * macrosPerUnit.vegetables.kcal;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${isOpen ? "border-emerald-200 shadow-md" : "border-slate-200"}`}
    >
      <div className="flex items-center gap-3 px-6 py-5">
        <button
          onClick={onToggle}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isOpen ? "bg-emerald-100 text-emerald-700" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
        >
          {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
        <input
          type="text"
          value={meal.name}
          onChange={(e) => onUpdate({ ...meal, name: e.target.value })}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <div className="hidden items-center gap-2 sm:flex">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            ח · {meal.protein.amount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
            פ · {meal.carbs.amount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            ש · {meal.fats.amount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            י · {meal.vegetables.amount}
          </span>
          <span className="ms-1 text-xs font-bold text-slate-700">{totalKcal} קק״ל</span>
        </div>
        <button
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
          aria-label="מחק ארוחה"
        >
          <FaTrash size={11} />
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 bg-slate-50/30 p-6 sm:grid-cols-2">
          {(Object.keys(macrosPerUnit) as Array<keyof typeof macrosPerUnit>).map((key) => {
            const def = macrosPerUnit[key];
            const item = meal[key];
            return (
              <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ring-1 ${def.color}`}
                    >
                      {def.icon}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{def.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.amount * def.kcal} קק״ל</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={item.amount}
                    onChange={(e) => updateMacro(key, { amount: Number(e.target.value) || 0 })}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-center text-base font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                    {(["קבוע", "בחירה"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateMacro(key, { mode })}
                        className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all ${
                          item.mode === mode
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CardioPlanEditor() {
  const [minutesPerWeek, setMinutesPerWeek] = useState(60);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-blue-50/60 p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <FaPersonRunning size={18} className="text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900">תוכנית אירובי</h3>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700 underline decoration-slate-300 decoration-1 underline-offset-4">
            כמות אירובי לשבוע (דק'):
          </label>
          <input
            type="number"
            value={minutesPerWeek}
            onChange={(e) => setMinutesPerWeek(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700 underline decoration-slate-300 decoration-1 underline-offset-4">
            כמות פעמים לשבוע:
          </label>
          <input
            type="number"
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-bold text-slate-700 underline decoration-slate-300 decoration-1 underline-offset-4">
          דגשים:
        </label>
        <div className="rounded-xl bg-white">
          <RichTextEditor
            value={notes}
            onChange={setNotes}
            placeholder="כתוב כאן דגשים לאירובי... (תוכל לעצב את הטקסט)"
          />
        </div>
      </div>

      {/* Summary at bottom */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FaPersonRunning size={14} className="text-emerald-600" />
          <span>
            סך הכל: <span className="font-bold text-slate-900">{minutesPerWeek} דקות</span> ב-
            <span className="font-bold text-slate-900">{sessionsPerWeek} פעמים</span> בשבוע
          </span>
        </div>
        <span className="text-xs text-slate-500">
          ≈{" "}
          <span className="font-bold text-slate-700">
            {sessionsPerWeek > 0 ? Math.round(minutesPerWeek / sessionsPerWeek) : 0}
          </span>{" "}
          דקות לאימון
        </span>
      </div>
    </div>
  );
}

function WorkoutNotesEditor() {
  const [notes, setNotes] = useState<{ id: string; html: string }[]>([]);
  const [customText, setCustomText] = useState("");
  const [savedTemplates, setSavedTemplates] = useState<
    { id: string; name: string; notes: { id: string; html: string }[] }[]
  >([
    {
      id: "wtpl-1",
      name: "תבנית דגשי מתחילים",
      notes: [
        {
          id: "wn-1",
          html: "<p><strong>חימום</strong>: 5-10 דקות הליכה / רכיבה אירובית קלה לפני כל אימון</p>",
        },
        {
          id: "wn-2",
          html: "<p><strong>טכניקה לפני משקל</strong>: לעבוד על ביצוע מושלם לפני העלאת משקל</p>",
        },
        {
          id: "wn-3",
          html: "<p><strong>נשימה</strong>: לנשום החוצה בעלייה (מאמץ), פנימה בירידה</p>",
        },
      ],
    },
  ]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [loadOpen, setLoadOpen] = useState(false);

  const addCustomNote = () => {
    const plain = customText.replace(/<[^>]*>/g, "").trim();
    if (!plain) return;
    setNotes((p) => [...p, { id: `wn-${Date.now()}`, html: customText }]);
    setCustomText("");
  };

  const updateNote = (id: string, html: string) =>
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, html } : n)));
  const deleteNote = (id: string) => setNotes((p) => p.filter((n) => n.id !== id));

  const saveAsTemplate = () => {
    if (!templateName.trim() || notes.length === 0) return;
    setSavedTemplates((p) => [
      ...p,
      { id: `wtpl-${Date.now()}`, name: templateName.trim(), notes: [...notes] },
    ]);
    setTemplateName("");
    setSaveDialogOpen(false);
  };

  const loadTemplate = (id: string) => {
    const tpl = savedTemplates.find((t) => t.id === id);
    if (!tpl) return;
    setNotes(tpl.notes.map((n) => ({ ...n, id: `wn-${Date.now()}-${Math.random()}` })));
    setLoadOpen(false);
  };

  const deleteTemplate = (id: string) => setSavedTemplates((p) => p.filter((t) => t.id !== id));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FaClipboardCheck size={16} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">דגשי תוכנית אימון</h3>
          <span className="text-xs text-slate-400">({notes.length} דגשים פעילים)</span>
        </div>
        <div className="flex items-center gap-2">
          {savedTemplates.length > 0 && (
            <button
              onClick={() => setLoadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
            >
              <FaClipboardList size={11} />
              <span>טען תבנית</span>
            </button>
          )}
          {notes.length > 0 && (
            <>
              <button
                onClick={() => setSaveDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
              >
                <FaFloppyDisk size={11} />
                <span>שמור תבנית דגשים</span>
              </button>
              <button
                onClick={() => setNotes([])}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600"
              >
                <FaTrash size={10} />
                <span>נקה הכל</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notes list */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 px-4 py-12 text-center">
            <FaClipboardCheck size={36} className="text-slate-300" />
            <p className="text-sm text-slate-400">לא נוספו דגשים עדיין</p>
            <p className="text-xs text-slate-400">בחר מתוך התבניות למעלה או הוסף דגש ידני למטה</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    dir="rtl"
                    onBlur={(e) => updateNote(note.id, e.currentTarget.innerHTML)}
                    className="rich-display text-sm leading-relaxed text-slate-800 focus:outline-none"
                    dangerouslySetInnerHTML={{
                      __html: /<[^>]+>/.test(note.html) ? note.html : `<p>${note.html}</p>`,
                    }}
                  />
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <FaXmark size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Custom note input — rich text */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            הוסף דגש ידני
          </label>
          <RichTextEditor
            value={customText}
            onChange={setCustomText}
            placeholder="כתוב כאן דגש מותאם אישית לתוכנית האימון... (תוכל לעצב את הטקסט)"
          />
          <button
            onClick={addCustomNote}
            disabled={!customText.replace(/<[^>]*>/g, "").trim()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaPlus size={11} />
            <span>הוסף לדגשים</span>
          </button>
        </div>
      </div>

      {/* Save template dialog */}
      {saveDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          onClick={() => setSaveDialogOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <FaFloppyDisk size={14} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">שמור תבנית דגשים</h2>
                <p className="text-xs text-slate-500">תוכל לטעון תבנית זו לתוכניות עתידיות</p>
              </div>
            </div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              שם התבנית
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="לדוגמה: דגשים לתוכנית חיטוב"
              autoFocus
              className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-bold">{notes.length} דגשים</span> ייכללו בתבנית
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                onClick={saveAsTemplate}
                disabled={!templateName.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaFloppyDisk size={11} />
                <span>שמור תבנית</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load template dialog */}
      {loadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          onClick={() => setLoadOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                  <FaClipboardList size={14} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">טען תבנית דגשים</h2>
                  <p className="text-xs text-slate-500">בחר תבנית שמורה לטעינה</p>
                </div>
              </div>
              <button
                onClick={() => setLoadOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <FaXmark size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {savedTemplates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-8 text-center text-sm text-slate-400">
                  אין תבניות שמורות עדיין
                </div>
              ) : (
                savedTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-300 hover:bg-blue-50/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <FaClipboardList size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{tpl.name}</p>
                      <p className="text-xs text-slate-500">{tpl.notes.length} דגשים</p>
                    </div>
                    <button
                      onClick={() => loadTemplate(tpl.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      טען
                    </button>
                    <button
                      onClick={() => deleteTemplate(tpl.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutPlanTab() {
  const [planTab, setPlanTab] = useState<"workouts" | "cardio" | "notes">("workouts");
  const [plan, setPlan] = useState<Workout[]>(workoutPlan);
  const [openWorkout, setOpenWorkout] = useState<string | null>(plan[0]?.id || null);
  const planTabs = [
    { id: "workouts" as const, label: "אימונים", icon: <FaDumbbell size={13} /> },
    { id: "cardio" as const, label: "אירובי", icon: <FaPersonRunning size={13} /> },
    { id: "notes" as const, label: "דגשים", icon: <FaClipboardCheck size={13} /> },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1">
          {planTabs.map((t) => {
            const active = planTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPlanTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <span>{t.label}</span>
                <span className={active ? "text-white" : "text-slate-500"}>{t.icon}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            שמור תוכנית כתבנית
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
            <FaFloppyDisk size={11} />
            שמור תוכנית
          </button>
        </div>
      </div>
      {planTab === "workouts" && (
        <div className="flex flex-col gap-3">
          {plan.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              isOpen={openWorkout === w.id}
              onToggle={() => setOpenWorkout(openWorkout === w.id ? null : w.id)}
              onUpdate={(updated) =>
                setPlan((prev) => prev.map((p) => (p.id === w.id ? updated : p)))
              }
              onDelete={() => setPlan((prev) => prev.filter((p) => p.id !== w.id))}
            />
          ))}
          <button
            onClick={() => {
              const next: Workout = { id: `w-${Date.now()}`, name: `אימון חדש`, muscleGroups: [] };
              setPlan((prev) => [...prev, next]);
              setOpenWorkout(next.id);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/40 px-4 py-3.5 text-sm font-semibold text-slate-500 transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:text-purple-700"
          >
            <FaPlus size={12} />
            <span>הוסף אימון</span>
          </button>
        </div>
      )}
      {planTab === "cardio" && <CardioPlanEditor />}
      {planTab === "notes" && <WorkoutNotesEditor />}
    </div>
  );
}

function WorkoutCard({
  workout,
  isOpen,
  onToggle,
  onUpdate,
  onDelete,
}: {
  workout: Workout;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (w: Workout) => void;
  onDelete: () => void;
}) {
  const totalExercises = workout.muscleGroups.reduce((s, g) => s + g.exercises.length, 0);
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${isOpen ? "border-purple-200 shadow-md" : "border-slate-200"}`}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={onToggle}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${isOpen ? "bg-purple-100 text-purple-700" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
        >
          {isOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </button>
        <input
          type="text"
          value={workout.name}
          onChange={(e) => onUpdate({ ...workout, name: e.target.value })}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <span className="hidden text-xs text-slate-400 sm:inline">
          {workout.muscleGroups.length} קבוצות · {totalExercises} תרגילים
        </span>
        <button
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
          aria-label="מחק אימון"
        >
          <FaTrash size={11} />
        </button>
      </div>
      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/30 px-5 py-4">
          {workout.muscleGroups.map((mg) => (
            <MuscleGroupBlock
              key={mg.id}
              muscleGroup={mg}
              onUpdate={(updated) =>
                onUpdate({
                  ...workout,
                  muscleGroups: workout.muscleGroups.map((g) => (g.id === mg.id ? updated : g)),
                })
              }
              onDelete={() =>
                onUpdate({
                  ...workout,
                  muscleGroups: workout.muscleGroups.filter((g) => g.id !== mg.id),
                })
              }
            />
          ))}
          <button
            onClick={() => {
              const newGroup: WorkoutMuscleGroup = {
                id: `wmg-${Date.now()}`,
                group: "חזה",
                exercises: [],
              };
              onUpdate({ ...workout, muscleGroups: [...workout.muscleGroups, newGroup] });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-500 transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:text-purple-700"
          >
            <FaPlus size={11} />
            <span>הוסף קבוצת שריר</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MuscleGroupBlock({
  muscleGroup,
  onUpdate,
  onDelete,
}: {
  muscleGroup: WorkoutMuscleGroup;
  onUpdate: (mg: WorkoutMuscleGroup) => void;
  onDelete: () => void;
}) {
  const colors = muscleGroupColors[muscleGroup.group];
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(muscleGroup.exercises[0]?.id ? [muscleGroup.exercises[0].id] : [])
  );
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full ${colors.bg} px-3 py-1 text-xs font-bold ${colors.text}`}
          >
            קבוצת שריר: {muscleGroup.group}
          </span>
          <select
            value={muscleGroup.group}
            onChange={(e) => onUpdate({ ...muscleGroup, group: e.target.value as MuscleGroup })}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:border-slate-300 focus:border-purple-500 focus:outline-none"
          >
            {Object.keys(muscleGroupColors).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
          aria-label="מחק קבוצת שריר"
        >
          <FaTrash size={10} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
        {muscleGroup.exercises.map((ex) => (
          <div key={ex.id}>
            <ExerciseCard
              exercise={ex}
              muscleGroup={muscleGroup.group}
              isExpanded={expandedIds.has(ex.id)}
              onToggle={() => toggleExpanded(ex.id)}
              onUpdate={(updated) =>
                onUpdate({
                  ...muscleGroup,
                  exercises: muscleGroup.exercises.map((e) => (e.id === ex.id ? updated : e)),
                })
              }
              onDelete={() =>
                onUpdate({
                  ...muscleGroup,
                  exercises: muscleGroup.exercises.filter((e) => e.id !== ex.id),
                })
              }
            />
          </div>
        ))}
        <button
          onClick={() => {
            const firstInGroup = exerciseCatalog.find((c) => c.group === muscleGroup.group);
            if (!firstInGroup) return;
            const newEx: WorkoutExercise = {
              id: `e-${Date.now()}`,
              catalogId: firstInGroup.id,
              method: "סטנדרטי",
              restSeconds: 60,
              sets: [{ setNumber: 1, minReps: 10, maxReps: 12 }],
            };
            onUpdate({ ...muscleGroup, exercises: [...muscleGroup.exercises, newEx] });
            setExpandedIds((prev) => new Set([...prev, newEx.id]));
          }}
          className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-500 transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:text-purple-700"
        >
          <FaPlus size={10} />
          <span>הוסף תרגיל</span>
        </button>
      </div>
    </div>
  );
}

function ExercisePicker({
  value,
  muscleGroup,
  onChange,
}: {
  value: string;
  muscleGroup: MuscleGroup;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = exerciseCatalog.find((c) => c.id === value);
  const availableExercises = exerciseCatalog.filter((c) => c.group === muscleGroup);
  const filtered = availableExercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 pe-7 text-right text-sm font-bold text-slate-800 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 relative"
      >
        <span className="block truncate">{selected?.name || "— בחר תרגיל —"}</span>
        <FaChevronDown
          size={8}
          className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* Search */}
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <FaMagnifyingGlass
                size={10}
                className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש תרגיל..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 ps-7 pe-2 text-xs text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                dir="rtl"
              />
            </div>
          </div>

          {/* Scrollable list */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                {search ? `לא נמצא תרגיל "${search}"` : "אין תרגילים בקבוצה זו"}
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = c.id === value;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      onChange(c.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-right text-xs transition-colors ${
                      isSelected
                        ? "bg-purple-50 text-purple-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex h-8 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                      <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                    </span>
                    <span className="flex-1 font-medium">{c.name}</span>
                    {isSelected && <FaCheck size={9} className="text-purple-600" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/40 px-3 py-1.5 text-[10px] text-slate-400 text-center">
            {filtered.length} מתוך {availableExercises.length} תרגילים
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  muscleGroup,
}: {
  exercise: WorkoutExercise;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (e: WorkoutExercise) => void;
  onDelete: () => void;
  muscleGroup: MuscleGroup;
}) {
  const totalRepsRange = `${Math.min(...exercise.sets.map((s) => s.minReps))}-${Math.max(...exercise.sets.map((s) => s.maxReps))}`;
  const catalogEntry = exerciseCatalog.find((c) => c.id === exercise.catalogId);
  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1];
    onUpdate({
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          setNumber: exercise.sets.length + 1,
          minReps: last?.minReps || 10,
          maxReps: last?.maxReps || 12,
        },
      ],
    });
  };
  const updateSet = (setNumber: number, updates: Partial<WorkoutSet>) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets.map((s) => (s.setNumber === setNumber ? { ...s, ...updates } : s)),
    });
  };
  const deleteSet = (setNumber: number) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets
        .filter((s) => s.setNumber !== setNumber)
        .map((s, i) => ({ ...s, setNumber: i + 1 })),
    });
  };
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${isExpanded ? "border-purple-300" : "border-slate-200 hover:border-slate-300"}`}
    >
      <div className="flex items-stretch gap-3 p-2.5">
        <div className="flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
          {catalogEntry ? (
            <img
              src={catalogEntry.image}
              alt={catalogEntry.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <FaDumbbell size={24} className="text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
          <ExercisePicker
            value={exercise.catalogId}
            muscleGroup={muscleGroup}
            onChange={(catalogId) => onUpdate({ ...exercise, catalogId })}
          />
          <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
            <span className="inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 font-bold text-purple-700">
              {exercise.sets.length} סטים
            </span>
            <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 font-semibold">
              {totalRepsRange} חזרות
            </span>
            <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 font-semibold">
              {exercise.restSeconds}״ מנוחה
            </span>
            {exercise.method && (
              <span className="truncate text-slate-400">· {exercise.method}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5">
          <button
            onClick={onToggle}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${isExpanded ? "bg-purple-100 text-purple-700" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
          >
            {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>
          <button
            onClick={onDelete}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
            aria-label="מחק תרגיל"
          >
            <FaXmark size={10} />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/30 p-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    שיטת אימון
                  </label>
                  {exercise.method && (
                    <button
                      onClick={() => onUpdate({ ...exercise, method: "" })}
                      className="inline-flex items-center gap-1 rounded text-[9px] font-semibold text-rose-600 hover:text-rose-700"
                      title="מחק שיטת אימון"
                    >
                      <FaXmark size={8} />
                      <span>מחק</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={exercise.method}
                    onChange={(e) => onUpdate({ ...exercise, method: e.target.value })}
                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-2 py-1.5 pe-7 text-xs font-medium text-slate-700 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="">— ללא שיטה —</option>
                    {workoutMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown
                    size={9}
                    className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  מנוחה (שניות)
                </label>
                <input
                  type="number"
                  value={exercise.restSeconds}
                  onChange={(e) => onUpdate({ ...exercise, restSeconds: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  סטים
                </label>
                <button
                  onClick={addSet}
                  className="inline-flex items-center gap-1 rounded-md bg-gradient-to-br from-purple-500 to-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm hover:shadow-md"
                >
                  <FaPlus size={8} />
                  <span>סט</span>
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {exercise.sets.map((set) => (
                  <div
                    key={set.setNumber}
                    className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5"
                  >
                    <span className="text-xs font-bold text-purple-700">סט {set.setNumber}</span>
                    <div>
                      <p className="mb-0.5 text-[9px] uppercase text-slate-400">מינ׳ חזרות</p>
                      <input
                        type="number"
                        value={set.minReps}
                        onChange={(e) =>
                          updateSet(set.setNumber, { minReps: Number(e.target.value) })
                        }
                        className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-center text-sm font-bold text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <div>
                      <p className="mb-0.5 text-[9px] uppercase text-slate-400">מקס׳ חזרות</p>
                      <input
                        type="number"
                        value={set.maxReps}
                        onChange={(e) =>
                          updateSet(set.setNumber, { maxReps: Number(e.target.value) })
                        }
                        className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-center text-sm font-bold text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <button
                      onClick={() => {
                        onUpdate({
                          ...exercise,
                          sets: [
                            ...exercise.sets,
                            {
                              setNumber: exercise.sets.length + 1,
                              minReps: set.minReps,
                              maxReps: set.maxReps,
                            },
                          ],
                        });
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-purple-100 hover:text-purple-700"
                      aria-label="שכפל סט"
                      title="שכפל סט"
                    >
                      <FaCopy size={11} />
                    </button>
                    <button
                      onClick={() => deleteSet(set.setNumber)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-600"
                      aria-label="מחק סט"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormsTab() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"כל הקבוצות" | FormResponse["formType"]>(
    "כל הקבוצות"
  );
  const [openForm, setOpenForm] = useState<FormResponse | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>(formResponses);

  const filtered = responses.filter((r) => {
    const matchesSearch =
      r.respondent.toLowerCase().includes(search.toLowerCase()) ||
      r.formName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "כל הקבוצות" || r.formType === filterType;
    return matchesSearch && matchesType;
  });

  const formTypes: ("כל הקבוצות" | FormResponse["formType"])[] = [
    "כל הקבוצות",
    "התחלה",
    "ביניים",
    "סיום ליווי",
    "התאמה מקצועית",
  ];

  const typeColors: Record<FormResponse["formType"], string> = {
    התחלה: "bg-blue-100 text-blue-700",
    ביניים: "bg-amber-100 text-amber-700",
    "סיום ליווי": "bg-emerald-100 text-emerald-700",
    "התאמה מקצועית": "bg-purple-100 text-purple-700",
  };

  const toggleViewed = (id: string) => {
    setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, viewed: !r.viewed } : r)));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FaMagnifyingGlass
            size={12}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי משתמש או שאלון"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="relative sm:w-72">
          <FaFilter
            size={11}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-9 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {formTypes.map((t) => (
              <option key={t} value={t}>
                סוג השאלון — {t}
              </option>
            ))}
          </select>
          <FaChevronDown
            size={10}
            className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Forms table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FaClipboardList size={16} className="text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900">שאלונים שמילא המתאמן</h3>
            <span className="text-xs text-slate-400">({filtered.length} שאלונים)</span>
          </div>
          <span className="text-xs text-slate-400">דף 1 תוך 1</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-slate-500">
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  משתמש
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  שאלון
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  סוג השאלון
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  נענה בתאריך
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  נצפה
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    לא נמצאו שאלונים תואמים
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-700">{r.respondent}</td>
                    <td className="px-5 py-4 text-slate-700">{r.formName}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColors[r.formType]}`}
                      >
                        {r.formType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-slate-700">{r.date}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleViewed(r.id)}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                          r.viewed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white hover:border-emerald-400"
                        }`}
                        aria-label="סמן כנצפה"
                      >
                        {r.viewed && <FaCheck size={10} />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setOpenForm(r);
                            if (!r.viewed) toggleViewed(r.id);
                          }}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <FaEye size={10} />
                          <span>צפה</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openForm && <FormDetailModal response={openForm} onClose={() => setOpenForm(null)} />}
    </div>
  );
}

function FormDetailModal({ response, onClose }: { response: FormResponse; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col gap-4 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <FaClipboardList size={18} className="text-amber-600" />
              <h2 className="text-2xl font-bold text-slate-900">פרטי תשובה</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              aria-label="סגור"
            >
              <FaXmark size={18} />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">שם הטופס</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{response.formName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">סוג הטופס</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{response.formType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">משיב</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{response.respondent}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">נשלח בתאריך</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{response.date}</p>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm">
          {response.sections.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeSection === i
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Active section content */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="mb-3 text-lg font-bold text-slate-900">
            {response.sections[activeSection].title}
          </h3>
          <div className="flex flex-col gap-2">
            {response.sections[activeSection].fields.map((field, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-slate-50/40 px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-700">{field.question}</p>
                <p className="mt-1 text-sm text-slate-600">{field.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StrengthProgress() {
  const [filter, setFilter] = useState<"הכל" | MuscleGroup>("הכל");
  const [openExercise, setOpenExercise] = useState<string | null>(null);
  const [detailExercise, setDetailExercise] = useState<ExerciseProgress | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const groups: ("הכל" | MuscleGroup)[] = [
    "הכל",
    "חזה",
    "גב",
    "טרפזים",
    "כתפיים",
    "יד קידמית",
    "יד אחורית",
    "רגליים",
    "ישבן",
    "תאומים",
    "אמות",
    "בטן",
  ];
  const filtered = filter === "הכל" ? strengthData : strengthData.filter((e) => e.group === filter);

  // Summary stats
  const prsThisMonth = strengthData.filter((e) => {
    const last = e.sessions[e.sessions.length - 1];
    const prev = e.sessions[e.sessions.length - 2];
    return last && prev && last.weight > prev.weight;
  }).length;
  const totalGain = strengthData.reduce((s, e) => {
    const first = e.sessions[0];
    const last = e.sessions[e.sessions.length - 1];
    if (!first || !last || first.weight === 0) return s;
    return s + ((last.weight - first.weight) / first.weight) * 100;
  }, 0);
  const avgGain = (
    totalGain / strengthData.filter((e) => e.sessions[0]?.weight > 0).length
  ).toFixed(1);
  const heaviestLift = strengthData.reduce(
    (max, e) => {
      const top = Math.max(...e.sessions.map((s) => s.weight));
      return top > max.weight ? { name: e.name, weight: top } : max;
    },
    { name: "", weight: 0 }
  );

  // Exercises with significant progress in the last month (last 4 sessions vs prior)
  const monthlyProgress = strengthData
    .map((e) => {
      const sessions = e.sessions;
      if (sessions.length < 5) return null;
      const recent = sessions[sessions.length - 1];
      const monthAgo = sessions[Math.max(0, sessions.length - 5)];
      const isBodyweight = sessions.every((s) => s.weight === 0);
      const recentValue = isBodyweight ? recent.reps : recent.weight;
      const baseValue = isBodyweight ? monthAgo.reps : monthAgo.weight;
      if (baseValue === 0) return null;
      const gainPct = ((recentValue - baseValue) / baseValue) * 100;
      return { name: e.name, gainPct, group: e.group };
    })
    .filter(
      (x): x is { name: string; gainPct: number; group: MuscleGroup } =>
        x !== null && x.gainPct >= 5
    )
    .sort((a, b) => b.gainPct - a.gainPct);

  const topMonthly = monthlyProgress[0];

  const stats = [
    {
      label: "ממוצע עלייה",
      value: `${avgGain}%`,
      sub: "מתחילת ליווי",
      color: "from-emerald-500 to-emerald-600",
      icon: <FaArrowTrendUp size={18} />,
    },
    {
      label: "PRs החודש",
      value: prsThisMonth,
      sub: "תרגילים בהם שבר שיא",
      color: "from-blue-500 to-indigo-600",
      icon: <FaBoltLightning size={18} />,
    },
    {
      label: "התקדמות החודש",
      value: monthlyProgress.length,
      sub: topMonthly
        ? `המוביל: ${topMonthly.name} +${topMonthly.gainPct.toFixed(0)}%`
        : "תרגילים בולטים",
      color: "from-purple-500 to-fuchsia-600",
      icon: <FaArrowTrendUp size={18} />,
    },
    {
      label: "הרמה כבדה ביותר",
      value: `${heaviestLift.weight} ק״ג`,
      sub: heaviestLift.name,
      color: "from-orange-500 to-amber-600",
      icon: <FaArrowTrendUp size={18} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar + Note creator button */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === g
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <button
          onClick={() => setNoteOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-800"
        >
          <FaNoteSticky size={12} />
          <span>צור פתק התקדמות</span>
        </button>
      </div>

      {/* Exercise cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((exercise) => {
          const first = exercise.sessions[0];
          const last = exercise.sessions[exercise.sessions.length - 1];
          const isBodyweight = exercise.sessions.every((s) => s.weight === 0);
          const gain = isBodyweight ? last.reps - first.reps : last.weight - first.weight;
          const gainPercent = isBodyweight
            ? first.reps === 0
              ? 0
              : Math.round(((last.reps - first.reps) / first.reps) * 100)
            : first.weight === 0
              ? 0
              : Math.round(((last.weight - first.weight) / first.weight) * 100);
          const colors = muscleGroupColors[exercise.group];
          const isOpen = openExercise === exercise.name;

          return (
            <div
              key={exercise.name}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span
                      className={`inline-flex items-center rounded-full ${colors.bg} px-2.5 py-0.5 text-xs font-semibold ${colors.text}`}
                    >
                      {exercise.group}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{exercise.name}</h3>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-md`}
                  >
                    <FaDumbbell size={14} />
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">נוכחי</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isBodyweight
                        ? `${last.reps} ${last.reps > 30 ? "שניות" : "חזרות"}`
                        : `${last.weight} ק״ג`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isBodyweight ? "ללא משקל" : `${last.reps} חזרות`}
                    </p>
                  </div>
                  <div
                    className={`text-end ${gain > 0 ? "text-emerald-600" : gain < 0 ? "text-rose-600" : "text-slate-400"}`}
                  >
                    <p className="text-xs font-semibold">
                      {gain > 0 ? "↑" : gain < 0 ? "↓" : "—"} {Math.abs(gain)}
                      {isBodyweight ? (last.reps > 30 ? " שנ׳" : "") : " ק״ג"}
                    </p>
                    <p className="text-[10px] font-bold">
                      {gainPercent > 0 ? "+" : ""}
                      {gainPercent}% מתחילת ליווי
                    </p>
                  </div>
                </div>

                {/* Mini sparkline */}
                <div className="mt-4">
                  <MiniSparkline
                    values={exercise.sessions.map((s) => (isBodyweight ? s.reps : s.weight))}
                    gradient={colors.gradient}
                  />
                </div>

                <button
                  onClick={() =>
                    exercise.detailed
                      ? setDetailExercise(exercise)
                      : setOpenExercise(isOpen ? null : exercise.name)
                  }
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>
                    {exercise.detailed
                      ? "ראה תיעוד סטים מלא"
                      : isOpen
                        ? "הסתר היסטוריה"
                        : "ראה היסטוריה מלאה"}
                  </span>
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider">
                          תאריך
                        </th>
                        <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider">
                          {isBodyweight ? "זמן/חזרות" : "משקל"}
                        </th>
                        <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider">
                          חזרות
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...exercise.sessions].reverse().map((s, i) => (
                        <tr key={s.date} className="border-t border-slate-100">
                          <td className="py-2 text-right text-slate-700">{s.date}</td>
                          <td
                            className={`py-2 text-center font-semibold ${i === 0 ? colors.text : "text-slate-700"}`}
                          >
                            {isBodyweight ? "—" : `${s.weight} ק״ג`}
                          </td>
                          <td
                            className={`py-2 text-center font-semibold ${i === 0 ? colors.text : "text-slate-700"}`}
                          >
                            {s.reps}
                            {isBodyweight && s.reps > 30 && " שנ׳"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {detailExercise && (
        <ExerciseDetailModal exercise={detailExercise} onClose={() => setDetailExercise(null)} />
      )}

      {noteOpen && <ProgressNoteCreator onClose={() => setNoteOpen(false)} />}
    </div>
  );
}

function ProgressNoteCreator({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("חזה");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [manualText, setManualText] = useState<string | null>(null);

  const availableExercises = strengthData.filter((e) => e.group === muscleGroup);

  const toggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Auto-generated note text
  const generatedNote = (() => {
    if (selectedExercises.length === 0) return "";
    const sFmt = new Date(startDate).toLocaleDateString("he-IL");
    const eFmt = new Date(endDate).toLocaleDateString("he-IL");

    const lines: string[] = [];
    lines.push(`היי 👋`);
    lines.push("");
    lines.push(`רצינו לעדכן אותך על ההתקדמות שלך מתאריך ${sFmt} עד ${eFmt}:`);
    lines.push("");

    selectedExercises.forEach((name) => {
      const ex = strengthData.find((e) => e.name === name);
      if (!ex || ex.sessions.length === 0) return;
      const first = ex.sessions[0];
      const last = ex.sessions[ex.sessions.length - 1];
      const isBodyweight = ex.sessions.every((s) => s.weight === 0);
      if (isBodyweight) {
        const diff = last.reps - first.reps;
        const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
        lines.push(
          `💪 ${name}: התחלת עם ${first.reps} חזרות, היום ${last.reps} (${arrow} ${Math.abs(diff)})`
        );
      } else {
        const diff = last.weight - first.weight;
        const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
        const pct = first.weight > 0 ? Math.round((diff / first.weight) * 100) : 0;
        lines.push(
          `💪 ${name}: התחלת עם ${first.weight} ק״ג, היום ${last.weight} ק״ג (${arrow} ${
            diff > 0 ? "+" : ""
          }${diff} ק״ג · ${pct > 0 ? "+" : ""}${pct}%)`
        );
      }
    });

    lines.push("");
    lines.push("המשך כך — אתה בכיוון הנכון! 🚀");
    return lines.join("\n");
  })();

  const noteText = manualText !== null ? manualText : generatedNote;

  const regenerate = () => {
    setManualText(null);
  };

  const copyToClipboard = () => {
    if (noteText) navigator.clipboard?.writeText(noteText);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col gap-4 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
              <FaNoteSticky size={16} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">צור פתק התקדמות</h2>
              <p className="text-xs text-slate-500">בחר טווח תאריכים ותרגילים ליצירת פתק אוטומטי</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="סגור"
          >
            <FaXmark size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* Right: Form */}
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
            {/* Date range */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                טווח תאריכים
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[10px] text-slate-400">מ-</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setManualText(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-slate-400">עד</p>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setManualText(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Muscle group */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                קבוצת שרירים
              </label>
              <div className="relative">
                <select
                  value={muscleGroup}
                  onChange={(e) => {
                    setMuscleGroup(e.target.value as MuscleGroup);
                    setSelectedExercises([]);
                    setManualText(null);
                  }}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pe-9 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {Object.keys(muscleGroupColors).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <FaChevronDown
                  size={10}
                  className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Exercise selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                תרגילים ({availableExercises.length})
              </label>
              <div className="flex flex-col gap-2">
                {availableExercises.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-xs text-slate-400">
                    אין תרגילים בקבוצה זו
                  </p>
                ) : (
                  availableExercises.map((ex) => {
                    const selected = selectedExercises.includes(ex.name);
                    return (
                      <button
                        key={ex.name}
                        onClick={() => {
                          toggleExercise(ex.name);
                          setManualText(null);
                        }}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-right text-sm transition-all ${
                          selected
                            ? "border-amber-300 bg-amber-50/60 text-amber-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-medium">{ex.name}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            selected
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected && <FaCheck size={9} />}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected exercises summary */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                תרגילים שנבחרו
              </p>
              {selectedExercises.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">לא נבחרו תרגילים.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedExercises.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800"
                    >
                      {name}
                      <button
                        onClick={() => {
                          toggleExercise(name);
                          setManualText(null);
                        }}
                        className="text-amber-700 hover:text-amber-900"
                      >
                        <FaXmark size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Left: Generated note preview */}
          <div className="flex min-h-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">הפתק המוצע</h3>
                <p className="text-xs text-slate-500">
                  ניתן לערוך את הטקסט ידנית לפני שליחה למתאמן
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!noteText}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40"
                  aria-label="העתק"
                >
                  <FaCopy size={11} />
                  <span>העתק</span>
                </button>
                <button
                  onClick={regenerate}
                  disabled={selectedExercises.length === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
                >
                  <FaArrowRotateRight size={11} />
                  <span>רענן פתק</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {selectedExercises.length === 0 ? (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 text-center">
                  <FaNoteSticky size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-400">בחר תרגילים כדי ליצור פתק התקדמות.</p>
                </div>
              ) : (
                <textarea
                  value={noteText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="h-full min-h-[300px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/30 p-4 text-sm leading-relaxed text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  dir="rtl"
                />
              )}
            </div>

            <button
              disabled={selectedExercises.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaPaperPlane size={12} />
              <span>שלח פתק למתאמן</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseDetailModal({
  exercise,
  onClose,
}: {
  exercise: ExerciseProgress;
  onClose: () => void;
}) {
  const detailed = exercise.detailed || [];
  const [openDate, setOpenDate] = useState<string | null>(
    detailed[detailed.length - 1]?.date || null
  );

  // Find max set count for chart lines
  const maxSets = detailed.reduce((m, s) => Math.max(m, s.sets.length), 0);
  // Series per set #: array of {date, weight} per set number
  const setColors = ["#3b82f6", "#ec4899", "#10b981", "#f97316", "#a855f7", "#06b6d4"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-7xl flex-col gap-4 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full ${muscleGroupColors[exercise.group].bg} px-2.5 py-0.5 text-xs font-semibold ${muscleGroupColors[exercise.group].text}`}
              >
                קבוצת שריר: {exercise.group}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{exercise.name}</h2>
            <p className="text-sm text-slate-500">תרגיל — מעקב סטים מלא</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="סגור"
          >
            <FaXmark size={18} />
          </button>
        </div>

        {/* Two-column body: chart on left, sets log on right */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          {/* Right column = sets log (in RTL the first child renders on right; we render log FIRST) */}
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/30 p-3 lg:order-2">
            {[...detailed].reverse().map((session) => {
              const isOpen = openDate === session.date;
              const [day, month, year] = session.date.split("/");
              const monthName =
                [
                  "ינואר",
                  "פברואר",
                  "מרץ",
                  "אפריל",
                  "מאי",
                  "יוני",
                  "יולי",
                  "אוגוסט",
                  "ספטמבר",
                  "אוקטובר",
                  "נובמבר",
                  "דצמבר",
                ][Number(month) - 1] || "";
              return (
                <div
                  key={session.date}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                    isOpen ? "border-blue-200 shadow-md" : "border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenDate(isOpen ? null : session.date)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-center leading-none ${
                          isOpen
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-slate-50/60 text-slate-700"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isOpen ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {monthName}
                        </span>
                        <span
                          className={`text-2xl font-bold ${isOpen ? "text-white" : "text-slate-900"}`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-[9px] font-medium ${
                            isOpen ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {year}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {session.sets.length} סטים
                        </span>
                        <span className="text-[10px] text-slate-400">
                          שיא: {Math.max(...session.sets.map((s) => s.weight))} ק״ג
                        </span>
                      </div>
                    </div>
                    <FaChevronDown
                      size={11}
                      className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
                      {session.sets.map((s) => (
                        <div
                          key={s.setNumber}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">
                              סט {s.setNumber}
                            </span>
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: setColors[(s.setNumber - 1) % setColors.length],
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-500">
                            תאריך: {session.date}; {s.time}
                          </p>
                          <p className="text-xs text-slate-700">
                            <span className="font-semibold">משקל עבודה:</span> {s.weight} ק״ג
                          </p>
                          <p className="text-xs text-slate-700">
                            <span className="font-semibold">חזרות:</span> {s.reps}
                          </p>
                          {s.program && (
                            <p className="text-xs text-slate-700">
                              <span className="font-semibold">תוכנית:</span> {s.program}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Left column = simple PR chart + goals */}
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto lg:order-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">התקדמות שיא לאורך זמן</h4>
                  <p className="text-xs text-slate-500">המשקל הכבד ביותר בכל אימון</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  ↑ +
                  {(
                    Math.max(...detailed[detailed.length - 1].sets.map((s) => s.weight)) -
                    Math.max(...detailed[0].sets.map((s) => s.weight))
                  ).toFixed(1)}{" "}
                  ק״ג מתחילה
                </span>
              </div>
              <PRTrendChart sessions={detailed} />
            </div>

            {/* Goals section */}
            <ExerciseGoals exercise={exercise} sessions={detailed} />

            {/* Monthly PRs */}
            <MonthlyPRs sessions={detailed} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PRTrendChart({ sessions }: { sessions: ExerciseSession[] }) {
  if (sessions.length === 0) return null;
  const W = 600;
  const H = 240;
  const padTop = 28;
  const padBottom = 32;
  const padLeft = 44;
  const padRight = 20;

  const points = sessions.map((s) => ({
    date: s.date,
    weight: Math.max(...s.sets.map((set) => set.weight)),
    reps: s.sets.find((set) => set.weight === Math.max(...s.sets.map((x) => x.weight)))?.reps || 0,
  }));

  const weights = points.map((p) => p.weight);
  // Round nicely — find rounded min/max so Y labels are clean integers
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const padding = Math.max(2, (rawMax - rawMin) * 0.2);
  const minW = Math.floor((rawMin - padding) / 5) * 5;
  const maxW = Math.ceil((rawMax + padding) / 5) * 5;
  const stepX = (W - padLeft - padRight) / Math.max(1, points.length - 1);

  const coords = points.map((p, i) => ({
    x: padLeft + i * stepX,
    y: padTop + (1 - (p.weight - minW) / (maxW - minW)) * (H - padTop - padBottom),
    weight: p.weight,
    date: p.date,
    reps: p.reps,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L ${coords[coords.length - 1].x.toFixed(1)} ${H - padBottom} L ${coords[0].x.toFixed(1)} ${H - padBottom} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(minW + ((maxW - minW) * i) / yTicks)
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-56 w-full">
      <defs>
        <linearGradient id="prGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yLabels.map((_, i) => {
        const gy = padTop + ((H - padTop - padBottom) * i) / yTicks;
        return (
          <g key={i}>
            <line
              x1={padLeft}
              x2={W - padRight}
              y1={gy}
              y2={gy}
              stroke="#e2e8f0"
              strokeDasharray="2 4"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={padLeft - 8}
              y={gy + 3}
              fontSize="9"
              fill="#cbd5e1"
              textAnchor="end"
              fontFamily="Heebo, sans-serif"
              fontWeight="500"
            >
              {yLabels[yLabels.length - 1 - i]}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#prGradient)" />
      <path
        d={linePath}
        fill="none"
        stroke="#10b981"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {coords.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.x}
            cy={c.y}
            r="3"
            fill="#fff"
            stroke="#10b981"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
          {/* Value label with subtle pill background */}
          <rect
            x={c.x - 14}
            y={c.y - 22}
            width="28"
            height="14"
            rx="7"
            fill="#10b981"
            opacity="0.95"
          />
          <text
            x={c.x}
            y={c.y - 12}
            fontSize="9"
            fontWeight="700"
            fill="#ffffff"
            textAnchor="middle"
            fontFamily="Heebo, sans-serif"
          >
            {c.weight}
          </text>
        </g>
      ))}

      {/* X labels */}
      {coords.map((c, i) => (
        <text
          key={i}
          x={c.x}
          y={H - padBottom + 18}
          fontSize="9"
          fill="#94a3b8"
          textAnchor="middle"
          fontFamily="Heebo, sans-serif"
          fontWeight="500"
        >
          {c.date}
        </text>
      ))}
    </svg>
  );
}

function ExerciseGoals({
  exercise,
  sessions,
}: {
  exercise: ExerciseProgress;
  sessions: ExerciseSession[];
}) {
  // Current PR set (heaviest weight)
  const allSets = sessions.flatMap((s) => s.sets);
  const heaviestSet = allSets.reduce((max, s) => (s.weight > max.weight ? s : max), allSets[0]);
  const currentPR = heaviestSet.weight;
  const currentReps = heaviestSet.reps;

  const [goalWeight, setGoalWeight] = useState<number>(Math.ceil(currentPR * 1.1));
  const [goalReps, setGoalReps] = useState<number>(currentReps);
  const [goalDate, setGoalDate] = useState<string>("");
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingReps, setEditingReps] = useState(false);

  const gap = goalWeight - currentPR;
  const gapPct = currentPR > 0 ? ((gap / currentPR) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/40 via-white to-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <FaArrowTrendUp size={14} className="text-blue-600" />
        <h4 className="text-sm font-bold text-slate-900">יעד הבא</h4>
        <span className="text-xs text-slate-400">(להציב מטרה למתאמן)</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Current */}
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">שיא נוכחי</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{currentPR} ק״ג</p>
          <p className="text-xs text-slate-500">{currentReps} חזרות</p>
        </div>

        {/* Goal */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3">
          <p className="text-[10px] uppercase tracking-wider text-blue-600">יעד</p>

          <div className="mt-1 flex items-baseline gap-1.5">
            {editingWeight ? (
              <input
                type="number"
                value={goalWeight}
                onChange={(e) => setGoalWeight(Number(e.target.value))}
                onBlur={() => setEditingWeight(false)}
                autoFocus
                className="w-16 rounded-lg border border-blue-300 bg-white px-1 py-0.5 text-xl font-bold text-blue-700 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setEditingWeight(true)}
                className="text-xl font-bold text-blue-700 hover:underline"
              >
                {goalWeight} ק״ג
              </button>
            )}
            <span className="text-sm text-slate-500">×</span>
            {editingReps ? (
              <input
                type="number"
                value={goalReps}
                onChange={(e) => setGoalReps(Number(e.target.value))}
                onBlur={() => setEditingReps(false)}
                autoFocus
                className="w-14 rounded-lg border border-blue-300 bg-white px-1 py-0.5 text-base font-bold text-blue-700 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setEditingReps(true)}
                className="text-base font-bold text-blue-700 hover:underline"
              >
                {goalReps}
              </button>
            )}
            <span className="text-xs text-slate-500">חזרות</span>
            <button
              onClick={() => {
                setEditingWeight(true);
              }}
              className="ms-auto text-blue-600 hover:text-blue-700"
              aria-label="ערוך יעד"
            >
              <FaPencil size={9} />
            </button>
          </div>

          <input
            type="date"
            value={goalDate}
            onChange={(e) => setGoalDate(e.target.value)}
            className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Gap */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600">פער</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {gap > 0 ? "+" : ""}
            {gap} ק״ג
          </p>
          <p className="text-[10px] text-emerald-600">
            {gapPct}% עלייה · {goalReps - currentReps > 0 ? "+" : ""}
            {goalReps - currentReps} חזרות
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>0 ק״ג</span>
          <span className="font-bold text-slate-700">
            יעד: {goalWeight} ק״ג × {goalReps}
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-blue-500 to-emerald-500"
            style={{ width: `${Math.min(100, (currentPR / goalWeight) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-center text-[10px] font-semibold text-slate-500">
          {((currentPR / goalWeight) * 100).toFixed(0)}% מהיעד הושג
        </p>
      </div>
    </div>
  );
}

function MonthlyPRs({ sessions }: { sessions: ExerciseSession[] }) {
  // Group by month → find heaviest set per month
  const byMonth = new Map<
    string,
    { date: string; weight: number; reps: number; setNumber: number }
  >();
  sessions.forEach((session) => {
    const [, month, year] = session.date.split("/");
    const key = `${month}/${year}`;
    const topSet = session.sets.reduce(
      (max, s) => (s.weight > max.weight ? s : max),
      session.sets[0]
    );
    const existing = byMonth.get(key);
    if (!existing || topSet.weight > existing.weight) {
      byMonth.set(key, {
        date: session.date,
        weight: topSet.weight,
        reps: topSet.reps,
        setNumber: topSet.setNumber,
      });
    }
  });

  const months = Array.from(byMonth.entries())
    .map(([key, pr]) => {
      const [month, year] = key.split("/");
      return { key, month: Number(month), year, pr };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year.localeCompare(b.year);
      return a.month - b.month;
    });

  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <FaBoltLightning size={14} className="text-amber-500" />
        <h4 className="text-sm font-bold text-slate-900">שיאים חודשיים</h4>
        <span className="text-xs text-slate-400">(המשקל הכבד ביותר בכל חודש)</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {months.map((m, i) => {
          const prev = i > 0 ? months[i - 1].pr.weight : null;
          const delta = prev !== null ? m.pr.weight - prev : null;
          return (
            <div
              key={m.key}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/60 via-white to-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {monthNames[m.month - 1]} {m.year}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {m.pr.weight} <span className="text-sm text-slate-500">ק״ג</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {m.pr.reps} חזרות · סט {m.pr.setNumber}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                  <FaBoltLightning size={14} />
                </div>
              </div>
              {delta !== null && (
                <div
                  className={`mt-3 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${
                    delta > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : delta < 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span>{delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}</span>
                  <span>
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(1)} ק״ג מהחודש הקודם
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MultiSetChart({
  sessions,
  maxSets,
  colors,
}: {
  sessions: ExerciseSession[];
  maxSets: number;
  colors: string[];
}) {
  if (sessions.length === 0) return null;
  const W = 600;
  const H = 320;
  const padTop = 16;
  const padBottom = 32;
  const padLeft = 36;
  const padRight = 12;

  // Build series per set
  const series: { setIndex: number; points: { x: number; y: number; weight: number }[] }[] = [];
  const allWeights: number[] = [];
  sessions.forEach((s) => s.sets.forEach((set) => allWeights.push(set.weight)));
  const minW = Math.min(...allWeights) - 2;
  const maxW = Math.max(...allWeights) + 2;
  const stepX = (W - padLeft - padRight) / Math.max(1, sessions.length - 1);

  for (let i = 0; i < maxSets; i++) {
    const points: { x: number; y: number; weight: number }[] = [];
    sessions.forEach((session, sessionIdx) => {
      const set = session.sets.find((s) => s.setNumber === i + 1);
      if (set) {
        const x = padLeft + sessionIdx * stepX;
        const y = padTop + (1 - (set.weight - minW) / (maxW - minW)) * (H - padTop - padBottom);
        points.push({ x, y, weight: set.weight });
      }
    });
    if (points.length > 0) series.push({ setIndex: i, points });
  }

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    (minW + ((maxW - minW) * i) / yTicks).toFixed(1)
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-72 w-full">
      <defs>
        {series.map((s) => (
          <linearGradient
            key={s.setIndex}
            id={`grad-set-${s.setIndex}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={colors[s.setIndex % colors.length]} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors[s.setIndex % colors.length]} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* Grid */}
      {yLabels.map((label, i) => {
        const gy = padTop + ((H - padTop - padBottom) * i) / yTicks;
        return (
          <g key={i}>
            <line
              x1={padLeft}
              x2={W - padRight}
              y1={gy}
              y2={gy}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />
            <text
              x={padLeft - 6}
              y={gy + 3}
              fontSize="9"
              fill="#94a3b8"
              textAnchor="end"
              fontFamily="Heebo, sans-serif"
            >
              {yLabels[yLabels.length - 1 - i]}
            </text>
          </g>
        );
      })}

      {/* Areas + lines per set */}
      {series.map((s) => {
        const linePath = s.points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ");
        const areaPath =
          linePath +
          ` L ${s.points[s.points.length - 1].x.toFixed(1)} ${H - padBottom} L ${s.points[0].x.toFixed(1)} ${H - padBottom} Z`;
        const c = colors[s.setIndex % colors.length];
        return (
          <g key={s.setIndex}>
            <path d={areaPath} fill={`url(#grad-set-${s.setIndex})`} />
            <path
              d={linePath}
              fill="none"
              stroke={c}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {s.points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#fff"
                stroke={c}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        );
      })}

      {/* X labels */}
      {sessions.map((session, i) => (
        <text
          key={session.date}
          x={padLeft + i * stepX}
          y={H - padBottom + 16}
          fontSize="9"
          fill="#94a3b8"
          textAnchor="middle"
          fontFamily="Heebo, sans-serif"
        >
          {session.date}
        </text>
      ))}
    </svg>
  );
}

function MiniSparkline({ values, gradient }: { values: number[]; gradient: string }) {
  if (values.length === 0) return null;
  const W = 200;
  const H = 50;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = W / Math.max(1, values.length - 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: H - ((v - min) / range) * (H - 8) - 4,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  // Pull color from gradient class
  const colorMap: Record<string, string> = {
    "from-blue-500 to-indigo-600": "#3b82f6",
    "from-emerald-500 to-teal-600": "#10b981",
    "from-purple-500 to-fuchsia-600": "#a855f7",
    "from-orange-500 to-amber-600": "#f97316",
    "from-pink-500 to-rose-600": "#ec4899",
    "from-slate-500 to-slate-700": "#64748b",
  };
  const stroke = colorMap[gradient] || "#3b82f6";
  const id = `spark-${gradient.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-12 w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2"
          fill="#fff"
          stroke={stroke}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function MeasurementsTable() {
  const columns: { key: keyof Omit<Measurement, "date">; label: string; color: string }[] = [
    { key: "chest", label: "חזה", color: "text-blue-600" },
    { key: "arm", label: "זרוע", color: "text-purple-600" },
    { key: "waist", label: "מותן", color: "text-emerald-600" },
    { key: "buttocks", label: "ישבן", color: "text-orange-600" },
    { key: "thigh", label: "ירך", color: "text-pink-600" },
    { key: "calves", label: "תאומים", color: "text-indigo-600" },
  ];

  const [rows, setRows] = useState<Measurement[]>(measurementsData);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [draft, setDraft] = useState<Measurement | null>(null);

  const startEdit = (row: Measurement) => {
    setEditingDate(row.date);
    setDraft({ ...row });
  };
  const cancelEdit = () => {
    setEditingDate(null);
    setDraft(null);
  };
  const saveEdit = () => {
    if (!draft || !editingDate) return;
    setRows((prev) => prev.map((r) => (r.date === editingDate ? draft : r)));
    setEditingDate(null);
    setDraft(null);
  };
  const deleteRow = (date: string) => {
    if (!window.confirm(`למחוק את המדידה מ-${date}?`)) return;
    setRows((prev) => prev.filter((r) => r.date !== date));
  };
  const addNew = () => {
    const today = new Date().toLocaleDateString("he-IL");
    const newRow: Measurement = {
      date: today,
      chest: 0,
      arm: 0,
      waist: 0,
      buttocks: 0,
      thigh: 0,
      calves: 0,
    };
    if (rows.some((r) => r.date === today)) {
      alert("כבר קיימת מדידה לתאריך הזה");
      return;
    }
    setRows((prev) => [...prev, newRow]);
    setEditingDate(today);
    setDraft(newRow);
  };

  // Latest row & change vs first row
  const latest = rows[rows.length - 1] || measurementsData[0];
  const earliest = rows[0] || measurementsData[0];

  const getDelta = (key: keyof Omit<Measurement, "date">) => {
    const diff = latest[key] - earliest[key];
    if (diff === 0) return { text: "0", color: "text-slate-400", arrow: "" };
    if (diff < 0) return { text: `${diff}`, color: "text-emerald-600", arrow: "↓" };
    return { text: `+${diff}`, color: "text-rose-600", arrow: "↑" };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary stat cards — change vs start */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {columns.map((c) => {
          const delta = getDelta(c.key);
          return (
            <div
              key={c.key}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className={`mt-1 text-2xl font-bold ${c.color}`}>
                {latest[c.key]}
                <span className="text-xs text-slate-400 mr-1">ס״מ</span>
              </p>
              <p className={`mt-0.5 text-xs font-semibold ${delta.color}`}>
                {delta.arrow} {delta.text} מהתחלה
              </p>
            </div>
          );
        })}
      </div>

      {/* Measurements table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FaHeartPulse size={16} className="text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">מעקב היקפים</h3>
            <span className="text-xs text-slate-400">({rows.length} מדידות)</span>
          </div>
          <button
            onClick={addNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
          >
            <FaPencil size={11} />
            <span>הוסף מדידה</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-slate-500">
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                  תאריך
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((row, i) => {
                const isEditing = editingDate === row.date;
                const useEditValues = isEditing && draft;
                return (
                  <tr
                    key={row.date}
                    className={`border-t border-slate-100 transition-colors ${
                      isEditing
                        ? "bg-blue-50/60"
                        : i === 0
                          ? "bg-blue-50/30 hover:bg-blue-50/50"
                          : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="px-5 py-4 text-right font-semibold text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draft!.date}
                          onChange={(e) => setDraft({ ...draft!, date: e.target.value })}
                          className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                          dir="ltr"
                        />
                      ) : (
                        <>
                          {row.date}
                          {i === 0 && (
                            <span className="ms-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              אחרונה
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-5 py-4 text-center font-semibold ${
                          isEditing ? "text-slate-700" : i === 0 ? c.color : "text-slate-700"
                        }`}
                      >
                        {useEditValues ? (
                          <input
                            type="number"
                            value={draft![c.key]}
                            onChange={(e) =>
                              setDraft({ ...draft!, [c.key]: Number(e.target.value) })
                            }
                            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
                          />
                        ) : (
                          row[c.key]
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                            >
                              <FaFloppyDisk size={10} />
                              <span>שמור</span>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              <FaXmark size={10} />
                              <span>בטל</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(row)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
                              aria-label="ערוך"
                            >
                              <FaPencil size={11} />
                            </button>
                            <button
                              onClick={() => deleteRow(row.date)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
                              aria-label="מחק"
                            >
                              <FaTrash size={11} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserProfileForm() {
  const [firstName, setFirstName] = useState("שרון");
  const [lastName, setLastName] = useState("אבוחצירה");
  const [email, setEmail] = useState("sharolga@gmail.com");
  const [phone, setPhone] = useState("0537439123");
  const [planTypeForm, setPlanTypeForm] = useState("חיטוב");
  const [periodicCheck, setPeriodicCheck] = useState("שבוע");
  const [startDate, setStartDate] = useState("2026-05-05");
  const [endDate, setEndDate] = useState("2027-02-07");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("ללא");
  const [editingDiet, setEditingDiet] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <FaUser size={16} className="text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">פרטי משתמש</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelCls}>שם פרטי</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputCls}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelCls}>שם משפחה</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputCls}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelCls}>טלפון</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
            dir="ltr"
          />
        </div>
        <div>
          <label className={labelCls}>אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            dir="ltr"
          />
        </div>
        <div>
          <label className={labelCls}>סוג תוכנית</label>
          <div className="relative">
            <select
              value={planTypeForm}
              onChange={(e) => setPlanTypeForm(e.target.value)}
              className={`${inputCls} cursor-pointer appearance-none pe-10`}
            >
              <option>חיטוב</option>
              <option>במסה</option>
              <option>שמירה</option>
              <option>התאוששות</option>
            </select>
            <FaChevronDown
              size={11}
              className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>בדיקה תקופתית</label>
          <div className="relative">
            <select
              value={periodicCheck}
              onChange={(e) => setPeriodicCheck(e.target.value)}
              className={`${inputCls} cursor-pointer appearance-none pe-10`}
            >
              <option>שבוע</option>
              <option>שבועיים</option>
              <option>חודש</option>
              <option>רבעון</option>
            </select>
            <FaChevronDown
              size={11}
              className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>תאריך תחילת הליווי</label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${inputCls} pe-10`}
            />
            <FaCalendarDays
              size={13}
              className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-blue-500"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>תאריך סיום הליווי</label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${inputCls} pe-10`}
            />
            <FaCalendarCheck
              size={13}
              className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label className={`${labelCls} mb-0`}>הגבלות תזונה</label>
          <button
            onClick={() => setEditingDiet(!editingDiet)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
            aria-label="ערוך הגבלות תזונה"
          >
            <FaPencil size={10} />
          </button>
        </div>
        {editingDiet ? (
          <textarea
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            onBlur={() => setEditingDiet(false)}
            autoFocus
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="לדוגמה: צמחוני, ללא גלוטן, ללא לקטוז..."
            dir="rtl"
          />
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700">
            {dietaryRestrictions || "ללא"}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg ${
            saved
              ? "bg-emerald-600"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          }`}
        >
          <FaFloppyDisk size={13} />
          <span>{saved ? "✓ נשמר בהצלחה" : "שמור משתמש"}</span>
        </button>
      </div>
    </div>
  );
}

function ComparePane({
  date,
  angle,
  badge,
  badgeColor,
  photoUrl,
  metadata,
  sortedDates,
  onChangeDate,
}: {
  date: string;
  angle: number;
  badge: string;
  badgeColor: string;
  photoUrl?: string;
  metadata?: { weight?: string; bodyFat?: string };
  sortedDates: string[];
  onChangeDate: (d: string) => void;
}) {
  const currentIdx = sortedDates.indexOf(date);
  const goPrev = () => {
    if (currentIdx > 0) onChangeDate(sortedDates[currentIdx - 1]);
  };
  const goNext = () => {
    if (currentIdx < sortedDates.length - 1) onChangeDate(sortedDates[currentIdx + 1]);
  };

  return (
    <div className="flex min-h-0 flex-col gap-3">
      {/* Image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-slate-100">
        <span
          className={`absolute right-3 top-3 z-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-md ${badgeColor}`}
        >
          {badge}
        </span>
        {photoUrl ? (
          <img src={photoUrl} alt={badge} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
            <FaCamera size={48} />
            <span className="text-sm font-medium">אין תמונה לזווית ולתאריך הזה</span>
          </div>
        )}
      </div>

      {/* Metadata bar */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <button
          onClick={goPrev}
          disabled={currentIdx <= 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white disabled:opacity-30"
          aria-label="תאריך קודם"
        >
          <FaArrowRight size={12} />
        </button>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-1 text-center text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">תאריך</p>
            <p className="font-bold text-slate-900">{date || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">משקל</p>
            <p className="font-bold text-slate-900">{metadata?.weight || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">אחוז שומן</p>
            <p className="font-bold text-slate-900">{metadata?.bodyFat || "—"}</p>
          </div>
        </div>
        <button
          onClick={goNext}
          disabled={currentIdx >= sortedDates.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white disabled:opacity-30"
          aria-label="תאריך הבא"
        >
          <FaArrowLeft size={12} />
        </button>
      </div>
    </div>
  );
}
