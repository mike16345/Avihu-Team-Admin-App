import { IDietPlan } from "@/interfaces/IDietPlan";
import ERROR_MESSAGES from "@/utils/errorMessages";
import { z } from "zod";

const MIN_QUANTITY = 0;

const dietItemSchema = z.object({
  quantity: z.coerce
    .number()
    .min(MIN_QUANTITY, { message: `חובה לשים כמות גדול מ-${MIN_QUANTITY}` }),
  customItems: z.array(z.string()).optional().default([]),
  extraItems: z.array(z.string()).optional().default([]),
});

const mealSchema = z.object({
  totalProtein: dietItemSchema,
  totalCarbs: dietItemSchema,
  totalFats: dietItemSchema,
  totalVeggies: dietItemSchema,
});

const dietPlanSchema = z.object({
  version: z.literal(1).optional(),
  meals: z.array(mealSchema),
  totalCalories: z.coerce.number().min(0).optional(),
  freeCalories: z.coerce.number().min(0, { message: ERROR_MESSAGES.minNumber(0) }),
  fatsPerDay: z.coerce.number().min(0).optional(),
  veggiesPerDay: z.coerce.number().min(0).optional(),
  customInstructions: z.array(z.string()).optional(),
  supplements: z.array(z.string()).optional(),
  unitDisplayMode: z.union([z.literal(1), z.literal(2)]).optional(),
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
