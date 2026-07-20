import type { DietV2CategoryKind } from "@/interfaces/IDietPlanV2";

import {
  MOCK_FOOD_LIBRARY,
  searchFoodLibrary,
  type FoodLibraryItem,
} from "./dietPlanV2Utils";

const STORAGE_KEY = "dietPlanV2:foodHistory";

interface FoodHistoryEntry {
  count: number;
  lastUsedAt: string;
}

type CategoryHistory = Record<string, FoodHistoryEntry>;
type FoodHistory = Partial<Record<DietV2CategoryKind, CategoryHistory>>;

const readAllHistory = (): FoodHistory => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as FoodHistory;
  } catch {
    return {};
  }
};

const writeAllHistory = (history: FoodHistory): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
  }
};

export const recordFoodUsage = (kind: DietV2CategoryKind, foodId: string): void => {
  const history = readAllHistory();
  const categoryHistory = history[kind] ?? {};
  const existing = categoryHistory[foodId];
  const nextEntry: FoodHistoryEntry = {
    count: (existing?.count ?? 0) + 1,
    lastUsedAt: new Date().toISOString(),
  };

  writeAllHistory({
    ...history,
    [kind]: { ...categoryHistory, [foodId]: nextEntry },
  });
};

export const getRankedSuggestions = (
  query: string,
  kind: DietV2CategoryKind,
  limit: number
): FoodLibraryItem[] => {
  const historyForKind = readAllHistory()[kind] ?? {};
  const trimmed = query.trim();

  if (trimmed) {
    const results = searchFoodLibrary(trimmed, kind, limit);
    return results.slice().sort((a, b) => scoreFor(historyForKind, b) - scoreFor(historyForKind, a));
  }

  const historyRanked = MOCK_FOOD_LIBRARY.filter((food) => food.kind === kind && historyForKind[food.id])
    .sort((a, b) => scoreFor(historyForKind, b) - scoreFor(historyForKind, a))
    .slice(0, limit);

  if (historyRanked.length >= limit) return historyRanked;

  const seen = new Set(historyRanked.map((f) => f.id));
  const librarySuggestions = searchFoodLibrary("", kind, limit * 2).filter((f) => !seen.has(f.id));

  return [...historyRanked, ...librarySuggestions].slice(0, limit);
};

const scoreFor = (history: CategoryHistory, food: FoodLibraryItem): number => {
  const entry = history[food.id];
  if (!entry) return 0;
  const recencyMs = new Date(entry.lastUsedAt).getTime() || 0;

  return entry.count * 1_000_000_000_000 + recencyMs;
};
