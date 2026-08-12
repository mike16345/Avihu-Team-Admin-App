import { expect, test } from "@playwright/test";

import {
  dedupeCatalogCandidates,
  hasCategoryDuplicate,
  normalizeCatalogName,
} from "../../../../src/components/DietPlanV2/dietPlanV2Catalog";
import { computePlanMacroTotals } from "../../../../src/components/DietPlanV2/dietPlanV2Utils";
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

test("V2 plan validation requires all four non-negative meal macros", () => {
  const missingMacros = dietPlanV2Schema.safeParse({
    version: 2,
    highlights: "",
    meals: [
      {
        name: "Meal 1",
        categories: [],
        macros: { calories: 0 },
      },
    ],
  });
  const negativeMacros = dietPlanV2Schema.safeParse({
    version: 2,
    highlights: "",
    meals: [
      {
        name: "Meal 1",
        categories: [],
        macros: { calories: 0, protein: -1, carbs: 0, fat: 0 },
      },
    ],
  });

  expect(missingMacros.success).toBe(false);
  expect(negativeMacros.success).toBe(false);
});

test("V2 plan validation accepts literal names and zero macro values", () => {
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
          },
        ],
        macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        freeCalories: { calories: 150, description: "Fruit / snack" },
        supplements: ["Creatine 5g"],
      },
    ],
  });

  expect(result.success).toBe(true);
});

test("plan totals use explicit meal macros and keep free calories separate", () => {
  expect(
    computePlanMacroTotals({
      version: 2,
      highlights: "",
      meals: [
        {
          name: "Meal 1",
          categories: [],
          macros: { calories: 448, protein: 25, carbs: 45, fat: 12 },
          freeCalories: { calories: 150, description: "Fruit" },
        },
        {
          name: "Meal 2",
          categories: [],
          macros: { calories: 590, protein: 40, carbs: 60, fat: 10 },
        },
      ],
    })
  ).toEqual({
    macros: { calories: 1038, protein: 65, carbs: 105, fat: 22 },
    freeCalories: 150,
  });
});

test("V2 access follows the trainer setting with the Avihu preview fallback", () => {
  expect(usesDietPlanV2({ _id: "trainer-a", dietPlanVersion: 2 })).toBe(true);
  expect(usesDietPlanV2({ _id: "trainer-b", dietPlanVersion: 1 })).toBe(false);
  expect(usesDietPlanV2({ _id: "6774eb1c730c4c44354db2d0" })).toBe(true);
});
