import { DIET_V2_MEAL_CATEGORIES } from "@/interfaces/IDietPlanV2";
import { z } from "zod";

const nonNegativeNumber = z
  .number({ required_error: "שדה חובה", invalid_type_error: "שדה חובה" })
  .finite("יש להזין מספר תקין")
  .min(0, "הערך חייב להיות 0 או יותר");

const planItemSchema = z.object({
  name: z.string().trim().min(1, "יש להזין שם מאכל"),
  catalogItemId: z.string().optional(),
});

const macrosSchema = z.object({
  calories: nonNegativeNumber,
  protein: nonNegativeNumber,
  carbs: nonNegativeNumber,
  fat: nonNegativeNumber,
});

const optionalCategoryMacrosSchema = z
  .object({
    calories: nonNegativeNumber.optional(),
    protein: nonNegativeNumber.optional(),
    carbs: nonNegativeNumber.optional(),
    fat: nonNegativeNumber.optional(),
  })
  .optional();

const categorySchema = z
  .object({
    category: z.enum(DIET_V2_MEAL_CATEGORIES),
    items: z.array(planItemSchema),
    macros: optionalCategoryMacrosSchema,
  })
  .superRefine((category, context) => {
    if (category.items.length === 0) return;

    const fields = {
      protein: ["calories", "protein"],
      carbs: ["calories", "carbs"],
      fat: ["calories", "fat"],
      vegetables: ["calories", "carbs"],
    }[category.category] as Array<"calories" | "protein" | "carbs" | "fat">;

    fields.forEach((field) => {
      if (typeof category.macros?.[field] !== "number") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "שדה חובה",
          path: ["macros", field],
        });
      }
    });
  });

const freeCaloriesSchema = z.object({
  calories: nonNegativeNumber,
  items: z.array(planItemSchema).min(1, "יש להוסיף לפחות פריט אחד"),
});

const mealSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  categories: z.array(categorySchema),
  addOns: z.array(planItemSchema),
  macros: macrosSchema,
  freeCalories: freeCaloriesSchema.optional(),
  supplements: z.array(z.string()).optional(),
});

export const dietPlanV2Schema = z.object({
  _id: z.string().optional(),
  version: z.literal(2),
  meals: z.array(mealSchema).min(1, "יש להוסיף לפחות ארוחה אחת"),
  highlights: z.string(),
});
