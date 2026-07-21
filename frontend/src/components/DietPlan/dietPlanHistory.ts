import type { IDietPlan } from "@/interfaces/IDietPlan";

export type DietPlanHistoryType = "save" | "preset-loaded" | "created";

export type MacroKey = "protein" | "carbs" | "fats" | "veggies";

export const MACRO_LABELS: Record<MacroKey, string> = {
  protein: "חלבון",
  carbs: "פחמימות",
  fats: "שומן",
  veggies: "ירקות",
};

export interface DietPlanTotals {
  protein: number;
  carbs: number;
  fats: number;
  veggies: number;
  freeCalories: number;
  mealCount: number;
}

export interface DietPlanChangeSummary {
  presetName?: string;
  macros: { key: MacroKey; before: number; after: number }[];
  freeCalories?: { before: number; after: number };
  mealCount?: { before: number; after: number };
}

export interface DietPlanHistoryEntry {
  id: string;
  timestamp: string;
  type: DietPlanHistoryType;
  description: string;
  details?: DietPlanChangeSummary;
}

const MAX_ENTRIES = 50;
const storageKey = (userId: string) => `dietPlan:history:${userId}`;

export const computePlanTotals = (plan: IDietPlan | null | undefined): DietPlanTotals => {
  const meals = plan?.meals ?? [];
  const totals: DietPlanTotals = {
    protein: 0,
    carbs: 0,
    fats: 0,
    veggies: 0,
    freeCalories: Number(plan?.freeCalories) || 0,
    mealCount: meals.length,
  };
  meals.forEach((m) => {
    totals.protein += Number(m?.totalProtein?.quantity) || 0;
    totals.carbs += Number(m?.totalCarbs?.quantity) || 0;
    totals.fats += Number(m?.totalFats?.quantity) || 0;
    totals.veggies += Number(m?.totalVeggies?.quantity) || 0;
  });

  return totals;
};

export const buildChangeSummary = (
  before: DietPlanTotals,
  after: DietPlanTotals,
  presetName?: string
): DietPlanChangeSummary => {
  const macros: DietPlanChangeSummary["macros"] = [];
  (Object.keys(MACRO_LABELS) as MacroKey[]).forEach((key) => {
    if (before[key] !== after[key]) macros.push({ key, before: before[key], after: after[key] });
  });
  const summary: DietPlanChangeSummary = { macros, presetName };
  if (before.freeCalories !== after.freeCalories) {
    summary.freeCalories = { before: before.freeCalories, after: after.freeCalories };
  }
  if (before.mealCount !== after.mealCount) {
    summary.mealCount = { before: before.mealCount, after: after.mealCount };
  }

  return summary;
};

export const readDietPlanHistory = (userId: string): DietPlanHistoryEntry[] => {
  if (!userId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as DietPlanHistoryEntry[];
  } catch {
    return [];
  }
};

const writeAll = (userId: string, entries: DietPlanHistoryEntry[]): void => {
  if (!userId || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(entries));
  } catch {
    return;
  }
};

const buildId = () => `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const appendDietPlanHistory = (
  userId: string,
  type: DietPlanHistoryType,
  description: string,
  details?: DietPlanChangeSummary
): DietPlanHistoryEntry | null => {
  if (!userId) return null;
  const entry: DietPlanHistoryEntry = {
    id: buildId(),
    timestamp: new Date().toISOString(),
    type,
    description,
    details,
  };
  const next = [entry, ...readDietPlanHistory(userId)].slice(0, MAX_ENTRIES);
  writeAll(userId, next);

  return entry;
};

export const clearDietPlanHistory = (userId: string): void => {
  if (!userId || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    return;
  }
};
