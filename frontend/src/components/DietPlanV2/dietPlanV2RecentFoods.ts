import type {
  DietV2CategoryKind,
  DietV2OptionMacros,
  DietV2Unit,
} from "@/interfaces/IDietPlanV2";

const MAX_RECENT_FOODS = 100;
export const RECENT_FOODS_UPDATED_EVENT = "diet-v2-recent-foods-updated";

export interface RecentFoodInput {
  displayName: string;
  categoryKind: DietV2CategoryKind;
  referenceQuantity: number;
  unit: DietV2Unit;
  referenceMacros: DietV2OptionMacros;
}

export interface RecentFood extends RecentFoodInput {
  id: string;
  normalizedName: string;
  lastUsedAt: string;
  useCount: number;
}

export const normalizeRecentFoodName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLocaleLowerCase("he");

export const mealContainsFood = (foodNames: string[], candidateName: string): boolean => {
  const normalizedCandidate = normalizeRecentFoodName(candidateName);
  if (!normalizedCandidate) return false;

  return foodNames.some((foodName) => normalizeRecentFoodName(foodName) === normalizedCandidate);
};

const buildRecentFoodIdentity = (input: RecentFoodInput): string =>
  `${normalizeRecentFoodName(input.displayName)}::${input.categoryKind}::${input.unit}`;

export const getRecentFoodsStorageKey = (trainerId: string): string =>
  `dietV2:recentFoods:${trainerId}`;

export const upsertRecentFood = (
  foods: RecentFood[],
  input: RecentFoodInput,
  usedAt = new Date().toISOString(),
  maxItems = MAX_RECENT_FOODS
): RecentFood[] => {
  const normalizedName = normalizeRecentFoodName(input.displayName);
  const id = buildRecentFoodIdentity(input);
  const existing = foods.find((food) => food.id === id);
  const nextFood: RecentFood = {
    ...input,
    id,
    displayName: input.displayName.trim().replace(/\s+/g, " "),
    normalizedName,
    lastUsedAt: usedAt,
    useCount: (existing?.useCount ?? 0) + 1,
  };
  const withoutExisting = foods.filter((food) => food.id !== id);

  return [nextFood, ...withoutExisting]
    .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))
    .slice(0, Math.max(0, maxItems));
};

export const getRecentFoodSuggestions = (
  foods: RecentFood[],
  query: string,
  categoryKind: DietV2CategoryKind,
  limit = 5
): RecentFood[] => {
  const normalizedQuery = normalizeRecentFoodName(query);

  return foods
    .filter(
      (food) =>
        food.categoryKind === categoryKind &&
        (normalizedQuery.length === 0 || food.normalizedName.includes(normalizedQuery))
    )
    .sort((a, b) => b.useCount - a.useCount || b.lastUsedAt.localeCompare(a.lastUsedAt))
    .slice(0, limit);
};

export const removeRecentFood = (foods: RecentFood[], id: string): RecentFood[] =>
  foods.filter((food) => food.id !== id);

export const scaleMacrosForQuantity = (
  macros: DietV2OptionMacros,
  currentQuantity: number,
  nextQuantity: number
): DietV2OptionMacros => {
  if (currentQuantity <= 0) return macros;
  const ratio = nextQuantity / currentQuantity;
  const scale = (value: number) => Math.round(value * ratio * 100) / 100;

  return {
    protein: scale(macros.protein),
    carbs: scale(macros.carbs),
    fat: scale(macros.fat),
    calories: scale(macros.calories),
  };
};

export const loadRecentFoods = (trainerId: string): RecentFood[] => {
  if (typeof window === "undefined" || !trainerId) return [];

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(getRecentFoodsStorageKey(trainerId)) ?? "[]"
    );
    return Array.isArray(parsed) ? (parsed as RecentFood[]) : [];
  } catch {
    return [];
  }
};

export const saveRecentFoods = (trainerId: string, foods: RecentFood[]): void => {
  if (typeof window === "undefined" || !trainerId) return;

  try {
    window.localStorage.setItem(getRecentFoodsStorageKey(trainerId), JSON.stringify(foods));
    window.dispatchEvent(new CustomEvent(RECENT_FOODS_UPDATED_EVENT, { detail: trainerId }));
  } catch {
    // Browser storage can be unavailable or full; plan editing must remain usable.
  }
};
