import type { DietV2CategoryKind } from "@/interfaces/IDietPlanV2";

import {
  MOCK_FOOD_LIBRARY,
  searchFoodLibrary,
  type FoodLibraryItem,
} from "./dietPlanV2Utils";

/**
 * Per-trainer history of picked foods, per category. Ranks the
 * "מוצעים לך" chip row so foods the trainer keeps reaching for
 * float to the top, and less-used library defaults fill the rest.
 *
 * Storage shape today is localStorage, keyed by trainer-agnostic
 * category. Once the backend lands, this whole module swaps to a
 * scoped resource wrapper — the public API is intentionally the
 * same shape (`recordFoodUsage`, `getRankedSuggestions`) so callers
 * won't need to change.
 *
 * TODO(Michael): replace localStorage reads/writes with
 * `POST /diet-plan-v2/food-history` + `GET /diet-plan-v2/food-history`
 * scoped by trainerId. Keep the same ranking semantics on the server
 * so the client can render optimistically without waiting on the API.
 */

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
    /* storage unavailable — best effort */
  }
};

/** Called whenever the trainer picks or adds a food into a category —
 *  the chip click, the autocomplete pick, and the parser's matched
 *  food all funnel through here. Free-text rows without a library
 *  match are skipped: they can't be re-suggested since we don't have
 *  a stable id for them. */
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

/** Merge the trainer's personal history with the built-in library and
 *  return a ranked list for the "מוצעים לך" chip row.
 *  - When there is a query, the underlying library search does the
 *    filtering; history nudges the tied items but doesn't override
 *    relevance (a name match still beats a stale favourite).
 *  - When the query is empty, history-ranked foods come first
 *    (count DESC, lastUsedAt DESC), then library defaults fill up
 *    to `limit`. */
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
  // Big weight on count so a proven favourite outranks a one-time
  // recent pick; break ties by lastUsedAt (milliseconds) so within
  // equal-count items the most-recent bubble up.
  const recencyMs = new Date(entry.lastUsedAt).getTime() || 0;

  return entry.count * 1_000_000_000_000 + recencyMs;
};
