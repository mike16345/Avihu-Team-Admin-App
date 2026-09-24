import { expect, test } from "@playwright/test";
import { dietPlanSchema } from "../../src/components/DietPlan/DietPlanSchema";
import type { IDietPlanPreset } from "../../src/interfaces/IDietPlan";
import { normalizeDietPlan, normalizePresetForDietPlan } from "../../src/utils/dietPlanUtils";

const preset: IDietPlanPreset = {
  _id: "preset-id",
  name: "Cutting preset",
  goal: "cutting",
  calories: 1800,
  proteinServings: 6,
  carbServings: 5,
  fatServings: 3,
  dietaryRestrictions: ["gluten-free"],
  builtByTrainerId: "trainer-id",
  meals: [
    {
      _id: "meal-id",
      totalProtein: { quantity: 2 },
      totalCarbs: { quantity: 1 },
      totalFats: { quantity: 0 },
      totalVeggies: { quantity: 3 },
    },
  ],
  totalCalories: 1750,
  freeCalories: 100,
  fatsPerDay: 3,
  veggiesPerDay: 4,
  unitDisplayMode: 2,
  customInstructions: ["Drink water"],
  supplements: ["Vitamin D"],
};

test("normal diet-plan normalization preserves metadata used by the preset editor", () => {
  expect(normalizeDietPlan(preset)).toMatchObject({
    name: "Cutting preset",
    goal: "cutting",
    dietaryRestrictions: ["gluten-free"],
    builtByTrainerId: "trainer-id",
  });
});

test("normalizing a preset keeps only fields accepted by a diet plan", () => {
  expect(normalizePresetForDietPlan(preset)).toEqual({
    meals: [
      {
        totalProtein: { quantity: 2, customItems: [], extraItems: [] },
        totalCarbs: { quantity: 1, customItems: [], extraItems: [] },
        totalFats: { quantity: 0, customItems: [], extraItems: [] },
        totalVeggies: { quantity: 3, customItems: [], extraItems: [] },
      },
    ],
    totalCalories: 1750,
    freeCalories: 100,
    fatsPerDay: 3,
    veggiesPerDay: 4,
    unitDisplayMode: 2,
    customInstructions: ["Drink water"],
    supplements: ["Vitamin D"],
  });
});

test("diet plan validation strips preset-only metadata from a save payload", () => {
  const result = dietPlanSchema.parse({
    _id: "preset-id",
    name: "Cutting preset",
    version: 1,
    meals: [],
    freeCalories: 0,
    fatsPerDay: 3,
    veggiesPerDay: 4,
    supplements: [],
    goal: "cutting",
    calories: 1800,
    proteinServings: 6,
    carbServings: 5,
    fatServings: 3,
    dietaryRestrictions: ["gluten-free"],
    builtByTrainerId: "trainer-id",
    unitDisplayMode: 2,
  });

  expect(result).toEqual({
    version: 1,
    meals: [],
    freeCalories: 0,
    fatsPerDay: 3,
    veggiesPerDay: 4,
    supplements: [],
    unitDisplayMode: 2,
  });
});
