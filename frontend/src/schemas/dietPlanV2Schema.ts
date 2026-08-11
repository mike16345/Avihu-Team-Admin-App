import { DIET_V2_MEAL_CATEGORIES } from "@/interfaces/IDietPlanV2";
import { z } from "zod";

const nonNegativeNumber = z.coerce
  .number({ invalid_type_error: "שדה חובה" })
  .min(0, "הערך חייב להיות 0 או יותר");

const planItemSchema = z.object({
  name: z.string().trim().min(1, "יש להזין שם מאכל"),
  catalogItemId: z.string().optional(),
});

const categorySchema = z.object({
  category: z.enum(DIET_V2_MEAL_CATEGORIES),
  items: z.array(planItemSchema),
});

const mealMacrosSchema = z.object({
  calories: nonNegativeNumber,
  protein: nonNegativeNumber,
  carbs: nonNegativeNumber,
  fat: nonNegativeNumber,
});

const freeCaloriesSchema = z.object({
  calories: nonNegativeNumber,
  description: z.string(),
});

const mealSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  categories: z.array(categorySchema),
  macros: mealMacrosSchema,
  freeCalories: freeCaloriesSchema.optional(),
  supplements: z.array(z.string()).optional(),
});

export const dietPlanV2Schema = z.object({
  _id: z.string().optional(),
  version: z.literal(2),
  meals: z.array(mealSchema).min(1, "יש להוסיף לפחות ארוחה אחת"),
  highlights: z.string(),
});
