import { IDietPlan } from "@/interfaces/IDietPlan";
import { z } from "zod";

const customItemsSchema = z.object({
  item: z.string(),
  quantity: z.coerce.number(),
});

const dietItemSchema = z.object({
  quantity: z.coerce.number().min(0, { message: "Quantity must be 0 or more." }),
  unit: z.enum(["grams", "spoons"]),
  customItems: z.array(customItemsSchema).optional(),
});

const mealSchema = z.object({
  totalProtein: dietItemSchema,
  totalCarbs: dietItemSchema,
  totalFats: dietItemSchema.optional(),
  totalVeggies: dietItemSchema.optional(),
});

const dietPlanSchema = z.object({
  meals: z.array(mealSchema),
  totalCalories: z.coerce.number().optional(),
  freeCalories: z.coerce.number(),
  customInstructions: z.array(z.string()).optional(),
});

function validateDietPlan(dietPlan: IDietPlan) {
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
