import { expect, test } from "@playwright/test";

import {
  dedupeCatalogCandidates,
  hasCategoryDuplicate,
  normalizeCatalogName,
} from "../../../../src/components/DietPlanV2/dietPlanV2Catalog";
import {
  computePlanMacroTotals,
  deriveMealMacros,
} from "../../../../src/components/DietPlanV2/dietPlanV2Utils";
import { dietPlanV2Schema } from "../../../../src/schemas/dietPlanV2Schema";
import { usesDietPlanV2 } from "../../../../src/lib/dietPlanVersion";

test("catalog names normalize surrounding whitespace, repeated whitespace, and case", () => {
  expect(normalizeCatalogName("  100G   Chicken Breast ")).toBe("100g chicken breast");
});

test("same-category duplicate detection ignores normalized spelling differences", () => {
  expect(hasCategoryDuplicate([{ name: "100g Chicken breast" }], " 100G  chicken breast ")).toBe(
    true
  );
  expect(hasCategoryDuplicate([{ name: "100g Chicken breast" }], "200g Chicken breast")).toBe(
    false
  );
});

test("catalog candidates deduplicate within a category but not across categories", () => {
  expect(
    dedupeCatalogCandidates([
      { name: "Rice", category: "carbs" },
      { name: " rice ", category: "carbs" },
      { name: "Rice", category: "protein" },
    ])
  ).toEqual([
    { name: "Rice", category: "carbs" },
    { name: "Rice", category: "protein" },
  ]);
});

test("V2 plan validation requires every macro for non-empty categories", () => {
  const missingMacros = dietPlanV2Schema.safeParse({
    version: 2,
    highlights: "",
    meals: [
      {
        name: "Meal 1",
        categories: [
          {
            category: "protein",
            items: [{ name: "Chicken" }],
            macros: { calories: 100, protein: 20 },
          },
        ],
        addOns: [],
        macros: { calories: 999, protein: 999, carbs: 999, fat: 999 },
      },
    ],
  });
  const negativeMacros = dietPlanV2Schema.safeParse({
    version: 2,
    highlights: "",
    meals: [
      {
        name: "Meal 1",
        categories: [
          {
            category: "protein",
            items: [{ name: "Chicken" }],
            macros: { calories: 100, protein: -1, carbs: 0, fat: 0 },
          },
        ],
        addOns: [],
        macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      },
    ],
  });

  expect(missingMacros.success).toBe(false);
  expect(negativeMacros.success).toBe(false);
});

test("V2 plan validation accepts explicit zero macros and skips empty categories", () => {
  const result = dietPlanV2Schema.safeParse({
    version: 2,
    highlights: "",
    meals: [
      {
        name: "Meal 1",
        categories: [
          {
            category: "protein",
            items: [{ name: "100g Chicken breast" }],
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          },
          { category: "vegetables", items: [] },
        ],
        addOns: [{ name: "Creatine 5g" }],
        macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        freeCalories: { calories: 150, description: "Fruit / snack" },
      },
    ],
  });

  expect(result.success).toBe(true);
});

test("meal and plan totals derive from category macros and keep free calories separate", () => {
  const firstMeal = {
    name: "Meal 1",
    categories: [
      {
        category: "protein" as const,
        items: [{ name: "Chicken" }],
        macros: { calories: 200, protein: 25, carbs: 0, fat: 5 },
      },
      {
        category: "carbs" as const,
        items: [{ name: "Rice" }],
        macros: { calories: 248, protein: 0, carbs: 45, fat: 7 },
      },
    ],
    addOns: [{ name: "Salt" }],
    macros: { calories: 999, protein: 999, carbs: 999, fat: 999 },
    freeCalories: { calories: 150, description: "Fruit" },
  };

  expect(deriveMealMacros(firstMeal)).toEqual({ calories: 448, protein: 25, carbs: 45, fat: 12 });
  expect(
    computePlanMacroTotals({
      version: 2,
      highlights: "",
      meals: [
        {
          ...firstMeal,
        },
        {
          name: "Meal 2",
          categories: [
            {
              category: "vegetables",
              items: [{ name: "Salad" }],
              macros: { calories: 50, protein: 2, carbs: 8, fat: 1 },
            },
          ],
          addOns: [],
          macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        },
      ],
    })
  ).toEqual({
    macros: { calories: 498, protein: 27, carbs: 53, fat: 13 },
    freeCalories: 150,
  });
});

test("V2 access follows the trainer setting with the Avihu preview fallback", () => {
  expect(usesDietPlanV2({ _id: "trainer-a", dietPlanVersion: 2 })).toBe(true);
  expect(usesDietPlanV2({ _id: "trainer-b", dietPlanVersion: 1 })).toBe(false);
  expect(usesDietPlanV2({ _id: "6774eb1c730c4c44354db2d0" })).toBe(true);
});
