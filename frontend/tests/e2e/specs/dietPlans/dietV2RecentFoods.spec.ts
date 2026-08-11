import { expect, test } from "@playwright/test";
import {
  getRecentFoodSuggestions,
  getRecentFoodsStorageKey,
  mealContainsFood,
  removeRecentFood,
  scaleMacrosForQuantity,
  upsertRecentFood,
} from "../../../../src/components/DietPlanV2/dietPlanV2RecentFoods";

const chicken = {
  displayName: "חזה עוף",
  categoryKind: "protein" as const,
  referenceQuantity: 100,
  unit: "g" as const,
  referenceMacros: { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
};

test("recent foods - repeat entry - replaces nutrition and increments usage", async () => {
  const first = upsertRecentFood([], chicken, "2026-08-10T10:00:00.000Z");
  const updated = upsertRecentFood(
    first,
    {
      ...chicken,
      displayName: "  חזה   עוף ",
      referenceQuantity: 150,
      referenceMacros: { protein: 46.5, carbs: 0, fat: 5.4, calories: 248 },
    },
    "2026-08-10T11:00:00.000Z"
  );

  expect(updated).toHaveLength(1);
  expect(updated[0]).toMatchObject({
    displayName: "חזה עוף",
    normalizedName: "חזה עוף",
    referenceQuantity: 150,
    useCount: 2,
    lastUsedAt: "2026-08-10T11:00:00.000Z",
    referenceMacros: { protein: 46.5, carbs: 0, fat: 5.4, calories: 248 },
  });
});

test("recent foods - same name with another unit or category - remains separate", async () => {
  const byGram = upsertRecentFood([], chicken, "2026-08-10T10:00:00.000Z");
  const byPiece = upsertRecentFood(
    byGram,
    { ...chicken, referenceQuantity: 1, unit: "piece" },
    "2026-08-10T11:00:00.000Z"
  );
  const anotherCategory = upsertRecentFood(
    byPiece,
    { ...chicken, categoryKind: "addon" },
    "2026-08-10T12:00:00.000Z"
  );

  expect(anotherCategory).toHaveLength(3);
});

test("recent foods - suggestions - filters by category and ranks frequent items first", async () => {
  let foods = upsertRecentFood([], chicken, "2026-08-10T10:00:00.000Z");
  foods = upsertRecentFood(foods, chicken, "2026-08-10T11:00:00.000Z");
  foods = upsertRecentFood(
    foods,
    { ...chicken, displayName: "טופו", referenceMacros: { protein: 8, carbs: 2, fat: 4, calories: 76 } },
    "2026-08-10T12:00:00.000Z"
  );
  foods = upsertRecentFood(
    foods,
    { ...chicken, displayName: "אורז", categoryKind: "carbs" },
    "2026-08-10T13:00:00.000Z"
  );

  expect(getRecentFoodSuggestions(foods, "", "protein", 5).map((food) => food.displayName)).toEqual([
    "חזה עוף",
    "טופו",
  ]);
  expect(getRecentFoodSuggestions(foods, "טו", "protein", 5).map((food) => food.displayName)).toEqual([
    "טופו",
  ]);
});

test("recent foods - capacity - evicts the least recently used entry", async () => {
  let foods: ReturnType<typeof upsertRecentFood> = [];

  for (let index = 0; index < 101; index += 1) {
    foods = upsertRecentFood(
      foods,
      { ...chicken, displayName: `מאכל ${index}` },
      new Date(Date.UTC(2026, 7, 10, 10, index)).toISOString(),
      100
    );
  }

  expect(foods).toHaveLength(100);
  expect(foods.some((food) => food.displayName === "מאכל 0")).toBe(false);
  expect(foods.some((food) => food.displayName === "מאכל 100")).toBe(true);
});

test("recent foods - remove - deletes only the selected entry", async () => {
  let foods = upsertRecentFood([], chicken, "2026-08-10T10:00:00.000Z");
  foods = upsertRecentFood(
    foods,
    { ...chicken, displayName: "טופו" },
    "2026-08-10T11:00:00.000Z"
  );

  const remaining = removeRecentFood(foods, foods[0].id);

  expect(remaining).toHaveLength(1);
  expect(remaining[0].displayName).not.toBe(foods[0].displayName);
});

test("recent foods - trainer storage key - isolates each trainer", async () => {

  expect(getRecentFoodsStorageKey("trainer-a")).toBe("dietV2:recentFoods:trainer-a");
  expect(getRecentFoodsStorageKey("trainer-b")).toBe("dietV2:recentFoods:trainer-b");
});

test("diet option - quantity change - scales all macros proportionally", async () => {

  expect(
    scaleMacrosForQuantity(
      { protein: 31, carbs: 2, fat: 3.6, calories: 165 },
      100,
      150
    )
  ).toEqual({ protein: 46.5, carbs: 3, fat: 5.4, calories: 247.5 });
  expect(
    scaleMacrosForQuantity({ protein: 31, carbs: 2, fat: 3.6, calories: 165 }, 0, 150)
  ).toEqual({ protein: 31, carbs: 2, fat: 3.6, calories: 165 });
});

test("meal foods - duplicate name - is detected across every category", () => {
  expect(mealContainsFood(["חזה עוף", "אורז"], "  חזה   עוף ")).toBe(true);
  expect(mealContainsFood(["חזה עוף", "אורז"], "טופו")).toBe(false);
});
