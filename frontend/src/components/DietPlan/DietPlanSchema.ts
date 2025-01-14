import { IDietPlan } from "@/interfaces/IDietPlan";
import { z } from "zod";

const customItemsSchema = z.object({
  item: z.string(),
  quantity: z.coerce.number(),
});

const dietItemSchema = z.object({
  quantity: z.coerce.number().min(0, { message: "Quantity must be 0 or more." }),
  unit: z.enum(["grams", "spoons"]),
  customItems: z.array(z.string()).optional(),
  extraItems: z.array(z.string()).optional(),
});

const mealSchema = z.object({
  totalProtein: dietItemSchema,
  totalCarbs: dietItemSchema,
});

const dietPlanSchema = z.object({
  meals: z.array(mealSchema),
  totalCalories: z.coerce.number().min(0).optional(),
  freeCalories: z.coerce.number().min(0),
  fatsPerDay: z.coerce.number().min(0).optional(),
  customInstructions: z.array(z.string()).optional(),
});

function validateDietPlan(dietPlan: IDietPlan) {
  console.log("diet plan", dietPlan);
  const result = dietPlanSchema.safeParse(dietPlan);
  if (result.error) {
    console.error("Validation failed:", result.error);
  }
  return {
    isValid: result.success,
    errors: result?.error?.format(),
  };
}
export { mealSchema, validateDietPlan, dietPlanSchema };
