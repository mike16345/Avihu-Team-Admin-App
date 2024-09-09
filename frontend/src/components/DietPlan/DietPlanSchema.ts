import { IDietPlan } from "@/interfaces/IDietPlan";
import { z } from "zod";

const customInstructionsSchema = z.object({
  item: z.string(),
  quantity: z.number(),
});

const dietItemSchema = z.object({
  quantity: z.coerce.number().min(0, { message: "Quantity must be 0 or more." }),
  unit: z.enum(["grams", "spoons"]),
  customInstructions: z.array(customInstructionsSchema).optional(),
});

const mealSchema = z.object({
  totalProtein: dietItemSchema,
  totalCarbs: dietItemSchema,
  totalFats: dietItemSchema.optional(),
  totalVeggies: dietItemSchema.optional(),
});
function validateMealsInDietPlan(dietPlan: IDietPlan) {
  const validationResults = dietPlan.meals.map((meal, index) => {
    const result = mealSchema.safeParse(meal);

    if (!result.success) {
      console.error(`Validation failed for meal at index ${index}:`, result.error);
      return {
        index,
        isValid: false,
        errors: result.error.format(),
      };
    }

    return {
      index,
      isValid: true,
      errors: null,
    };
  });

  return validationResults;
}
export { mealSchema, validateMealsInDietPlan };
