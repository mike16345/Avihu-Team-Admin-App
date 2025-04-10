import { IDietPlan } from "@/interfaces/IDietPlan";
import ERROR_MESSAGES from "@/utils/errorMessages";
import { z } from "zod";

const MIN_QUANTITY = 0;

const dietItemSchema = z.object({
  quantity: z.coerce
    .number()
    .min(MIN_QUANTITY, { message: `חובה לשים כמות גדול מ-${MIN_QUANTITY}` }),
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
  freeCalories: z.coerce.number().min(0, { message: ERROR_MESSAGES.minNumber(0) }),
  fatsPerDay: z.coerce
    .number()
    .min(0, { message: ERROR_MESSAGES.minNumber(0) })
    .optional(),
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
