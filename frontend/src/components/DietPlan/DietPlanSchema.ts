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
  meals: z.array(mealSchema),
  totalCalories: z.coerce.number().min(0).optional(),
  freeCalories: z.coerce.number().min(0, { message: ERROR_MESSAGES.minNumber(0) }),
  customInstructions: z.array(z.string()).optional(),
  supplements: z.array(z.string()).optional(),
  // Optional trainer-tagged meta (kept in sync with IDietPlanMeta).
  goal: z.enum(["cutting", "mass"]).optional(),
  calories: z.coerce.number().min(0).max(10000).optional(),
  proteinServings: z.coerce.number().min(0).max(30).optional(),
  carbServings: z.coerce.number().min(0).max(30).optional(),
  fatServings: z.coerce.number().min(0).max(30).optional(),
  dietaryRestrictions: z
    .array(z.enum(["lactose-free", "vegetarian", "vegan", "no-fish", "no-meat", "gluten-free"]))
    .optional(),
  builtByTrainerId: z.string().optional(),
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
